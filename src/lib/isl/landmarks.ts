import type { LandmarkFrame } from "./types";

/** A raw MediaPipe landmark point. */
export interface Point {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/**
 * Upper-body pose points that carry signing information (head, shoulders,
 * arms, hands, hips). Leg points are dropped: they add payload without
 * adding signal for Indian Sign Language.
 */
export const POSE_KEY_INDICES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24,
] as const;

/**
 * A compact subset of the 468-point face mesh: brows, eyes, nose, lips and
 * chin. Enough for the non-manual markers ISL relies on, ~1/30th the payload.
 */
export const FACE_KEY_INDICES = [
  1, 4, 10, 13, 14, 33, 61, 70, 105, 133, 152, 159, 145, 263, 291, 300, 334,
  362, 386, 374, 17, 199,
] as const;

export const HAND_POINTS = 21;
export const POSE_VECTOR_LENGTH = POSE_KEY_INDICES.length * 3;
export const FACE_VECTOR_LENGTH = FACE_KEY_INDICES.length * 3;
export const HAND_VECTOR_LENGTH = HAND_POINTS * 3;
/** Per-frame feature vector length fed to the recognition model. */
export const FRAME_VECTOR_LENGTH =
  HAND_VECTOR_LENGTH * 2 + POSE_VECTOR_LENGTH + FACE_VECTOR_LENGTH;

function round(value: number): number {
  return Math.round(value * 1e4) / 1e4;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Centres a group of points on an anchor and divides by a scale, so the same
 * sign produces the same numbers whether the signer is near or far from the
 * camera, left or right of frame.
 */
function normalizeGroup(
  points: Point[],
  indices: readonly number[],
  anchor: Point,
  scale: number,
): number[] {
  const safeScale = scale > 1e-5 ? scale : 1;
  const out: number[] = [];
  for (const index of indices) {
    const p = points[index];
    if (!p) {
      out.push(0, 0, 0);
      continue;
    }
    out.push(
      round((p.x - anchor.x) / safeScale),
      round((p.y - anchor.y) / safeScale),
      round((p.z ?? 0) / safeScale),
    );
  }
  return out;
}

export interface HolisticResultLike {
  poseLandmarks?: Point[];
  faceLandmarks?: Point[];
  leftHandLandmarks?: Point[];
  rightHandLandmarks?: Point[];
}

/**
 * Turns one MediaPipe Holistic result into a compact, scale- and
 * position-invariant frame. Only these numbers ever leave the device — the
 * camera image itself is never uploaded.
 */
export function normalizeFrame(
  result: HolisticResultLike,
  timestamp: number,
): LandmarkFrame {
  const pose = result.poseLandmarks ?? [];
  const leftShoulder = pose[11];
  const rightShoulder = pose[12];

  const bodyAnchor: Point =
    leftShoulder && rightShoulder
      ? {
          x: (leftShoulder.x + rightShoulder.x) / 2,
          y: (leftShoulder.y + rightShoulder.y) / 2,
          z: ((leftShoulder.z ?? 0) + (rightShoulder.z ?? 0)) / 2,
        }
      : { x: 0.5, y: 0.5, z: 0 };

  const bodyScale =
    leftShoulder && rightShoulder ? distance(leftShoulder, rightShoulder) : 0.3;

  const hands: number[][] = [];
  for (const hand of [result.leftHandLandmarks, result.rightHandLandmarks]) {
    if (!hand || hand.length < HAND_POINTS) {
      hands.push(new Array<number>(HAND_VECTOR_LENGTH).fill(0));
      continue;
    }
    const wrist = hand[0]!;
    const middleBase = hand[9] ?? hand[HAND_POINTS - 1]!;
    hands.push(
      normalizeGroup(
        hand,
        Array.from({ length: HAND_POINTS }, (_, i) => i),
        wrist,
        distance(wrist, middleBase) || 0.1,
      ),
    );
  }

  return {
    hands,
    face: result.faceLandmarks?.length
      ? normalizeGroup(result.faceLandmarks, FACE_KEY_INDICES, bodyAnchor, bodyScale)
      : new Array<number>(FACE_VECTOR_LENGTH).fill(0),
    pose: pose.length
      ? normalizeGroup(pose, POSE_KEY_INDICES, bodyAnchor, bodyScale)
      : new Array<number>(POSE_VECTOR_LENGTH).fill(0),
    timestamp,
  };
}

/** Flattens a frame into a single fixed-length feature vector. */
export function frameToVector(frame: LandmarkFrame): number[] {
  const left = frame.hands[0] ?? [];
  const right = frame.hands[1] ?? [];
  const vector = [
    ...pad(left, HAND_VECTOR_LENGTH),
    ...pad(right, HAND_VECTOR_LENGTH),
    ...pad(frame.pose, POSE_VECTOR_LENGTH),
    ...pad(frame.face, FACE_VECTOR_LENGTH),
  ];
  return vector;
}

function pad(values: number[] | undefined, length: number): number[] {
  const source = values ?? [];
  if (source.length === length) return source;
  const out = source.slice(0, length);
  while (out.length < length) out.push(0);
  return out;
}

/**
 * Resamples a captured sequence to exactly `length` frames so every model
 * receives a fixed-size tensor, regardless of how fast frames arrived.
 */
export function resampleSequence(
  frames: LandmarkFrame[],
  length: number,
): LandmarkFrame[] {
  if (frames.length === 0) return [];
  if (frames.length === length) return frames;
  const out: LandmarkFrame[] = [];
  for (let i = 0; i < length; i += 1) {
    const position = (i * (frames.length - 1)) / Math.max(length - 1, 1);
    out.push(frames[Math.round(position)]!);
  }
  return out;
}

/** True when at least one hand was detected in the frame. */
export function frameHasHands(frame: LandmarkFrame): boolean {
  return frame.hands.some((hand) => hand.some((value) => value !== 0));
}

/** Share of frames in which a hand was visible — the pipeline's quality gate. */
export function handCoverage(frames: LandmarkFrame[]): number {
  if (!frames.length) return 0;
  return frames.filter(frameHasHands).length / frames.length;
}
