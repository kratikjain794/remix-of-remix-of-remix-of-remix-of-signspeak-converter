import { lazy, Suspense } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { ScanFace } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * The recognition studio touches the camera and runs model inference, so the
 * whole component is browser-only: lazily imported behind <ClientOnly>, the
 * MediaPipe library itself is dynamically imported at load time.
 */
const RecognitionStudio = lazy(() =>
  import("@/components/isl/RecognitionStudio").then((m) => ({
    default: m.RecognitionStudio,
  })),
);

export const Route = createFileRoute("/recognize")({
  head: () => ({
    meta: [
      { title: "Recognize Signs — Camera to Text | ISL Converter" },
      {
        name: "description",
        content:
          "Turn on your camera and see recognised hand signs with confidence scores, spoken output and a session history. Runs entirely in your browser.",
      },
      {
        property: "og:title",
        content: "Recognize Signs with Your Camera — ISL Converter",
      },
      {
        property: "og:description",
        content:
          "A real pre-trained model reads hand poses from your camera, in the browser, with honest confidence reporting.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecognizePage,
});

function RecognizePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <ScanFace className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Signs into words
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Point the camera at a hand and the pre-trained model reports what it sees, with a
          confidence score. Nothing is uploaded — the whole pipeline runs on this device.
        </p>
      </div>
      <ClientOnly
        fallback={
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          }
        >
          <RecognitionStudio />
        </Suspense>
      </ClientOnly>
    </main>
  );
}
