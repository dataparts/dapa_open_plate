/**
 * -----------------------------------------------------------------------------
 * Open Plate - Universal File Naming API
 * -----------------------------------------------------------------------------
 * File: src/nameParser.ts
 *
 * Responsible for:
 *  - Parsing raw filenames
 *  - Tokenization
 *  - Stop-word removal
 *  - Brand overrides
 *  - Consonant reduction
 *  - 4-letter code generation
 *
 * This file DOES NOT:
 *  - Generate UUIDs
 *  - Generate dates
 *  - Assemble the final Open Plate filename
 * -----------------------------------------------------------------------------
 */

export interface ParsedFileName {
    place: string;
    persona: string;
    purpose: string;
    extras: string[];
    extension: string;
}

/**
 * Minimal stop words.
 *
 * The PR only specifies stop-word removal but does not define
 * the complete list, so we intentionally keep it conservative.
 */
const STOP_WORDS = new Set([
    "the",
    "a",
    "an",
    "of",
    "to",
    "for",
    "and",
    "in",
    "on",
    "at",
    "by",
    "with",
    "from"
]);

/**
 * Explicit brand overrides required by the specification.
 */
const BRAND_OVERRIDES: Record<string, string> = {
    google: "gogl",
    chrome: "chrm",
    passwords: "pswd",
    password: "pswd"
};

/**
 * Remove non-alphanumeric characters.
 */
function sanitizeWord(word: string): string {
    return word
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

/**
 * Consonant reduction fallback.
 *
 * Example:
 *
 * chrome
 * ↓
 * chrm
 *
 * microsoft
 * ↓
 * mcrs
 */
function consonantReduce(word: string): string {

    if (word.length <= 4) {
        return word;
    }

    const first = word[0];

    const consonants =
        word
            .slice(1)
            .replace(/[aeiou]/g, "");

    const reduced = first + consonants;

    if (reduced.length >= 4) {
        return reduced.substring(0, 4);
    }

    return reduced;
}

/**
 * Convert a token into a standardized code.
 */
function generateCode(word: string): string {

    const cleaned = sanitizeWord(word);

    if (!cleaned) {
        return "";
    }

    if (BRAND_OVERRIDES[cleaned]) {
        return BRAND_OVERRIDES[cleaned];
    }

    if (cleaned.length <= 4) {
        return cleaned;
    }

    return consonantReduce(cleaned);
}

/**
 * Convert a filename into cleaned tokens.
 */
function tokenize(rawFileName: string): string[] {

    return rawFileName
        .toLowerCase()
        .split(/[\s._\-()]+/)
        .map(token => token.trim())
        .filter(Boolean)
        .filter(token => !STOP_WORDS.has(token));
}

/**
 * Parse a raw filename into Open Plate components.
 *
 * Example:
 *
 * google chrome passwords.csv
 *
 * ↓
 *
 * {
 *   place: "gogl",
 *   persona: "chrm",
 *   purpose: "pswd",
 *   extras: [],
 *   extension: "csv"
 * }
 */
export function parseFileName(rawFileName: string): ParsedFileName {

    const trimmed = rawFileName.trim();

    const lastDot = trimmed.lastIndexOf(".");

    const extension =
        lastDot >= 0
            ? trimmed.substring(lastDot + 1).toLowerCase()
            : "";

    const filename =
        lastDot >= 0
            ? trimmed.substring(0, lastDot)
            : trimmed;

    const tokens = tokenize(filename);

    const codes = tokens
        .map(generateCode)
        .filter(Boolean);

    const place = codes.length > 0 ? codes[0] : "";

    const persona = codes.length > 1 ? codes[1] : "";

    const purpose = codes.length > 2 ? codes[2] : "";

    const extras =
        codes.length > 3
            ? codes.slice(3)
            : [];

    return {
        place,
        persona,
        purpose,
        extras,
        extension
    };
}