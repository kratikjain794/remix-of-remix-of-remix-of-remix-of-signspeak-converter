import type {
  GestureRecognizer as MPGestureRecognizer,
  GestureRecognizerResult,
} from "@mediapipe/tasks-vision";

import {
  GESTURE_MODEL_URL,
  MEDIAPIPE_WASM_URL,
} from "./gestures";

export type { GestureRecognizerResult };

/**
 * Thin wrapper around the pre-trained MediaPipe Gesture Recognizer.
 *
 * Everything browser-specific — the dynamic library import, WASM loading and
 * model download — happens inside `load()`, so this module is safe to import
 * from anywhere without breaking SSR.
 */
export class GestureRecognizerClient {
  private recognizer: MPGestureRecognizer | null = null;
  private loading: Promise<void> | null = null;

  readonly name = "MediaPipe Gesture Recognizer";
  readonly version = "gesture_recognizer float16 v1";
  /** Honest mode label: this is a generic pre-trained model, not an ISL one. */
  readonly mode = "pretrained-gesture" as const;

  isReady(): boolean {
    return this.recognizer !== null;
  }

  /** True while the model files are downloading / initialising. */
  isLoading(): boolean {
    return this.loading !== null;
  }

  /**
   * Downloads and initialises the model. Idempotent and failure-tolerant:
   * callers get a rejected promise they can surface as "Model failed to load".
   */
  async load(): Promise<void> {
    if (this.recognizer) return;
    if (!this.loading) {
      this.loading = this.doLoad().finally(() => {
        this.loading = null;
      });
    }
    return this.loading;
  }

  private async doLoad(): Promise<void> {
    // Dynamic import: the library must never execute during SSR.
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

    const create = (delegate: "GPU" | "CPU") =>
      vision.GestureRecognizer.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: GESTURE_MODEL_URL,
          delegate,
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

    try {
      this.recognizer = await create("GPU");
    } catch {
      // Some machines / browsers have no usable WebGL context — fall back.
      this.recognizer = await create("CPU");
    }
  }

  /**
   * Runs one video-frame inference. `timestampMs` must be strictly
   * increasing; callers use their own monotonic counter.
   */
  detect(video: HTMLVideoElement, timestampMs: number): GestureRecognizerResult | null {
    if (!this.recognizer) return null;
    return this.recognizer.recognizeForVideo(video, timestampMs);
  }

  /** Frees the native model and WASM resources. The instance cannot be reused. */
  dispose(): void {
    this.recognizer?.close();
    this.recognizer = null;
  }
}
