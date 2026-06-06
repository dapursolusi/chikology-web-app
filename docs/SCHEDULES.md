# Chikology.id — Sprint Schedule

> Last updated: 1 Juni 2026 (Phase 2 done ahead of schedule)
> Rescheduled after Mas Chiko meeting (May 31). All feedback items marked with 🆕
> Phase 2 PRD published (GitHub issue #7). Architecture decisions finalized.

---

## Key Dates

| Milestone   | Date                                     | Scope                                                      |
| ----------- | ---------------------------------------- | ---------------------------------------------------------- |
| Soft Launch | **June 12, 2026**                        | Scanner + Journal + Landing Page. E-book = countdown only. |
| Full Launch | **June 16, 2026** (Mas Chiko's birthday) | E-book unlocks. Chapter buttons appear. Countdown removed. |

---

## Tech Stack Decisions (Locked)

| Layer           | Choice                                |
| --------------- | ------------------------------------- |
| Framework       | Next.js (App Router)                  |
| UI              | Tailwind CSS v4 + shadcn/ui           |
| Database        | Supabase (Postgres)                   |
| ORM             | Drizzle ORM + postgres driver         |
| Auth            | Supabase Auth (Google OAuth only)     |
| Face Detection  | Groq (Llama 4 Scout) server-side      |
| Storage         | Supabase Storage (book PDFs, Phase 3) |
| Deploy          | Vercel                                |
| Payment         | Mock (real gateway deferred)          |
| Book Pricing    | Waiting on Mas Chiko                  |
| Email Marketing | Deferred until 500+ users             |
| Package Manager | bun — `bunx --bun`, not npx           |

---

---

## PHASE 0: Foundation — ✅ Done (May 25)

---

## PHASE 1: Face Scanner — ✅ Shipped (May 25–26)

### Day 1 — Groq Integration ✅ Done

### Day 2 — Polish, Save, Deploy ✅ Done

| #   | Task                   | Done?                            |
| --- | ---------------------- | -------------------------------- |
| 1–8 | All core tasks         | ✓                                |
| 9   | Mobile responsive test | ✓ (tested during Mas Chiko demo) |

---

## PHASE 1.5: Scanner Refinements — Mas Chiko Feedback (Jun 1–3)

> Based on 8 feedback items from Mas Chiko meeting (May 31).
> Items 1, 3, 4, 5, 6 touch the scanner or landing page.

### Day 1 — Sunday, Jun 1: Landing Page Quick Wins

**Goal:** "Copy fixed. Privacy banner visible. Landing page presentable."

| #   | Task                                                                                            | Est.   | Done? |
| --- | ----------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | 🆕 Hero: change "Mulai Gratis" → "Daftar" (remove "Masuk gratis" copy)                          | 5 min  | ✓     |
| 2   | 🆕 Add privacy section to footer: **"Datamu aman, privasi terjamin"** + brief privacy statement | 20 min | ✓     |
| 3   | 🆕 Hero: update sub-copy to remove "Masuk gratis" references                                    | 5 min  | ✓     |
| 4   | Mobile responsive check on updated landing page                                                 | 15 min | ☐     |
| 5   | Deploy + verify                                                                                 | 10 min | ☐     |

**End-of-day checkpoint:** Landing page shows "Daftar", privacy banner in footer. Mobile OK.
**Total: ~1 hour**

---

### Day 2 — Monday, Jun 2: Pre-Scan Questionnaire

**Goal:** "User answers questions before camera activates. Answers sent to Groq for synthesis."

| #   | Task                                                                                                                                                  | Est.   | Done? |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | 🆕 Create `PreScanQuestionnaire.tsx` — form component, displayed before camera. Questions placeholder (user will fill in Mas Chiko's questions later) | 60 min | ✓     |
| 2   | 🆕 Update schema: add `questionnaire_responses` table (user_id, answers JSONB, created_at)                                                            | 15 min | ✓     |
| 3   | `bunx --bun drizzle-kit push`                                                                                                                         | 5 min  | ☐     |
| 4   | 🆕 Wire questionnaire into scanner flow: form → submit → show camera                                                                                  | 30 min | ✓     |
| 5   | 🆕 Pass questionnaire answers as context into Groq STRESS_PROMPT                                                                                      | 20 min | ✓     |
| 6   | 🆕 Mobile responsive check: questionnaire form on small screens                                                                                       | 15 min | ☐     |
| 7   | Deploy + test: questionnaire → scan → result                                                                                                          | 15 min | ☐     |

**End-of-day checkpoint:** Questionnaire appears before camera. Answers influence Groq result. Mobile OK.
**Total: ~2.5 hours**

---

### Day 3 — Tuesday, Jun 3: Result Card Refinement + CTA

**Goal:** "Result card shows consultation CTA, privacy note, improved stress comments."

| #   | Task                                                                                                                                                                                                           | Est.   | Done? |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | 🆕 Extract result card from `FaceScanner.tsx` into `StressResultCard.tsx` (cleaner separation)                                                                                                                 | 30 min | ✓     |
| 2   | 🆕 Add consultation CTA to result card: **"Butuh rekomendasi lebih dalam? Jadwalkan konsultasi dengan Mas Chiko"** → link (wa.me/6287853186759)                                                                | 20 min | ✓     |
| 3   | 🆕 Add privacy tagline to result card: **"Datamu aman, privasi terjamin"**                                                                                                                                     | 10 min | ✓     |
| 4   | 🆕 Restructure stress comments per tier in `stressAnalyzer.ts` — organize into: pesan (message), ciri (indicators), risiko (risk), intervensi (intervention). Use content from `docs/STRESS_RECOMMENDATION.md` | 60 min | ✓     |
| 5   | 🆕 Add variation to stress comments: multiple message variants per tier (rotate or randomize)                                                                                                                  | 30 min | ☐     |
| 6   | 🆕 Mobile responsive check: refined result card on small screens                                                                                                                                               | 15 min | ☐     |
| 7   | Deploy + full test: questionnaire → scan → refined result → CTA visible                                                                                                                                        | 15 min | ☐     |

**End-of-day checkpoint:** Result card has CTA, privacy note, structured comments with variations. Mobile OK.
**Total: ~3 hours**

---

## PHASE 2: Journal System — ✅ Done (Jun 1–3, shipped Jun 1)

> Accelerated from original Jun 4–6 schedule. All slices merged into `main` on Jun 1.

### Day 1 — Sunday, Jun 1: Foundation + Editor

**Goal:** "Journal page exists. I can write text and save it."

| #   | Task                                                        | Est.   | Done? |
| --- | ----------------------------------------------------------- | ------ | ----- |
| 1   | Tiptap editor with bold/italic/list toolbar                 | 45 min | ✓     |
| 2   | Journal server actions: saveJournalEntry, getJournalEntries | 30 min | ✓     |
| 3   | Journal page layout + MoodSelector                          | 45 min | ✓     |
| 4   | Bug: navbar1.tsx hydration mismatch + modal.tsx aria        | 20 min | ✓     |
| 5   | Mobile responsive check                                     | 20 min | ☐     |

**End-of-day checkpoint:** Journal page renders. Can type and save. Content in DB.

---

### Day 2 — Monday, Jun 2: Mood + History + Scanner Connect

**Goal:** "I can pick my mood, see past entries. Scanner pre-fills mood."

| #   | Task                                                             | Est.   | Done? |
| --- | ---------------------------------------------------------------- | ------ | ----- |
| 1   | MoodSelector: tiny captions below emojis + aria-label            | 30 min | ✓     |
| 2   | JournalHistory: expandable entries, soft-delete, stripHtml lists | 45 min | ✓     |
| 3   | ScannerFlow redirect: router.push(/journal?tier=N) on save       | 20 min | ✓     |
| 4   | ScanResultAccordion + pre-fill mood from tier URL param          | 30 min | ✓     |
| 5   | Success toast on save + optimistic history update                | 30 min | ✓     |
| 6   | Sidebar nav fix + DashboardHeader with dynamic breadcrumb        | 30 min | ✓     |
| 7   | Deploy to dev + verify E2E                                       | 15 min | ✓     |

**End-of-day checkpoint:** Full journal flow works: scan → pre-fills mood → write → save → history updates immediately. Toast appears on save.

---

### Day 3 — Tuesday, Jun 3: Bug Fixes + Polish

**Goal:** "Everything solid. Mobile ready."

| #   | Task                                                                                          | Est.   | Done? |
| --- | --------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Bug: toolbar type="button" (prevents form submit on click)                                    | 10 min | ✓     |
| 2   | Bug: JournalHistory localEntries stale (useState only reads prop on mount)                    | 20 min | ✓     |
| 3   | Bug: infinite toast loop (startTransition + router.refresh race)                              | 20 min | ✓     |
| 4   | CSS: .journal-content list styles (bullets/numbers invisible without @tailwindcss/typography) | 15 min | ✓     |
| 5   | Deploy to dev + E2E verify                                                                    | 15 min | ✓     |
| 6   | Mobile responsive check                                                                       | 20 min | ☐     |

**End-of-day checkpoint:** Journal feature complete. Connected to scanner. All major bugs fixed. Phase 2 DONE.
**Total: ~3 hours**

## PHASE 3: E-Book (Jun 7–8 soft launch scope, Jun 12–15 full launch scope)

> **Soft launch (Jun 12):** Landing page e-book section = countdown to June 16. Dashboard book nav = greyed. No chapter buttons visible.
> **Full launch (Jun 16):** Countdown removed → chapter button group appears. E-book nav unlocks. Full read/buy flow.

### Soft Launch Scope — Saturday, Jun 7: Schema + Countdown

**Goal:** "Book chapters table exists. Landing page shows countdown. Nav is greyed."

> **Update (Jun 4):** Slice 1 (issue #14) shipped early. Scope refined per PRD #13: the soft-launch slice only needs `app_settings` (the feature-flag table). `book_chapters` + `chapter_purchases` schema moved to the full-launch build slice (Jun 12–15) since they're not used by anything during soft launch. The `EBOOK_LIVE` flag is database-driven (row in `app_settings`), not an env var, so it can be flipped via pg_cron at midnight Jun 16 without a deploy.

| #   | Task                                                                                                                                                                    | Est.   | Done?                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| 1   | ~~Add `book_chapters` table~~ — moved to full-launch build slice                                                                                                        | 20 min | ⏭ deferred                                                                                                    |
| 2   | ~~Add `chapter_purchases` table~~ — moved to full-launch build slice                                                                                                    | 15 min | ⏭ deferred                                                                                                    |
| 2a  | 🆕 Add `app_settings` table: `key TEXT PK`, `value TEXT NOT NULL`, `updated_at TIMESTAMPTZ` (backs the database-driven feature flag)                                    | 10 min | ✓ (Jun 4)                                                                                                      |
| 3   | `bunx --bun drizzle-kit push` (applied `app_settings` only this slice)                                                                                                  | 5 min  | ✓ (Jun 4)                                                                                                      |
| 3a  | 🆕 Seed row `('ebook_live', 'false')` into `app_settings` (manual `bun -e` script since `drizzle-kit push` ignores SQL INSERT statements)                               | 5 min  | ✓ (Jun 4)                                                                                                      |
| 4   | 🆕 Create `BookCountdown.tsx` — countdown timer targeting June 16, 2026                                                                                                 | 30 min | ✓ (Jun 4) — TDD, 4 tests                                                                                       |
| 5   | 🆕 Replace e-book section CTA with countdown component. Remove "Baca Preview" and "Akses Full E-Book" buttons. Show countdown + "Rilis 16 Juni — Ulang Tahun Mas Chiko" | 20 min | ✓ (Jun 4) — TDD, 2 tests                                                                                       |
| 6   | 🆕 Add `EBOOK_LIVE` feature flag (DB row, not env var) — when false, sidebar "E-book" link renders as greyed/disabled with tooltip "Segera hadir 16 Juni"               | 20 min | ✓ (Jun 4) — TDD, 3 sidebar tests + getEbookLive helper                                                         |
| 7   | 🆕 Set `EBOOK_LIVE=false` for soft launch (done via seeded `app_settings` row above)                                                                                    | 5 min  | ✓ (Jun 4)                                                                                                      |
| 8   | Test: landing page shows countdown, dashboard book nav greyed                                                                                                           | 15 min | ◐ landing page smoke-tested in headless chrome; dashboard sidebar pending real-user verification post-PR-merge |

**End-of-day checkpoint:** Countdown visible on landing page. Book nav greyed. Schema ready for full launch.
**Total: ~2 hours** — Actual: ~2 hours from session start to all-green tests + build. PR open and squash-merge pending.

---

### Soft Launch Scope — Sunday, Jun 8: Security + Final Prep

**Goal:** "Everything secure. Full E2E test passes. Ready for soft launch."

| #   | Task                                                                                                                  | Est.   | Done? |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Connect navigation: scanner → journal → book (greyed)                                                                 | 20 min | ☐     |
| 2   | Privacy check: privacy tagline visible on scanner, result card, landing page footer                                   | 10 min | ☐     |
| 3   | Consultation CTA check: visible on result card + landing page                                                         | 10 min | ☐     |
| 4   | 🆕 Mobile responsive: full E2E on phone — questionnaire → scan → result → journal → landing page                      | 30 min | ☐     |
| 5   | SEO basics: title, description, og:image                                                                              | 20 min | ☐     |
| 6   | Deploy soft launch build to Vercel                                                                                    | 15 min | ☐     |
| 7   | Full E2E test: new user → daftar → questionnaire → scan → result (CTA + privacy) → journal → landing page (countdown) | 30 min | ☐     |

**End-of-day checkpoint:** Soft launch ready. All features tested. Mobile OK.
**Total: ~2.5 hours**

---

### Buffer — Monday, Jun 9: Testing + Bug Fix

| #   | Task                                          | Est.   | Done? |
| --- | --------------------------------------------- | ------ | ----- |
| 1   | Bug fixes from E2E test                       | 60 min | ☐     |
| 2   | Mas Chiko UAT (share preview link)            | 30 min | ☐     |
| 3   | Final adjustments based on Mas Chiko feedback | 60 min | ☐     |
| 4   | Deploy final soft launch build                | 15 min | ☐     |

---

### Tuesday, Jun 10–11: Mas Chiko Final Approval

| #   | Task                                                | Est.   | Done? |
| --- | --------------------------------------------------- | ------ | ----- |
| 1   | Mas Chiko reviews full app on phone                 | 30 min | ☐     |
| 2   | Fix any issues found                                | 60 min | ☐     |
| 3   | Connect domain (chikology.id) to Vercel if not done | 20 min | ☐     |
| 4   | Final deploy                                        | 15 min | ☐     |

---

### 🚀 Wednesday, Jun 12: SOFT LAUNCH

Scanner + Journal + Landing Page live. E-book = countdown to June 16.

---

### Full Launch Build — Jun 12–15: Chapter UI + Payment + Viewer

> These tasks happen AFTER soft launch. Build the full e-book experience for June 16.

| #   | Task                                                                                                                                     | Est.   | Done?                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| 1   | 🆕 Create `ChapterList.tsx` — horizontal button group [Bab 1] [Bab 2] [Bab 3] ...                                                        | 30 min | ☐                                                                |
| 2   | Button state logic: unreleased → grey ("Segera hadir"), released + not purchased → price + "Beli", released + purchased → open reader    | 30 min | ☐                                                                |
| 3   | Create `app/dashboard/book/page.tsx` — chapter list page                                                                                 | 20 min | ☐                                                                |
| 4   | Create `app/dashboard/book/[chapterId]/page.tsx` — chapter reader                                                                        | 20 min | ☐                                                                |
| 5   | Access check: not purchased → redirect / show "Beli" button                                                                              | 20 min | ☐                                                                |
| 6   | Mock payment flow: button inserts into `chapter_purchases`                                                                               | 30 min | ☐                                                                |
| 7   | PDF viewer: signed Supabase URL (5-min expiry) + render in `<iframe>`                                                                    | 45 min | ☐                                                                |
| 8   | Sequential purchase: can only buy chapter N if N-1 is owned                                                                              | 30 min | ☐                                                                |
| 9   | Disable PDF right-click + hide download in iframe                                                                                        | 20 min | ☐                                                                |
| 10  | RLS policy: users access only owned chapter PDFs                                                                                         | 30 min | ☐                                                                |
| 11  | Create admin page for chapter upload (title, number, price, release date, PDF) — split into 2A/2B/2C sub-slices; 2A + 2B shipped Jun 4   | 60 min | ✓ (2A + 2B + 2C shipped Jun 5)                                   |
| 12  | 🆕 Replace landing page countdown with chapter button group                                                                              | 20 min | ✓ (Jun 6) — TDD, 25 new tests, branch `feat/landing/full-launch` |
| 13  | 🆕 Set `EBOOK_LIVE=true` + deploy                                                                                                        | 5 min  | ☐                                                                |
| 14  | 🆕 Mobile responsive: chapter button group on phone                                                                                      | 20 min | ☐                                                                |
| 15  | Full E2E: scan → journal → browse chapters → buy → read ✓                                                                                | 30 min | ☐                                                                |
| 16  | 🆕 Admin edit chapter (title, number, price, release date, is_free, replace PDF) — sub-slice 2C of issue #15                             | 30 min | ✓ (Jun 5)                                                        |
| 17  | 🆕 Admin hide / unhide chapter (is_published=false) — sub-slice 2C of issue #15                                                          | 15 min | ✓ (Jun 5)                                                        |
| 18  | 🆕 Chapter Reader page at `/dashboard/book/[chapterId]`: signed-URL iframe, 5-scenario next-chapter button, consultation CTA (issue #18) | 90 min | ✓ (Jun 6) — TDD, 21 tests, branch `feat/reader/chapter-reader`   |

**Total: ~6.5 hours (spread across Jun 12–15)**

---

### 🚀 Tuesday, Jun 16: FULL LAUNCH

E-book unlocks. Chapter buttons live. Countdown removed. `EBOOK_LIVE=true`.

---

## Full Calendar View

```
May 25–26     ████ Phase 0 ✓ + Phase 1 (Scanner) ✓               ← DONE
May 27–30     ░░░░ Original Phase 2/3 dates (missed)
May 31        🔄   Mas Chiko meeting + reschedule

Jun  1 (Sun)  ████ Phase 1.5 ✓ + Phase 2 Day 1 — Journal Foundation ← DONE (ahead!)
Jun  2 (Mon)  ████ Phase 2 Day 2 — Mood + History + Scanner Connect  ← DONE
Jun  3 (Tue)  ████ Phase 2 Day 3 — Bug Fixes + Polish               ← DONE

Jun  4 (Thu)  ████ Phase 3 Slice 1 — Soft launch countdown + nav gate (issue #14) ← DONE (3 days early)
Jun  4 (Thu)  ████ Phase 3 Slice 2A — Chapter schema + admin role-gate + read-only list (issue #15 partial) ← DONE
Jun  4 (Thu)  ████ Phase 3 Slice 2B — Admin create chapter form + PDF upload (issue #25) ← DONE
Jun  5 (Thu)  ████ Phase 3 Slice 2C — Admin edit + hide chapter (issue #26) ← DONE
Jun  6 (Sat)  ████ Phase 3 Slice 4 — Chapter Reader (issue #18) ← DONE (TDD, 21 new tests, branch feat/reader/chapter-reader, awaiting commit)
Jun  6 (Sat)  ████ Phase 3 Slice 5 — Landing Page Full Launch (issue #19) ← DONE (TDD, 25 new tests, branch feat/landing/full-launch)

Jun  7 (Sat)  ░░░░ Phase 3 (soft launch) — Countdown + Nav Gating
Jun  8 (Sun)  ░░░░ Phase 3 (soft launch) — Security + E2E Test

Jun  9 (Mon)  ░░░░ Buffer — bug fixes + Mas Chiko UAT
Jun 10 (Tue)  ░░░░ Mas Chiko final approval + domain connect
Jun 11 (Wed)  ░░░░ Final prep

Jun 12 (Thu)  🚀   SOFT LAUNCH — Scanner + Journal + Landing Page. E-book = countdown.

Jun 12–15     ░░░░ Full e-book build (chapter UI, payment, viewer)
Jun 16 (Mon)  🚀   FULL LAUNCH — E-book unlocks. Chapter buttons live.
```

---

## Pending — Waiting on Mas Chiko

| Item                                                                              | Needed by     | Impact if late                        |
| --------------------------------------------------------------------------------- | ------------- | ------------------------------------- |
| Pre-scan questions (wording, count, order)                                        | Before Jun 2  | Ship with placeholder questions       |
| Booking/consultation link for CTA                                                 | Before Jun 3  | Placeholder URL in CTA button         |
| Stress recommendation content (if different from `docs/STRESS_RECOMMENDATION.md`) | Before Jun 3  | Use existing content from doc         |
| Chapter pricing (chapter 1 free or paid?)                                         | Before Jun 12 | Can't build full launch purchase flow |
| Chapter content / PDF files                                                       | Before Jun 14 | Can't test chapter upload + viewer    |
| Chapter release schedule (tanggal per bab)                                        | Before Jun 14 | Can't set release_date in DB          |

---

## Reminders (Dev)

- Always use `bun` — `bunx --bun` for package execution, never `npx`
- Run `bunx --bun drizzle-kit push` after every schema change
- Route convention: everything behind `/dashboard/` (auth shell with sidebar)
- Face detection: Groq API (Llama 4 Scout) via `/api/analyze-face`. Requires `GROQ_API_KEY` in `.env.local`
- `mapEmotionsToStress()` in `stressAnalyzer.ts` unused — kept for future DeepFace integration
- Feature flag: `EBOOK_LIVE=false` in production until full launch (June 16)
- Privacy tagline **"Datamu aman, privasi terjamin"** must appear on: scanner page, result card, landing page footer
- Consultation CTA **"Butuh rekomendasi lebih dalam? Jadwalkan konsultasi dengan Mas Chiko"** appears on: result card (after scan), landing page
- All components must pass mobile responsive test before phase is marked done
- Pre-scan questions: user will insert Mas Chiko's questions manually into `PreScanQuestionnaire.tsx`
