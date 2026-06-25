import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

const dialect = new PostgresDialect({ pool });

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const db = new Kysely<{}>({ dialect });
