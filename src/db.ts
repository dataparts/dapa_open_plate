import Database from "better-sqlite3";
import { PlateRecord } from "./plateService";

const db = new Database("openplate.db");

/**
 * Initialize the SQLite database.
 */
db.exec(`
CREATE TABLE IF NOT EXISTS plates (
    id TEXT PRIMARY KEY,
    raw_name TEXT NOT NULL,
    generated_name TEXT NOT NULL,
    created_at TEXT NOT NULL
);
`);

export interface StoredPlate {
    id: string;
    rawName: string;
    generatedName: string;
    createdAt: string;
}

/**
 * Save a generated plate.
 */
export function savePlate(record: PlateRecord, rawName: string): void {
    const stmt = db.prepare(`
        INSERT INTO plates (
            id,
            raw_name,
            generated_name,
            created_at
        )
        VALUES (?, ?, ?, ?)
    `);

    stmt.run(
        record.id,
        rawName,
        record.generatedName,
        new Date().toISOString()
    );
}

/**
 * Retrieve a plate by UUID.
 */
export function getPlate(id: string): StoredPlate | undefined {
    const stmt = db.prepare(`
        SELECT
            id,
            raw_name,
            generated_name,
            created_at
        FROM plates
        WHERE id = ?
    `);

    const row = stmt.get(id) as any;

    if (!row) {
        return undefined;
    }

    return {
        id: row.id,
        rawName: row.raw_name,
        generatedName: row.generated_name,
        createdAt: row.created_at,
    };
}