import type { LanguageCode } from "./types";

export function speechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Reads text aloud with the browser's own voices. No audio leaves the device.
 * Returns false when the browser has no speech engine available.
 */
export function speak(text: string, language: LanguageCode): boolean {
  if (!speechSynthesisSupported() || !text.trim()) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (speechSynthesisSupported()) window.speechSynthesis.cancel();
}
