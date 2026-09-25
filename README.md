# Remix of Remix of Remix of Remix of SignSpeak Converter

Build a complete, production-style, fully functional AI-powered Indian Sign Language (ISL) Converter application.

PROJECT NAME:

ISL Converter – Two-Way Indian Sign Language Communication System

PROJECT PURPOSE:

Build an accessible two-way communication platform that converts English/Hindi text or speech into Indian Sign Language (ISL) content and converts ISL gestures captured through a camera into English/Hindi text and optional speech.

This project is based on a college-level AI/ML project called "ISL Converter".

The application must not be a static UI or a fake prototype. Build the complete working application architecture with functional frontend, backend APIs, database integration, camera interaction, speech input/output, ISL gloss processing, sign-video retrieval, gesture-recognition pipeline, authentication, history, and administration.

IMPORTANT:

Do NOT replace functional features with dummy buttons.

Do NOT show "coming soon" for the main project features.

Every major feature must have a working flow.

Where an external AI model or dataset is required, create the proper integration layer, API endpoint, model-loading mechanism, database structure, configuration, and clear setup instructions.

==================================================

1. TECHNOLOGY STACK

==================================================

FRONTEND:

- React.js

- TypeScript

- Vite

- Tailwind CSS

- Responsive design

- WebRTC / browser camera APIs

- MediaPipe for browser-side landmark visualization where appropriate

BACKEND:

- Python

- FastAPI

- REST APIs

- Pydantic

- Uvicorn

AI / ML:

- PyTorch

- Transformers

- Whisper / multilingual ASR

- MediaPipe

- OpenCV

- LSTM/GRU baseline for ISL sequence recognition

- Architecture should allow future Transformer-based recognition

DATABASE:

- SQLite for initial development

- SQLAlchemy ORM

- Database architecture should be PostgreSQL-compatible for production

STORAGE:

- Local sign-video storage during development

- Structure the storage layer so it can later be replaced with S3/AWS storage

MODEL FORMAT:

- PyTorch

- ONNX support

- TFLite/mobile conversion should be considered in architecture

DEPLOYMENT:

- Frontend can be deployed separately

- FastAPI backend can be deployed on Render/AWS

- Make environment variables configurable

==================================================

2. CORE APPLICATION REQUIREMENTS

==================================================

The application has TWO PRIMARY MODES.

MODE A:

English/Hindi → ISL

MODE B:

ISL → English/Hindi

The homepage must clearly present both modes.

The complete user flow should be:

                    ┌─────────────────────────┐

                    │       ISL CONVERTER     │

                    └────────────┬────────────┘

                                 │

                 ┌───────────────┴───────────────┐

                 │                               │

         English/Hindi → ISL              ISL → English/Hindi

                 │                               │

          Text / Audio Input                 Camera Input

                 │                               │

          Speech Recognition              MediaPipe Processing

                 │                               │

             NLP Layer                    Hand/Face/Pose

                 │                               │

          ISL Gloss Mapping                Landmark Sequence

                 │                               │

          Sign Video Retrieval             ML Recognition

                 │                               │

          ISL Sign Videos                   ISL Gloss

                                                 │

                                      English/Hindi Text

                                                 │

                                        Optional TTS Audio

==================================================

3. LANDING PAGE

==================================================

Create a professional accessibility-focused landing page.

Hero section:

Title:

"ISL Converter"

Subtitle:

"Breaking Communication Barriers with AI"

Description:

"Translate English and Hindi speech or text into Indian Sign Language and understand ISL gestures through your camera."

Primary buttons:

1. "Translate to ISL"

2. "Recognize ISL"

Secondary:

"How It Works"

Add an accessible illustration showing:

English/Hindi

      ↓

AI Processing

      ↓

Indian Sign Language

and reverse:

Indian Sign Language

      ↓

AI Recognition

      ↓

English/Hindi

Include project use cases:

- Railway announcements

