import { useEffect, useState } from "react";
import { Download, Eye, FileText, Image, Loader2, X } from "lucide-react";
import type { Attachment } from "@/types/mail";

const PREVIEWABLE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp", "text/plain"];

function isPreviewable(type: string): boolean {
  return PREVIEWABLE_TYPES.includes(type);
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type === "application/pdf" || type === "text/plain") return FileText;
  return FileText;
}

function getFileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
}

function getIconColor(type: string): string {
  if (type === "application/pdf") return "bg-red-100 text-red-700";
  if (type.startsWith("image/")) return "bg-green-100 text-green-700";
  if (type === "text/plain") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

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

3. PERSONNEL
   - 42 personnel completed advanced training
   - 8 promotions approved for Q3
   - New postings effective 01 Oct 2026

4. UPCOMING COMMITMENTS
   - Joint naval exercise with friendly navies (Oct 15-22)
   - Annual fleet review preparation begins Oct 1
   - Command staff conference scheduled Oct 10

Regards,
Rajiv Kumar
Lieutenant Commander`;

const sampleImageUrl = "https://images.pexels.com/photos/13019394/pexels-photo-13019394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

function getBlobUrl(attachment: Attachment): string {
  if (attachment.file) {
    return URL.createObjectURL(attachment.file);
  }

  if (attachment.type === "application/pdf") {
    const blob = new Blob([samplePdfContent], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  }

  if (attachment.type === "text/plain") {
    const blob = new Blob([sampleTextContent], { type: "text/plain" });
    return URL.createObjectURL(blob);
  }

  if (attachment.type.startsWith("image/")) {
    return sampleImageUrl;
  }

  return "";
}

function downloadAttachment(attachment: Attachment) {
  const url = getBlobUrl(attachment);
  const a = document.createElement("a");
  a.href = url;
  a.download = attachment.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (attachment.file || attachment.type === "application/pdf" || attachment.type === "text/plain") {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export default function AttachmentViewer({
  attachment,
  onClose,
}: {
  attachment: Attachment;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    const url = getBlobUrl(attachment);
    setBlobUrl(url);

    if (attachment.type === "text/plain") {
      if (attachment.file) {
        const reader = new FileReader();
        reader.onload = () => setTextContent(reader.result as string);
        reader.readAsText(attachment.file);
      } else {
        setTextContent(sampleTextContent);
      }
    }

    const timer = setTimeout(() => setLoading(false), 500);
    return () => {
      clearTimeout(timer);
      if (url && (attachment.file || attachment.type === "application/pdf" || attachment.type === "text/plain")) {
        URL.revokeObjectURL(url);
      }
    };
  }, [attachment]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const Icon = getFileIcon(attachment.type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${getIconColor(attachment.type)}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{attachment.name}</p>
              <p className="text-xs text-slate-400">{attachment.size}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadAttachment(attachment)}
              className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-hidden bg-slate-50">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500">Loading preview...</p>
              </div>
            </div>
          ) : attachment.type === "application/pdf" ? (
            <iframe
              src={blobUrl}
              title={attachment.name}
              className="h-full w-full border-0"
            />
          ) : attachment.type.startsWith("image/") ? (
            <div className="flex h-full items-center justify-center overflow-auto p-6">
              <img
                src={blobUrl}
                alt={attachment.name}
                className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
              />
            </div>
          ) : attachment.type === "text/plain" ? (
            <div className="h-full overflow-y-auto p-6">
              <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-6 font-mono text-sm leading-6 text-slate-700">
                {textContent}
              </pre>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                  <FileText className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium text-slate-700">No preview available</p>
                <p className="mt-1 text-xs text-slate-400">
                  Download the file to view it
                </p>
                <button
                  type="button"
                  onClick={() => downloadAttachment(attachment)}
                  className="mt-4 flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { isPreviewable, downloadAttachment, getFileIcon, getFileExtension, getIconColor };
