import { Pool } from "pg";
import { Kysely, PostgresDialect, Generated } from "kysely";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
  max: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
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

interface Database {
  conversation: ConversationTable;
  feedback: FeedbackTable;
  reminder: ReminderTable;
}

export const db = new Kysely<Database>({ dialect });