- Classroom communication

- Hospital instructions

- Public information

- Everyday communication

- Accessibility support

Add a section:

"Why ISL Converter?"

Cards:

- Two-way communication

- English + Hindi support

- Speech recognition

- Camera-based ISL recognition

- ISL sign videos

- Text-to-speech

- Accessibility focused

- Scalable AI architecture

Add "Technology Stack" section.

Add footer with:

- ISL Converter

- Accessibility

- About

- Privacy

- Contact

==================================================

4. TRANSLATE ENGLISH/HINDI TO ISL

==================================================

Create a dedicated page:

/translate

UI must contain:

Language selector:

- English

- Hindi

- Auto Detect

Input methods:

TAB 1:

Text Input

Large textarea:

"Enter English or Hindi text..."

Buttons:

- Translate to ISL

- Clear

TAB 2:

Voice Input

Controls:

- Start Recording

- Stop Recording

- Recording indicator

- Audio duration

- Play recording

Speech recognition should use the backend Whisper/multilingual ASR service.

Flow:

Audio

↓

Whisper

↓

Detected Language

↓

Transcribed Text

↓

NLP Processing

↓

ISL Gloss Sequence

↓

Sign Video Retrieval

↓

ISL Video Player

Display:

Detected language

Transcribed text

Normalized text

ISL gloss sequence

Example:

Input:

"Please wait for the train."

Output:

ISL Gloss:

PLEASE WAIT TRAIN

Then retrieve the corresponding ISL sign videos.

==================================================

5. NLP + ISL GLOSS MAPPING

==================================================

Implement a dedicated backend translation service.

Create:

POST /api/translate/text

Request:

{

  "text": "...",

  "source_language": "en"

}

Response:

{

  "original_text": "...",

  "normalized_text": "...",

  "language": "en",

  "gloss_sequence": [

    "PLEASE",

    "WAIT",

    "TRAIN"

  ],

  "signs": [

    {

      "gloss": "PLEASE",

      "video_url": "...",

      "duration": 2.5

    }

  ]

}

The NLP layer should:

1. Detect language

2. Normalize input

3. Tokenize sentence

4. Remove unnecessary filler words where appropriate

5. Convert sentence structure into an ISL-oriented gloss sequence

6. Match glosses against the sign dictionary

7. Retrieve available sign videos

Do NOT claim that English grammar and ISL grammar are identical.

Create a configurable gloss mapping system.

Database table:

isl_gloss_mappings

Fields:

id

english_word

hindi_word

isl_gloss

category

video_id

priority

created_at

Allow administrators to modify mappings.

==================================================

6. ISL SIGN VIDEO LIBRARY

==================================================

Create a complete sign-video library system.

Page:

/sign-library

Features:

- Search signs

- Search by English

- Search by Hindi

- Search by ISL gloss

- Filter by category

- Video preview

- Fullscreen video

- Playback controls

- Previous / Next sign

- Loop

- Playback speed

Categories:

- Greetings

- Numbers

- Questions

- Travel

- Railway

- Education

- Healthcare

- Emergency

- Daily conversation

- Food

- Places

- People

- Actions

- Time

- Directions

Each sign record:

id

gloss

english

hindi

category

video_url

thumbnail_url

description

keywords

IMPORTANT:

Do not invent copyrighted ISL videos.

Create a seed/demo library structure with clearly marked sample assets and provide an admin upload mechanism for authorized ISL videos.

Support:

MP4

WebM

==================================================

7. ISL VIDEO SEQUENCE PLAYER

==================================================

Create a dedicated ISL output component.

When the system produces:

HELLO

HOW

ARE

YOU

the application should retrieve the four corresponding videos and play them sequentially.

Features:

- Automatic sequence playback

- Previous sign

- Next sign

- Pause

- Resume

- Replay

- Progress bar

- Current gloss

- Total signs

- Current sign number

- Fullscreen

