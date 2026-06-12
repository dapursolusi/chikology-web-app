# Chikology.id — Sprint Schedule

> Last updated: 11 Juni 2026 (All MUST-DO before soft launch complete)
> Rescheduled after Mas Chiko meeting (May 31). All feedback items marked with 🆕
> Phase 2 PRD published (GitHub issue #7). Architecture decisions finalized.

---

| Milestone   | Date                                     | Scope                                                      |
| ----------- | ---------------------------------------- | ---------------------------------------------------------- |
| Soft Launch | **June 12, 2026**                        | Scanner + Journal + Landing Page. E-book = countdown only. |
| Full Launch | **June 16, 2026** (Mas Chiko's birthday) | E-book unlocks. Chapter buttons appear. Countdown removed. |

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
| 4   | Mobile responsive check on updated landing page                                                 | 15 min | ✓     |
| 5   | Deploy + verify                                                                                 | 10 min | ✓     |

**End-of-day checkpoint:** Landing page shows "Daftar", privacy banner in footer. Mobile OK.
**Total: ~1 hour**

---

### Day 2 — Monday, Jun 2: Pre-Scan Questionnaire

**Goal:** "User answers questions before camera activates. Answers sent to Groq for synthesis."

| #   | Task                                                                                                                                                  | Est.   | Done? |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | 🆕 Create `PreScanQuestionnaire.tsx` — form component, displayed before camera. Questions placeholder (user will fill in Mas Chiko's questions later) | 60 min | ✓     |
| 2   | 🆕 Update schema: add `questionnaire_responses` table (user_id, answers JSONB, created_at)                                                            | 15 min | ✓     |
| 3   | `bunx --bun drizzle-kit push`                                                                                                                         | 5 min  | ✓     |
| 4   | 🆕 Wire questionnaire into scanner flow: form → submit → show camera                                                                                  | 30 min | ✓     |
| 5   | 🆕 Pass questionnaire answers as context into Groq STRESS_PROMPT                                                                                      | 20 min | ✓     |
| 6   | 🆕 Mobile responsive check: questionnaire form on small screens                                                                                       | 15 min | ✓     |
| 7   | Deploy + test: questionnaire → scan → result                                                                                                          | 15 min | ✓     |

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
| 5   | 🆕 Add variation to stress comments: multiple message variants per tier (rotate or randomize)                                                                                                                  | 30 min | ✓     |
| 6   | 🆕 Mobile responsive check: refined result card on small screens                                                                                                                                               | 15 min | ✓     |
| 7   | Deploy + full test: questionnaire → scan → refined result → CTA visible                                                                                                                                        | 15 min | ✓     |

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
| 5   | Mobile responsive check                                     | 20 min | ✓     |

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
| 6   | Mobile responsive check                                                                       | 20 min | ✓     |

**End-of-day checkpoint:** Journal feature complete. Connected to scanner. All major bugs fixed. Phase 2 DONE.
**Total: ~3 hours**

---

## PHASE 3: E-Book System — ✅ Core Slices Shipped (Jun 4–9)

> **Soft launch (Jun 12):** Landing page e-book section = countdown to June 16. Dashboard book nav = greyed. No chapter buttons visible.
> **Full launch (Jun 16):** Countdown removed → chapter button group appears. E-book nav unlocks. Full read/buy flow.

### Phase 3 Slices — All Merged to Main

| Slice | Issue | Scope                                                                  | PR       | Status          |
| ----- | ----- | ---------------------------------------------------------------------- | -------- | --------------- |
| 1     | #14   | Soft launch: `app_settings` flag, BookCountdown, greyed nav            | #41      | ✅ Merged Jun 8 |
| 2A    | #15   | Chapter schema (`book_chapters`, `chapter_purchases`), admin role gate | #37, #38 | ✅ Merged Jun 6 |
| 2B    | #25   | Admin create chapter + PDF upload                                      | #27      | ✅ Merged Jun 5 |
| 2C    | #26   | Admin edit + hide chapter                                              | #29      | ✅ Merged Jun 5 |
| 3     | #17   | Chapter list + purchase flow + `/dashboard/book` page                  | #31      | ✅ Merged Jun 6 |
| 4     | #18   | Chapter reader + signed URL + 5-scenario next-chapter button           | #32      | ✅ Merged Jun 6 |
| 5     | #19   | Landing page full launch: embedded chapter row                         | #33      | ✅ Merged Jun 6 |
| 6     | #16   | Full launch transition: pg_cron flip, admin toggle, RLS, E2E tests     | #34–#36  | ✅ Merged Jun 6 |
| —     | #45   | BookCountdown: add seconds + center layout                             | #52      | ✅ Merged Jun 9 |
| —     | #44   | Admin nav items visibility in sidebar                                  | #51      | ✅ Merged Jun 9 |
| —     | #42   | PDF signed URL generation fix for chapter reader                       | #42      | ✅ Merged Jun 9 |
| —     | #49   | PDF Protection: PDF.js viewer + watermarking + audit logs              | #50      | ✅ Merged Jun 9 |

**All core e-book infrastructure is complete and deployed.**

---

### 🔴 MUST-DO Before Soft Launch (Jun 10–11) — Issue #64

| #   | Task                                                                     | Est.   | Done? |
| --- | ------------------------------------------------------------------------ | ------ | ----- |
| 1   | Consent checkbox: scanner flow gate before camera activates              | 15 min | ✅    |
| 2   | Privacy Policy page: `/kebijakan-privasi` static page in Indonesian      | 30 min | ✅    |
| 3   | Footer link: "Kebijakan Privasi" link next to privacy tagline            | 5 min  | ✅    |
| 4   | Supabase keep-alive pg_cron: `SELECT 1` every 6 days                     | 15 min | ✅    |
| 5   | Mobile E2E: full flow on phone — questionnaire → consent → scan → result | 15 min | ✅    |

### Soft Launch Checklist — Jun 10–11 (Nice-to-Have)

| #   | Task                                                                    | Est.   | Done? |
| --- | ----------------------------------------------------------------------- | ------ | ----- |
| 6   | Connect navigation: scanner → journal → book (greyed)                   | 20 min | ☐     |
| 7   | Privacy tagline check: visible on scanner, result card, footer          | 10 min | ☐     |
| 8   | Consultation CTA check: visible on result card + landing page           | 10 min | ☐     |
| 9   | SEO basics: title, description, og:image                                | 20 min | ☐     |
| 10  | Full E2E test: new user → daftar → questionnaire → consent → scan → etc | 30 min | ☐     |
| 11  | Bug fixes from E2E test                                                 | 60 min | ☐     |
| 12  | Mas Chiko UAT (share preview link)                                      | 30 min | ☐     |
| 13  | Final adjustments + deploy                                              | 30 min | ☐     |

---

### 🚀 Thursday, Jun 12: SOFT LAUNCH

Scanner + Journal + Landing Page live. E-book = countdown to June 16.

---

## PHASE 4: Payment System + Analytics — IN PROGRESS (Jun 9+)

> Replacing mock payment with real gateway + building analytics dashboard for Mas Chiko.

### Open Issues (Current Sprint)

| Issue | Title                                                                                     | Scope                                            | Status         |
| ----- | ----------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------- |
| #43   | Payment proof upload for chapter purchases (mock flow)                                    | Mock payment confirmation modal → pending status | ✅ DONE        |
| #53   | [AFK] Payment proof upload + pending status (Slice 1)                                     | User uploads payment proof, admin verifies       | ✅ DONE        |
| #54   | [AFK] Admin proof verification (Slice 2)                                                  | Admin dashboard: approve/reject payment proofs   | ✅ DONE        |
| #55   | [AFK] Re-upload flow + two-step wizard + integration (Slice 3)                            | User re-uploads rejected proof, wizard UX        | 🔄 IN PROGRESS |
| #46   | [PRD] Core SaaS: user profile, purchase history, email notifications, analytics dashboard | Post-purchase analytics for author               | 🔄 IN PROGRESS |

### Phase 4 Tasks

#### Payment System (Issues #43, #53–#55)

| #   | Task                                                                                                    | Est.   | Done?       |
| --- | ------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| 1   | Mock payment modal → server action inserts `chapter_purchases` with `status: 'pending'`                 | 30 min | ✓           |
| 2   | Payment proof upload: file input (image/PDF → JPEG/PNG/WebP) → Supabase Storage `payment-proofs` bucket | 45 min | ✓           |
| 3   | `payment_proofs` table: id, user_id, chapter_id, file_path, status (pending/approved/rejected)          | 20 min | ✓           |
| 4   | Admin page: list pending proofs, view image, approve/reject → updates `chapter_purchases` status        | 60 min | ✓           |
| 5   | Re-upload flow: rejected → user sees wizard → re-upload → back to pending                               | 45 min | ☐           |
| 6   | Real payment gateway integration (Midtrans/Xendit) — replace mock when ready                            | —      | ⏳ DEFERRED |

#### Analytics Dashboard (Issue #46)

| #   | Task                                                                                 | Est.   | Done?       |
| --- | ------------------------------------------------------------------------------------ | ------ | ----------- |
| 1   | `/dashboard/admin/analytics` page (role: admin)                                      | 30 min | ☐           |
| 2   | KPI cards: total users, scans completed, journal entries, chapter purchases, revenue | 30 min | ☐           |
| 3   | Chart: daily/weekly signups (Recharts or Tremor)                                     | 45 min | ☐           |
| 4   | Chart: scanner completion funnel (started → questionnaire → scan → result)           | 45 min | ☐           |
| 5   | Chart: chapter purchase funnel (view → buy → pending → approved)                     | 45 min | ☐           |
| 6   | Table: recent purchases with user, chapter, amount, status, payment proof link       | 30 min | ☐           |
| 7   | Export CSV button for purchases                                                      | 15 min | ☐           |
| 8   | Email notifications (Resend/SendGrid) — new user, purchase confirmed, proof rejected | —      | ⏳ DEFERRED |

---

### 🚀 Monday, Jun 16: FULL LAUNCH

E-book unlocks. Chapter buttons live. Countdown removed. `EBOOK_LIVE=true` (auto-flip via pg_cron).
Payment system + analytics dashboard in parallel.

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

Jun  9 (Mon)  ████ PDF Protection — viewer migration, watermarking & audit logs (issue #49) ← DONE
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
