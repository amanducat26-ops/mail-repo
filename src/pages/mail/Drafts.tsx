import { Suspense, lazy, useMemo } from "react";
import { useMail } from "@/context/MailContext";

const ComposeMail = lazy(() => import("@/components/mail/ComposeMail"));

export default function Drafts() {
  const { mails, mode, openCompose } = useMail();
  const drafts = useMemo(() => mails.filter((mail) => mail.folder === "draft"), [mails]);

  if (mode === "composing") {
    return (
      <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-400">Loading editor…</div>}>
        <ComposeMail />
      </Suspense>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-5">
        <h1 className="text-base font-semibold text-slate-900">Drafts</h1>
        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {drafts.length}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        {drafts.length ? (
          <div className="w-[520px] border-r border-slate-200">
            {drafts.map((draft) => (
              <button
                key={draft.id}
                type="button"
                onClick={() =>
                  openCompose({
                    id: draft.id,
                    to: draft.recipients.to,
                    cc: draft.recipients.cc,
                    bcc: draft.recipients.bcc,
                    subject: draft.subject,
                    body: draft.body,
                    attachments: draft.attachments,
                  })
                }
                className="flex w-full border-b border-slate-200 px-5 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {draft.subject || "(No subject)"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    To: {draft.recipients.to.join(", ")}
                  </p>
                  <p className="mt-2 truncate text-xs text-slate-400">{draft.preview}</p>
                </div>
                <span className="ml-auto shrink-0 text-xs text-slate-400">{draft.createdAt}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No drafts
          </div>
        )}
      </div>
    </div>
  );
}
