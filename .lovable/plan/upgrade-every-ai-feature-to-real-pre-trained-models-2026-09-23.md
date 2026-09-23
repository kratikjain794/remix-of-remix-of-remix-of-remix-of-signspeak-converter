# Upgrade every AI feature to real pre-trained models

I inspected the project and researched what genuinely exists today. Summary of findings first, because two of your requirements cannot be met the way they are written — and the honest alternative matters more than pretending.

## What I found

- Camera recognition already uses a real pre-trained model: Google's MediaPipe Gesture Recognizer, 7 generic hand poses. It is correctly labelled as generic, not ISL.
- The sign vocabulary tables in the database are **completely empty**, so the Translate page currently produces nothing at all. This is the biggest functional gap.
- **No pre-trained Indian Sign Language recognition model exists publicly.** Everything found is a student demo, a Python-only research checkpoint, or a dataset — none loadable in a browser, none with a stable public URL.
- **No text-to-sign generation model exists for ISL either**, in the browser or on a server. The only working text-to-sign pipelines are Python systems for Swiss/German/French sign languages.
- Verified, openly licensed media does exist for one thing: the full A–Z two-handed manual alphabet (Wikimedia Commons, open licence). Indian Sign Language fingerspelling uses this two-handed alphabet, so it is a genuine, citable source — not invented artwork.

## What I will build

### 1. Camera recognition — add a second real model, keep the first

A model adapter at `src/lib/isl/recognition/signRecognitionModel.ts` with `loadModel()`, `predict()`, `start()`, `stop()`, `dispose()`. The studio UI talks only to the adapter.

Two selectable backends, both genuinely pre-trained, both honestly labelled:

- **Generic Gesture Mode** — the existing MediaPipe Gesture Recognizer (7 classes). Kept as the labelled fallback.
- **Fingerspelling Mode** — a published ONNX alphabet-recognition model (26 classes, A–Z) run in the browser with ONNX Runtime Web, with MediaPipe supplying the hand crop. It is trained on the **American** manual alphabet, so the UI will say exactly that. It will never be called ISL.

Kept as-is: temporal smoothing, confidence threshold, landmark overlay, recognition history, speech output.

### 2. Text to signs — real model where one exists, honest gap where none does

Since no text-to-sign model exists, the modelled part is the language work, and it moves off the hardcoded rules onto a real pre-trained language model running on the server:

- language detection (English / Hindi), normalisation, typo handling, tokenisation, and ISL-style gloss sequencing all come from the pre-trained model, not a hand-written word list.
- `franc` runs in the browser purely to show "Detected language: Hindi" instantly; the server model is authoritative.
- New endpoint `POST /api/sign/translate` returning `{ signs: [...] }` — the clean adapter shape you asked for, ready for a real sign-generation model to slot in behind it. The existing endpoint stays working.

### 3. Unknown words — real fingerspelling, no fakery

"My name is Kratik" → known words as signs, then **K R A T I K** spelled with actual verified manual-alphabet images from Wikimedia Commons. Words with no sign and no spellable form show "sign unavailable". No emoji, no generated hands.

### 4. Sign sequence player

Extended with Play All, Pause, Previous, Next, Restart, current-sign counter (1 / N), per-sign visual, and a learning-mode step-through. Existing styling and component reused.

### 5. Sign Library

Driven by data, not invented entries: the two model class lists (7 gestures, 26 letters) plus the A–Z alphabet media, each row carrying name, category, visual, description, source and which model recognises it. Additional vocabulary categories appear only when real verified media is added — empty categories are shown as empty, not padded.

### 6. Model Information panel

On both pages: model name, type, task, class count, browser or backend execution, load status, and source link.

### 7. Performance

Each model loads only when its page opens, and is disposed on unmount. Camera inference stays throttled. If a model fails to load: "AI model unavailable" plus the labelled generic fallback — never a silent fake prediction.

## Technical notes

- New dependencies: `onnxruntime-web`, `franc-min`.
- Model files load from their published sources at runtime; nothing large is bundled, so the Vercel deployment is unaffected. No Python backend is introduced.
- One database migration seeds the model class lists and the verified alphabet media. No fabricated sign entries.
- Untouched: Home, About, navigation, styling, accessibility controls, speech input/output, history tables.

## Remaining limitations I will state in the app

- Full-sentence ISL recognition is not possible today; no such public model exists.
- Fingerspelling recognition is American-alphabet trained; fingerspelling *display* uses the two-handed alphabet that ISL actually uses. These are deliberately labelled as different things.
- Word-level ISL sign videos require licensed media (ISLRTC is government content with no open licence). The player and library are ready for it; the media has to be supplied.
