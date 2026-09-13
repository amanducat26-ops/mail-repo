import { memo } from "react";
import { Paperclip, Star } from "lucide-react";
import { useMail } from "@/context/MailContext";
import { getInitials } from "@/utils/mail";
import type { Mail } from "@/types/mail";

export default function MailList({ mails }: { mails: Mail[] }) {
  const { selectedMail, openMail } = useMail();

  if (!mails.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        No messages
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {mails.map((mail) => (
        <MailListItem
          key={mail.id}
          mail={mail}
          selected={selectedMail?.id === mail.id}
          onClick={() => openMail(mail)}
        />
      ))}
    </div>
  );
}

const MailListItem = memo(function MailListItem({
  mail,
  selected,
  onClick,
}: {
  mail: Mail;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full border-b border-slate-200 border-l-2 px-4 py-3 text-left transition-colors",
        selected ? "border-l-blue-800 bg-blue-50" : "border-l-transparent hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-800">
          {getInitials(mail.sender.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span
              className={[
                "truncate text-sm",
                mail.isRead ? "text-slate-600" : "font-semibold text-slate-900",
              ].join(" ")}
            >
              {mail.sender.name}
            </span>
            <span className="shrink-0 text-xs text-slate-400">{mail.createdAt}</span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span
              className={[
                "truncate text-sm",
                mail.isRead ? "text-slate-700" : "font-semibold text-slate-900",
              ].join(" ")}
            >
              {mail.subject || "(No subject)"}
            </span>
            {mail.attachments?.length > 0 && (
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            )}
          </div>

          <p className="mt-1 truncate text-xs text-slate-500">{mail.preview}</p>
        </div>

        {mail.isStarred && <Star className="h-4 w-4 shrink-0 fill-current text-amber-500" />}
      </div>
    </button>
  );
});
