import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, Database, Eye, Layers, ScanLine, Volume2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How it works — ISL Converter" },
      {
        name: "description",
        content:
          "How English and Hindi sentences become an Indian Sign Language gloss sequence, how signs are read back into words, and where the limits are.",
      },
      { property: "og:title", content: "How ISL Converter works" },
      {
        property: "og:description",
        content:
          "The translation pipeline, the camera pipeline, the data model and the honest limits of the demo classifier.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const PIPELINE = [
  {
    icon: ScanLine,
    title: "Detect and clean",
    body: "Devanagari characters point to Hindi, otherwise English. Quotation marks are normalised, spacing is collapsed and the sentence is split into words.",
  },
  {
    icon: Layers,
    title: "Drop what has no sign",
    body: "Articles, copulas and particles carry no sign of their own. They are removed and listed so you can see exactly what changed.",
  },
  {
    icon: Database,
    title: "Look up the gloss",
    body: "Each word is tried as typed, then lemmatised (arriving → arrive), then matched against the English and Hindi entries of the sign dictionary. Long digit strings become one sign per digit.",
  },
  {
    icon: Eye,
    title: "Order toward ISL",
    body: "Time markers move to the front, question words to the end, and negation is marked last. This is an approximation, and the interface says so.",
  },
  {
    icon: Volume2,
    title: "Retrieve the signs",
    body: "Every gloss is matched to a dictionary entry. If no video has been added yet, the card shows the sign name rather than pretending to be a video.",
  },
];

const CAMERA = [
  "MediaPipe runs in the browser and extracts hand, face and posture points from each frame.",
  "Frames are buffered into a fixed-length window, then sent as compact numbers — never as video.",
  "A prediction is accepted only above the confidence threshold, and the same sign is not repeated back to back.",
  "Accepted signs are appended to a sentence you can read in English or Hindi and speak aloud.",
];

const STACK = [
  { icon: Cpu, label: "Classifier adapter", body: "demo | pytorch | transformer, with a stored model registry so a trained model can be attached later." },
  { icon: Database, label: "Managed database", body: "Signs, gloss mappings, recognition classes, settings and per-user history with row-level security." },
  { icon: Layers, label: "Server endpoints", body: "Translation, transcription, recognition, dictionary and history routes with the same JSON contract." },
];

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="secondary">Project documentation</Badge>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        How ISL Converter works
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The app moves information in two directions: words into a sign sequence, and
        signs back into words. Both directions share one dictionary so that a sign and
        its gloss never drift apart.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Words into signs
        </h2>
        <ol className="mt-5 space-y-4">
          {PIPELINE.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border border-border bg-card p-5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-base font-bold">
                  {i + 1}. {step.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Signs into words
        </h2>
        <ul className="mt-4 space-y-3">
          {CAMERA.map((line) => (
            <li key={line} className="flex gap-3 text-sm">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-muted-foreground">{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">Built with</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {STACK.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-5">
              <item.icon className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 font-display text-sm font-bold">{item.label}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold tracking-tight">
          What it does not do
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>· It is not a certified translation tool and produces no legally valid output.</li>
          <li>· The shipped classifier is a demo used for interface testing; its confidence numbers are not model accuracy.</li>
          <li>· ISL grammar is richer than the ordering rules here, so a fluent signer may sign a sentence differently.</li>
          <li>· Words outside the dictionary are reported as unmatched rather than guessed.</li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/translate">
          <Button size="lg">
            Open the translator
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </Link>
        <Link to="/">
          <Button size="lg" variant="outline">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
