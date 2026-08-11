import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export interface PlateRecord {
  id: string;
  rawName: string;
  generatedName: string;
  createdAt: string;
}

let database: Database.Database | null = null;

function resolveDbPath(): string {
  return path.resolve(process.env.DB_PATH ?? "./data/plate.db");
}

function initializeDatabase(): Database.Database {
  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS plates (
      id TEXT PRIMARY KEY,
      raw_name TEXT NOT NULL,
      generated_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  return db;
}

export function getDb(): Database.Database {
  if (!database) {
    database = initializeDatabase();
  }

  return database;
}

export function insertPlate(record: PlateRecord): void {
  const statement = getDb().prepare(`
    INSERT INTO plates (id, raw_name, generated_name, created_at)
    VALUES (@id, @rawName, @generatedName, @createdAt)
  `);

  statement.run(record);
}

export function findPlateById(id: string): PlateRecord | null {
  const statement = getDb().prepare(`
    SELECT id, raw_name AS rawName, generated_name AS generatedName, created_at AS createdAt
    FROM plates
    WHERE id = ?
  `);

  return (statement.get(id) as PlateRecord | undefined) ?? null;
}

export function closeDatabase(): void {
  if (database) {
    database.close();
    database = null;
  }
}
