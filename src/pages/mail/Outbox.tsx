import { useMail } from "@/context/MailContext";
import MailList from "@/components/mail/MailList";
import MailPreview from "@/components/mail/MailPreview";
import ComposeMail from "@/components/mail/ComposeMail";

export default function Outbox() {
  const { mails, mode } = useMail();
  const outbox = mails.filter((mail) => mail.folder === "outbox");

  if (mode === "composing") return <ComposeMail />;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-5">
        <h1 className="text-base font-semibold text-slate-900">Outbox</h1>
        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {outbox.length}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="w-[380px] shrink-0 border-r border-slate-200 bg-white">
          <MailList mails={outbox} />
        </div>
        <div className="min-w-0 flex-1">
          <MailPreview />
        </div>
      </div>
    </div>
  );
}
