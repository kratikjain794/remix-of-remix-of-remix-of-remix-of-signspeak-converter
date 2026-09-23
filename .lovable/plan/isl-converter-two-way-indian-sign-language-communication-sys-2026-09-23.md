# ISL Converter — Two-Way Indian Sign Language Communication System

## Important architecture note (please read)

Your brief asks for a Python/FastAPI + SQLite backend. This environment builds and runs
React + TypeScript apps with a built-in cloud backend (managed Postgres database, user
accounts, file storage, and server-side functions). Python services cannot run here.

So the app will be built with the same architecture and the same API contract, but the
server side runs as TypeScript server endpoints instead of FastAPI:

- `/api/translate/text`, `/api/speech/transcribe`, `/api/isl/recognize`, `/api/signs`,
  `/api/history`, `/api/admin/*`, `/health` — same routes, same request/response JSON.
- Speech-to-text and text-to-speech use the built-in AI gateway (multilingual, English + Hindi).
- MediaPipe hand/face/pose landmark extraction still runs in the browser, and only compact
  landmark sequences are sent to the server — never raw video.
- The gesture classifier is a pluggable model adapter (`demo` | `pytorch` | `transformer`)
  with a stored model registry, so a trained model can be attached later without any
  frontend change. Demo mode is clearly labelled everywhere as a demo, never as real accuracy.
- I will also include a `backend/` folder with the FastAPI reference implementation
  (structure, models, services, ml adapters, seed, tests, requirements, README) so the
  college submission has the Python code, even though the live app runs the TS server.

## What gets built

### Foundation
- Accessibility-first design system: light surfaces, deep indigo accents, high-contrast
  mode, font-size scale (S/N/L/XL), reduced motion, visible focus, ARIA labels.
- Navbar (with mobile menu), footer, PWA manifest, responsive mobile-first layout.

### Pages
- `/` landing: hero, two-way flow illustration, use cases, "Why ISL Converter", tech stack.
- `/translate`: language selector (English / हिन्दी / auto), text tab and voice tab
  (record, duration, playback, transcribe), results showing detected language,
  transcript, normalized text, gloss sequence, and the sign sequence player.
- `/announcements`: large announcement input, record or upload audio, high-contrast
  fullscreen presentation mode with autoplay sequence.
- `/recognize`: camera feed with MediaPipe hand + face + pose landmark overlay, frame
  buffering, sequence window, confidence display and threshold, debounced repeat
  suppression, continuous sentence building, English/Hindi output, speak button.
- `/sign-library`: search by English, Hindi, or gloss, category filters, preview,
  fullscreen, speed, loop, prev/next.
- `/auth` (login + register), `/dashboard`, `/profile`, `/history` (translations,
  recognitions, announcements; view, replay, delete).
- `/admin`: stats, users, sign videos + upload, gloss mappings, recognition classes,
  categories, model versions with load status and active mode, usage logs.
- `/about`, `/architecture`, `/privacy`.

### Data model
`profiles`, `user_roles` (separate table, USER/ADMIN), `sign_videos`, `isl_gloss_mappings`,
`recognition_classes`, `translation_history`, `recognition_history`, `announcements`,
`model_versions`, `system_settings`. Row-level security so users see only their own
history; admins manage the shared dictionary. Seeded with categories, the demo vocabulary
(HELLO, THANK YOU, PLEASE, YES, NO, HELP, WATER, FOOD, TRAIN, STATION, HOSPITAL, SCHOOL,
HOME, STOP, WAIT, GO, GOOD, MORNING, NAME, YOU, I), gloss mappings and metadata — no
copyrighted videos; admins upload authorized clips into storage.

### Server side
- NLP/gloss service: language detect, normalize, tokenize, drop fillers, reorder toward
  ISL structure, number/entity handling, dictionary lookup, video retrieval, unmatched
  words reported honestly as "no sign available".
- Speech transcription and TTS endpoints (browser TTS fallback).
- Recognition endpoint with model adapter, confidence threshold, class mapping.
- Config via environment settings: sequence length, confidence threshold, prediction
  interval, model mode and path.

### Quality
- Full loading and error states with the exact messages in your brief.
- Tests for gloss mapping, language detection, sign retrieval, auth rules, and key UI flows.
- `README.md`, `.env.example`, seed data, deployment notes.

## Build order

1. Design system, layout, accessibility controls, landing page.
2. Cloud backend: database schema, roles, seed data, auth pages, dashboard.
3. Translation pipeline: NLP/gloss service, sign retrieval, sequence player, `/translate`.
4. Speech: transcription endpoint, recorder, uploader, TTS, announcements mode.
5. Recognition: MediaPipe pipeline, buffering, recognition endpoint, model adapters.
6. Sign library, history, admin dashboard, uploads, model management.
7. FastAPI reference backend folder, README, tests, PWA polish.

This is a large build, so it will run across several passes; each pass leaves the app
working end to end.
