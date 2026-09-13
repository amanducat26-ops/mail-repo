import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Maximize,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import type { Attachment } from "@/types/mail";

const PREVIEWABLE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
];

const samplePdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT /F1 24 Tf 72 700 Td (Monthly Report - Naval Operations) Tj 0 -36 Td /F1 14 Tf (Prepared by: Rajiv Kumar) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
trailer
<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`;

const sampleTextContent = `BRIEFING NOTES
===============

Date: 12 September 2026
From: Rajiv Kumar
Subject: Monthly Operations Summary

1. OPERATIONAL OVERVIEW
   - All units reported operational readiness at 95%+
   - Two joint exercises completed successfully
   - Coastal patrol coverage maintained at 100%

2. MAINTENANCE STATUS
   - Vessel INS-Vikrant: Routine maintenance complete
   - Vessel INS-Viraat: Dry dock scheduled for Oct 2026
   - All aircraft serviced and certified

Regards,
Rajiv Kumar
Lieutenant Commander`;

const sampleImageUrl =
  "https://images.pexels.com/photos/13019394/pexels-photo-13019394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

function isPreviewable(type: string): boolean {
  return PREVIEWABLE_TYPES.includes(type);
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  return FileText;
}

function getFileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
}

function getIconColor(type: string): string {
  if (type === "application/pdf") return "bg-red-500 text-white";
  if (type.startsWith("image/")) return "bg-sky-100 text-sky-700";
  if (type === "text/plain") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

function getBlobUrl(attachment: Attachment): string {
  if (attachment.file) return URL.createObjectURL(attachment.file);

  if (attachment.type === "application/pdf") {
    return URL.createObjectURL(new Blob([samplePdfContent], { type: "application/pdf" }));
  }

  if (attachment.type === "text/plain") {
    return URL.createObjectURL(new Blob([sampleTextContent], { type: "text/plain" }));
  }

  if (attachment.type.startsWith("image/")) return sampleImageUrl;
  return "";
}

function downloadAttachment(attachment: Attachment) {
  const url = getBlobUrl(attachment);
  if (!url) return;

  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (url.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AttachmentViewer({
  attachment,
  attachments,
  onSelect,
  onClose,
}: {
  attachment: Attachment;
  attachments: Attachment[];
  onSelect: (attachment: Attachment) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    setLoading(true);
    setZoom(100);
    setTextContent("");
    const url = getBlobUrl(attachment);
    setBlobUrl(url);

    if (attachment.type === "text/plain") {
      if (attachment.file) {
        const reader = new FileReader();
        reader.onload = () => setTextContent(String(reader.result ?? ""));
        reader.readAsText(attachment.file);
      } else {
        setTextContent(sampleTextContent);
      }
    }

    const timer = setTimeout(() => setLoading(false), 350);
    return () => {
      clearTimeout(timer);
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [attachment]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f7f3eb] shadow-2xl lg:m-4 lg:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e7dfd2] bg-[#fbf8f2] px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-slate-900">Preview</span>
          </div>

          <div className="flex items-center gap-1 text-slate-600">
            <button type="button" onClick={() => setZoom((value) => Math.max(50, value - 10))} className="rounded-md p-2 hover:bg-slate-200/70" aria-label="Zoom out">
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-14 rounded-md bg-[#f1eadd] px-3 py-1.5 text-center text-xs font-medium text-slate-700">{zoom}%</span>
            <button type="button" onClick={() => setZoom((value) => Math.min(200, value + 10))} className="rounded-md p-2 hover:bg-slate-200/70" aria-label="Zoom in">
              <Plus className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setZoom(100)} className="ml-2 rounded-md p-2 hover:bg-slate-200/70" aria-label="Reset zoom">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} className="rounded-md p-2 hover:bg-slate-200/70" aria-label="Enter fullscreen">
              <Maximize className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => downloadAttachment(attachment)} className="ml-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium hover:bg-slate-200/70">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <main className="relative min-h-0 min-w-0 flex-1 overflow-auto bg-[#202a35]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-300">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Loading preview...</p>
                </div>
              </div>
            ) : attachment.type === "application/pdf" ? (
              <iframe src={blobUrl} title={attachment.name} className="h-full min-h-[420px] w-full border-0 bg-white" />
            ) : attachment.type.startsWith("image/") ? (
              <div className="flex min-h-full items-center justify-center overflow-auto p-5 sm:p-10">
                <img
                  src={blobUrl}
                  alt={attachment.name}
                  className="rounded-sm object-contain shadow-2xl transition-transform duration-200"
                  style={{ width: `${zoom}%`, maxWidth: "none" }}
                />
              </div>
            ) : attachment.type === "text/plain" ? (
              <div className="h-full overflow-y-auto p-6 sm:p-10">
                <pre className="mx-auto max-w-3xl whitespace-pre-wrap rounded-lg bg-white p-6 font-mono text-sm leading-6 text-slate-700 shadow-xl">{textContent}</pre>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center bg-[#202a35] text-center text-white">
                <div>
                  <FileText className="mx-auto mb-3 h-12 w-12 text-slate-400" />
                  <p className="font-medium">No preview available</p>
                  <button type="button" onClick={() => downloadAttachment(attachment)} className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-800">Download file</button>
                </div>
              </div>
            )}
          </main>

          <aside className="flex w-full shrink-0 flex-col border-t border-[#e7dfd2] bg-[#fbf8f2] lg:w-[360px] lg:border-l lg:border-t-0">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#e7dfd2] px-5">
              <h2 className="text-sm font-semibold text-slate-900">Attachments ({attachments.length})</h2>
              <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200/70" aria-label="Close attachments">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
              {attachments.map((item, index) => {
                const ItemIcon = getFileIcon(item.type);
                const isSelected = item.id === attachment.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${isSelected ? "border-[#e5d3a8] bg-[#f7ecd4] shadow-sm" : "border-[#e7dfd2] bg-[#fdfbf7] hover:border-[#d8c7a6] hover:bg-white"}`}
                  >
                    <div className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                      {item.type.startsWith("image/") ? (
                        <img src={getBlobUrl(item)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${getIconColor(item.type)}`}><ItemIcon className="h-5 w-5" /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">{item.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{getFileExtension(item.name)} · {item.size}</p>
                    </div>
                    <Eye className={`h-4 w-4 shrink-0 ${isSelected ? "text-slate-800" : "text-slate-500"}`} />
                    <span className="sr-only">Attachment {index + 1}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export { isPreviewable, downloadAttachment, getFileIcon, getFileExtension, getIconColor };
