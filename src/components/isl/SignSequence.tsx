import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Hand,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { speak, speechSynthesisSupported } from "@/lib/isl/speak";
import type { LanguageCode, SignAsset } from "@/lib/isl/types";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.5] as const;
const FALLBACK_MS = 1500;

interface Props {
  signs: SignAsset[];
  language: LanguageCode;
  originalText: string;
}

/**
 * Steps through the sign sequence one sign at a time. When a sign has no video
 * yet, the card shows the sign name and dwells for a beat so the rhythm of the
 * sentence is still readable.
 */
export function SignSequence({ signs, language, originalText }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [loop, setLoop] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const total = signs.length;
  const current = signs[index];

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [signs]);

  const go = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const advance = useCallback(() => {
    setIndex((i) => {
      if (i + 1 < total) return i + 1;
      if (loop) return 0;
      setPlaying(false);
      return i;
    });
  }, [loop, total]);

  useEffect(() => {
    if (!playing || !current) return;
    const video = videoRef.current;
    if (current.available && video) {
      video.playbackRate = speed;
      void video.play().catch(() => {
        /* autoplay blocked — the manual controls still work */
      });
      return;
    }
    const ms = (current.duration ? Number(current.duration) * 1000 : FALLBACK_MS) / speed;
    const timer = setTimeout(advance, ms);
    return () => clearTimeout(timer);
  }, [advance, current, loop, playing, speed]);

  useEffect(() => {
    if (!playing) videoRef.current?.pause();
  }, [playing]);

  const canSpeak = speechSynthesisSupported();

  const status = useMemo(() => {
    if (!current) return "";
    return `Signing ${index + 1} of ${total}: ${current.gloss}`;
  }, [current, index, total]);

  if (total === 0) return null;

  return (
    <section
      aria-label="Sign sequence player"
      tabIndex={0}
      className="rounded-xl border border-border bg-card p-4 shadow-card focus-visible:outline-none sm:p-5"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(index + 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(index - 1);
        } else if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          setPlaying((p) => !p);
        }
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{total} signs in this sentence</Badge>
        <span className="ml-auto text-xs text-muted-foreground">
          Use the left and right arrow keys to step through
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div
          className="relative flex aspect-video min-h-[15rem] items-center justify-center overflow-hidden rounded-lg border border-border bg-surface"
          aria-hidden="true"
        >
          {current?.available && current.video_url ? (
            <video
              key={current.video_url}
              ref={videoRef}
              src={current.video_url}
              playsInline
              muted={false}
              className="size-full object-contain"
              onEnded={advance}
            />
          ) : (
            <div className="px-6 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
                <Hand className="size-7" aria-hidden="true" />
              </span>
              <p className="mt-3 font-display text-2xl font-bold">{current?.gloss}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Video not added yet — the sign name is shown instead
              </p>
            </div>
          )}
          <span className="absolute bottom-2 right-2 rounded bg-background/85 px-2 py-0.5 text-[11px] font-semibold">
            {index + 1} / {total}
          </span>
        </div>

        <div className="flex flex-col">
          <p aria-live="polite" className="sr-only">
            {status}
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Now signing
          </p>
          <p className="mt-1 font-display text-3xl font-bold leading-tight">
            {current?.gloss}
          </p>
          <p className="mt-2 text-base">
            {current?.english ?? "—"}
            {current?.hindi ? <span className="text-muted-foreground"> · {current.hindi}</span> : null}
          </p>
          {current?.category ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Category: {current.category}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setPlaying((p) => !p)}>
              {playing ? (
                <>
                  <Pause className="size-4" aria-hidden="true" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="size-4" aria-hidden="true" />
                  Play sequence
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous sign"
              onClick={() => go(index - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next sign"
              onClick={() => go(index + 1)}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Back to the first sign"
              onClick={() => {
                setPlaying(false);
                setIndex(0);
              }}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </Button>
            {canSpeak ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => speak(originalText, language)}
              >
                <Volume2 className="size-4" aria-hidden="true" />
                Speak text
              </Button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
              {SPEEDS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={speed === option ? "default" : "outline"}
                  className="h-8 px-2.5 text-xs"
                  aria-pressed={speed === option}
                  onClick={() => setSpeed(option)}
                >
                  {option}×
                </Button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={loop} onCheckedChange={setLoop} />
              <span className="inline-flex items-center gap-1.5">
                <Repeat className="size-3.5" aria-hidden="true" />
                Loop
              </span>
            </label>
          </div>
        </div>
      </div>

      <ol className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="All signs in order">
        {signs.map((sign, i) => (
          <li key={`${sign.gloss}-${i}`}>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setIndex(i);
              }}
              aria-current={i === index ? "step" : undefined}
              className={cn(
                "flex min-w-28 flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors",
                i === index
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:bg-accent",
              )}
            >
              <span className="text-[11px] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <span className="text-sm font-bold">{sign.gloss}</span>
              <span className="text-[11px] text-muted-foreground">
                {sign.available ? "video ready" : "name only"}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