- Playback speed

Example:

[ HELLO.mp4 ] → [ HOW.mp4 ] → [ ARE.mp4 ] → [ YOU.mp4 ]

Show:

ISL Gloss:

HELLO → HOW → ARE → YOU

==================================================

8. RAILWAY ANNOUNCEMENT USE CASE

==================================================

Create a dedicated "Announcement Mode".

Route:

/announcements

Purpose:

Convert railway/public announcements into ISL.

Interface:

Large announcement input box.

Options:

- Enter text

- Record announcement

- Upload audio

Example:

"Train number 12951 will arrive at platform number 3."

System:

Audio

↓

Whisper

↓

Text

↓

NLP

↓

ISL Gloss

↓

Sign Video Sequence

Display:

ANNOUNCEMENT

Original:

Train number 12951 will arrive at platform number 3.

ISL:

TRAIN 12951 ARRIVE PLATFORM 3

Then play sign sequence.

Create a high-contrast presentation mode suitable for a large railway display.

Include:

- Large text

- Large video

- High contrast

- Fullscreen

- Auto-play sequence

- Pause/resume

==================================================

9. ISL → ENGLISH/HINDI CAMERA RECOGNITION

==================================================

Create:

/recognize

This is one of the most important features.

Request camera permission.

Show live camera feed.

UI:

┌──────────────────────────────┐

│                              │

│       LIVE CAMERA            │

│                              │

│   MediaPipe landmarks        │

│                              │

└──────────────────────────────┘

Buttons:

Start Camera

Stop Camera

Start Recognition

Stop Recognition

Language output:

English

Hindi

Recognition result:

Recognized Sign:

HELLO

Translation:

Hello

Optional speech:

🔊 Speak

==================================================

10. MEDIAPIPE LANDMARK PROCESSING

==================================================

Use MediaPipe to extract:

1. Hand landmarks

2. Face landmarks

3. Pose/body landmarks

Do not use hand landmarks only.

The project specifically considers facial expressions, head movement and body posture important to ISL recognition.

Create a landmark processing service.

Extract normalized features.

Example feature structure:

{

  "hands": [...],

  "face": [...],

  "pose": [...],

  "timestamp": ...

}

Create temporal sequences from consecutive frames.

Example:

Frame 1

Frame 2

Frame 3

...

Frame N

Then pass the sequence to the recognition model.

==================================================

11. ISL RECOGNITION MODEL

==================================================

Implement an ML inference architecture.

Baseline:

MediaPipe landmarks

↓

Feature normalization

↓

Temporal sequence

↓

LSTM / GRU

↓

ISL Gloss Classification

Create backend endpoint:

POST /api/isl/recognize

Input:

landmark sequence

Output:

{

  "gloss": "HELLO",

  "confidence": 0.94,

  "english": "Hello",

  "hindi": "नमस्ते"

}

The model architecture must support:

- PyTorch

- Saved .pth model

- Configurable model path

- Class mapping JSON

- Confidence threshold

Create:

models/

  isl_model.pth

  class_mapping.json

IMPORTANT:

Do not pretend that a random/untrained model provides real ISL recognition.

If the trained model is not available, implement the complete inference interface and a clearly separated development/demo mode using seeded supported gestures.

Create a configuration:

ISL_MODEL_MODE=demo

ISL_MODEL_PATH=models/isl_model.pth

When a real trained model is supplied, the application should switch to:

ISL_MODEL_MODE=production

without changing the frontend.

==================================================

12. REAL-TIME RECOGNITION

==================================================

Implement frame buffering.

Example:

Camera

↓

Capture frames

↓

MediaPipe

↓

Landmark buffer

↓

Sequence length N

↓

LSTM/GRU

↓

Prediction

↓

Confidence filtering

↓

Gloss

↓

English/Hindi text

Do not send every raw video frame unnecessarily to the backend.

