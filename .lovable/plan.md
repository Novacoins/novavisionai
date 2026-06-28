This is a very large request — essentially a full consumer AI app (Nova Vision / VisionNova AI) with camera scanning, multimodal AI, meal planner, plant scanner, sidebar with ~15 sub-pages, auth, history, favorites, chat, community, i18n for 20+ languages, PDF export, OCR, barcode, voice, notifications, etc.

Before I start building, I need to confirm scope and priorities so I deliver something that actually works rather than 30 half-finished screens.

## A few important realities

1. **This is a web app, not a native mobile app.** The Lovable stack is TanStack Start (React + Vite, deployed to Cloudflare Workers). I can build a mobile-optimized PWA with camera access via `getUserMedia` and file upload, but it is not a native Android/iOS app. Native push notifications, true background tasks, and app-store distribution are out of scope.
2. **AI vision** will use Lovable AI Gateway (default `google/gemini-3-flash-preview`, which is multimodal). Works great for image analysis.
3. **Backend** will use Lovable Cloud (auth, database for history/favorites/chats/profile, storage for scan images).
4. **Realistic first version.** Building every single feature listed (community feed, voice assistant, OCR, barcode, 20 languages with real translations, PDF export, weekly meal planner, notifications, etc.) in one shot will produce a shallow, broken app. I'd rather ship a solid v1 and layer extras.

## Proposed v1 scope (what I'll build now)

**Core**
- Auth (email/password) via Lovable Cloud
- Mobile-first layout with bottom nav: Home, Scan, Meal Planner, Plant Scanner, Profile
- Premium sliding sidebar (hamburger) with emerald/black glassmorphism theme

**Scan (core feature)**
- Camera capture + image upload
- Multimodal AI analysis returning: identification, category, safety, recommendations, nutrition (for food), care (for plants)
- Results saved to scan history with thumbnail in Cloud storage
- "Ask about this image" follow-up chat

**Home**
- Scan Anything CTA, daily meal suggestion, nutrition tip, recent scans, quick shortcuts

**Meal Planner**
- AI-generated daily plan based on user goals/diet preferences stored on profile
- Generate from preferences or from recent scanned ingredients

**Plant Scanner**
- Dedicated flow with plant-specific prompt (name, edible, toxicity, care, warnings)

**Sidebar pages (real, functional)**
- My Profile (edit display name, country, dietary goals, diet prefs; stats: total scans, favorites)
- Scan History (search, filter, favorite, delete, share)
- Favorites
- AI Chat (text + optional image attach, conversation persistence)
- Appearance (light/dark/system, persisted)
- Notifications settings (preferences stored; in-app toast notifications, no native push)
- FAQ (static)
- Contact Support (form → stored in DB + emailed via configurable support address)
- About, Privacy Policy, Terms of Service (static content pages)
- Logout (with confirmation)

**Design system**
- Emerald #0B8F4D primary, deep black #111, charcoal #1C1C1C, white
- Glassmorphism cards, rounded corners, soft shadows, smooth Framer-Motion transitions
- Dark mode default, light mode supported
- Lucide icons

## Deferred to later iterations (call out, don't silently build)

- Languages: I'll wire an Appearance/Language selector UI and persist the choice, but **only English content is shipped in v1**. Full translations for 20 locales are a multi-day effort that needs translation source files; I'll set up i18next so adding locales later is incremental.
- Community feed (posts/likes/comments) — needs moderation, real social infra
- Voice input / voice AI assistant
- OCR / barcode / QR / image translation
- PDF export of scans/reports
- Weekly meal planner + shopping list + meal reminder notifications
- Collections (folders for favorites)
- Onboarding tutorial

I can add these in follow-up turns once v1 is solid.

## Open questions

1. **Confirm v1 scope above is OK?** Or do you want me to push specific deferred items (e.g. OCR, voice, PDF export) into v1?
2. **Auth:** email + password only, or also Google sign-in? (Google needs you to set up an OAuth client.)
3. **Support email** for the Contact form — what address should messages go to? (I can store them in the DB regardless; sending email needs a Resend API key or similar.)
4. **Existing app:** you mention "keep my current homepage / scan flow working." The project currently only has the Lovable blank template — there's no existing VisionNova code. I'll build from scratch. Confirm that's expected.

Reply with answers (or just "go with v1 as proposed") and I'll start.