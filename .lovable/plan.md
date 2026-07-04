## Nova Vision AI — Production Upgrade Plan

This is a very large scope (13 major areas, ~40+ features). I'll break it into shippable phases so each phase is testable and reversible. Please confirm the phase order — I recommend shipping Phase 1 first, then iterating.

---

### Phase 1 — Foundations (ship first)

**1.1 Remove "Edit with Lovable" badge**
- Requires Pro plan. I'll call `set_badge_visibility(hide_badge: true)`. If your plan doesn't support it, I'll tell you and skip.

**1.2 Auth improvements**
- Add **Forgot Password** flow (`/forgot-password` + `/reset-password` routes, `resetPasswordForEmail` + `updateUser`).
- Session persistence is already correct (Supabase localStorage + autoRefresh); I'll verify + document.
- Google login in Android WebView: already routed through system browser (`src/lib/webview.ts`). I'll add a Capacitor-friendly deep-link callback for wrapped apps.

**1.3 Accent colors expansion**
- Extend `src/lib/accent-color.tsx` from current palette to: Green (default), Blue, Purple, Red, Orange, Pink, Cyan, Indigo, Emerald, Yellow, White, Black. Persist to profile + localStorage.

---

### Phase 2 — Profile & Points system

**2.1 Database migrations**
- `profiles`: add `ai_points int default 100`, `ai_interests text[]`, `achievements jsonb`, `country text` (if missing).
- Drop UI for `dietary_goal`, `diet_preference` (keep columns to avoid data loss; hide in UI only).
- Trigger: on new user, set `ai_points = 100`.

**2.2 Points awarding (server-side RPC)**
- `award_points(user_id, action, amount)` SECURITY DEFINER.
- Hook into: scan complete (+10), chat message sent (+5), image generated (+20), lesson completed (+30), daily login (+5, once per day via `last_login_at`).

**2.3 Profile page redesign**
- Replace 🔥 Streak card with ⭐ AI Points card.
- Show Favorites count (already queryable from `scans` where `is_favorite`).
- AI Interests multi-select chips (saves to `profiles.ai_interests`).
- Achievements grid (computed from thresholds: Beginner = 1 scan, AI Learner = 1 lesson, Daily Scanner = 7-day streak, Image Creator = 5 images, Power User = 500 points, AI Expert = 2000 points).

---

### Phase 3 — Recent Scan detail

- Recent scan cards on Home already exist. Add click handler → route to `/scan-result/$scanId`.
- New route reads scan row, renders image + AI description + objects + summary + date + Save/Share/Favorite buttons (reuse `ScanResult` component).

---

### Phase 4 — AI Suite (remove "Coming Soon")

This is the biggest phase. Each sub-feature is a real AI call via Lovable AI Gateway.

**4.1 AI Learning Academy** — `academy` route already exists. Add:
- Curriculum data (9 tracks × ~5 lessons each) stored in `academy_lessons` table.
- Lesson viewer with AI-generated explanations (`google/gemini-3-flash-preview`).
- Practice quiz (AI-generated 3 questions per lesson).
- `academy_progress` table tracks completion → awards +30 points + "AI Learner" badge.

**4.2 AI Image Studio** — `image-studio` route exists. Build 9 tools:
- Generator, Wallpaper, Logo → `openai/gpt-image-2` via `/api/generate-image` streaming route.
- Enhancer, Upscaler, Face Restore, Art Styles, BG Changer → `google/gemini-3.1-flash-image` (edit mode).
- BG Remover → same, prompted for transparent output.
- Nova Vision AI watermark added to canvas before download (bottom-right corner).
- Save-to-Gallery: `generated_images` table.

**4.3 AI Workspace** — `workspace` route exists. Tables:
- `workspace_projects` (id, user_id, name, kind, created_at)
- `workspace_items` (id, project_id, type, content jsonb) for saved chats, images, docs.
- UI: project list → project detail with tabs (Chats / Images / Docs / Notes).

**4.4 AI Tools Hub** — `tools` route exists. 12 tools, each a small form + server-fn call:
- Writer, Translator, Summarizer, Grammar, Email, Blog, Resume → text completions.
- OCR, PDF Reader/Summarizer → multimodal (image/PDF upload → Gemini).
- Code Generator, SQL Generator → text completions with code-format system prompt.

**4.5 AI Memory** — `ai-memory` route exists. Table `ai_memory` (user_id, key, value, updated_at).
- Chat pulls memory as system context.
- User can view + clear memory entries.

**4.6 Daily AI Feed** — `daily-feed` route exists. Server fn generates 5 cards/day (news-style tips, prompts, productivity ideas). Cached per-day per-user in `daily_feed_cache`.

**4.7 AI Chat** — already solid. Verify long conversations, image understanding (already supported via `imageUrl` in `chatMessage`).

---

### Phase 5 — Polish

- Performance: React Query stale-time tuning, lazy-load studio/academy routes.
- Error handling: consistent toast + retry across all AI calls.
- Console-error sweep via Playwright.
- Mobile responsive audit on 375×812 viewport.

---

### Technical section (for reviewer)

**New DB tables:** `academy_lessons`, `academy_progress`, `workspace_projects`, `workspace_items`, `ai_memory`, `daily_feed_cache`, `generated_images`. All with RLS scoped to `auth.uid()` + GRANT block for `authenticated` + `service_role`.

**New server fns (`src/lib/*.functions.ts`):**
- `awardPoints`, `getProfileStats`
- `academyGenerateLesson`, `academyGenerateQuiz`, `academyCompleteLesson`
- `toolWrite`, `toolTranslate`, `toolSummarize`, `toolGrammar`, `toolOcr`, `toolPdfSummarize`, `toolCodeGen`, `toolSqlGen`, `toolEmail`, `toolResume`, `toolBlog`
- `workspaceCreateProject`, `workspaceAddItem`, `workspaceListProjects`
- `aiMemoryUpsert`, `aiMemoryClear`, `aiMemoryList`
- `dailyFeedFetch`

**New server routes (`src/routes/api/`):** `/api/generate-image` (streaming), `/api/edit-image` (streaming).

**Watermark:** Canvas overlay applied client-side before download, text "Nova Vision AI" + logo mark, bottom-right, 10% opacity backdrop.

**Estimated size:** ~40 new files, ~15 edited files, 7 migrations.

---

### Recommendation

Ship in this order, one phase per turn:
1. **Phase 1** (badge + auth + accents) — small, high user impact
2. **Phase 2** (points + profile) — foundation for gamification
3. **Phase 3** (scan detail) — quick win
4. **Phase 4** in sub-phases: 4.2 Image Studio → 4.4 Tools → 4.1 Academy → 4.3 Workspace → 4.5 Memory → 4.6 Feed
5. **Phase 5** polish

**Approve this plan and I'll start with Phase 1.** Or tell me which phase to prioritize first if you want a different order.
