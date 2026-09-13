export interface Recipient {
  id: string;
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  file?: File;
}

export interface MailRecipients {
  to: string[];
  cc?: string[];
  bcc?: string[];
}

export interface Mail {
  id: string;
  folder: MailFolder;
  sender: {
    name: string;
    email: string;
  };
  recipients: MailRecipients;
  subject: string;
  preview: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  isStarred: boolean;
  attachments: Attachment[];
}

export type MailFolder = "inbox" | "outbox" | "draft" | "archive" | "deleted";

export type MailMode = "empty" | "viewing" | "composing";

export interface ComposeData {
  id: string | null;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  attachments: Attachment[];
}

export interface MailContextValue {
  mails: Mail[];
  recipients: Recipient[];
  selectedMail: Mail | null;
  mode: MailMode;
  composeData: ComposeData | null;
  isSaving: boolean;
  isSending: boolean;
  openMail: (mail: Mail) => void;
  openCompose: (data?: Partial<ComposeData>) => void;
  reply: (mail: Mail) => void;
  replyAll: (mail: Mail) => void;
  forward: (mail: Mail) => void;
  saveDraft: (formData: ComposeData) => Promise<Mail | undefined>;
  sendMail: (formData: ComposeData) => Promise<void>;
  discardCompose: () => void;
  addAttachments: (files: FileList) => void;
  removeAttachment: (id: string) => void;
}
