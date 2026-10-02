# 🎓 ToppersToolkitAI

> **AI-powered academic study companion, LaTeX formula doubt solver, and pedagogical mentor for the Topper's Toolkit learning platform.**

![Framework](https://img.shields.io/badge/Framework-Next.js%2015-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![AI Engine](https://img.shields.io/badge/AI-Google%20Genkit%20%2B%20Gemini-4285F4?logo=google&logoColor=white)
![Database](https://img.shields.io/badge/Database-Firebase%20Firestore-FFCA28?logo=firebase&logoColor=black)
![Typesetting](https://img.shields.io/badge/Math-KaTeX-00D8A2?logo=latex&logoColor=white)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

---

## 📖 Overview

**ToppersToolkitAI** is an intelligent academic study companion engineered for the Topper's Toolkit educational ecosystem. Powered by Next.js 15, Google Genkit, and Firebase Firestore, it provides secondary and senior-secondary students with personalized, step-by-step doubt resolution across Mathematics, Physics, Chemistry, and Biology.

The application couples real-time formula rendering via KaTeX with Google Gemini LLMs through structured Genkit flows. It maintains durable conversational histories in Cloud Firestore, contextualizes explanations to individual student grade levels, and acts as an interactive guide for Topper's Toolkit resources.

---

## ✨ Key Features

- **Academic Doubt Resolution Flow (`solve-student-doubt.ts`)**: Structured Genkit flow that decomposes challenging academic questions into intuitive, pedagogical steps. Accurately adapts pedagogical depth based on `studentName`, `studentClass`, and academic background.
- **Precision KaTeX & Markdown Rendering**: Deep integration of `katex`, `react-katex`, `react-markdown`, and `remark-gfm` ensuring seamless mathematical notation, chemical reactions, exponents, fractions, and matrices are rendered clearly.
- **Student Context Retention (`remember-student-context.ts`)**: Automatically tracks student learning curves, previously addressed topics, and persistent preferences across sessions for a continuous tutoring relationship.
- **Topper's Toolkit Knowledge Navigator (`offer-toppers-toolkit-info.ts`)**: Built-in navigational guide that directs students to syllabus notes, past question papers, and revision tools within the Topper's Toolkit suite.
- **Persistent Cloud Firestore Storage**:
  - `chats/<studentName>/messages`: Sub-collection recording structured timestamped message dialogues.
  - Server actions (`getAiResponse`, `getChatHistory`, `clearUserChatSession`, `deleteUserChatHistory`) ensure atomic cloud synchronization.
- **Turbopack & Modern UI Architecture**: Runs with Next.js Turbopack development acceleration, styled with Tailwind CSS, Lucide icons, and the full Radix UI component suite.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Version / Purpose |
|-------|------------|-------------------|
| **Core Framework** | Next.js 15 | `15.5.2` (Turbopack, Server Actions, App Router) |
| **Frontend Library** | React | `18.3.1` |
| **AI Framework** | Google Genkit | `^1.14.1` (`@genkit-ai/googleai`, `@genkit-ai/next`) |
| **Large Language Model**| Google Gemini | `gemini-1.5-flash` / Gemini Pro via Genkit |
| **Cloud Database** | Firebase Firestore | `^11.9.1` |
| **Formula Typesetting** | KaTeX | `0.16.11` via `react-katex` |
| **Markdown Parser** | React Markdown | `9.0.1` with `remark-gfm` |
| **Component Primitives**| Radix UI | Accessible Dialog, Tooltip, ScrollArea, Select, Tabs |
| **Styling** | Tailwind CSS | `^3.4.1` with `@tailwindcss/typography` |

---

## 📁 Project Structure

```plaintext
ToppersToolkitAI/
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   ├── solve-student-doubt.ts        # Main academic doubt solver flow
│   │   │   ├── remember-student-context.ts   # Student preference & context memory
│   │   │   └── offer-toppers-toolkit-info.ts # Ecosystem knowledge provider flow
│   │   ├── dev.ts                            # Genkit developer server runner
│   │   └── genkit.ts                         # Genkit & Google AI provider config
│   ├── app/
│   │   ├── actions.ts                        # Server actions for Firestore & AI execution
│   │   ├── layout.tsx                        # Root layout with providers & fonts
│   │   ├── page.tsx                          # Interactive student chat page
│   │   └── globals.css                       # Tailwind & KaTeX style definitions
│   ├── components/
│   │   ├── chat-interface.tsx                # Chat dialogue & message bubbles
│   │   ├── student-form.tsx                  # Student profile configuration
│   │   └── ui/                               # Radix UI primitives
│   └── lib/                                  # Firebase SDK initialization & utility helpers
├── next.config.ts                            # Next.js config (configured for port 9002)
├── tailwind.config.ts                        # Tailwind design configuration
└── tsconfig.json                             # TypeScript settings
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `20.x` or later
- **npm** or **pnpm**
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)
- **Firebase Project**: With Cloud Firestore enabled

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/AryansDevStudios/ToppersToolkitAI.git
cd ToppersToolkitAI
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Google GenAI API Key for Genkit
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Launch Development Servers

Start the Next.js development server with Turbopack (defaults to port `9002`):

```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) in your browser.

To start the **Genkit Developer Console** to inspect flows and debug model executions:

```bash
npm run genkit:dev
```
Open [http://localhost:4000](http://localhost:4000).

---

## 🤝 Contributing

Contributions are welcomed!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFlow`)
3. Commit your changes (`git commit -m 'Add physics simulation flow'`)
4. Push to the branch (`git push origin feature/NewFlow`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
