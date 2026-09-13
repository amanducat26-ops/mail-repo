import { useEffect, useMemo, useRef, useState } from "react";
import JoditEditor, { type JoditEditorProps } from "jodit-react";
import { ArrowLeft, File, Loader2, Paperclip, X } from "lucide-react";
import { useMail } from "@/context/MailContext";
import { searchRecipients } from "@/utils/mail";
import type { ComposeData, Recipient } from "@/types/mail";

const emptyForm: ComposeData = {
  id: null,
  to: [],
  cc: [],
  bcc: [],
  subject: "",
  body: "",
  attachments: [],
};

type RecipientType = "to" | "cc" | "bcc";
type Errors = Partial<Record<"to" | "subject" | "body", string>>;

const joditConfig: JoditEditorProps["config"] = {
  readonly: false,
  height: 360,
  toolbar: true,
  buttons: [
    "bold", "italic", "underline", "|",
    "ul", "ol", "|",
    "link", "|",
    "align", "font", "fontsize", "paragraph", "|",
    "undo", "redo", "|",
    "hr", "table", "|",
    "fullsize",
  ],
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  defaultActionOnPasteFromWord: "insert_clear_html",
  placeholder: "Write your message...",
  disablePlugins: ["stat", "poweredBy", "copy-format"],
  uploader: { insertImageAsBase64URI: true },
};

