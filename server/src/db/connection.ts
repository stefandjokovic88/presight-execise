import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSchema } from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** SQLite file lives at server/data/users.db */
export const DATA_DIR = path.resolve(__dirname, "../../data");
export const DB_PATH = path.join(DATA_DIR, "users.db");

let dbInstance: Database.Database | null = null;

export function getDb(dbPath: string = DB_PATH): Database.Database {
  if (dbInstance && dbPath === DB_PATH) {
    return dbInstance;
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  createSchema(db);

  if (dbPath === DB_PATH) {
    dbInstance = db;
  }

  return db;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
