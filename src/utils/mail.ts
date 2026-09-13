import type { Recipient } from "../types/mail";

export function getInitials(name = ""): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function searchRecipients(recipients: Recipient[], search: string): Recipient[] {
  const value = search.trim().toLowerCase();
  if (!value) return [];
  return recipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(value) ||
      recipient.email.toLowerCase().includes(value)
  );
}

export function createMailId(): string {
  return `mail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
