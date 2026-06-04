# Chikology — Domain Glossary

## Auth & Users

- **Authentication**: Supabase Auth with Google OAuth + email/password. No email verification (auto-confirm for MVP).
- **Session**: Managed by Supabase via cookies. Refreshed in `proxy.ts` on every request. Server-side check in dashboard layout as defense-in-depth.
- **User identity**: Two layers — `auth.users` (Supabase-managed) and `public.users` (app-level, created via DB trigger on signup). The `public.users.id` matches `auth.users.id`.
- **Proxy**: Next.js 16 file convention (`src/proxy.ts`) that replaced `middleware.ts`. Used for session refresh + route protection.

## Products

- **Face Detection / Stress Analysis**: Groq Llama 4 Scout (server-side). 5-tier stress level with Indonesian-language messages and interventions. Face is cropped 70% center before sending. Result card shows structured fields: pesan (message), ciri (indicators), risiko (risk), intervensi (intervention).
- **Journal**: Tiptap rich-text editor. Mood selector (5 levels: very_calm → very_stressed). History list. Connects to face scanner for pre-filled mood.
- **E-Book**: Digital book with chapter-gated content. Each chapter has its own price and release schedule. Supabase Storage for PDF files. Feature is entirely hidden during soft launch; unlocks at full launch. Landing page always shows the book promo card (cover + description) — CTA area swaps based on phase.
- **Book Countdown**: Soft launch CTA area shows "Rilis 16 Juni 2026 — Ulang Tahun Mas Chiko 🎉" with a live countdown timer (days/hours/minutes). Replaced entirely by ChapterList at full launch.
- **RLS Policies**: `book_chapters` — public SELECT, admin-only mutation. `chapter_purchases` — user reads/inserts own rows only, immutable. `app_settings` — public SELECT, admin-only mutation. Supabase Storage bucket `book-chapters` — private, access only via server-action-generated signed URLs.
- **Chapter**: Individual unit of the e-book. Schema: id (uuid PK), title (text), chapter_number (smallint UNIQUE), price_idr (integer, 0 = free), release_date (date, nullable — NULL = not yet scheduled), is_free (boolean, default false), pdf_path (text, nullable — placeholder before PDF upload), created_at, updated_at. No `deleted_at` — soft-hide by setting `release_date = NULL`.
- **Chapter Purchase**: Records ownership. Schema: id (uuid PK), user_id (FK → users), chapter_id (FK → chapters), purchased_at. UNIQUE(user_id, chapter_id) prevents duplicate purchases. Immutable — no update/delete. No `deleted_at`.
- **App Settings**: Key-value store for feature flags. Schema: key (text PK), value (text), updated_at. Seeds `ebook_live = 'false'`. Flipped by pg_cron on Jun 16 or manually via admin page.
- **ChapterList**: Shared component used in two places — dashboard book page (full detail mode) and landing page e-book section (compact embedded mode). Same state logic, different layout. Split only if absolutely needed.
- **Chapter Pricing**: All chapters are paid by default. Each chapter has an `is_free` boolean on the row — togglable via admin UI. No global free/paid switch. This lets Mas Chiko flip individual chapters (e.g., Chapter 1 free) at any time without a deploy.
- **Free Chapter Claim**: User must be authenticated (signed up). Clicking "Buka Gratis" on a free chapter inserts a row into `chapter_purchases` (no payment). This keeps ownership checks uniform — `chapter_purchases` is the single source of truth for "owns Chapter N."
- **Mock Payment**: Confirmation modal when user clicks "Beli RpX" — shows chapter title + price. "Ya, Beli" button inserts row into `chapter_purchases`. No real payment gateway. Server action swaps later when real payments land.
- **Chapter Release**: Chapters are released sequentially as Mas Chiko finishes writing them. `release_date` controls per-chapter availability. Before `release_date`, chapter shows as "Segera hadir". After `release_date`, chapter is accessible (free or purchasable). Mas Chiko will likely have 2-3 chapters ready by full launch.
- **Sequential Purchase**: Chapter N can only be purchased if chapter N-1 is owned by the user. Enforced by chapter_number order. Free chapters bypass payment but still count as "owned" for sequential gating. Unreleased chapters skip purchase logic entirely.
- **Chapter Access State**: Each chapter has one of four visual states for a given user — **unreleased** (grey, tooltip "Segera hadir"), **locked** (teal at 50% opacity + lock icon, shows price, tooltip "Selesaikan Bab N terlebih dahulu"), **buyable** (solid teal "Beli RpX" or "Buka Gratis"), **owned** (green outlined "Baca" with check icon).
- **Landing Page Auth Awareness**: Landing page e-book section checks login status. Logged-in users see real ownership states. Visitors see all released chapters as actionable — any button click redirects to signup/login → dashboard book page where real state is shown.
- **EBOOK_LIVE Feature Flag**: Stored in `app_settings` DB table (`key='ebook_live', value='false'`), not env var. Auto-flipped by Supabase pg_cron on Jun 16, 2026 00:00:00+07. Admin page can also override manually. Read server-side for consistent state across landing page and dashboard.
- **Chapter Reader**: Minimal page at `/dashboard/book/[chapterId]` — header with chapter title + back button, full-height iframe with signed PDF URL, consultation CTA. Next chapter button at bottom — uses same purchase flow (owned → navigate, free → auto-claim, paid → redirect to chapter list, unreleased → "Segera hadir").
- **PDF Viewer**: Supabase Storage private bucket. Server action generates 5-min signed URL for owned chapters only. Rendered in `<iframe>` with direct PDF URL. No download-blocking JS. Audience who can bypass are technical enough to use DevTools, which is an acceptable risk for MVP.
- **Admin Access**: `public.users` has a `role TEXT DEFAULT 'user'` column. Values: `'user'`, `'admin'`. Admin page checks `role === 'admin'`. Granting access = UPDATE query to change role. No separate roles table for MVP.
- **Admin Book Management**: Route at `/dashboard/admin/book`. CRUD form for chapters: title (required), chapter_number (required, unique), price_idr (integer, 0 = free), release_date (optional date picker), is_free (toggle — when ON, price auto-sets to 0), PDF file upload (optional on create, replaceable on edit, PDF only, max 50MB). Validation: title max 255, chapter number unique, price min 0, is_free enforces price = 0.

