Here's your full sprint plan, broken into **bite-sized tasks per day.** Each task is 1–2 hours max, binary (done or not), and ordered so you can just follow the list top to bottom without thinking.

---

## Tech Stack Decisions (Locked)

| Layer           | Choice                                |
| --------------- | ------------------------------------- |
| Framework       | Next.js 16 (App Router)               |
| UI              | Tailwind CSS v4 + shadcn/ui           |
| Database        | Supabase (Postgres)                   |
| ORM             | Drizzle ORM + `postgres` driver       |
| Auth            | Supabase Auth (Google OAuth only)     |
| Face Detection  | face-api.js (client-side)             |
| Storage         | Supabase Storage (book PDFs, Phase 3) |
| Deploy          | Vercel                                |
| Payment         | **Mock** (real gateway deferred)      |
| Book Pricing    | Waiting on Mas Chiko                  |
| Email Marketing | Deferred until 500+ users             |
| Package Manager | **bun** — `bunx --bun`, not `npx`     |

### File structure

```
src/
├── app/
│   ├── (main)/              ← public landing page
│   ├── api/                  ← API routes
│   ├── dashboard/
│   │   ├── layout.tsx        ← auth shell (sidebar)
│   │   ├── page.tsx          ← dashboard home
│   │   ├── scanner/          ← Phase 1
│   │   ├── journal/          ← Phase 2
│   │   └── book/             ← Phase 3
│   ├── layout.tsx            ← root layout (theme, fonts)
│   └── globals.css
├── components/
│   ├── ui/                   ← shadcn components
│   ├── FaceScanner.tsx       ← Phase 1
│   ├── JournalEditor.tsx     ← Phase 2
│   ├── MoodSelector.tsx      ← Phase 2
│   └── JournalHistory.tsx    ← Phase 2
├── lib/
│   ├── db/
│   │   ├── index.ts          ← drizzle client
│   │   └── schema.ts         ← all tables
│   ├── stressAnalyzer.ts     ← Phase 1
│   └── utils.ts
└── types/
    └── face-api.d.ts
```

---

## PHASE 0: Foundation (May 25 — done)

| #   | Task                                                                  | Done? |
| --- | --------------------------------------------------------------------- | ----- |
| 1   | Grill all tech stack decisions                                        | ✓     |
| 2   | `bun add face-api.js drizzle-orm postgres @supabase/supabase-js`      | ✓     |
| 3   | `bun add -D drizzle-kit`                                              | ✓     |
| 4   | Create `drizzle.config.ts` + `src/lib/db/index.ts`                    | ✓     |
| 5   | Create `src/lib/db/schema.ts` (users, journal_entries, mood enum)     | ✓     |
| 6   | Create `src/lib/stressAnalyzer.ts` (emotion→stress→recommendation)    | ✓     |
| 7   | Create `src/components/FaceScanner.tsx` (webcam + model load + start) | ✓     |
| 8   | Create `src/app/dashboard/scanner/page.tsx`                           | ✓     |
| 9   | Download face-api.js models to `public/models/`                       | ✓     |
| 10  | Create `src/types/face-api.d.ts`                                      | ✓     |
| 11  | Delete demo pages (face-detection, journal, e-book, api/test)         | ✓     |
| 12  | Fix dashboard links (home page quick actions)                         | ✓     |
| 13  | Build passes ✅                                                       | ✓     |

---

## PHASE 1: Face Detection (May 26–28)

### Day 1 — Tuesday, May 26: Skeleton + Camera Works

**Goal: "Camera works on phone, models load, wire up the analyze button"**

| #   | Task                                                                                | Est.   | Done? |
| --- | ----------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Add "Analyze Face" button to `FaceScanner`                                          | 10 min | ☐     |
| 2   | Implement `analyzeFace()` — call `faceapi.detectSingleFace().withFaceExpressions()` | 45 min | ☐     |
| 3   | Console.log the raw emotions object — verify it returns numbers                     | 15 min | ☐     |
| 4   | Wire `mapEmotionsToStress()` — log the stress tier (1–5)                            | 20 min | ☐     |
| 5   | Wire `getRandomRecommendation()` — log the recommendation string                    | 10 min | ☐     |
| 6   | Display results in UI: stress label + recommendation text                           | 30 min | ☐     |
| 7   | Add "No face detected" error handling (show message if detection returns null)      | 15 min | ☐     |
| 8   | Test with different expressions: smile, frown, neutral — does tier change?          | 20 min | ☐     |
| 9   | Tweak `mapEmotionsToStress()` thresholds if results feel off                        | 30 min | ☐     |
| 10  | Test on phone browser (HTTPS required) — deploy to Vercel preview                   | 30 min | ☐     |

**End-of-day checkpoint:** Click "Analyze" → see "😟 Stressed" + "Try a 5-minute meditation 🧘‍♀️". Change expression → different result.

**Total: ~3.5 hours active work**

---

### Day 2 — Wednesday, May 27: Polish + Save + Ship

**Goal: "Feature complete. User can scan face, see result, save to journal."**

