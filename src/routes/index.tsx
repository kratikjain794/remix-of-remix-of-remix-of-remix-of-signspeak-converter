import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  Building2,
  GraduationCap,
  HeartHandshake,
  Keyboard,
  Languages,
  ShieldCheck,
  Stethoscope,
  Train,
  Type,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ISL Converter — English and Hindi to Indian Sign Language" },
      {
        name: "description",
        content:
          "Type or speak in English or Hindi and see the Indian Sign Language sequence, word by word. Signs can also be read back into words.",
      },
      { property: "og:title", content: "ISL Converter — English and Hindi to Indian Sign Language" },
      {
        property: "og:description",
        content:
          "A two-way communication aid: text and speech become a sign sequence, and signs become words.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FLOW = [
  {
    icon: Type,
    title: "1 · You type or speak",
    body: "English or Hindi, one sentence at a time. Voice input uses your browser's microphone.",
  },
  {
    icon: Languages,
    title: "2 · Words become gloss",
    body: "Filler words are dropped and the sentence is reordered toward ISL structure.",
  },
  {
    icon: Video,
    title: "3 · Gloss becomes signs",
    body: "Each gloss is matched to the sign dictionary and played as a sequence.",
  },
  {
    icon: Camera,
    title: "4 · Signs become words",
    body: "The camera tracks hands, face and posture and turns them back into English or Hindi.",
  },
];

const USE_CASES = [
  {
    icon: Train,
    title: "Railway enquiry",
    body: "Platform, delay and ticket questions answered in the signer's language.",
  },
  {
    icon: Stethoscope,
    title: "Hospital reception",
    body: "Symptoms, appointments and directions without waiting for an interpreter.",
  },
  {
    icon: GraduationCap,
    title: "Classrooms",
    body: "Instructions and announcements shown as a sign sequence students can follow.",
  },
  {
    icon: Building2,
    title: "Public offices",
    body: "Forms, documents and counters made accessible at the point of service.",
  },
];

const WHY = [
  {
    icon: ShieldCheck,
    title: "Video never leaves the device",
    body: "The camera extracts hand, face and posture points locally; only those compact numbers are sent for a prediction.",
  },
  {
    icon: HeartHandshake,
    title: "Honest about its limits",
    body: "The shipped classifier is labelled a demo everywhere, and words with no sign are reported instead of guessed.",
  },
  {
    icon: Keyboard,
    title: "Keyboard and screen-reader friendly",
    body: "Every control is reachable by Tab, the player steps with arrow keys, and status changes are announced.",
  },
];

function Index() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <Badge variant="secondary" className="mb-5">
              Two-way Indian Sign Language communication
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Between speech and sign,
              <span className="block text-primary">both ways.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Type or speak in English or Hindi and watch the sentence turn into an
              Indian Sign Language sequence. Then point the camera the other way and
              read signs back into words.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/translate">
                <Button size="lg">
                  Translate a sentence
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  How it works
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No account needed to try it. Works best in Chrome.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-lift">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Example
            </p>
            <p className="mt-2 font-display text-xl font-bold">
              “Where is the train station?”
            </p>
            <div className="my-4 flex items-center gap-2 text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <ArrowRight className="size-4" aria-hidden="true" />
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="gloss-chip">TRAIN</span>
              <span className="gloss-chip">STATION</span>
              <span className="gloss-chip">WHERE</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              “is” and “the” carry no sign of their own, so they are dropped and shown
              separately. Question words move to the end, as in ISL.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          The two-way flow
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          One pipeline for words into signs, one for signs into words. They share the
          same dictionary of signs.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((step) => (
            <li
              key={step.title}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-display text-base font-bold">{step.title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Where it helps
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((useCase) => (
              <div key={useCase.title} className="rounded-xl border border-border bg-card p-5">
                <useCase.icon className="size-6 text-primary" aria-hidden="true" />
                <p className="mt-3 font-display text-base font-bold">{useCase.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{useCase.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Why this build is careful
            </h2>
            <p className="mt-3 text-muted-foreground">
              A communication aid that over-promises is worse than none. Every limit is
              stated in the interface.
            </p>
          </div>
          <ul className="space-y-4">
            {WHY.map((item) => (
              <li key={item.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <item.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-display text-base font-bold">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lift">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Try the translation pipeline now
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            The dictionary is loaded with everyday words and digits, so you can convert
            a real sentence straight away.
          </p>
          <Link to="/translate" className="mt-6 inline-block">
            <Button size="lg">
              Open the translator
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
