import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import Database from "bun:sqlite";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { type D1DatabaseLike } from "../index";

let dbInstance: BunSQLiteDatabase | null = null;

export const obtenerDb = (_d1?: D1DatabaseLike): BunSQLiteDatabase => {
  if (!dbInstance) {
    const dbPath = process.env.DB_PATH || "./data/alvas.db";
    const dbDir = dirname(dbPath);
    
    mkdirSync(dbDir, { recursive: true });
    
    const sqlite = new Database(dbPath, {
      create: true,
    });
    sqlite.exec("PRAGMA journal_mode = WAL");
    sqlite.exec("PRAGMA foreign_keys = ON");
    dbInstance = drizzle(sqlite);
  }
  return dbInstance;
};

export const resetDb = () => {
  dbInstance = null;
};
