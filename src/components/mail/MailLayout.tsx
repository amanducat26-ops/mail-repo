import { Outlet } from "react-router-dom";
import MailSidebar from "./MailSidebar";

export default function MailLayout() {
  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-slate-50">
      <MailSidebar />
      <main className="min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
