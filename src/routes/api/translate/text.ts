import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  createServerPublicClient,
  errorResponse,
  jsonResponse,
} from "@/lib/isl/server-db.server";
import {
  applyIslOrdering,
  buildCandidates,
  detectLanguage,
  tokenise,
} from "@/lib/isl/nlp";
import type { SignAsset, TranslationResponse } from "@/lib/isl/types";

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
  source_language: z.enum(["en", "hi", "auto"]).default("auto"),
});

/**
 * POST /api/translate/text
 * English/Hindi text -> ISL gloss sequence -> sign video assets.
 */
export const Route = createFileRoute("/api/translate/text")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return errorResponse("Invalid request body. Provide { text, source_language }.", 422);
        }

        const language =
          parsed.source_language === "auto"
            ? detectLanguage(parsed.text)
            : parsed.source_language;

        const { normalized, tokens, removed, isQuestion, isNegated } = tokenise(
          parsed.text,
          language,
        );
        const candidates = buildCandidates(tokens, language);

        const client = createServerPublicClient();
        const { data: mappings, error } = await client
          .from("isl_gloss_mappings")
          .select("english_word, hindi_word, isl_gloss, priority")
          .order("priority", { ascending: true });

        if (error) {
          return errorResponse("AI service is currently unavailable. Please try again.", 503);
        }

        const index = new Map<string, string>();
        for (const m of mappings ?? []) {
          for (const key of [m.english_word, m.hindi_word]) {
            if (!key) continue;
            const k = key.toLowerCase();
            if (!index.has(k)) index.set(k, m.isl_gloss);
          }
        }

        /** One input word mapped to its gloss, before sign expansion. */
        interface WordEntry {
          word: string;
          gloss: string;
          fromDictionary: boolean;
          /** Whether this word can be fingerspelled letter by letter (Latin letters only). */
          spellable: boolean;
        }

        const entries: WordEntry[] = [];
        for (const c of candidates) {
          if (c.literals?.length) {
            // Digits: ONE TWO THREE — word-level, not fingerspelled.
            for (const literal of c.literals) {
              entries.push({ word: literal, gloss: literal, fromDictionary: false, spellable: false });
            }
            continue;
          }
          const hit = c.keys.map((k) => index.get(k.toLowerCase())).find(Boolean);
          if (hit) {
            entries.push({ word: c.token, gloss: hit, fromDictionary: true, spellable: false });
          } else {
            entries.push({
              word: c.token,
              gloss: c.token.toUpperCase(),
              fromDictionary: false,
              spellable: /^[A-Za-z]+$/.test(c.token),
            });
          }
        }

        const ordered = applyIslOrdering(entries, { isQuestion, isNegated });
        if (isNegated) {
          ordered.push({ word: "not", gloss: "NO", fromDictionary: false, spellable: false });
        }

        // Fetch dictionary sign rows plus every letter row needed for fingerspelling.
        const neededGlosses = new Set<string>(ordered.map((e) => e.gloss));
        const neededLetters = new Set<string>();
        for (const e of ordered) {
          if (!e.fromDictionary && e.spellable) {
            for (const ch of e.word.toUpperCase()) neededLetters.add(ch);
          }
        }
        const lookup = [...neededGlosses, ...neededLetters];
        const { data: signRows } = lookup.length
          ? await client
              .from("sign_videos")
              .select("id, gloss, english, hindi, category, video_url, thumbnail_url, duration")
              .in("gloss", lookup)
          : { data: [] as never[] };
        const signIndex = new Map((signRows ?? []).map((s) => [s.gloss, s]));

        // Expand every word into: dictionary sign -> A-Z fingerspelling -> labelled fallback.
        const signs: SignAsset[] = [];
        for (const entry of ordered) {
          if (entry.fromDictionary) {
            const row = signIndex.get(entry.gloss);
            signs.push({
              id: row?.id ?? null,
              gloss: entry.gloss,
              english: row?.english ?? entry.word,
              hindi: row?.hindi ?? null,
              category: row?.category ?? null,
              video_url: row?.video_url ?? null,
              thumbnail_url: row?.thumbnail_url ?? null,
              duration: row?.duration ?? null,
              available: Boolean(row && (row.video_url || row.thumbnail_url)),
              kind: "word",
            });
            continue;
          }
          if (entry.spellable) {
            for (const ch of entry.word.toUpperCase()) {
              const row = signIndex.get(ch);
              signs.push({
                id: row?.id ?? null,
                gloss: ch,
                english: entry.word,
                hindi: null,
                category: "fingerspelling",
                video_url: null,
                thumbnail_url: row?.thumbnail_url ?? null,
                duration: 0.9,
                available: Boolean(row?.thumbnail_url),
                kind: "letter",
              });
            }
            continue;
          }
          signs.push({
            id: null,
            gloss: entry.gloss,
            english: entry.word,
            hindi: null,
            category: "unavailable",
            video_url: null,
            thumbnail_url: null,
            duration: null,
            available: false,
            kind: "unavailable",
          });
        }

        const unmatched = Array.from(
          new Set(
            signs
              .filter((s) => s.kind === "unavailable")
              .map((s) => s.english ?? s.gloss),
          ),
        );

        const body: TranslationResponse = {
          original_text: parsed.text,
          normalized_text: normalized,
          language,
          detected_language: detectLanguage(parsed.text),
          tokens,
          removed_words: [],
          gloss_sequence: ordered.map((e) => e.gloss),
          unmatched_words: unmatched,
          signs,
        };
        return jsonResponse(body);
      },
    },
  },
});
