import type { LandmarkFrame } from "@/lib/isl/types";

export interface VocabularyEntry {
  class_index: number;
  gloss: string;
  english: string;
  hindi: string | null;
}

export interface PreparedSequence {
  /** Fixed-length sequence of normalized frames. */
  frames: LandmarkFrame[];
  /** frames.length x FRAME_VECTOR_LENGTH feature matrix. */
  vectors: number[][];
  /** Share of frames where at least one hand was visible (0-1). */
  handCoverage: number;
}

export interface Prediction {
  class_index: number;
  confidence: number;
}

export interface ModelConfig {
  mode: string;
  modelPath: string | null;
  sequenceLength: number;
  confidenceThreshold: number;
  predictionInterval: number;
  cooldownMs: number;
  inferenceUrl: string | null;
}

/**
 * Every recognition backend implements this one interface, so the browser
 * never changes when the project moves from the demo heuristic to trained
 * weights.
 */
export interface ISLRecognitionModel {
  readonly name: string;
  readonly version: string;
  /** "demo" is shown to users as Demo Recognition Mode. */
  readonly mode: "demo" | "production";
  readonly architecture: string;
  isReady(): boolean;
  predict(
    input: PreparedSequence,
    vocabulary: VocabularyEntry[],
  ): Promise<Prediction>;
}

export class ModelUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelUnavailableError";
  }
}
