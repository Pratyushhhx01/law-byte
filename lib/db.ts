import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

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

interface UserTable {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  image: string | null;
  plan: string;
}

interface UserDailyUsageTable {
  userId: string;
  date: Date;
  count: number;
}

interface Database {
  conversation: ConversationTable;
  "user": UserTable;
  user_daily_usage: UserDailyUsageTable;
}

export const db = new Kysely<Database>({ dialect });
