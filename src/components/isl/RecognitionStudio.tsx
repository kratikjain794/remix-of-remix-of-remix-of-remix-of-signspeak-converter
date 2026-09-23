import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Hand,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/isl/speak";
import type { SignAsset } from "@/lib/isl/types";

import {
  DEFAULT_CONFIDENCE_THRESHOLD,
  GESTURE_CATALOG,
  HAND_CONNECTIONS,
  HISTORY_COOLDOWN_MS,
  INFERENCE_INTERVAL_MS,
  SMOOTHING_WINDOW,
  gestureInfo,
} from "@/lib/isl/recognition/gestures";
import {
  GestureRecognizerClient,
  type GestureRecognizerResult,
} from "@/lib/isl/recognition/gesture-recognizer";

type ModelState = "loading" | "ready" | "error";
type CameraState = "off" | "starting" | "on" | "denied" | "unavailable" | "error";

interface RingEntry {
  category: string;
  score: number;
  handPresent: boolean;
}

interface HistoryEntry {
  category: string;
  label: string;
  score: number;
  at: number;
}

/** The sign currently shown, or why nothing is shown. */
type Detection =
  | { kind: "sign"; category: string; label: string; score: number }
  | { kind: "no-hand" }
  | { kind: "low-confidence"; category: string; score: number };

function gestureLabel(category: string): string {
  return gestureInfo(category)?.label ?? category.replaceAll("_", " ");
}

/**
 * Live sign-recognition studio. Runs a real pre-trained MediaPipe Gesture
 * Recognizer entirely in the browser — camera frames never leave the device.
 *
 * Honesty note surfaced in the UI: this model recognises generic hand poses,
 * not full ISL. It sits behind the project's model adapter, so an ISL-trained
 * model can replace it later without any UI change.
 */
