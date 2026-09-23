/**
 * NLP layer for English/Hindi -> ISL gloss.
 *
 * NOTE ON GRAMMAR: Indian Sign Language does NOT share English or Hindi
 * grammar. ISL is broadly topic-comment with a tendency toward
 * subject-object-verb ordering, drops copulas, articles and most inflection,
 * and places question words at the end of the utterance. What follows is a
 * rule-based approximation used to produce a readable gloss sequence — it is
 * not a full ISL grammar model, and the UI states that openly.
 */
import type { LanguageCode } from "./types";

const DEVANAGARI = /[\u0900-\u097F]/;

export function detectLanguage(text: string): LanguageCode {
  const devanagariChars = (text.match(/[\u0900-\u097F]/g) ?? []).length;
  const latinChars = (text.match(/[A-Za-z]/g) ?? []).length;
  if (devanagariChars > 0 && devanagariChars >= latinChars) return "hi";
  return "en";
}

export function isDevanagari(word: string): boolean {
  return DEVANAGARI.test(word);
}

/**
 * Filler words (articles, copulas, particles) are deliberately KEPT: every
 * input word must end up as a sign, a fingerspelled word, or a clearly
 * labelled "sign unavailable" card — never silently dropped.
 */

const QUESTION_WORDS = new Set([
  "WHAT", "WHERE", "WHEN", "WHO", "WHY", "HOW", "WHICH",
]);

const NUMBER_WORDS: Record<string, string> = {
  "0": "ZERO", "1": "ONE", "2": "TWO", "3": "THREE", "4": "FOUR",
  "5": "FIVE", "6": "SIX", "7": "SEVEN", "8": "EIGHT", "9": "NINE",
};

/** Very small English lemmatiser — ISL glosses are uninflected. */
export function lemmatise(word: string): string {
  const w = word.toLowerCase();
  const irregular: Record<string, string> = {
    children: "child", men: "man", women: "woman", feet: "foot",
    went: "go", goes: "go", going: "go", gone: "go",
    came: "come", coming: "come", comes: "come",
    arriving: "arrive", arrives: "arrive", arrived: "arrive",
    waiting: "wait", waits: "wait", waited: "wait",
    departing: "depart", departs: "depart", departed: "depart",
    delayed: "late", running: "run", helped: "help", helping: "help",
  };
  if (irregular[w]) return irregular[w];
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

export function normalizeText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export interface TokenisedInput {
  normalized: string;
  tokens: string[];
  removed: string[];
  isQuestion: boolean;
  isNegated: boolean;
}

export function tokenise(text: string, language: LanguageCode): TokenisedInput {
  void language; // kept for API stability; filler words are no longer removed
  const normalized = normalizeText(text);
  const isQuestion = /[?？]/.test(normalized);
  const rawTokens = normalized
    .replace(/[.,!?;:"()\[\]]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const tokens: string[] = [];
  const removed: string[] = [];
  let isNegated = false;

  for (const raw of rawTokens) {
    const lower = raw.toLowerCase();
    if (lower === "not" || lower === "don't" || lower === "dont" || raw === "नहीं" || raw === "मत") {
      // Negation is carried by the NO sign appended at the end of the sequence.
      isNegated = true;
      continue;
    }
    tokens.push(raw);
  }

  return { normalized, tokens, removed, isQuestion, isNegated };
}

export interface GlossCandidate {
  /** the token as typed */
  token: string;
  /** lookup keys, most specific first */
  keys: string[];
  /** glosses produced directly, without a dictionary lookup */
  literals?: string[];
}

export function buildCandidates(tokens: string[], language: LanguageCode): GlossCandidate[] {
  return tokens.map((token) => {
    if (/^\d+$/.test(token)) {
      // Digits are signed one at a time, so 123 reads as ONE TWO THREE.
      return {
        token,
        keys: [token],
        literals: token.split("").map((d) => NUMBER_WORDS[d] ?? d),
      };
    }
    const keys = new Set<string>();
    const lower = token.toLowerCase();
    keys.add(lower);
    if (language === "en") keys.add(lemmatise(token));
    keys.add(token);
    return { token, keys: Array.from(keys) };
  });
}

/**
 * Reorders a list of word-level entries toward ISL structure:
 * time markers first, question words last. Generic so callers keep their own
 * entry objects; every entry exposes a `gloss` string. Negation (a "NO" entry)
 * is appended by the caller after reordering.
 */
const TIME_GLOSSES = new Set([
  "MORNING", "EVENING", "NIGHT", "TODAY", "TOMORROW", "YESTERDAY", "NOW", "TIME", "LATE",
]);

export function applyIslOrdering<T extends { gloss: string }>(
  entries: T[],
  opts: { isQuestion: boolean; isNegated: boolean },
): T[] {
  void opts;
  const time = entries.filter((e) => TIME_GLOSSES.has(e.gloss));
  const questions = entries.filter((e) => QUESTION_WORDS.has(e.gloss));
  const rest = entries.filter((e) => !TIME_GLOSSES.has(e.gloss) && !QUESTION_WORDS.has(e.gloss));
  return [...time, ...rest, ...questions];
}
