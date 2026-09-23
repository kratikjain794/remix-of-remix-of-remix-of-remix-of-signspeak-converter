import { useCallback, useEffect, useRef, useState } from "react";
import type { SourceLanguage } from "./types";

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getConstructor(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"] ?? null) as
    | (new () => RecognitionLike)
    | null;
}

function messageFor(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was blocked. Allow it in your browser, or type the sentence instead.";
    case "no-speech":
      return "I couldn't hear anything. Check the microphone and try again.";
    case "audio-capture":
      return "No microphone was found. Plug one in or type the sentence instead.";
    case "network":
      return "Voice recognition needs the internet. Try again or type the sentence.";
    default:
      return "I couldn't hear that. Try again or type the sentence instead.";
  }
}

export interface SpeechInput {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  elapsed: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Browser speech-to-text for the voice tab. Kept deliberately small: it only
 * captures a short sentence and hands the text back to the caller.
 */
export function useSpeechInput(language: SourceLanguage): SpeechInput {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSupported(getConstructor() !== null);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(
    () => () => {
      clearTimer();
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    },
    [clearTimer],
  );

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    clearTimer();
  }, [clearTimer]);

  const start = useCallback(() => {
    const Ctor = getConstructor();
    if (!Ctor) {
      setError("This browser has no voice input. Chrome, Edge and Safari support it.");
      return;
    }
    setError(null);
    setTranscript("");
    setElapsed(0);

    const recognition = new Ctor();
    recognition.lang = language === "hi" ? "hi-IN" : language === "en" ? "en-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = String(result[0]?.transcript ?? "");
        if (result.isFinal) final += text;
        else interim += text;
      }
      setTranscript((final || interim).trim());
    };
    recognition.onerror = (event: any) => {
      setError(messageFor(String(event?.error ?? "unknown")));
      setListening(false);
      clearTimer();
    };
    recognition.onend = () => {
      setListening(false);
      clearTimer();
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      clearTimer();
      timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    } catch {
      setError("Voice input could not start. Close other tabs using the microphone and try again.");
      setListening(false);
    }
  }, [clearTimer, language]);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
    setElapsed(0);
  }, []);

  return { supported, listening, transcript, error, elapsed, start, stop, reset };
}
