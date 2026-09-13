import type { Recipient, Mail } from "../types/mail";

export const recipients: Recipient[] = [
  { id: "1", name: "Rahul Sharma", email: "rahul.sharma@navy.gov.in" },
  { id: "2", name: "Rahul Verma", email: "rahul.verma@navy.gov.in" },
  { id: "3", name: "Rajiv Kumar", email: "rajiv.kumar@navy.gov.in" },
  { id: "4", name: "Amit Singh", email: "amit.singh@navy.gov.in" },
  { id: "5", name: "Anil Mehta", email: "anil.mehta@navy.gov.in" },
  { id: "6", name: "Priya Nair", email: "priya.nair@navy.gov.in" },
];

export const mails: Mail[] = [
  {
    id: "mail-1",
    folder: "inbox",
    sender: { name: "Rahul Sharma", email: "rahul.sharma@navy.gov.in" },
    recipients: { to: ["amit.singh@navy.gov.in"] },
    subject: "Operational Briefing - Monday",
    preview: "Please find the operational briefing details...",
    body: `
      <p>Sir,</p>
      <p>Please find the operational briefing details for Monday.</p>
      <p>The briefing will be held at 1000 hrs in the conference room.</p>
      <p>Regards,<br />Rahul Sharma</p>
    `,
    createdAt: "10:30 AM",
    isRead: false,
    isStarred: true,
    attachments: [
      { id: "att-4", name: "Operational_Brief.pdf", size: "1.2 MB", type: "application/pdf" },
    ],
  },
  {
    id: "mail-2",
    folder: "inbox",
    sender: { name: "Rajiv Kumar", email: "rajiv.kumar@navy.gov.in" },
    recipients: { to: ["amit.singh@navy.gov.in"] },
    subject: "Monthly Report",
    preview: "The monthly report has been prepared...",
    body: `
      <p>Sir,</p>
      <p>The monthly report has been prepared and is attached for review.</p>
      <p>Regards,<br />Rajiv Kumar</p>
    `,
    createdAt: "Yesterday",
    isRead: true,
    isStarred: false,
    attachments: [
      { id: "att-1", name: "Monthly_Report.pdf", size: "2.4 MB", type: "application/pdf" },
      { id: "att-2", name: "Naval_Operations.jpg", size: "1.8 MB", type: "image/jpeg" },
      { id: "att-3", name: "Briefing_Notes.txt", size: "12 KB", type: "text/plain" },
    ],
  },
  {
    id: "mail-3",
    folder: "inbox",
    sender: { name: "Priya Nair", email: "priya.nair@navy.gov.in" },
    recipients: { to: ["amit.singh@navy.gov.in"] },
    subject: "Meeting Confirmation",
    preview: "The meeting scheduled for tomorrow is confirmed...",
    body: `
      <p>Sir,</p>
      <p>The meeting scheduled for tomorrow is confirmed.</p>
      <p>Regards,<br />Priya Nair</p>
    `,
    createdAt: "12 Sep",
    isRead: true,
    isStarred: false,
    attachments: [],
  },
  {
    id: "mail-4",
    folder: "outbox",
    sender: { name: "Amit Singh", email: "amit.singh@navy.gov.in" },
    recipients: { to: ["rahul.sharma@navy.gov.in"] },
    subject: "Re: Operational Briefing",
    preview: "Acknowledged. I will attend the briefing...",
    body: `
      <p>Rahul,</p>
      <p>Acknowledged. I will attend the briefing.</p>
      <p>Regards,<br />Amit Singh</p>
    `,
    createdAt: "Yesterday",
    isRead: true,
    isStarred: false,
    attachments: [],
  },
  {
    id: "mail-5",
    folder: "draft",
    sender: { name: "Amit Singh", email: "amit.singh@navy.gov.in" },
    recipients: { to: ["rahul.sharma@navy.gov.in"], cc: [], bcc: [] },
    subject: "Draft Operational Note",
    preview: "Draft operational note...",
    body: `
      <p>Rahul,</p>
      <p>This is a draft operational note.</p>
    `,
    createdAt: "11 Sep",
    isRead: true,
    isStarred: false,
    attachments: [],
  },
];

export const initialMailData = { mails, recipients };