Prefer extracting landmarks locally where possible and sending compact landmark sequences.

Provide configurable:

SEQUENCE_LENGTH

CONFIDENCE_THRESHOLD

PREDICTION_INTERVAL

==================================================

13. CONTINUOUS SENTENCE RECOGNITION

==================================================

Architecture should support:

SIGN 1 → SIGN 2 → SIGN 3 → SIGN 4

Example:

HELLO

MY

NAME

AKRITI

Output:

"Hello, my name is Akriti."

For the initial project, use limited vocabulary and supported signs.

Create a temporal aggregation layer that avoids displaying the same prediction repeatedly.

Example:

HELLO

HELLO

HELLO

HELLO

should become:

HELLO

not:

HELLO HELLO HELLO HELLO

Add a prediction cooldown/debounce mechanism.

==================================================

14. TEXT TO SPEECH

==================================================

After ISL recognition:

ISL

↓

Gloss

↓

English/Hindi sentence

↓

TTS

Support:

- Browser/device TTS as fallback

- Backend Google/Indic TTS integration through configurable provider

Controls:

🔊 Speak

⏹ Stop

Language:

English / Hindi

Do not hard-code API keys.

Use environment variables.

==================================================

15. SPEECH TO TEXT

==================================================

Backend endpoint:

POST /api/speech/transcribe

Accept:

audio file

Return:

{

  "text": "...",

  "language": "en",

  "confidence": 0.91

}

Implement Whisper/multilingual ASR integration.

Support:

English

Hindi

Architecture should allow additional Indian languages later.

Add:

- microphone recording

- audio upload

- transcription status

- error handling

- retry

==================================================

16. DATABASE

==================================================

Use SQLite initially.

Use SQLAlchemy.

Create these tables:

users

isl_gloss_mappings

sign_videos

recognition_classes

translation_history

recognition_history

announcements

model_versions

system_settings

Suggested fields:

USERS:

id

name

email

password_hash

role

created_at

SIGN_VIDEOS:

id

gloss

english

hindi

category

video_url

thumbnail_url

description

is_active

created_at

ISL_GLOSS_MAPPINGS:

id

english_word

hindi_word

isl_gloss

sign_video_id

priority

TRANSLATION_HISTORY:

id

user_id

input_type

source_language

original_text

normalized_text

gloss_sequence

created_at

RECOGNITION_HISTORY:

id

user_id

recognized_gloss

english_text

hindi_text

confidence

created_at

MODEL_VERSIONS:

id

name

version

model_type

file_path

accuracy

status

created_at

==================================================

17. USER AUTHENTICATION

==================================================

Implement authentication.

Pages:

/login

/register

/profile

/history

Roles:

USER

ADMIN

Users should be able to:

- Register

- Login

- Logout

- View profile

- View translation history

- View recognition history

- Delete their own history

Use secure password hashing.

Do not store plaintext passwords.

Use JWT authentication for FastAPI.

==================================================

18. USER DASHBOARD

==================================================

After login:

/dashboard

Show:

Welcome message

Quick actions:

[Translate to ISL]

[Recognize ISL]

[Announcement Mode]

[Sign Library]

Statistics:

Total translations

ISL recognitions

Recent activity

Recent history:

Timestamp

Mode

Input

Output

==================================================

19. HISTORY

==================================================

Create:

/history

Tabs:

Translation History

Recognition History

Announcements

Each record should show:

Date

Input

Language

ISL gloss

Output

Actions:

View

Replay

Delete

==================================================

20. ADMIN DASHBOARD

==================================================

Create:

/admin

Only ADMIN users can access.

Dashboard statistics:

Total users

Total signs

Total gloss mappings

Total translations

Total recognitions

Admin features:

1. Manage users

2. Manage sign videos

3. Add/edit/delete gloss mappings

4. Upload sign videos

5. Manage categories

6. Manage recognition classes

7. Manage model versions

8. View system logs

