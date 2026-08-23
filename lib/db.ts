import { Pool } from "@neondatabase/serverless";
import { Kysely, PostgresDialect, Generated } from "kysely";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

const dialect = new PostgresDialect({ pool });

interface ConversationTable {
  id: string;
  userId: string;
  title: string;
  preview: string;
  type: string;
  pinned: boolean;
  messages: unknown;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FeedbackTable {
  id: Generated<string>;
  userId: string;
  messageId: string;
  rating: string;
  comment: string | null;
  createdAt: Generated<Date>;
}

interface ReminderTable {
  id: Generated<string>;
  userId: string;
  title: string;
  deadlineAt: Date;
  type: string;
  completed: boolean | null;
  createdAt: Generated<Date>;
}

interface CaseFolderTable {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: string;
  parties: string;
  court: string;
  nextHearing: Date | null;
  notes: string;
  createdAt: Generated<Date>;
}

interface CaseDocumentTable {
  id: string;
  caseId: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  createdAt: Generated<Date>;
}

interface LegalNoticeTable {
  id: string;
  userId: string;
  caseId: string | null;
  recipientName: string;
  recipientEmail: string;
  recipientAddress: string;
  subject: string;
  content: string;
  status: string;
  sentAt: Date | null;
  createdAt: Generated<Date>;
}

interface Database {
  conversation: ConversationTable;
  feedback: FeedbackTable;
  reminder: ReminderTable;
  case_folder: CaseFolderTable;
  case_document: CaseDocumentTable;
  legal_notice: LegalNoticeTable;
}

export const db = new Kysely<Database>({ dialect });