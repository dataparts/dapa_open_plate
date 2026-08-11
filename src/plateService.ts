import { v4 as uuidv4 } from "uuid";
import { insertPlate, findPlateById, PlateRecord } from "./db";
import { parseRawName } from "./nameParser";

export interface CreatePlateResult {
  id: string;
  generatedName: string;
}

const DEFAULT_LANGUAGE_CODE = "usen";

function normalizeFixedCode(value: string, fallback: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const source = normalized || fallback;
  return source.slice(0, 4).padEnd(4, "x");
}

export function getDateCode(now: Date = new Date()): string {
  // Spec: YYMMDD, strip zeros, then if both month and day have no zeros strip
  // the first digit of the year. Example: 2026-08-11 → YY=26, M=8, D=11.
  // M and D have no zeros → strip first year digit → "6811".
  let yearStr = String(now.getUTCFullYear() % 100);
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const monthStr = String(month);
  const dayStr = String(day);

  if (!monthStr.includes("0") && !dayStr.includes("0")) {
    yearStr = yearStr.replace(/^0*/, "").slice(-1) || yearStr;
  }

  return `${yearStr}${monthStr}${dayStr}`;
}

export function getPlatformCode(): string {
  return normalizeFixedCode(process.env.PLATFORM ?? "dapa", "dapa");
}

export function generatePlateName(rawName: string, now: Date = new Date()): string {
  const parsed = parseRawName(rawName);
  const segments = [
    getPlatformCode(),
    parsed.place,
    parsed.persona,
    parsed.purpose,
    ...parsed.extras,
    DEFAULT_LANGUAGE_CODE,
    getDateCode(now)
  ].filter(Boolean);

  return `${segments.join("_")}.${parsed.extension}`;
}

export function createPlate(rawName: string, now: Date = new Date()): CreatePlateResult {
  const generatedName = generatePlateName(rawName, now);
  const record: PlateRecord = {
    id: uuidv4(),
    rawName,
    generatedName,
    createdAt: now.toISOString()
  };

  insertPlate(record);

  return {
    id: record.id,
    generatedName: record.generatedName
  };
}

export function getPlate(id: string): PlateRecord | null {
  return findPlateById(id);
}