9. View usage statistics

==================================================

21. SIGN VIDEO UPLOAD

==================================================

Admin upload page:

Upload video

Gloss

English meaning

Hindi meaning

Category

Description

Keywords

Thumbnail

Validate:

- file type

- file size

- required fields

Store metadata in database.

Make storage abstraction:

LocalStorageProvider

and architecture ready for:

S3StorageProvider

==================================================

22. ACCESSIBILITY

==================================================

Accessibility is a CORE requirement.

Implement:

- WCAG-conscious design

- keyboard navigation

- visible focus states

- large buttons

- high contrast mode

- readable typography

- ARIA labels

- screen-reader friendly labels

- captions where applicable

- responsive layout

- reduced motion option

Provide:

Accessibility toggle

High Contrast toggle

Font Size:

Small

Normal

Large

Extra Large

==================================================

23. RESPONSIVE DESIGN

==================================================

The application must work on:

Desktop

Laptop

Tablet

Mobile

Camera recognition must work on mobile browsers where supported.

Use a mobile-first responsive design.

The layout must NOT break on small screens.

==================================================

24. UI DESIGN

==================================================

Design should look like a modern AI accessibility product.

Style:

Clean

Professional

Minimal

Accessible

Modern

Trustworthy

Use:

- White/light background

- Deep blue/indigo primary accents

- Accessible contrast

- Rounded cards

- Subtle shadows

- Clear icons

- Large CTA buttons

Do not overuse gradients.

Avoid unnecessary animations.

Use animations only for:

- loading

- recording

- recognition state

- transitions

==================================================

25. NAVIGATION

==================================================

Navbar:

Logo:

ISL Converter

Links:

Home

Translate

Recognize

Announcements

Sign Library

History

About

If logged in:

Dashboard

Profile

Admin:

Admin Dashboard

Mobile:

hamburger menu

==================================================

26. API ARCHITECTURE

==================================================

Create FastAPI routes:

/api/auth/register

/api/auth/login

/api/auth/me

/api/translate/text

/api/translate/audio

/api/speech/transcribe

/api/isl/gloss

/api/isl/signs

/api/isl/recognize

/api/signs

/api/signs/{id}

/api/history

/api/history/{id}

/api/announcements

/api/admin/users

/api/admin/signs

/api/admin/gloss-mappings

/api/admin/models

Add:

GET /health

Response:

{

  "status": "ok"

}

Add proper:

HTTP status codes

Pydantic validation

error responses

logging

CORS

request IDs

==================================================

27. BACKEND PROJECT STRUCTURE

==================================================

Use clean architecture:

backend/

app/

    main.py

    api/

        auth.py

        translate.py

        speech.py

        recognition.py

        signs.py

        history.py

        announcements.py

        admin.py

    models/

        user.py

        sign_video.py

        gloss_mapping.py

        history.py

        model_version.py

    schemas/

        auth.py

        translation.py

        recognition.py

        signs.py

    services/

        speech_service.py

        nlp_service.py

        gloss_service.py

        sign_retrieval_service.py

        recognition_service.py

        tts_service.py

    ml/

        whisper_model.py

        isl_model.py

        feature_extractor.py

        preprocessing.py

    database/

        database.py

        migrations/

    core/

        config.py

        security.py

        logging.py

models/

data/

videos/

tests/

==================================================

28. FRONTEND PROJECT STRUCTURE

==================================================

frontend/

src/

components/

    Navbar

    Footer

    AudioRecorder

    AudioUploader

    CameraCapture

    LandmarkOverlay

    SignVideoPlayer

    SignSequencePlayer

    TranslationResult

    RecognitionResult

    ConfidenceIndicator

    LanguageSelector

    AccessibilityControls

pages/

    Home

    Translate

    Recognize

    Announcements

    SignLibrary

    Dashboard

    History

    Profile

    Login

    Register

    AdminDashboard

