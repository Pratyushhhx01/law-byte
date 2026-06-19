import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const dialect = new PostgresDialect({ pool });

export const db = new Kysely<{}>({ dialect });
