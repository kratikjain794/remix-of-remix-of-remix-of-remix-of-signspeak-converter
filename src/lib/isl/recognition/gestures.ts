/**
 * Browser-safe constants and metadata for the recognition pipeline.
 * No browser APIs here — this module is SSR-safe by design.
 */

/** The pre-trained MediaPipe Gesture Recognizer model (Google, free, client-side). */
export const GESTURE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

/** Matching WASM runtime for the installed @mediapipe/tasks-vision version. */
export const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";

/** Inference runs at most this often (ms) — full frame rate is not needed. */
export const INFERENCE_INTERVAL_MS = 180;

/** Number of recent predictions kept for majority-vote smoothing. */
export const SMOOTHING_WINDOW = 5;

/** Default confidence below which a prediction is shown as "low confidence". */
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.6;

/** Minimum ms between two identical entries in the recent-signs history. */
export const HISTORY_COOLDOWN_MS = 1500;

/**
 * The categories the pre-trained model can actually recognise. These are its
 * real output classes — displayed exactly as the model reports them, never
 * relabelled as ISL signs.
 */
export interface GestureInfo {
  /** Raw model class name, e.g. "Open_Palm". */
  category: string;
  /** Human-readable phrasing shown in the UI. */
  label: string;
  /** Plain-language description of the hand pose. */
  description: string;
}

export const GESTURE_CATALOG: GestureInfo[] = [
  {
    category: "Open_Palm",
    label: "Open palm",
    description: "All five fingers extended, hand open.",
  },
  {
    category: "Closed_Fist",
    label: "Closed fist",
    description: "Fingers folded into the palm.",
  },
  {
    category: "Pointing_Up",
    label: "Pointing up",
    description: "Index finger extended upward.",
  },
  {
    category: "Thumb_Up",
    label: "Thumb up",
    description: "Fist with the thumb pointing upward.",
  },
  {
    category: "Thumb_Down",
    label: "Thumb down",
    description: "Fist with the thumb pointing downward.",
  },
  {
    category: "Victory",
    label: "Victory",
    description: "Index and middle finger extended in a V.",
  },
  {
    category: "ILoveYou",
    label: "I love you",
    description: "Thumb, index and little finger extended.",
  },
];

export function gestureInfo(category: string): GestureInfo | null {
  return GESTURE_CATALOG.find((g) => g.category === category) ?? null;
}

/** 21-point hand skeleton connections used to draw the landmark overlay. */
export const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];