## Scanner Flow

- **ScannerFlow**: Wrapper component (`src/components/dashboard/scanner/ScannerFlow.tsx`) that orchestrates the scan flow: PreScanQuestionnaire → FaceScanner → result. Manages questionnaire answers state and passes them to the scanner.
- **PreScanQuestionnaire**: Optional form shown before camera activates. Multiple-choice questions with "Lainnya" (other) textarea option. Can be skipped via confirmation modal. Lives at `src/components/dashboard/scanner/PreScanQuestionnaire.tsx`.
- **StressResultCard**: Extracted result card component (`src/components/dashboard/scanner/StressResultCard.tsx`). Displays tier, emoji, label, pesan, ciri, risiko, intervensi. Includes consultation CTA (WhatsApp) and privacy tagline. Ciri + risiko in expandable section.
- **Consultation CTA**: "Butuh rekomendasi lebih dalam? Jadwalkan konsultasi dengan Mas Chiko" → WA link (`wa.me/6287853186759`). Appears on result card after scan.
- **Privacy Tagline**: "Datamu aman, privasi terjamin" — appears on: dashboard header, result card, landing page footer.

## Journaling

- **Journal History**: List of past journal entries, newest first, in `JournalHistory.tsx`.
- **Save to Journal**: Scan result can be saved to journal. Pre-fills mood tier from scan. Triggered by "Simpan ke Jurnal" button on result card.
