const STOP_WORDS = new Set(["the", "a", "an", "of", "in", "for", "and", "or", "to", "from"]);
const EXTENSION_PATTERN = /^[a-z0-9]{1,10}$/i;
const COMMON_EXTENSIONS = new Set(["csv", "txt", "pdf", "doc", "docx", "xls", "xlsx", "json", "xml", "png", "jpg", "jpeg", "zip"]);
const CODE_OVERRIDES: Record<string, string> = {
  google: "gogl",
  chrome: "chrm",
  passwords: "pswd",
  password: "pswd",
  amazon: "amzn",
  firefox: "frfx",
  document: "dcmt",
  documents: "docs",
  docs: "docs",
  export: "expr",
  drive: "drve",
  safari: "sfri",
  edge: "edge",
  notes: "note",
  photos: "phto"
};

export interface ParsedNameParts {
  place: string;
  persona: string;
  purpose: string;
  extras: string[];
  extension: string;
  words: string[];
}

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function padCode(code: string): string {
  return code.slice(0, 4).padEnd(4, "x");
}

function buildFallbackCode(word: string): string {
  const normalized = normalizeToken(word);
  if (!normalized) {
    return "unkn";
  }

  if (normalized.length <= 4) {
    return padCode(normalized);
  }

  const chars = normalized.split("");
  const secondChar = chars[1] ?? "";
  const remaining = chars.slice(2);
  let code = chars[0];

  if (/[aeiou]/.test(secondChar)) {
    code += secondChar;
  }

  for (const char of remaining) {
    if (code.length >= 4) {
      break;
    }
    if (!/[aeiou]/.test(char)) {
      code += char;
    }
  }

  if (code.length < 4 && secondChar && !/[aeiou]/.test(secondChar) && !code.includes(secondChar)) {
    code += secondChar;
  }

  for (const char of chars.slice(1)) {
    if (code.length >= 4) {
      break;
    }
    if (!code.includes(char)) {
      code += char;
    }
  }

  return padCode(code);
}

export function toFourLetterCode(word: string): string {
  const normalized = normalizeToken(word);
  if (!normalized) {
    return "unkn";
  }

  return CODE_OVERRIDES[normalized] ?? buildFallbackCode(normalized);
}

function extractExtension(rawName: string): { baseName: string; extension: string } {
  const trimmed = rawName.trim();
  const dottedExtension = trimmed.match(/\.([a-z0-9]{1,10})$/i);

  if (dottedExtension) {
    return {
      baseName: trimmed.slice(0, -dottedExtension[0].length).trim(),
      extension: dottedExtension[1].toLowerCase()
    };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  const trailingToken = normalizeToken(parts[parts.length - 1] ?? "");
  if (COMMON_EXTENSIONS.has(trailingToken) && EXTENSION_PATTERN.test(trailingToken)) {
    return {
      baseName: parts.slice(0, -1).join(" "),
      extension: trailingToken
    };
  }

  return { baseName: trimmed, extension: "nakf" };
}

export function parseRawName(rawName: string): ParsedNameParts {
  if (typeof rawName !== "string" || !rawName.trim()) {
    throw new Error("rawName must be a non-empty string");
  }

  const { baseName, extension } = extractExtension(rawName);
  if (!EXTENSION_PATTERN.test(extension)) {
    throw new Error("Input file extension is invalid");
  }

  const words = baseName
    .split(/[^a-zA-Z0-9]+/)
    .map(normalizeToken)
    .filter((word) => word && !STOP_WORDS.has(word));

  if (words.length === 0) {
    throw new Error("rawName must contain at least one significant word");
  }

  const codes = words.map(toFourLetterCode);
  const [place = "", persona = "", purpose = "", ...extras] = codes;

  return {
    place,
    persona,
    purpose,
    extras,
    extension,
    words
  };
}