services/

    api.ts

    auth.ts

    translation.ts

    recognition.ts

    signs.ts

hooks/

    useCamera

    useAudioRecorder

    useRecognition

types/

    translation.ts

    recognition.ts

    signs.ts

==================================================

29. ERROR HANDLING

==================================================

Every feature must have proper error handling.

Examples:

Camera permission denied:

"Camera access is required for ISL recognition. Please allow camera permission and try again."

Microphone permission denied:

"Microphone access is required for speech input."

No sign found:

"No matching ISL sign is available for this word."

Low recognition confidence:

"Recognition confidence is low. Please perform the sign clearly and try again."

Backend unavailable:

"AI service is currently unavailable. Please try again."

Invalid audio:

"Unable to process this audio file."

Model unavailable:

"ISL recognition model is not configured. Please configure the model before using production recognition."

==================================================

30. LOADING STATES

==================================================

Never leave the user staring at a blank screen.

Use loading indicators for:

Speech transcription

NLP processing

Gloss generation

Video retrieval

Camera initialization

Recognition

History loading

Admin operations

Use meaningful messages:

"Listening..."

"Transcribing..."

"Processing language..."

"Generating ISL sequence..."

"Recognizing sign..."

"Preparing ISL videos..."

==================================================

31. SECURITY

==================================================

Implement:

JWT authentication

Password hashing

CORS configuration

Input validation

File validation

Upload size limits

Role-based authorization

SQL injection protection through ORM

XSS-safe rendering

No API keys in frontend

Environment variables

Create:

.env.example

Example:

DATABASE_URL=

JWT_SECRET=

WHISPER_MODEL=

TTS_API_KEY=

STORAGE_PATH=

ISL_MODEL_PATH=

ISL_MODEL_MODE=demo

==================================================

32. TESTING

==================================================

Create backend tests for:

- authentication

- text translation

- language detection

- gloss mapping

- sign retrieval

- speech endpoint

- recognition endpoint

- database operations

- admin authorization

Create frontend tests for:

- translation flow

- camera component

- sign video player

- authentication

- history

- accessibility

Also create API documentation using FastAPI Swagger.

==================================================

33. DEMO MODE

==================================================

Because actual trained ISL recognition weights and authorized sign-video datasets may not be included initially, implement a controlled DEMO MODE.

The demo must NOT falsely claim AI accuracy.

Create a clearly labelled:

"Demo Model"

mode.

For demo mode:

- use a small supported vocabulary

- provide sample authorized/placeholder assets only where legally appropriate

- allow administrators to upload real ISL videos

- allow real trained .pth model to be plugged in later

- maintain exactly the same API contract

Example supported vocabulary:

HELLO

THANK YOU

PLEASE

YES

NO

HELP

WATER

FOOD

TRAIN

STATION

HOSPITAL

SCHOOL

HOME

STOP

WAIT

GO

GOOD

MORNING

NAME

YOU

I

The vocabulary must be configurable through the database.

==================================================

34. MODEL INTEGRATION

==================================================

Create a model adapter architecture.

Base interface:

ISLRecognitionModel

Implement:

DemoISLModel

PyTorchISLModel

Later:

TransformerISLModel

The frontend should not know which model is running.

Backend selects the model using:

ISL_MODEL_MODE

Possible values:

demo

pytorch

transformer

==================================================

35. CONFIDENCE HANDLING

==================================================

Every recognition result must include confidence.

Example:

{

  "gloss": "HELLO",

  "confidence": 0.94

}

UI:

Confidence: 94%

If confidence < threshold:

"Low confidence"

Do not convert uncertain predictions into definite sentences.

==================================================

36. LANGUAGE SUPPORT

==================================================

English and Hindi must be first-class languages.

Language selector:

English

हिन्दी

Use proper Hindi Unicode rendering.

Speech:

English TTS

Hindi TTS

Translation output should preserve the selected target language.

==================================================