| #   | Task                                                                          | Est.   | Done? |
| --- | ----------------------------------------------------------------------------- | ------ | ----- |
| 1   | Add loading state ("Analyzing...") with spinner/animation                     | 15 min | ☐     |
| 2   | Add canvas overlay showing face detection box (optional)                      | 30 min | ☐     |
| 3   | Push Drizzle schema to Supabase: `bunx --bun drizzle-kit push`                | 15 min | ☐     |
| 4   | Create `app/api/journal/route.ts` — POST endpoint saves mood + recommendation | 30 min | ☐     |
| 5   | Add "Save to Journal" button → calls API → shows success toast                | 30 min | ☐     |
| 6   | Add auth guard (redirect to login if not logged in)                           | 20 min | ☐     |
| 7   | Style the whole component (colors, spacing, mobile-responsive)                | 45 min | ☐     |
| 8   | Test full flow: open camera → analyze → save → check Supabase table           | 20 min | ☐     |
| 9   | Deploy to Vercel, test on phone                                               | 15 min | ☐     |

**End-of-day checkpoint:** Deployed. Works on phone. Data saves to Supabase. Phase 1 DONE.

**Total: ~3.5 hours active work**

---

## PHASE 2: Journal System (May 28–30)

### Day 1 — Thursday, May 28: Schema + Basic Page

**Goal: "Journal page exists, I can write text and save it"**

| #   | Task                                                                      | Est.   | Done? |
| --- | ------------------------------------------------------------------------- | ------ | ----- |
| 1   | `bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder` | 10 min | ☐     |
| 2   | Update Drizzle schema — add `content` column to `journal_entries`         | 10 min | ☐     |
| 3   | Rewrite `app/dashboard/journal/page.tsx` — basic layout with heading      | 15 min | ☐     |
| 4   | Create `components/JournalEditor.tsx` — mount Tiptap with basic toolbar   | 45 min | ☐     |
| 5   | Add "Save" button that POST's Tiptap HTML content to `/api/journal`       | 30 min | ☐     |
| 6   | Update the API route to accept `content` field                            | 15 min | ☐     |
| 7   | Test: write something → save → check Supabase → content stored ✓          | 15 min | ☐     |

**End-of-day checkpoint:** Journal page renders Tiptap editor. I can type and save. Content appears in DB.

**Total: ~2.5 hours active work**

---

### Day 2 — Friday, May 29: Mood Selector + History List

**Goal: "I can pick my mood, see past entries"**

| #   | Task                                                                                        | Est.   | Done? |
| --- | ------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Create `components/MoodSelector.tsx` — 5 emoji buttons (😌😊😐😟😰), one selected at a time | 30 min | ☐     |
| 2   | Wire mood selection into journal form state                                                 | 15 min | ☐     |
| 3   | Update save API to include mood in the INSERT                                               | 10 min | ☐     |
| 4   | Create GET `/api/journal` — fetch all entries for current user, newest first                | 30 min | ☐     |
| 5   | Create `components/JournalHistory.tsx` — list view of past entries                          | 45 min | ☐     |
| 6   | Add journal history below the editor (or as separate tab)                                   | 20 min | ☐     |
| 7   | Test: save 3 entries with different moods → all show in history ✓                           | 15 min | ☐     |

**End-of-day checkpoint:** Full journal flow works: pick mood → write → save → see it in history.

**Total: ~2.75 hours active work**

---

### Day 3 — Saturday, May 30: Polish + Connect Face Scanner

**Goal: "Face scanner pre-fills mood. Everything looks good."**

| #   | Task                                                                                      | Est.   | Done? |
| --- | ----------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | After face scan "Save to Journal" → redirect to `/dashboard/journal` with mood pre-filled | 30 min | ☐     |
| 2   | Journal page reads the pre-filled mood and selects it automatically                       | 20 min | ☐     |
| 3   | Add "Scan Face First" optional button on journal page (links to scanner)                  | 15 min | ☐     |
| 4   | Add entry detail view — click a history item → expand to see full content                 | 30 min | ☐     |
| 5   | Style everything: mood selector colors, editor toolbar, history cards                     | 45 min | ☐     |
| 6   | Mobile responsive check + fix                                                             | 20 min | ☐     |
| 7   | Deploy + test full flow: scan → pre-fills mood → write journal → save → see history       | 20 min | ☐     |

**End-of-day checkpoint:** Journal feature complete. Connected to face scanner. Phase 2 DONE.

**Total: ~3 hours active work**

---

## PHASE 3: Book Chapter Gating (Jun 2–4)

### Day 1 — Tuesday, Jun 2: Schema + Admin Upload

**Goal: "Chapters exist in DB, I can upload a PDF"**

| #   | Task                                                                                      | Est.   | Done? |
| --- | ----------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Add `book_chapters` table to Drizzle schema + `drizzle-kit push`                          | 15 min | ☐     |
| 2   | Add `chapter_purchases` table to Drizzle schema + `drizzle-kit push`                      | 15 min | ☐     |
| 3   | Create Supabase Storage bucket `book-pdfs` (private, no public access)                    | 10 min | ☐     |
| 4   | Create admin page `app/admin/chapters/page.tsx` — form to add chapter                     | 60 min | ☐     |
| 5   | Upload PDF to Supabase Storage + save metadata to `book_chapters` table                   | 30 min | ☐     |
| 6   | Test: upload a dummy PDF → appears in DB + Storage ✓                                      | 15 min | ☐     |
| 7   | Create GET `/api/chapters` — returns chapter list (title, number, price, owned/not-owned) | 30 min | ☐     |

