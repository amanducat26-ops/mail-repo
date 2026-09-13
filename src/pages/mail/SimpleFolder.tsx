import { Suspense, lazy, useMemo } from "react";
import { useMail } from "@/context/MailContext";
import MailList from "@/components/mail/MailList";
import MailPreview from "@/components/mail/MailPreview";
import type { MailFolder } from "@/types/mail";

const ComposeMail = lazy(() => import("@/components/mail/ComposeMail"));

export default function SimpleFolder({
  folder,
  title,
}: {
  folder: MailFolder;
  title: string;
}) {
  const { mails, mode } = useMail();
  const folderMails = useMemo(() => mails.filter((mail) => mail.folder === folder), [mails, folder]);

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
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {folderMails.length}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="w-[380px] shrink-0 border-r border-slate-200 bg-white">
          <MailList mails={folderMails} />
        </div>
        <div className="min-w-0 flex-1">
          <MailPreview />
        </div>
      </div>
    </div>
  );
}
