# Nova Vision AI — Full Functionality Plan

Ship in three phases. Each phase is independently usable, replaces "Coming Soon" tiles as it lands, and reuses the existing `chatMessage` server function as the central AI engine.

---

## Phase A — Tools Hub + Chat Modes + Preferences (ship first)

**Goal:** every AI Tools Hub card and every AI Chat mode works end-to-end. No dead tiles.

### 1. Central chat with modes

- Extend `chatMessage` (`src/lib/ai.functions.ts`) to accept an optional `mode` id (`blog`, `resume`, `grammar`, `translator`, `summarizer`, `email`, `code`, `sql`, `logo`, `ocr`, `pdf`, `general`).
- Add a mode registry (`src/lib/chat-modes.ts`) with: id, label, icon, color, system prompt (SEO Expert / HR Expert / Senior Engineer / DB Expert / etc.), starter suggestions.
- `_authenticated.chat.tsx`: read `?mode=xxx` search param, show a mode chip in the header, pass mode into `chatMessage`, seed 3 starter prompts per mode.
- All existing `/tools/*` tile links either (a) route straight to `/chat?mode=xxx` for text tools, or (b) keep the existing dedicated pages for tools that need custom UI (OCR image upload, PDF upload, Logo generator image, TTS/STT).

### 2. Tool pages that need custom UI (real, not placeholders)

- **OCR Scanner** — image upload → existing vision engine → extract text; copy/download buttons.
- **PDF Summarizer** — PDF upload (≤20MB) → send as `file` block to Gemini → summary + Q&A follow-up (routes into chat with the PDF pre-attached in context).
- **Logo Generator** — form (brand, style, colors) → Gemini image model → download PNG.
- **Text-to-Speech** — text input + voice picker → `openai/gpt-4o-mini-tts` streaming → play + download MP3.
- **Speech-to-Text** — record via Web Audio → WAV upload → `openai/gpt-4o-mini-transcribe` → transcript with copy.
- **Resume Builder** — structured form → chat mode with resume system prompt → export as PDF (client-side jsPDF).
- **Translator, Blog Writer, Grammar Checker, Text Summarizer, Email Writer, Code Generator, SQL Generator** — thin wrappers that route to `/chat?mode=xxx` with a preset first prompt template.

### 3. Preferences (replaces "Coming Soon" tile in AI Memory)

- New table `user_preferences` (user_id PK, ai_model, response_length, writing_style, tone, creativity, language, theme, voice, default_behavior, updated_at) with RLS + GRANTs.
- New route `_authenticated.preferences.tsx` — real form, saves to DB, loaded and injected into every `chatMessage` system prompt.

### 4. Cloud Sync tile

- New route `_authenticated.cloud-sync.tsx` — shows last-updated timestamps per data type (profiles, scans, chats, prompts, notes, etc.) and a "✓ All data synced to cloud" state. Read-only status page.

**Files added (~15):** chat-modes.ts, preferences.tsx, cloud-sync.tsx, tools/ocr.tsx, tools/pdf.tsx, tools/logo.tsx, tools/tts.tsx, tools/stt.tsx, tools/resume.tsx, plus updates to chat.tsx, tools.$toolId.tsx, ai.functions.ts, ai-memory.tsx, workspace.tsx, one migration.

---

## Phase B — AI Memory (Conversations + Prompts + Smart Memories + Clear)

**Goal:** every card in `/ai-memory` is functional.

### Tables (one migration)

- `chat_conversations` already exists → add `pinned boolean`, `title text` (editable), `mode text`, `updated_at`.
- `chat_messages` already exists → keep.
- `saved_prompts` (id, user_id, title, body, tags text[], folder, favorite, created_at, updated_at).
- `prompt_folders` (id, user_id, name).
- `smart_memories` (id, user_id, key, value, enabled, updated_at).
- `memory_settings` (user_id PK, memory_enabled boolean).

All with RLS + GRANTs to `authenticated`.

### Routes

- `_authenticated.chat.tsx` upgraded:
  - Real conversation persistence (save each user/assistant turn to `chat_messages`).
  - Sidebar drawer: "New chat", search box, list grouped by Today/Yesterday/Older, pin/rename/delete row actions, click resumes exactly where left off.
- `_authenticated.prompts.tsx` — Prompt Library: create/edit/delete/favorite/search/folder, "Use in chat" button that navigates to `/chat?prompt=<id>`.
- `_authenticated.smart-memories.tsx` — list/add/edit/delete memories, global memory ON/OFF; injected into system prompt when enabled.
- `_authenticated.clear-memory.tsx` — 4 destructive actions with confirmation dialogs: delete conversations, delete prompts, delete memories, clear local cache.

Update `_authenticated.ai-memory.tsx` — remove all `soon: true`, wire to new routes.

**Files added (~8):** prompts.tsx, smart-memories.tsx, clear-memory.tsx, one migration, chat sidebar component, chat persistence hook.

---

## Phase C — AI Workspace (Projects, Docs, Notes, Images, Voice, Folders, Sync status)

**Goal:** every card in `/workspace` works.

### Tables & storage

- `projects` (id, user_id, name, folder_id, created_at).
- `documents` (id, user_id, project_id, title, content_md, updated_at).
- `notes` (id, user_id, project_id, title, content_json, updated_at).
- `voice_notes` (id, user_id, project_id, title, storage_path, duration_sec, transcript, summary, created_at).
- `workspace_folders` (id, user_id, name, parent_id).
- Storage buckets: `voice-notes` (private), `workspace-uploads` (private). Both with per-user RLS on `storage.objects`.

### Routes

- `_authenticated.projects.tsx` (+ `$projectId.tsx`) — CRUD, drag-and-drop into folders.
- `_authenticated.documents.tsx` (+ `$docId.tsx`) — Tiptap editor, AI rewrite/summarize/improve buttons, export PDF (jsPDF) / DOCX (`docx` npm) / TXT.
- `_authenticated.notes.tsx` (+ `$noteId.tsx`) — Tiptap with checklists/bullets, AI rewrite/summarize/expand, search.
- `_authenticated.images-library.tsx` — reuse `scans` table + `scan-images` bucket, add album grouping, search, delete, "Analyze" reopens vision.
- `_authenticated.voice-notes.tsx` — record (Web Audio → WAV), pause/resume, upload to bucket, transcribe with `gpt-4o-mini-transcribe`, summarize with chat engine, rename, export transcript.
- `_authenticated.folders.tsx` — folder tree, drag-and-drop to reorganize.
- `_authenticated.cloud-sync.tsx` — already added in Phase A; extend with new data counts.

Update `_authenticated.workspace.tsx` — remove all `soon: true`.

**Dependencies to add:** `@tiptap/react @tiptap/starter-kit @tiptap/extension-task-list @tiptap/extension-task-item`, `jspdf`, `docx`, `eventsource-parser`.

**Files added (~14):** listed above + migration + storage buckets.

---

## Global polish (folded into each phase)

- Loading skeletons, toasts on success/error, empty states, per-page search where relevant, keyboard-friendly.
- `awardPoints` calls already exist for chat/lesson/scan/image; add `+5` for saved prompt used, `+10` for note created, keep totals in profile.
- Remove every `soon: true` from `HubGrid` usage after each phase.

---

## Phase A first — approve to start?

Phase A alone is ~15 files and one migration. It eliminates every "Coming Soon" in the Tools Hub, gives every tool a real working flow, adds real Preferences, and makes Cloud Sync a real status page. Phases B and C follow in separate approved batches so each ships tested and demoable rather than as one giant unreviewable change.
