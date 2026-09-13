import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { MailProvider } from "@/context/MailContext";
import MailLayout from "@/components/mail/MailLayout";
import Inbox from "@/pages/mail/Inbox";
import Outbox from "@/pages/mail/Outbox";
import Drafts from "@/pages/mail/Drafts";
import SimpleFolder from "@/pages/mail/SimpleFolder";

export default function App() {
  return (
    <BrowserRouter>
      <MailProvider>
        <Routes>
          <Route path="/mail" element={<MailLayout />}>
            <Route index element={<Navigate to="inbox" replace />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="outbox" element={<Outbox />} />
            <Route path="drafts" element={<Drafts />} />
            <Route
              path="archive"
              element={<SimpleFolder folder="archive" title="Archive" />}
            />
            <Route
              path="deleted"
              element={<SimpleFolder folder="deleted" title="Deleted" />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/mail/inbox" replace />} />
        </Routes>
        <Toaster position="bottom-right" />
      </MailProvider>
    </BrowserRouter>
  );
}
