import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";

import { initialMailData } from "../data/mailData";
import { createAttachmentId, createMailId } from "../utils/mail";
import type { ComposeData, Mail, MailContextValue, MailMode, Recipient } from "../types/mail";

const MailContext = createContext<MailContextValue | null>(null);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SENDER = { name: "Amit Singh", email: "amit.singh@navy.gov.in" } as const;

function buildPreview(body: string): string {
  return body.replace(/<[^>]*>/g, " ").trim().slice(0, 120) || "(No content)";
}

export function MailProvider({ children }: { children: ReactNode }) {
  const [mails, setMails] = useState<Mail[]>(initialMailData.mails);
  const [recipients] = useState<Recipient[]>(initialMailData.recipients);

  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [mode, setMode] = useState<MailMode>("empty");
  const [composeData, setComposeData] = useState<ComposeData | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const busyRef = useRef({ isSaving: false, isSending: false });

  const openMail = useCallback((mail: Mail) => {
    setSelectedMail(mail);
    setMode("viewing");
    setMails((current) =>
      current.map((item) => (item.id === mail.id ? { ...item, isRead: true } : item))
    );
  }, []);

  const openCompose = useCallback((data: Partial<ComposeData> = {}) => {
    setSelectedMail(null);
    setComposeData({
      id: data.id ?? null,
      to: data.to ?? [],
      cc: data.cc ?? [],
      bcc: data.bcc ?? [],
      subject: data.subject ?? "",
      body: data.body ?? "",
      attachments: data.attachments ?? [],
    });
    setMode("composing");
  }, []);

  const reply = useCallback(
    (mail: Mail) => {
      openCompose({
        to: [mail.sender.email],
        subject: mail.subject.startsWith("Re:") ? mail.subject : `Re: ${mail.subject}`,
        body: `
          <p></p>
          <p>On ${mail.createdAt}, ${mail.sender.name} wrote:</p>
          <blockquote>${mail.body}</blockquote>
        `,
      });
    },
    [openCompose]
  );

  const replyAll = useCallback(
    (mail: Mail) => {
      const originalTo = [...(mail.recipients?.to ?? []), ...(mail.recipients?.cc ?? [])];
      const to = [mail.sender.email, ...originalTo].filter(
        (email, index, array) => array.indexOf(email) === index
      );
      const bcc = [...(mail.recipients?.bcc ?? [])];
      openCompose({
        to,
        cc: [],
        bcc,
        subject: mail.subject.startsWith("Re:") ? mail.subject : `Re: ${mail.subject}`,
        body: `
          <p></p>
          <p>On ${mail.createdAt}, ${mail.sender.name} wrote:</p>
          <blockquote>${mail.body}</blockquote>
        `,
      });
    },
    [openCompose]
  );

  const forward = useCallback(
    (mail: Mail) => {
      openCompose({
        subject: mail.subject.startsWith("Fwd:") ? mail.subject : `Fwd: ${mail.subject}`,
        body: `
          <p></p>
          <p>---------- Forwarded message ----------</p>
          <p>
            <strong>From:</strong> ${mail.sender.name} &lt;${mail.sender.email}&gt;
          </p>
          <p><strong>Subject:</strong> ${mail.subject}</p>
          <hr />
          ${mail.body}
        `,
        attachments: mail.attachments ?? [],
      });
    },
    [openCompose]
  );

  const saveDraft = useCallback(
    async (formData: ComposeData): Promise<Mail | undefined> => {
      if (busyRef.current.isSaving || busyRef.current.isSending) return;
      busyRef.current.isSaving = true;
      setIsSaving(true);
      try {
        await wait(700);
        const draft: Mail = {
          id: formData.id ?? createMailId(),
          folder: "draft",
          sender: SENDER,
          recipients: { to: formData.to, cc: formData.cc, bcc: formData.bcc },
          subject: formData.subject,
          preview: buildPreview(formData.body),
          body: formData.body,
          createdAt: "Just now",
          isRead: true,
          isStarred: false,
          attachments: formData.attachments ?? [],
        };
        setMails((current) => {
          const exists = current.some((mail) => mail.id === draft.id);
          if (exists) return current.map((mail) => (mail.id === draft.id ? draft : mail));
          return [draft, ...current];
        });
        toast.success(formData.id ? "Draft updated" : "Draft saved");
        return draft;
      } catch {
        toast.error("Unable to save draft");
        throw new Error("Unable to save draft");
      } finally {
        busyRef.current.isSaving = false;
        setIsSaving(false);
      }
    },
    []
  );

  const sendMail = useCallback(
    async (formData: ComposeData): Promise<void> => {
      if (busyRef.current.isSending || busyRef.current.isSaving) return;
      busyRef.current.isSending = true;
      setIsSending(true);
      try {
        await wait(900);
        const sentMail: Mail = {
          id: formData.id ?? createMailId(),
          folder: "outbox",
          sender: SENDER,
          recipients: { to: formData.to, cc: formData.cc, bcc: formData.bcc },
          subject: formData.subject,
          preview: buildPreview(formData.body),
          body: formData.body,
          createdAt: "Just now",
          isRead: true,
          isStarred: false,
          attachments: formData.attachments ?? [],
        };
        setMails((current) => [sentMail, ...current.filter((mail) => mail.id !== formData.id)]);
        toast.success("Mail sent successfully");
        setMode("empty");
        setComposeData(null);
      } catch {
        toast.error("Unable to send mail");
        throw new Error("Unable to send mail");
      } finally {
        busyRef.current.isSending = false;
        setIsSending(false);
      }
    },
    []
  );

  const discardCompose = useCallback(() => {
    if (busyRef.current.isSaving || busyRef.current.isSending) return;
    setComposeData(null);
    setMode("empty");
    toast.success("Draft discarded");
  }, []);

  const addAttachments = useCallback((files: FileList) => {
    const attachments = Array.from(files).map((file) => ({
      id: createAttachmentId(),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type || "application/octet-stream",
      file,
    }));
    setComposeData((current) => ({
      ...(current ?? { id: null, to: [], cc: [], bcc: [], subject: "", body: "", attachments: [] }),
      attachments: [...(current?.attachments ?? []), ...attachments],
    }));
    toast.success(`${attachments.length} attachment${attachments.length > 1 ? "s" : ""} added`);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setComposeData((current) => ({
      ...(current ?? { id: null, to: [], cc: [], bcc: [], subject: "", body: "", attachments: [] }),
      attachments: (current?.attachments ?? []).filter((attachment) => attachment.id !== id),
    }));
  }, []);

  const value = useMemo<MailContextValue>(
    () => ({
      mails,
      recipients,
      selectedMail,
      mode,
      composeData,
      isSaving,
      isSending,
      openMail,
      openCompose,
      reply,
      replyAll,
      forward,
      saveDraft,
      sendMail,
      discardCompose,
      addAttachments,
      removeAttachment,
    }),
    [
      mails,
      recipients,
      selectedMail,
      mode,
      composeData,
      isSaving,
      isSending,
      openMail,
      openCompose,
      reply,
      replyAll,
      forward,
      saveDraft,
      sendMail,
      discardCompose,
      addAttachments,
      removeAttachment,
    ]
  );

  return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
}

export function useMail(): MailContextValue {
  const context = useContext(MailContext);
  if (!context) throw new Error("useMail must be used inside MailProvider");
  return context;
}