export default function ComposeMail() {
  const {
    composeData,
    recipients,
    isSaving,
    isSending,
    saveDraft,
    sendMail,
    discardCompose,
    addAttachments,
    removeAttachment,
  } = useMail();

  const [form, setForm] = useState<ComposeData>(emptyForm);
  const [recipientType, setRecipientType] = useState<RecipientType>("to");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setForm({
      ...emptyForm,
      ...composeData,
      to: composeData?.to ?? [],
      cc: composeData?.cc ?? [],
      bcc: composeData?.bcc ?? [],
      attachments: composeData?.attachments ?? [],
    });
    setShowCc(Boolean(composeData?.cc?.length));
    setShowBcc(Boolean(composeData?.bcc?.length));
    setSearch("");
    setErrors({});
  }, [composeData]);

  const suggestions = useMemo(
    () => searchRecipients(recipients, search),
    [recipients, search]
  );

  useEffect(() => {
    if (!search.trim()) {
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => setSearching(false), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const updateField = (field: keyof ComposeData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const addRecipient = (recipient: Recipient) => {
    if (!recipient?.email) return;
    setForm((current) => {
      const currentRecipients = current[recipientType] ?? [];
      if (currentRecipients.includes(recipient.email)) return current;
      return { ...current, [recipientType]: [...currentRecipients, recipient.email] };
    });
    setSearch("");
    setSearching(false);
  };

  const removeRecipient = (type: RecipientType, email: string) => {
    setForm((current) => ({
      ...current,
      [type]: current[type].filter((item) => item !== email),
    }));
  };

  const handleRecipientKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", "Tab", ","].includes(event.key)) {
      event.preventDefault();
      if (suggestions.length) addRecipient(suggestions[0]);
    }
    if (event.key === "Backspace" && !search && form[recipientType]?.length) {
      const values = form[recipientType];
      removeRecipient(recipientType, values[values.length - 1]);
    }
  };

  const validate = () => {
    const nextErrors: Errors = {};
    if (!form.to.length) nextErrors.to = "Recipient is required";
    if (!form.subject.trim()) nextErrors.subject = "Subject is required";
    if (!form.body.replace(/<[^>]*>/g, "").trim()) nextErrors.body = "Message cannot be empty";
    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const handleSend = async () => {
    if (!validate()) return;
    await sendMail(form);
  };

  const handleSave = async () => {
    await saveDraft(form);
  };

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
    addAttachments(files);
    event.target.value = "";
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={discardCompose}
            disabled={isSaving || isSending}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-semibold text-slate-900">
            {form.id ? "Edit Draft" : "New Message"}
          </h2>
        </div>
        <button
          type="button"
          onClick={discardCompose}
          disabled={isSaving || isSending}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-6">
          <RecipientRow
            label="To"
            type="to"
            values={form.to}
            activeType={recipientType}
            search={search}
            searching={searching}
            suggestions={suggestions}
            error={errors.to}
            onFocus={() => setRecipientType("to")}
            onSearch={setSearch}
            onKeyDown={handleRecipientKeyDown}
            onSelect={addRecipient}
            onRemove={removeRecipient}
            extraActions={
              <>
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="text-xs font-medium text-blue-700 transition-colors hover:text-blue-900"
                  >
                    Add Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    type="button"
                    onClick={() => setShowBcc(true)}
                    className="text-xs font-medium text-blue-700 transition-colors hover:text-blue-900"
                  >
                    Add Bcc
                  </button>
                )}
              </>
            }
          />

          {showCc && (
            <RecipientRow
              label="Cc"
              type="cc"
              values={form.cc}
              activeType={recipientType}
              search={search}
              searching={searching}
              suggestions={suggestions}
              onFocus={() => setRecipientType("cc")}
              onSearch={setSearch}
              onKeyDown={handleRecipientKeyDown}
              onSelect={addRecipient}
              onRemove={removeRecipient}
            />
          )}

          {showBcc && (
            <RecipientRow
              label="Bcc"
              type="bcc"
              values={form.bcc}
              activeType={recipientType}
              search={search}
              searching={searching}
              suggestions={suggestions}
              onFocus={() => setRecipientType("bcc")}
              onSearch={setSearch}
              onKeyDown={handleRecipientKeyDown}
              onSelect={addRecipient}
              onRemove={removeRecipient}
            />
          )}

          <div className="flex min-h-12 items-center border-b border-slate-200">
            <span className="w-12 shrink-0 text-sm text-slate-500">Subject</span>
            <input
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="Enter subject"
            />
          </div>
          {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}

          <div className="mt-4">
            <JoditEditor
              ref={editorRef}
              value={form.body}
              config={joditConfig}
              onBlur={(newContent: string) => updateField("body", newContent)}
              onChange={() => {}}
            />
          </div>
          {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}

          {form.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {form.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <File className="h-4 w-4 text-slate-500" />
                  <div className="min-w-0">
                    <p className="max-w-[220px] truncate text-xs font-medium text-slate-700">
                      {attachment.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{attachment.size}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-slate-200 px-5 py-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving || isSending}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
          >
            <Paperclip className="h-4 w-4" />
            Attach
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={discardCompose}
            disabled={isSaving || isSending}
            className="rounded-md px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isSending}
            className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {form.id ? "Update Draft" : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSaving || isSending}
            className="flex items-center gap-2 rounded-md bg-blue-800 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function RecipientRow({
  label,
  type,
  values,
  activeType,
  search,
  searching,
  suggestions,
  error,
  onFocus,
  onSearch,
  onKeyDown,
  onSelect,
  onRemove,
  extraActions,
}: {
  label: string;
  type: RecipientType;
  values: string[];
  activeType: RecipientType;
  search: string;
  searching: boolean;
  suggestions: Recipient[];
  error?: string;
  onFocus: () => void;
  onSearch: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelect: (recipient: Recipient) => void;
  onRemove: (type: RecipientType, email: string) => void;
  extraActions?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-12 items-center border-b border-slate-200">
      <span className="w-12 shrink-0 text-sm text-slate-500">{label}</span>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 py-2">
        {values.map((email) => (
          <span
            key={email}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800"
          >
            <span className="max-w-[260px] truncate">{email}</span>
            <button
              type="button"
              onClick={() => onRemove(type, email)}
              className="rounded-full transition-colors hover:bg-blue-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={activeType === type ? search : ""}
          onFocus={onFocus}
          onChange={(event) => onSearch(event.target.value)}
          onKeyDown={onKeyDown}
          className="min-w-[160px] flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-slate-400"
          placeholder={values.length ? "Add recipient" : "Search recipient"}
        />
      </div>

      {extraActions && (
        <div className="flex shrink-0 items-center gap-3 pl-2">
          {extraActions}
        </div>
      )}

      {activeType === type && search.trim() && (
        <div className="absolute left-12 right-0 top-full z-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          {searching ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching recipients...
            </div>
          ) : suggestions.length ? (
            suggestions.map((recipient) => (
              <button
                key={recipient.id}
                type="button"
                onClick={() => onSelect(recipient)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-800">
                  {recipient.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{recipient.name}</p>
                  <p className="truncate text-xs text-slate-500">{recipient.email}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-slate-500">No recipients found</div>
          )}
        </div>
      )}

      {error && (
        <p className="absolute left-12 top-full z-10 mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