**End-of-day checkpoint:** Chapters in DB. PDF uploaded. API returns chapter list.

**Total: ~3 hours active work**

---

### Day 2 — Wednesday, Jun 3: Payment Gating + Viewer

**Goal: "Users see chapter list. Paid = read. Unpaid = locked."**

| #   | Task                                                                                     | Est.   | Done? |
| --- | ---------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Create `app/dashboard/book/page.tsx` — chapter list UI (cards with lock/unlock icon)     | 45 min | ☐     |
| 2   | Add logic: check `chapter_purchases` for current user → mark chapters as owned/locked    | 30 min | ☐     |
| 3   | Create `app/dashboard/book/[chapterId]/page.tsx` — chapter reader page                   | 20 min | ☐     |
| 4   | Add access check: if not purchased → redirect to purchase page / show "Buy" button       | 20 min | ☐     |
| 5   | Create mock payment flow (for MVP: button that inserts purchase record)                  | 30 min | ☐     |
| 6   | After "payment" → insert into `chapter_purchases` → redirect to reader                   | 20 min | ☐     |
| 7   | Create PDF viewer: serve PDF via signed Supabase URL + render in `<iframe>` or react-pdf | 45 min | ☐     |
| 8   | Test: locked chapter → buy → now can read ✓                                              | 15 min | ☐     |

**End-of-day checkpoint:** Chapter list shows locked/unlocked. Purchase unlocks. PDF renders in-app.

**Total: ~3.75 hours active work**

---

### Day 3 — Thursday, Jun 4: Security + Sequential Gating + Ship

**Goal: "Must buy chapter 1 before chapter 2. PDF can't be easily downloaded."**

| #   | Task                                                                               | Est.   | Done? |
| --- | ---------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Add sequential logic: can only purchase chapter N if chapter N-1 is purchased      | 30 min | ☐     |
| 2   | Disable PDF right-click context menu + hide download button in iframe              | 20 min | ☐     |
| 3   | Generate signed URLs with short expiry (5 min) so links can't be shared            | 20 min | ☐     |
| 4   | Add RLS policy: users can only access PDFs for chapters they've purchased          | 30 min | ☐     |
| 5   | Style book page: chapter cards, progress indicator, "Next Chapter" flow            | 30 min | ☐     |
| 6   | Connect navigation between scanner → journal → book                                | 20 min | ☐     |
| 7   | Full E2E test: new user → scan face → journal → browse book → buy chapter 1 → read | 20 min | ☐     |
| 8   | Deploy final build                                                                 | 15 min | ☐     |

**End-of-day checkpoint:** MVP feature-complete. Phase 3 DONE.

**Total: ~3 hours active work**

---

## The Full Calendar View

```
Mon May 25 — PHASE 0 FOUNDATION ✓
Tue May 26 ░░░░░░░░ Phase 1, Day 1 - Detection + Analyze
Wed May 27 ░░░░░░░░ Phase 1, Day 2 - Polish + Save + Ship ← DEADLINE
Thu May 28 ░░░░░░░░ Phase 2, Day 1 - Schema + Editor
Fri May 29 ░░░░░░░░ Phase 2, Day 2 - Mood + History
Sat May 30 ░░░░░░░░ Phase 2, Day 3 - Polish + Connect  ← DEADLINE
May 31–Jun 1        Recovery (test, fix bugs, breathe)

Tue Jun 2  ░░░░░░░░ Phase 3, Day 1 - Schema + Upload
Wed Jun 3  ░░░░░░░░ Phase 3, Day 2 - Payment + Viewer
Thu Jun 4  ░░░░░░░░ Phase 3, Day 3 - Security + Ship  ← DEADLINE
Jun 5–11             Polish, E2E testing, Mas Chiko review

Jun 12                GO LIVE (external deadline to Mas Chiko)
```

---

### Why This Works For Your Brain

**Each day has ~3 hours of actual work.** Not 8. Not 12. Three. The rest is buffer for:

- Debugging something that doesn't work first try
- Bathroom + food + kids interrupting
- The 30 minutes of "staring at the screen before starting"

**Each task is checkable.** Your brain can't argue with "does the camera show my face? Yes or no." No ambiguity = no perfectionism loop.

**The dopamine:** Checking boxes is its own reward. By task #3 each day, you're in flow.

---

### Reminders

- Always use `bun` — `bunx --bun` for package execution, never `npx`
- Run `bunx --bun drizzle-kit push` to push schema changes to Supabase
- Route convention: everything behind `/dashboard/` (auth shell with sidebar)
- Face detection is fully client-side (face-api.js). No API endpoint needed.
- Book pricing model needs Mas Chiko's input before Phase 3 starts
