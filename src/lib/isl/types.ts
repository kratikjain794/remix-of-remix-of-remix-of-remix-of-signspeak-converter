export type LanguageCode = "en" | "hi";
export type SourceLanguage = LanguageCode | "auto";

export interface SignAsset {
  id: string | null;
  gloss: string;
  english: string | null;
  hindi: string | null;
  category: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  available: boolean;
  /** "word" = dictionary sign, "letter" = one fingerspelled letter, "unavailable" = no sign form at all. */
  kind?: "word" | "letter" | "unavailable";
}

export interface TranslationResponse {
  original_text: string;
  normalized_text: string;
  language: LanguageCode;
  detected_language: LanguageCode;
  tokens: string[];
  removed_words: string[];
  gloss_sequence: string[];
  unmatched_words: string[];
  signs: SignAsset[];
}

export interface TranscriptionResponse {
  text: string;
  language: LanguageCode;
  confidence: number;
  model: string;
}

/** A single MediaPipe frame: normalized hand, face and pose landmarks. */
export interface LandmarkFrame {
  hands: number[][];
  face: number[];
  pose: number[];
  timestamp: number;
}

export interface RecognitionRequest {
  sequence: LandmarkFrame[];
  target_language?: LanguageCode;
}

export interface RecognitionResponse {
  gloss: string | null;
  confidence: number;
  english: string | null;
  hindi: string | null;
  model_mode: string;
  model_name: string;
  threshold: number;
  low_confidence: boolean;
  message?: string;
}

export interface ModelStatus {
  mode: string;
  model_name: string;
  version: string;
  status: "loaded" | "not_loaded";
  sequence_length: number;
  confidence_threshold: number;
  prediction_interval: number;
  vocabulary_size: number;
}