37. PRIVACY

==================================================

Add Privacy page.

Explain:

- Camera is used only for recognition

- Microphone is used only for speech input

- Uploaded data should not be retained unless the user chooses to save history

- Provide delete-history controls

- Do not expose private recordings publicly

Do not store raw camera video by default.

Only send required landmark data for recognition where possible.

==================================================

38. ABOUT PAGE

==================================================

Create /about

Explain:

Problem:

Communication barrier between ISL users and English/Hindi speakers.

Solution:

Two-way AI-powered communication.

Technology:

Speech Recognition

NLP

Computer Vision

MediaPipe

PyTorch

FastAPI

React

SQLite/PostgreSQL

Use cases:

Railway

Education

Healthcare

Public services

Everyday communication

==================================================

39. SYSTEM ARCHITECTURE PAGE

==================================================

Create an internal documentation page:

/architecture

Show a diagram:

USER

 ↓

React Frontend

 ↓

FastAPI REST API

 ↓

AI Translation Engine

 ├── Whisper

 ├── NLP / Transformers

 └── ISL Gloss Mapping

 ↓

ISL Video Library

 ↓

ISL Output

Reverse:

Camera

 ↓

MediaPipe

 ├── Hand

 ├── Face

 └── Pose

 ↓

Feature Extraction

 ↓

LSTM / GRU

 ↓

ISL Gloss

 ↓

English/Hindi

 ↓

TTS

Also show:

Database

Model Storage

Video Storage

==================================================

40. PROJECT DOCUMENTATION

==================================================

Generate a README.md containing:

Project overview

Features

Architecture

Technology stack

Installation

Backend setup

Frontend setup

Database setup

Model setup

Dataset setup

Environment variables

API documentation

Demo mode

Production mode

Testing

Deployment

Troubleshooting

Include exact commands.

Backend:

python -m venv venv

pip install -r requirements.txt

uvicorn app.main:app --reload

Frontend:

npm install

npm run dev

==================================================

41. ENVIRONMENT SETUP

==================================================

Create:

.env.example

and never hard-code secrets.

Create separate configuration for:

Development

Testing

Production

==================================================

42. DATABASE SEEDING

==================================================

Create:

seed.py

Populate:

categories

demo vocabulary

gloss mappings

admin user instructions

sample metadata

Do not insert fake copyrighted videos.

Instead create a system where authorized videos can be uploaded through Admin Dashboard.

==================================================

43. API DOCUMENTATION

==================================================

FastAPI Swagger must be available.

Document:

request schemas

response schemas

errors

authentication

examples

Every endpoint must have meaningful descriptions.

==================================================

44. MOBILE/PWA REQUIREMENT

==================================================

Although the main implementation is React + FastAPI according to the project architecture, make the frontend strongly responsive and PWA-ready.

It should behave like a mobile application when opened on a phone.

Support:

camera

microphone

fullscreen video

touch controls

responsive navigation

Keep backend APIs independent so the same backend can later be consumed by a Flutter mobile application.

==================================================

45. PERFORMANCE

==================================================

Optimize:

Camera frame processing

MediaPipe inference

API requests

Video loading

Database queries

Do not upload full camera video continuously.

Prefer:

Camera

→ local MediaPipe

→ compact landmarks

→ backend model

Use debounce/throttling.

Lazy-load sign videos.

Cache commonly used sign metadata.

==================================================

46. IMPORTANT AI IMPLEMENTATION RULE

==================================================

Do not create an application that only LOOKS like AI.

Separate:

REAL AI SERVICES

DEMO SERVICES

DATA

Clearly identify which model is active.

The application must expose model status in the Admin Dashboard:

Model:

ISL LSTM

Version:

1.0

Status:

Loaded / Not Loaded

Mode:

Demo / Production

==================================================

47. MAIN USER JOURNEY

==================================================

USER JOURNEY 1:

Home

↓

Translate to ISL

