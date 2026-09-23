import type { SourceLanguage, TranslationResponse } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const UNAVAILABLE = "AI service is currently unavailable. Please try again.";

/**
 * Sends text to the translation endpoint and returns the gloss sequence plus
 * the sign assets that back it. Throws ApiError with a user-facing message.
 */
export async function translateText(
  text: string,
  sourceLanguage: SourceLanguage = "auto",
): Promise<TranslationResponse> {
  let response: Response;
  try {
    response = await fetch("/api/translate/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source_language: sourceLanguage }),
    });
  } catch {
    throw new ApiError("Network problem. Check your connection and try again.");
  }

  const payload = (await response.json().catch(() => null)) as
    | (Partial<TranslationResponse> & { error?: string })
    | null;

  if (!response.ok) {
    throw new ApiError(payload?.error ?? UNAVAILABLE, response.status);
  }
  if (!payload || !Array.isArray(payload.signs)) {
    throw new ApiError(UNAVAILABLE, response.status);
  }
  return payload as TranslationResponse;
}