export function RecognitionStudio() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const recognizerRef = useRef<GestureRecognizerClient | null>(null);
  const ringRef = useRef<RingEntry[]>([]);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastTimestampRef = useRef<number>(0);
  const lastHistoryRef = useRef<{ category: string; at: number }>({ category: "", at: 0 });
  const thresholdRef = useRef(DEFAULT_CONFIDENCE_THRESHOLD);
  const runningRef = useRef(false);

  const [modelState, setModelState] = useState<ModelState>("loading");
  const [cameraState, setCameraState] = useState<CameraState>("off");
  const [paused, setPaused] = useState(false);
  const [threshold, setThreshold] = useState(DEFAULT_CONFIDENCE_THRESHOLD);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [libraryMatch, setLibraryMatch] = useState<{
    asset: SignAsset | null;
    category: string;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  // ---- Model lifecycle -----------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    const client = new GestureRecognizerClient();
    recognizerRef.current = client;
    setModelState("loading");
    client
      .load()
      .then(() => {
        if (!cancelled) setModelState("ready");
      })
      .catch(() => {
        if (!cancelled) setModelState("error");
      });
    return () => {
      cancelled = true;
      client.dispose();
      if (recognizerRef.current === client) recognizerRef.current = null;
    };
  }, []);

  // ---- Drawing ---------------------------------------------------------------

  const drawOverlay = useCallback((result: GestureRecognizerResult | null) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hands = result?.landmarks ?? [];
    for (const hand of hands) {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
      ctx.lineWidth = 2;
      for (const [a, b] of HAND_CONNECTIONS) {
        const pa = hand[a];
        const pb = hand[b];
        if (!pa || !pb) continue;
        ctx.beginPath();
        ctx.moveTo(pa.x * canvas.width, pa.y * canvas.height);
        ctx.lineTo(pb.x * canvas.width, pb.y * canvas.height);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffffff";
      for (const p of hand) {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  // ---- Recognition logic ----------------------------------------------------

  const commitHistory = useCallback((category: string, score: number) => {
    const now = Date.now();
    const last = lastHistoryRef.current;
    if (last.category === category && now - last.at < HISTORY_COOLDOWN_MS) return;
    lastHistoryRef.current = { category, at: now };
    setHistory((prev) =>
      [{ category, label: gestureLabel(category), score, at: now }, ...prev].slice(0, 12),
    );
  }, []);

  const processResult = useCallback(
    (result: GestureRecognizerResult | null) => {
      drawOverlay(result);

      const ring = ringRef.current;
      const handCount = result?.landmarks?.length ?? 0;
      const top = result?.gestures?.[0]?.[0];
      ring.push({
        category: handCount > 0 && top ? top.categoryName : "None",
        score: top?.score ?? 0,
        handPresent: handCount > 0,
      });
      while (ring.length > SMOOTHING_WINDOW) ring.shift();

      const latest = ring[ring.length - 1];
      if (!latest || !latest.handPresent) {
        setDetection({ kind: "no-hand" });
        return;
      }

      // Majority vote over the recent window to stop predictions flashing.
      const counts = new Map<string, { count: number; total: number }>();
      for (const e of ring) {
        if (!e.handPresent || e.category === "None") continue;
        const cur = counts.get(e.category) ?? { count: 0, total: 0 };
        cur.count += 1;
        cur.total += e.score;
        counts.set(e.category, cur);
      }
      let winner: { category: string; count: number; mean: number } | null = null;
      for (const [category, { count, total }] of counts) {
        const mean = total / count;
        if (!winner || count > winner.count || (count === winner.count && mean > winner.mean)) {
          winner = { category, count, mean };
        }
      }

      const needed = Math.ceil(SMOOTHING_WINDOW / 2);
      if (!winner || winner.count < needed || winner.mean < thresholdRef.current) {
        setDetection({
          kind: "low-confidence",
          category: top?.categoryName ?? "",
          score: top?.score ?? 0,
        });
        return;
      }
      setDetection({
        kind: "sign",
        category: winner.category,
        label: gestureLabel(winner.category),
        score: winner.mean,
      });
      commitHistory(winner.category, winner.mean);
    },
    [commitHistory, drawOverlay],
  );

  const startLoop = useCallback(() => {
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const video = videoRef.current;
      const recognizer = recognizerRef.current;
      if (!video || !recognizer || !runningRef.current) return;
      if (video.readyState < 2 || video.currentTime === lastVideoTimeRef.current) return;
      lastVideoTimeRef.current = video.currentTime;
      const now = performance.now();
      if (now - lastTimestampRef.current < INFERENCE_INTERVAL_MS) return;
      lastTimestampRef.current = now;
      let result: GestureRecognizerResult | null = null;
      try {
        result = recognizer.detect(video, now);
      } catch {
        result = null;
      }
      processResult(result);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [processResult]);

  // ---- Camera controls -------------------------------------------------------

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      setCameraError("This browser does not support camera access.");
      return;
    }
    setCameraState("starting");
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
      ringRef.current = [];
      lastVideoTimeRef.current = -1;
      lastTimestampRef.current = 0;
      runningRef.current = true;
      setPaused(false);
      setCameraState("on");
      startLoop();
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraState("denied");
        setCameraError(
          "Camera permission was denied. Allow camera access in your browser settings, then try again.",
        );
      } else if (
        name === "NotFoundError" ||
        name === "OverconstrainedError" ||
        name === "NotReadableError"
      ) {
        setCameraState("unavailable");
        setCameraError("No usable camera was found. Check that a camera is connected and not in use by another app.");
      } else {
        setCameraState("error");
        setCameraError("The camera could not be started. Please try again.");
      }
    }
  }, [startLoop]);

  const stopCamera = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    ringRef.current = [];
    setCameraState("off");
    setPaused(false);
    setDetection(null);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const togglePause = useCallback(() => {
    setPaused((prev) => {
      const next = !prev;
      runningRef.current = !next;
      if (!next) {
        ringRef.current = [];
        lastVideoTimeRef.current = -1;
        lastTimestampRef.current = 0;
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    ringRef.current = [];
    lastHistoryRef.current = { category: "", at: 0 };
    setDetection(null);
    setHistory([]);
    setLibraryMatch(null);
  }, []);

  // Full cleanup when leaving the page.
  useEffect(
    () => () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  // ---- Sign-library lookup for the latest confirmed gesture ------------------

  useEffect(() => {
    const category = history[0]?.category;
    if (!category) {
      setLibraryMatch(null);
      return;
    }
    if (libraryMatch?.category === category) return;
    let cancelled = false;
    setLibraryMatch({ asset: null, category });
    const run = async () => {
      try {
        let asset: SignAsset | null = null;
        const columns = "id, gloss, english, hindi, category, video_url, thumbnail_url, duration";
        const byText = await supabase
          .from("sign_videos")
          .select(columns)
          .eq("is_active", true)
          .or(`gloss.ilike.${category},english.ilike.${category}`)
          .limit(1);
        let row = byText.data?.[0];
        if (!row) {
          const byKeyword = await supabase
            .from("sign_videos")
            .select(columns)
            .eq("is_active", true)
            .contains("keywords", [category])
            .limit(1);
          row = byKeyword.data?.[0];
        }
        if (row) {
          asset = {
            id: row.id,
            gloss: row.gloss,
            english: row.english,
            hindi: row.hindi,
            category: row.category,
            video_url: row.video_url,
            thumbnail_url: row.thumbnail_url,
            duration: row.duration,
            available: Boolean(row.video_url),
          };
        }
        if (!cancelled) setLibraryMatch({ asset, category });
      } catch {
        if (!cancelled) setLibraryMatch({ asset: null, category });
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [history, libraryMatch?.category]);

  // ---- Render -----------------------------------------------------------------

  const cameraOn = cameraState === "on";
  const modelReady = modelState === "ready";
  const spokenText = detection?.kind === "sign" ? detection.label : "";

  const statusLabel = (() => {
    if (modelState === "loading") return "Loading model…";
    if (modelState === "error") return "Model failed to load";
    if (cameraState === "off") return "Camera off";
    if (cameraState === "starting") return "Starting camera…";
    if (cameraState === "denied") return "Camera permission denied";
    if (cameraState === "unavailable") return "Camera not found";
    if (cameraState === "error") return "Camera error";
    return paused ? "Camera on — recognition paused" : "Recognizing…";
  })();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-display">Live camera</CardTitle>
            <Badge
              variant={modelState === "error" || cameraState === "denied" || cameraState === "unavailable" ? "destructive" : "secondary"}
            >
              {statusLabel}
            </Badge>
            {modelState === "loading" ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
          </div>
          <CardDescription>
            Everything runs in your browser. The camera image never leaves this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
            <video
              ref={videoRef}
              className="absolute inset-0 size-full object-cover"
              style={{ transform: "scaleX(-1)" }}
              playsInline
              muted
              aria-label="Live camera preview, mirrored"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 size-full"
              style={{ transform: "scaleX(-1)" }}
              aria-hidden="true"
            />
            {!cameraOn ? (
              <div className="absolute inset-0 grid place-items-center bg-background/80 p-6 text-center">
                <div>
                  <CameraOff className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-2 text-sm font-medium">Camera is off</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {modelState === "loading"
                      ? "The recognition model is still loading — one moment."
                      : modelState === "error"
                        ? "The model failed to load. Retry below; the rest of the app is unaffected."
                        : "Turn the camera on to start recognizing hand signs."}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <p aria-live="polite" className="sr-only">{statusLabel}</p>

          <div className="flex flex-wrap gap-2">
            {cameraOn ? (
              <Button variant="outline" onClick={stopCamera}>
                <CameraOff className="size-4" aria-hidden="true" />
                Turn camera off
              </Button>
            ) : (
              <Button onClick={() => void startCamera()} disabled={!modelReady || cameraState === "starting"}>
                {modelState === "loading" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Camera className="size-4" aria-hidden="true" />
                )}
                {cameraState === "starting" ? "Starting…" : "Turn camera on"}
              </Button>
            )}
            <Button variant="outline" onClick={togglePause} disabled={!cameraOn}>
              {paused ? (
                <>
                  <Play className="size-4" aria-hidden="true" />
                  Resume recognition
                </>
              ) : (
                <>
                  <Pause className="size-4" aria-hidden="true" />
                  Pause recognition
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => spokenText && speak(spokenText, "en")}
              disabled={!spokenText}
            >
              <Volume2 className="size-4" aria-hidden="true" />
              Speak
            </Button>
            {modelState === "error" ? (
              <Button
                variant="destructive"
                onClick={() => {
                  const client = new GestureRecognizerClient();
                  recognizerRef.current = client;
                  setModelState("loading");
                  client.load().then(() => setModelState("ready")).catch(() => setModelState("error"));
                }}
              >
                Retry model
              </Button>
            ) : null}
          </div>

          {cameraError ? (
            <Alert variant="destructive">
              <CameraOff className="size-4" aria-hidden="true" />
              <AlertTitle>Camera problem</AlertTitle>
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          ) : null}

          <div>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="confidence-threshold" className="font-medium">
                Confidence threshold
              </label>
              <span className="text-muted-foreground">{Math.round(threshold * 100)}%</span>
            </div>
            <Slider
              id="confidence-threshold"
              className="mt-2"
              min={0.3}
              max={0.95}
              step={0.05}
              value={[threshold]}
              onValueChange={(value) => setThreshold(value[0] ?? DEFAULT_CONFIDENCE_THRESHOLD)}
              aria-label="Confidence threshold"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Detected sign</CardTitle>
            <CardDescription>Updated only when the prediction is stable and above your threshold.</CardDescription>
          </CardHeader>
          <CardContent>
            {detection?.kind === "sign" ? (
              <div aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Detected sign
                </p>
                <p className="mt-1 font-display text-4xl font-extrabold tracking-tight">
                  {detection.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confidence: {Math.round(detection.score * 100)}%
                </p>
                <p className="mt-2 text-sm">
                  Text: <span className="font-medium">{detection.label}</span>
                </p>
              </div>
            ) : detection?.kind === "low-confidence" ? (
              <div aria-live="polite">
                <p className="font-display text-2xl font-bold text-muted-foreground">Low confidence</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {detection.category
                    ? `Possible: ${gestureLabel(detection.category)} at ${Math.round(detection.score * 100)}% — below your ${Math.round(threshold * 100)}% threshold. Hold the pose steady.`
                    : "Hold your hand up steadily in view of the camera."}
                </p>
              </div>
            ) : (
              <div aria-live="polite">
                <p className="font-display text-2xl font-bold text-muted-foreground">No sign detected</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cameraOn
                    ? "No hand is visible. Raise your hand into the frame."
                    : "Turn the camera on to begin."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent signs</CardTitle>
            <CardDescription>Confirmed predictions from this session, newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing recognized yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {history.map((entry) => (
                  <li key={`${entry.category}-${entry.at}`}>
                    <span className="gloss-chip">
                      {entry.label}
                      <span className="ml-1 text-muted-foreground">{Math.round(entry.score * 100)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">In the sign library</CardTitle>
            <CardDescription>Checked against the ISL dictionary for the latest confirmed sign.</CardDescription>
          </CardHeader>
          <CardContent>
            {!libraryMatch ? (
              <p className="text-sm text-muted-foreground">Recognize a sign to see its dictionary entry.</p>
            ) : libraryMatch.asset ? (
              <div>
                <p className="font-display text-lg font-bold">{libraryMatch.asset.gloss}</p>
                {libraryMatch.asset.english ? (
                  <p className="text-sm text-muted-foreground">{libraryMatch.asset.english}</p>
                ) : null}
                {libraryMatch.asset.video_url ? (
                  <video
                    className="mt-3 w-full rounded-lg border border-border"
                    src={libraryMatch.asset.video_url}
                    controls
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No video recorded for this sign yet.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{libraryMatch.category.replaceAll("_", " ")}</span> is
                not in the ISL sign library yet — no fake media is shown for missing signs.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Alert>
          <Hand className="size-4" aria-hidden="true" />
          <AlertTitle>Honest about what this recognizes</AlertTitle>
          <AlertDescription>
            This page runs Google&rsquo;s pre-trained MediaPipe gesture model, entirely in your
            browser. It recognises {GESTURE_CATALOG.length} generic hand poses:
            {" "}{GESTURE_CATALOG.map((g) => g.label).join(", ")}. These are{" "}
            <span className="font-semibold">not full ISL signs</span> — ISL grammar and one- and
            two-handed signs need a model trained on ISL data. The pipeline is built as a model
            adapter, so a trained ISL model can be plugged in here without changing this interface.
            {detection?.kind === "sign" && gestureInfo(detection.category)
              ? ` ${gestureInfo(detection.category)!.description}`
              : ""}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
