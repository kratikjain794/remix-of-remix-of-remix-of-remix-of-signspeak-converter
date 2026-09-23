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

        const glosses: string[] = [];
        const unmatched: string[] = [];
        for (const c of candidates) {
          if (c.literals?.length) {
            glosses.push(...c.literals);
            continue;
          }
          const hit = c.keys.map((k) => index.get(k.toLowerCase())).find(Boolean);
          if (hit) glosses.push(hit);
          else unmatched.push(c.token);
        }

        const ordered = applyIslOrdering(glosses, { isQuestion, isNegated });

        const uniqueGlosses = Array.from(new Set(ordered));
        const { data: signRows } = uniqueGlosses.length
          ? await client
              .from("sign_videos")
              .select("id, gloss, english, hindi, category, video_url, thumbnail_url, duration")
              .in("gloss", uniqueGlosses)
          : { data: [] as never[] };

        const signIndex = new Map((signRows ?? []).map((s) => [s.gloss, s]));
        const signs: SignAsset[] = ordered.map((gloss) => {
          const row = signIndex.get(gloss);
          return {
            id: row?.id ?? null,
            gloss,
            english: row?.english ?? null,
            hindi: row?.hindi ?? null,
            category: row?.category ?? null,
            video_url: row?.video_url ?? null,
            thumbnail_url: row?.thumbnail_url ?? null,
            duration: row?.duration ?? null,
            available: Boolean(row?.video_url),
          };
        });

        const body: TranslationResponse = {
          original_text: parsed.text,
          normalized_text: normalized,
          language,
          detected_language: detectLanguage(parsed.text),
          tokens,
          removed_words: removed,
          gloss_sequence: ordered,
          unmatched_words: unmatched,
          signs,
        };
        return jsonResponse(body);
      },
    },
  },
});
