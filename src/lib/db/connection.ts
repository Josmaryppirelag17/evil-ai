import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!DATABASE_URL) {
    console.warn("[db] DATABASE_URL not configured — returning null");
    return null;
  }
  if (!db) {
    const sql = neon(DATABASE_URL);
    db = drizzle(sql, { schema });
  }
  return db;
}

export type Db = ReturnType<typeof getDb>;
