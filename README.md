# 🌸 Momly : Mom's Friendly AI Bestie
### Empathetic Voice Companion for Maternal Well-being
**Google Cloud AI Builder Cup 2026 (JAPAC) · Category: Sustainability & Social Impact**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-momly--ai--companion.web.app-00C853?style=for-the-badge&logo=google-chrome&logoColor=white)](https://momly-ai-companion.web.app)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-AI%20Builder%20Cup%202026-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://aibuildercup.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%203.8%20Flash-F07B6B?style=for-the-badge&logo=googlegemini&logoColor=white)](https://aistudio.google.com/)
[![Firebase](https://img.shields.io/badge/Platform-Firebase%20%2B%20Cloud%20Run-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

---

## 👥 Authorship & Team Information

* **Author & Lead**: **Gina Sabrina** (*Nexora Team Leader*)
* **Team**: **Nexora Team**
* **Project**: Momly (: Mom's Friendly AI Bestie)
* **Live Prototype**: [https://momly-ai-companion.web.app](https://momly-ai-companion.web.app)
* **GitHub Repository**: [https://github.com/ginasabrinaasharie-ctrl/momly-ai](https://github.com/ginasabrinaasharie-ctrl/momly-ai)

---

## 📖 Overview

**Momly** is an empathetic, hands-free, voice-first AI companion engineered specifically for mothers navigating maternal burnout, postpartum anxiety, and late-night exhaustion.

In Indonesia alone, **68 million mothers** carry invisible emotional burdens; across JAPAC, **300+ million mothers** experience mental overload daily, with **1 in 3** reaching clinical burnout. At 2 AM, while holding a crying baby or feeling emotionally crushed, an exhausted mother cannot and should not be expected to type long paragraphs on a smartphone screen.

**Momly allows any mother to tap a single button, speak freely with her natural voice, and be heard and supported in real-time by an AI bestie who listens without judgment.**

---

## 🌟 6 Core Pillars of Maternal Well-being

1. **🎙️ Voice Call Companion (Curhat Hands-Free)**:
   * Talk, don’t type. Momly listens attentively and responds in a gentle, soothing voice with 2-3 sentence conversational turns—preventing cognitive exhaustion at 2 AM.
   * Dynamic avatar emotional states (welcoming, listening, supportive, calm, bestie, understanding) mirroring user emotion in real-time.
2. **📖 Jurnal Hati (Heart Journal: Gratitude & Micro-Wins)**:
   * 3 flexible input modalities: ⚡ Quick Chips (*"Si kecil mau makan"*), 🎙️ Voice Recording (*"Hari ini capek tapi..."*), or ✍️ Written Text.
   * Google Gemini Flash automatically parses raw emotion, extracts gratitude items and micro-wins, and crafts an affectionate, personalized validation love note.
3. **💌 Surat Cinta dari Momly (Post-Call Epistolary Letters & Memory)**:
   * Epistolary love letters generated after every call session to anchor emotional breakthroughs.
   * Momly remembers previous conversations so mothers never have to restart from zero or repeatedly re-explain their struggles.
4. **🫁 Jeda Pernafasan (30s Guided Breathing)**:
   * 4-4-4 diaphragmatic breathing visualizer featuring an expanding luminous orb and gentle guidance to regulate the parasympathetic nervous system during acute anxiety or panic.
5. **🌙 Daily Mood Check-In**:
   * 5-state emotional pulse tracker (*Overwhelmed, Exhausted, Anxious, Neutral, Joyful*) that calibrates Momly's empathy baseline and tone before a call begins.
6. **🔐 Google OAuth & Safe Identity**:
   * Frictionless 1-tap Google Sign-In via Firebase Auth. Protects personal journal entries, securely manages session history and daily quotas, and personalizes support with strict privacy.

---

## 🛠️ Technology Stack & Architecture

### Frontend & Client Experience
* **Framework**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS v4 (Glassmorphism, warm maternal color palette, fluid micro-interactions)
* **Icons & Visuals**: Lucide React + Custom Emotionally-Expressive Avatars
* **Audio & Speech Engine**:
  * Web Speech Recognition API (continuous STT)
  * Web Audio API (AnalyserNode volume & frequency visualizer)
  * MediaRecorder (audio chunk recording & fallback)
  * HTML5 Audio & SpeechSynthesis (low-latency conversational playback)
* **Deployment & PWA**: Mobile-first Responsive Design with Web Manifest & Service Worker

### Google Cloud Platform & Firebase Infrastructure
* **⚡ Google Gemini 3.8 Flash (`@google/genai` v1.29.0 SDK)**:
  * Empathetic voice companion reasoning with strict 2-3 sentence response cadence.
  * Structured JSON schema output generation for Jurnal Hati gratitude extraction.
  * Real-time maternal distress detection and therapeutic de-escalation guardrails.
* **🔑 Firebase Authentication**:
  * Google OAuth 2.0 Provider (`signInWithPopup`).
  * Frictionless 1-tap authentication preserving user identity across devices.
* **🌐 Firebase Hosting**:
  * Global Google Edge CDN delivering sub-50ms latency.
  * Automated SSL/HTTPS certificates enabling seamless microphone permissions across iOS Safari and Android Chrome.
* **🗄️ Cloud Firestore**:
  * Encrypted NoSQL database storing user profiles, emotional histories, journal entries, and post-call letters.
  * Client-side privacy isolation and anonymous telemetry aggregation.
* **☁️ Google Cloud Run**:
  * Containerized serverless microservices for quota guard and background processing.
* **📊 BigQuery Pipeline**:
  * Longitudinal maternal distress and emotional recovery analytics.

---

## 🏛️ Google Cloud & Firebase Complete Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + TypeScript + Vite + Tailwind CSS PWA)"]
        UI_Home["🎙️ Curhat (CallScreen & 1-Tap Voice Avatar)"]
        Mood["🌙 Daily Mood Check-in"]
        Breath["🫁 Jeda (30s Guided Breathing Pacer)"]
        Journal["📖 Jurnal Hati (Quick Chips / Voice / Text)"]
        Letters["💌 Surat Cinta (Post-Call Letters & Memories)"]
        Auth["🔐 Google OAuth (Firebase Auth SDK)"]
        STT["Web Speech Recognition (STT Engine)"]
        TTS["Audio Speech Playback (TTS Streamer)"]
    end

    subgraph GCP["Google Cloud Platform & Firebase Infrastructure"]
        Gemini_Flash["⚡ Google Gemini 3.8 Flash (Vertex AI / GenAI SDK)
• Live Voice Empathy Engine (2-3 sentence cadence)
• Jurnal Hati Structured JSON Extractor (Gratitude & Wins)
• Maternal Distress Detection Guardrails"]
        Firebase_Auth["🔑 Firebase Authentication
• Google OAuth 2.0 Provider (signInWithPopup)
• Maternal Identity & Encrypted Session State"]
        Firebase_Hosting["🌐 Firebase Hosting (Google Global Edge CDN)
• Sub-50ms Latency & Automated SSL
• PWA Offline Asset Service Worker"]
        Firestore["🗄️ Cloud Firestore (Encrypted NoSQL)
• User Profiles & Daily Quota Logs
• Jurnal Hati Entries & Surat Cinta Letters
• Anonymous Distress Telemetry"]
        Cloud_Run["☁️ Google Cloud Run
• Containerized Serverless Microservices
• Quota Guard & Rate Limiting Enforcement"]
        BigQuery["📊 BigQuery Analytics Pipeline
• Longitudinal Maternal Distress & Well-being Trends"]
    end

    Auth <-->|OAuth Tokens & Identity| Firebase_Auth
    Mood --> UI_Home
    UI_Home --> STT
    STT -->|Voice Audio Stream + Mood Context| Gemini_Flash
    Gemini_Flash -->|Empathetic Spoken Reply| TTS
    TTS --> UI_Home
    Journal -->|Multimodal Inputs (Chips/Voice/Text)| Gemini_Flash
    Gemini_Flash -->|Structured Gratitude, Wins & Validation Note| Journal
    Journal -->|Sync Encrypted Entry| Firestore
    UI_Home -.->|Post-call Empathy Summary| Letters
    Letters -->|Save Letter & Context| Firestore
    Breath -.-> UI_Home
    Firebase_Auth -.->|Sync Quota| Cloud_Run
    Firestore -.->|De-identified Telemetry Pipeline| BigQuery
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (v20+ recommended)
* Google Gemini API Key (obtain from [Google AI Studio](https://aistudio.google.com/))
* Firebase Account with Google Cloud Project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ginasabrinaasharie-ctrl/momly-ai.git
cd momly-ai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and enter your VITE_GEMINI_API_KEY
```

### 3. Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production & Firebase Deployment
```bash
npm run build
npx firebase deploy --only hosting
```
Live production build is automatically deployed to `https://momly-ai-companion.web.app`.

---

## 🏆 Hackathon Compliance & Submission Checklist

* **Competition**: Google Cloud AI Builder Cup 2026 (JAPAC)
* **Team**: **Nexora Team**
* **Team Leader & Author**: **Gina Sabrina**
* **Category**: Sustainability & Social Impact (UN SDG 3: Good Health & Well-being, SDG 5: Gender Equality)
* **Primary AI Engine**: Google Gemini 3.8 Flash (`@google/genai` SDK)
* **Cloud Infrastructure**: Firebase Hosting (Google Global Edge CDN) + Cloud Firestore + Firebase Authentication + Cloud Run + BigQuery
* **Working Prototype Link**: [https://momly-ai-companion.web.app](https://momly-ai-companion.web.app)
* **Pitch Deck**: Prepared using the official Hack2skill prescribed template ([momly_deck.html](./momly_deck.html))
* **Video Demonstration**: 3 to 4-minute end-to-end working solution walkthrough

---

## 📄 License & Intellectual Property Notice

This source code is made publicly available strictly for the evaluation and judging process of the **Google Cloud AI Builder Cup 2026**. All intellectual property and commercial rights are reserved by **Gina Sabrina (Nexora Team)**. See [LICENSE](./LICENSE) for details.
