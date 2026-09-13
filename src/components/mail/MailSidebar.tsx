import { Archive, FileText, Inbox, Mail, Send, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useMail } from "@/context/MailContext";

const items = [
  { label: "Inbox", path: "/mail/inbox", icon: Inbox },
  { label: "Outbox", path: "/mail/outbox", icon: Send },
  { label: "Drafts", path: "/mail/drafts", icon: FileText },
  { label: "Archive", path: "/mail/archive", icon: Archive },
  { label: "Deleted", path: "/mail/deleted", icon: Trash2 },
];

export default function MailSidebar() {
  const { openCompose } = useMail();

  return (
    <aside className="flex w-[230px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-800 text-white">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Mail</p>
          <p className="text-xs text-slate-400">Navy Mail</p>
        </div>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={() => openCompose()}
          className="w-full rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
        >
          Compose
        </button>
      </div>

      <nav className="space-y-1 px-3">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-blue-50 font-semibold text-blue-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