↓

Select Hindi/English

↓

Enter text OR record audio

↓

Speech recognition if audio

↓

NLP

↓

ISL gloss

↓

Retrieve videos

↓

Play sign sequence

↓

Save to history

USER JOURNEY 2:

Home

↓

Recognize ISL

↓

Allow camera

↓

Start recognition

↓

MediaPipe landmarks

↓

LSTM/GRU

↓

Recognized ISL gloss

↓

English/Hindi translation

↓

Text display

↓

TTS

↓

Save history

USER JOURNEY 3:

Announcements

↓

Enter/upload/record announcement

↓

Whisper

↓

NLP

↓

ISL gloss

↓

ISL sign video sequence

↓

Fullscreen display

USER JOURNEY 4:

Admin

↓

Login

↓

Dashboard

↓

Upload ISL sign video

↓

Add English/Hindi/gloss mapping

↓

Save

↓

Video becomes available in translation pipeline

==================================================

48. FINAL QUALITY REQUIREMENT

==================================================

Before considering the project complete, verify:

[ ] Landing page works

[ ] Registration works

[ ] Login works

[ ] JWT authentication works

[ ] Dashboard works

[ ] English text → ISL works

[ ] Hindi text → ISL works

[ ] English speech → text works

[ ] Hindi speech → text works

[ ] ISL gloss generation works

[ ] Sign mapping works

[ ] Sign video retrieval works

[ ] Sequential sign-video playback works

[ ] Railway announcement mode works

[ ] Camera permission works

[ ] MediaPipe landmarks work

[ ] Hand landmarks work

[ ] Face landmarks work

[ ] Pose landmarks work

[ ] Landmark sequence processing works

[ ] ISL recognition API works

[ ] Demo model works

[ ] PyTorch model adapter exists

[ ] Confidence threshold works

[ ] English output works

[ ] Hindi output works

[ ] Text-to-speech works

[ ] History works

[ ] Sign library works

[ ] Admin dashboard works

[ ] Sign upload works

[ ] Gloss mapping management works

[ ] Model management works

[ ] Accessibility controls work

[ ] Mobile responsive layout works

[ ] Error handling works

[ ] Loading states work

[ ] API documentation works

[ ] README exists

[ ] .env.example exists

[ ] Database seed exists

[ ] Backend tests exist

[ ] Frontend tests exist

==================================================

49. DO NOT DO THESE THINGS

==================================================

DO NOT:

- build only static frontend screens

- use fake buttons

- pretend dummy predictions are real AI

- hard-code API keys

- hard-code sign-video URLs

- claim unsupported ISL vocabulary

- store passwords in plaintext

- continuously upload raw camera video

- remove Hindi support

- remove audio input

- remove camera recognition

- replace FastAPI with an unrelated backend without explaining the architectural change

- remove MediaPipe

- remove PyTorch

- remove sign-video retrieval

- remove the two-way communication architecture

==================================================

50. FINAL DELIVERABLE

==================================================

Generate the complete application with:

1. React frontend

2. FastAPI backend

3. SQLite database

4. SQLAlchemy models

5. Authentication

6. AI service architecture

7. Whisper integration

8. NLP/gloss processing

9. MediaPipe camera pipeline

10. LSTM/GRU recognition adapter

11. Sign-video library

12. Sequential ISL video player

13. English/Hindi support

14. TTS

15. Railway announcement mode

16. History

17. Admin dashboard

18. Model management

19. Accessibility features

20. Responsive mobile UI

21. API documentation

22. Tests

23. README

24. Environment configuration

25. Deployment configuration

The final application should look and behave like a real AI accessibility product suitable for a college final-year project demonstration.

Use the project name "ISL Converter" consistently throughout the application.

Make the UI polished enough for a project presentation/demo, but prioritize actual functionality over decorative elements.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f0013844-fb4f-4014-93d6-a68ecaf3aadb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
