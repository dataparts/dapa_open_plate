import { randomUUID } from "crypto";
import { ParsedFileName, parseFileName } from "./nameParser";

/**
 * Represents a generated Open Plate record.
 */
export interface PlateRecord {
    id: string;
    rawName: string;
    generatedName: string;
    parsed: ParsedFileName;
}

/**
 * Default language identifier.
 */
const DEFAULT_LANGUAGE = "usen";

/**
 * Returns the configured platform.
 *
 * Defaults to "dapa" unless overridden by
 * the PLATFORM environment variable.
 */
function getPlatform(): string {
    return process.env.PLATFORM || "dapa";
}

/**
 * Generate the Open Plate date code.
 *
 * Specification:
 *
 * 1. Start with YYMMDD.
 * 2. Remove leading zero from month.
 * 3. Remove leading zero from day.
 * 4. If BOTH month and day originally contained
 *    no leading zeros, remove the first digit
 *    of the year.
 *
 * Example:
 *
 * 2026-08-11
 * ↓
 * 6811
 */
export function generateDateCode(date: Date = new Date()): string {

    let year = date.getFullYear().toString().slice(-2);

    const originalMonth =
        String(date.getMonth() + 1).padStart(2, "0");

    const originalDay =
        String(date.getDate()).padStart(2, "0");

    let month = originalMonth;
    let day = originalDay;

    if (month.startsWith("0")) {
        month = month.substring(1);
    }

    if (day.startsWith("0")) {
        day = day.substring(1);
    }

    if (
        !originalMonth.startsWith("0") &&
        !originalDay.startsWith("0")
    ) {
        year = year.substring(1);
    }

    return `${year}${month}${day}`;
}

/**
 * Assemble the final standardized filename.
 */
export function generatePlateName(
    parsed: ParsedFileName,
    date: Date = new Date()
): string {

    const parts: string[] = [

        getPlatform(),

        parsed.place,

        parsed.persona,

        parsed.purpose,

        ...parsed.extras,

        DEFAULT_LANGUAGE,

        generateDateCode(date)

    ].filter(Boolean);

    const extension =
        parsed.extension.trim().length > 0
            ? parsed.extension
            : "NAKF";

    return `${parts.join("_")}.${extension}`;
}

/**
 * Complete Open Plate workflow.
 *
 * Raw filename
 * ↓
 * Parse
 * ↓
 * Generate standardized filename
 * ↓
 * Generate UUID
 * ↓
 * Return record
 */
export function createPlate(
    rawFileName: string
): PlateRecord {

    const parsed = parseFileName(rawFileName);

    const generatedName =
        generatePlateName(parsed);

    return {

        id: randomUUID(),

        rawName: rawFileName,

        generatedName,

        parsed

    };
}