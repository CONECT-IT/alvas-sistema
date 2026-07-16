import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import Database from "bun:sqlite";
import { type D1DatabaseLike } from "../index";

let dbInstance: BunSQLiteDatabase | null = null;

export const obtenerDb = (_d1?: D1DatabaseLike): BunSQLiteDatabase => {
  if (!dbInstance) {
    const sqlite = new Database(process.env.DB_PATH || "./data/alvas.db", {
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
