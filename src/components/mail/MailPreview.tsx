import { useState } from "react";
import { Download, Eye, MoreHorizontal, Reply, ReplyAll, Forward } from "lucide-react";
import { useMail } from "@/context/MailContext";
import { getInitials } from "@/utils/mail";
import type { LucideIcon } from "lucide-react";
import type { Attachment } from "@/types/mail";
import AttachmentViewer, {
  isPreviewable,
  downloadAttachment,
  getFileIcon,
  getFileExtension,
  getIconColor,
} from "./AttachmentViewer";

export default function MailPreview() {
  const { selectedMail, reply, replyAll, forward } = useMail();
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  if (!selectedMail) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Reply className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700">Select a message</p>
          <p className="mt-1 text-xs text-slate-400">Choose a message from the list to view it</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {previewAttachment && (
        <AttachmentViewer
          attachment={previewAttachment}
          attachments={selectedMail.attachments ?? []}
          onSelect={setPreviewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}

      <div className="flex h-14 shrink-0 items-center justify-end border-b border-slate-200 px-5">
        <div className="flex items-center gap-1">
          <ToolbarButton icon={Reply} label="Reply" onClick={() => reply(selectedMail)} />
          <ToolbarButton icon={ReplyAll} label="Reply all" onClick={() => replyAll(selectedMail)} />
          <ToolbarButton icon={Forward} label="Forward" onClick={() => forward(selectedMail)} />
          <ToolbarButton icon={MoreHorizontal} label="More" />
        </div>
      </div>

      <article className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-semibold text-slate-900">
            {selectedMail.subject || "(No subject)"}
          </h1>

          <div className="mt-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-800">
              {getInitials(selectedMail.sender.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{selectedMail.sender.name}</p>
              <p className="text-xs text-slate-500">{selectedMail.sender.email}</p>
              <p className="mt-1 text-xs text-slate-400">
                To: {selectedMail.recipients?.to?.join(", ")}
              </p>
            </div>
            <span className="ml-auto text-xs text-slate-400">{selectedMail.createdAt}</span>
          </div>
        </div>

        <div
          className="prose prose-sm max-w-none px-6 py-6 text-slate-700"
          dangerouslySetInnerHTML={{ __html: selectedMail.body }}
        />

        {selectedMail.attachments?.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-5">
            <p className="mb-3 text-sm font-semibold text-slate-800">
              Attachments ({selectedMail.attachments.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {selectedMail.attachments.map((attachment) => {
                const Icon = getFileIcon(attachment.type);
                const canPreview = isPreviewable(attachment.type);

                return (
                  <div
                    key={attachment.id}
                    className="group flex w-[240px] flex-col overflow-hidden rounded-lg border border-slate-200 transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getIconColor(attachment.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {getFileExtension(attachment.name)} - {attachment.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex border-t border-slate-100">
                      {canPreview && (
                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(attachment)}
                          className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => downloadAttachment(attachment)}
                        className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 ${canPreview ? "border-l border-slate-100" : ""}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
