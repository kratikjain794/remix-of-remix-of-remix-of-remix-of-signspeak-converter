import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Copy,
  Info,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignSequence } from "@/components/isl/SignSequence";
import { translateText } from "@/lib/isl/api";
import { speak, speechSynthesisSupported } from "@/lib/isl/speak";
import { useSpeechInput } from "@/lib/isl/useSpeechInput";
import type { SourceLanguage, TranslationResponse } from "@/lib/isl/types";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 2000;

const LANGUAGES: { value: SourceLanguage; label: string; hint: string }[] = [
  { value: "auto", label: "Auto detect", hint: "Detect English or Hindi" },
  { value: "en", label: "English", hint: "Treat input as English" },
  { value: "hi", label: "हिन्दी", hint: "Treat input as Hindi" },
];

const EXAMPLES = [
  { text: "Where is the train station?", language: "auto" as SourceLanguage },
  { text: "I need help, please.", language: "auto" as SourceLanguage },
  { text: "ट्रैन स्टेशन कहामँ है?", language: "hi" as SourceLanguage },
  { text: "दवामई कहामँ मिलेगी?", language: "hi" as SourceLanguage },
];

export const Route = createFileRoute("/translate")({
  head: () => ({
    meta: [
      { title: "Translate — English & Hindi to Indian Sign Language | ISL Converter" },
      {
        name: "description",
        content:
          "Type or speak an English or Hindi sentence and get the Indian Sign Language gloss sequence with each sign shown in order.",
      },
      {
        property: "og:title",
        content: "Translate English & Hindi into Indian Sign Language",
      },
      {
        property: "og:description",
        content: "See the gloss sequence and sign order for any sentence you type or speak.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TranslatePage,
});

function TranslatePage() {
  const [language, setLanguage] = useState<SourceLanguage>("auto");
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const speech = useSpeechInput(language);

  const convert = useCallback(
    async (input: string) => {
      const value = input.trim();
      if (!value) {
        setError("Type or record a sentence first.");
        return;
      }
      setLoading(true);
      setError(null);
      setNotice(null);
      try {
        const response = await translateText(value, language);
        setResult(response);
      } catch (err) {
        setResult(null);
        setError(
          err instanceof Error
            ? err.message
            : "AI service is currently unavailable. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [language],
  );

  useEffect(() => {
    if (!speech.transcript) return;
    setNotice(null);
  }, [speech.transcript]);

  const useTranscript = () => {
    const value = speech.transcript.trim();
    if (!value) {
      setError("I couldn't hear anything yet. Tap the microphone and speak.");
      return;
    }
    setText(value);
    speech.stop();
    void convert(value);
  };

  const copyGloss = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.gloss_sequence.join(" · "));
      setNotice("Gloss sequence copied to the clipboard.");
    } catch {
      setNotice("Your browser blocked the copy. You can select the gloss chips instead.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Translate into sign language
        </h1>
        <p className="mt-3 text-muted-foreground">
          Write or say one sentence in English or Hindi. You'll get the gloss sequence
          and the signs in the order they should be shown.
        </p>
      </header>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Your sentence</CardTitle>
            <CardDescription>
              Choose the input language, or let the app detect it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1"
              role="group"
              aria-label="Input language"
            >
              {LANGUAGES.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={language === option.value ? "default" : "ghost"}
                  className="flex-1"
                  aria-pressed={language === option.value}
                  title={option.hint}
                  onClick={() => setLanguage(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <Tabs defaultValue="text">
              <TabsList className="w-full">
                <TabsTrigger value="text" className="flex-1">
                  Type text
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex-1">
                  Speak
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4 space-y-3">
                <Textarea
                  id="source-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      void convert(text);
                    }
                  }}
                  maxLength={MAX_LENGTH}
                  rows={5}
                  placeholder="Type a sentence, for example: Where is the train station?"
                  aria-describedby="source-text-help"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span id="source-text-help">
                    Press Ctrl / Cmd + Enter to convert
                  </span>
                  <span>
                    {text.length} / {MAX_LENGTH}
                  </span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => void convert(text)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Converting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" aria-hidden="true" />
                      Convert to sign sequence
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="voice" className="mt-4 space-y-3">
                {!speech.supported ? (
                  <Alert>
                    <Info className="size-4" aria-hidden="true" />
                    <AlertTitle>Voice input isn't available here</AlertTitle>
                    <AlertDescription>
                      This browser has no speech recognition. Chrome, Edge and Safari
                      support it — or just type the sentence.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        size="lg"
                        variant={speech.listening ? "destructive" : "default"}
                        onClick={() => (speech.listening ? speech.stop() : speech.start())}
                        aria-pressed={speech.listening}
                      >
                        {speech.listening ? (
                          <>
                            <MicOff className="size-4" aria-hidden="true" />
                            Stop listening ({speech.elapsed}s)
                          </>
                        ) : (
                          <>
                            <Mic className="size-4" aria-hidden="true" />
                            Start listening
                          </>
                        )}
                      </Button>
                      {speech.transcript ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            speech.reset();
                            speech.stop();
                          }}
                          aria-label="Clear what was heard"
                        >
                          <X className="size-4" aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Speak one sentence. Your browser does the listening — no audio is
                      uploaded.
                    </p>
                    {speech.transcript ? (
                      <div className="rounded-lg border border-border bg-surface p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Heard
                        </p>
                        <p className="mt-1 text-base">{speech.transcript}</p>
                      </div>
                    ) : null}
                    {speech.error ? (
                      <Alert variant="destructive">
                        <AlertTriangle className="size-4" aria-hidden="true" />
                        <AlertTitle>Couldn't listen</AlertTitle>
                        <AlertDescription>{speech.error}</AlertDescription>
                      </Alert>
                    ) : null}
                    <Button className="w-full" onClick={useTranscript} disabled={loading}>
                      Convert what I said
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Try an example
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example.text}
                    type="button"
                    onClick={() => {
                      setLanguage(example.language);
                      setText(example.text);
                      setError(null);
                      void convert(example.text);
                    }}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    {example.text}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Converting your text into sign language…
                </CardTitle>
                <CardDescription>
                  Cleaning the sentence, mapping words to gloss and fetching the signs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ) : null}

          {!loading && error ? (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" aria-hidden="true" />
              <AlertTitle>That didn't convert</AlertTitle>
              <AlertDescription className="space-y-3">
                <span className="block">{error}</span>
                <Button size="sm" variant="outline" onClick={() => void convert(text)}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {!loading && !error && !result ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Nothing converted yet</CardTitle>
                <CardDescription>
                  Once you convert a sentence you'll see the detected language, the
                  cleaned text, the gloss sequence and the sign player here.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {!loading && result ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>
                      Detected:{" "}
                      {result.detected_language === "hi" ? "Hindi" : "English"}
                    </Badge>
                    <Badge variant="secondary">
                      {result.signs.length} signs
                    </Badge>
                    {result.unmatched_words.length ? (
                      <Badge variant="destructive">
                        {result.unmatched_words.length} word
                        {result.unmatched_words.length > 1 ? "s" : ""} with no sign
                      </Badge>
                    ) : null}
                    {notice ? (
                      <span className="ml-auto text-xs text-muted-foreground">{notice}</span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Original
                    </p>
                    <p className="mt-1 text-lg">{result.original_text}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Cleaned sentence
                    </p>
                    <p className="mt-1">{result.normalized_text}</p>
                    {result.removed_words.length ? (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          No separate sign:
                        </span>
                        {result.removed_words.map((word, i) => (
                          <span
                            key={`${word}-${i}`}
                            className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground line-through"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Gloss sequence
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.gloss_sequence.map((gloss, i) => (
                        <span key={`${gloss}-${i}`} className="gloss-chip">
                          {gloss}
                        </span>
                      ))}
                    </div>
                  </div>

                  {result.unmatched_words.length ? (
                    <Alert>
                      <Info className="size-4" aria-hidden="true" />
                      <AlertTitle>No sign available yet</AlertTitle>
                      <AlertDescription>
                        These words have no dictionary sign and can't be fingerspelled,
                        so they show as clearly labelled "sign unavailable" cards:{" "}
                        <strong>{result.unmatched_words.join(", ")}</strong>. Every other
                        word not in the dictionary is automatically fingerspelled letter
                        by letter. An administrator can add more signs.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => void copyGloss()}>
                      <Copy className="size-4" aria-hidden="true" />
                      Copy gloss
                    </Button>
                    {speechSynthesisSupported() ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          speak(result.original_text, result.language)
                        }
                      >
                        <Volume2 className="size-4" aria-hidden="true" />
                        Speak original
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResult(null);
                        setText("");
                        setError(null);
                        setNotice(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <SignSequence
                signs={result.signs}
                language={result.language}
                originalText={result.original_text}
              />
            </>
          ) : null}
        </div>
      </div>

      <p
        className={cn(
          "mt-8 max-w-3xl text-sm text-muted-foreground",
          "border-t border-border pt-6",
        )}
      >
        Gloss order follows a simplified ISL structure — topic first, question words
        last — so treat it as a learning aid rather than a certified translation.
      </p>
    </div>
  );
}
