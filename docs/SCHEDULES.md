Here's your full sprint plan, broken into **bite-sized tasks per day.** Each task is 1–2 hours max, binary (done or not), and ordered so you can just follow the list top to bottom without thinking.

---

## PHASE 1: Face Detection (May 26–28)

### Day 1 — Monday, May 26: Skeleton + Camera Works

**Goal: "I can see my face on screen and models are loaded"**

| #   | Task                                                                                        | Est.   | Done? |
| --- | ------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | `npm install face-api.js`                                                                   | 5 min  | ☐     |
| 2   | Run the bash script to download model files to `public/models/`                             | 10 min | ☐     |
| 3   | Create `lib/stressAnalyzer.ts` (copy the stress mapping + recommendations code)             | 15 min | ☐     |
| 4   | Create `components/FaceScanner.tsx` — just the video element + "Start Camera" button        | 30 min | ☐     |
| 5   | Wire up `navigator.mediaDevices.getUserMedia` — confirm your face shows on screen           | 30 min | ☐     |
| 6   | Add `useEffect` to load face-api models on mount + show "Models loaded ✓" in console        | 30 min | ☐     |
| 7   | Create `app/scanner/page.tsx` that renders `<FaceScanner />`                                | 10 min | ☐     |
| 8   | Test on phone browser (HTTPS required for camera) — deploy to Vercel preview or use `ngrok` | 30 min | ☐     |

**End-of-day checkpoint:** Camera shows your face. Console logs "Models loaded." Nothing else needs to work yet.

**Total: ~2.5 hours active work**

---

### Day 2 — Tuesday, May 27: Detection + Stress Logic

**Goal: "I click Analyze, it detects my face, shows my stress level + recommendation"**

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

**End-of-day checkpoint:** Click "Analyze" → see "😟 Stressed" + "Try a 5-minute meditation 🧘‍♀️". Change expression → different result.

**Total: ~3.5 hours active work**

---

### Day 3 — Wednesday, May 28: Polish + Save + Ship

**Goal: "Feature complete. User can scan face, see result, save to journal."**

| #   | Task                                                                          | Est.   | Done? |
| --- | ----------------------------------------------------------------------------- | ------ | ----- |
| 1   | Add loading state ("Analyzing...") with spinner/animation                     | 15 min | ☐     |
| 2   | Add canvas overlay showing face detection box (optional, looks cool)          | 30 min | ☐     |
| 3   | Create Supabase table `journal_entries` (run SQL migration)                   | 15 min | ☐     |
| 4   | Create `app/api/journal/route.ts` — POST endpoint saves mood + recommendation | 30 min | ☐     |
| 5   | Add "Save to Journal" button → calls API → shows success toast                | 30 min | ☐     |
| 6   | Add auth check (redirect to login if not logged in)                           | 20 min | ☐     |
| 7   | Style the whole component properly (colors, spacing, mobile-responsive)       | 45 min | ☐     |
| 8   | Test full flow: open camera → analyze → save → check Supabase table           | 20 min | ☐     |
| 9   | Deploy to Vercel, test on phone                                               | 15 min | ☐     |

**End-of-day checkpoint:** Deployed. Works on phone. Data saves to Supabase. Phase 1 DONE.

**Total: ~3.5 hours active work**

---

## PHASE 2: Journal System (Jun 2–4)

### Day 1 — Monday, Jun 2: Schema + Basic Page

**Goal: "Journal page exists, I can write text and save it"**

| #   | Task                                                                                                | Est.   | Done? |
| --- | --------------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Install Tiptap: `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder`       | 10 min | ☐     |
| 2   | Update Supabase `journal_entries` table — add `content` (text) column if not there                  | 10 min | ☐     |
| 3   | Create `app/journal/page.tsx` — basic layout with heading                                           | 15 min | ☐     |
| 4   | Create `components/JournalEditor.tsx` — mount Tiptap with basic toolbar (bold, italic, bullet list) | 45 min | ☐     |
| 5   | Add a "Save" button that POST's Tiptap HTML content to `/api/journal`                               | 30 min | ☐     |
| 6   | Update the API route to accept `content` field                                                      | 15 min | ☐     |
| 7   | Test: write something → save → check Supabase → content stored ✓                                    | 15 min | ☐     |

**End-of-day checkpoint:** Journal page renders Tiptap editor. I can type and save. Content appears in DB.

**Total: ~2.5 hours active work**

---

### Day 2 — Tuesday, Jun 3: Mood Selector + History List

**Goal: "I can pick my mood, see past entries"**

| #   | Task                                                                                                         | Est.   | Done? |
| --- | ------------------------------------------------------------------------------------------------------------ | ------ | ----- |
| 1   | Create `components/MoodSelector.tsx` — 5 emoji buttons (😌😊😐😟😰), one selected at a time                  | 30 min | ☐     |
| 2   | Wire mood selection into journal form state                                                                  | 15 min | ☐     |
| 3   | Update save API to include mood in the INSERT                                                                | 10 min | ☐     |
| 4   | Create GET `/api/journal` — fetch all entries for current user, newest first                                 | 30 min | ☐     |
| 5   | Create `components/JournalHistory.tsx` — list view of past entries (date, mood emoji, first line of content) | 45 min | ☐     |
| 6   | Add journal history below the editor (or as separate tab)                                                    | 20 min | ☐     |
| 7   | Test: save 3 entries with different moods → all show in history ✓                                            | 15 min | ☐     |

**End-of-day checkpoint:** Full journal flow works: pick mood → write → save → see it in history.

**Total: ~2.75 hours active work**

---

### Day 3 — Wednesday, Jun 4: Polish + Connect Face Scanner

**Goal: "Face scanner pre-fills mood. Everything looks good."**

| #   | Task                                                                                                       | Est.   | Done? |
| --- | ---------------------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | After face scan "Save to Journal" → redirect to `/journal` with mood pre-filled (via query param or state) | 30 min | ☐     |
| 2   | Journal page reads the pre-filled mood and selects it automatically                                        | 20 min | ☐     |
| 3   | Add "Scan Face First" optional button on journal page (links to scanner)                                   | 15 min | ☐     |
| 4   | Add entry detail view — click a history item → expand to see full content                                  | 30 min | ☐     |
| 5   | Style everything: mood selector colors, editor toolbar, history cards                                      | 45 min | ☐     |
| 6   | Mobile responsive check + fix                                                                              | 20 min | ☐     |
| 7   | Deploy + test full flow: scan → pre-fills mood → write journal → save → see history                        | 20 min | ☐     |

**End-of-day checkpoint:** Journal feature complete. Connected to face scanner. Phase 2 DONE.

**Total: ~3 hours active work**

---

## PHASE 3: Book Chapter Gating (Jun 9–11)

### Day 1 — Monday, Jun 9: Schema + Admin Upload

**Goal: "Chapters exist in DB, I can upload a PDF"**

| #   | Task                                                                                                       | Est.   | Done? |
| --- | ---------------------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Create Supabase table `book_chapters` (id, title, chapter_number, price, pdf_url, description, created_at) | 15 min | ☐     |
| 2   | Create Supabase table `chapter_purchases` (id, user_id, chapter_id, paid_at, payment_status)               | 15 min | ☐     |
| 3   | Create Supabase Storage bucket `book-pdfs` (private, no public access)                                     | 10 min | ☐     |
| 4   | Create admin page `app/admin/chapters/page.tsx` — form to add chapter (title, number, price, PDF upload)   | 60 min | ☐     |
| 5   | Upload PDF to Supabase Storage + save metadata to `book_chapters` table                                    | 30 min | ☐     |
| 6   | Test: upload a dummy PDF → appears in DB + Storage ✓                                                       | 15 min | ☐     |
| 7   | Create GET `/api/chapters` — returns chapter list (title, number, price, owned/not-owned)                  | 30 min | ☐     |

**End-of-day checkpoint:** Chapters in DB. PDF uploaded. API returns chapter list.

**Total: ~3 hours active work**

---

### Day 2 — Tuesday, Jun 10: Payment Gating + Viewer

**Goal: "Users see chapter list. Paid = read. Unpaid = locked."**

| #   | Task                                                                                                  | Est.   | Done? |
| --- | ----------------------------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Create `app/book/page.tsx` — chapter list UI (cards with lock/unlock icon)                            | 45 min | ☐     |
| 2   | Add logic: check `chapter_purchases` for current user → mark chapters as owned/locked                 | 30 min | ☐     |
| 3   | Create `app/book/[chapterId]/page.tsx` — chapter reader page                                          | 20 min | ☐     |
| 4   | Add access check: if not purchased → redirect to purchase page / show "Buy" button                    | 20 min | ☐     |
| 5   | Create mock payment flow (for MVP: manual confirmation or simple button that inserts purchase record) | 30 min | ☐     |
| 6   | After "payment" → insert into `chapter_purchases` → redirect to reader                                | 20 min | ☐     |
| 7   | Create PDF viewer: serve PDF via signed Supabase URL + render in `<iframe>` or react-pdf              | 45 min | ☐     |
| 8   | Test: locked chapter → buy → now can read ✓                                                           | 15 min | ☐     |

**End-of-day checkpoint:** Chapter list shows locked/unlocked. Purchase unlocks. PDF renders in-app.

**Total: ~3.75 hours active work**

---

### Day 3 — Wednesday, Jun 11: Security + Sequential Gating + Ship

**Goal: "Must buy chapter 1 before chapter 2. PDF can't be easily downloaded."**

| #   | Task                                                                               | Est.   | Done? |
| --- | ---------------------------------------------------------------------------------- | ------ | ----- |
| 1   | Add sequential logic: can only purchase chapter N if chapter N-1 is purchased      | 30 min | ☐     |
| 2   | Disable PDF right-click context menu + hide download button in iframe              | 20 min | ☐     |
| 3   | Generate signed URLs with short expiry (5 min) so links can't be shared            | 20 min | ☐     |
| 4   | Add RLS policy: users can only access PDFs for chapters they've purchased          | 30 min | ☐     |
| 5   | Style book page: chapter cards, progress indicator, "Next Chapter" flow            | 30 min | ☐     |
| 6   | Connect everything: navigation between scanner → journal → book                    | 20 min | ☐     |
| 7   | Full E2E test: new user → scan face → journal → browse book → buy chapter 1 → read | 20 min | ☐     |
| 8   | Deploy final build                                                                 | 15 min | ☐     |

**End-of-day checkpoint:** MVP feature-complete. Phase 3 DONE.

**Total: ~3 hours active work**

---

## The Full Calendar View

```
May 26 (Mon) ░░░░░░░░ Phase 1, Day 1 - Skeleton + Camera
May 27 (Tue) ░░░░░░░░ Phase 1, Day 2 - Detection Logic
May 28 (Wed) ░░░░░░░░ Phase 1, Day 3 - Polish + Save  ← DEADLINE ✓
May 29–Jun 1          Recovery (test, fix bugs, breathe)

Jun 2  (Mon) ░░░░░░░░ Phase 2, Day 1 - Schema + Editor
Jun 3  (Tue) ░░░░░░░░ Phase 2, Day 2 - Mood + History
Jun 4  (Wed) ░░░░░░░░ Phase 2, Day 3 - Polish + Connect ← DEADLINE ✓
Jun 5–8               Recovery (test, fix bugs, games)

Jun 9  (Mon) ░░░░░░░░ Phase 3, Day 1 - Schema + Upload
Jun 10 (Tue) ░░░░░░░░ Phase 3, Day 2 - Payment + Viewer
Jun 11 (Wed) ░░░░░░░░ Phase 3, Day 3 - Security + Ship  ← DEADLINE ✓
Jun 12–18             Polish, E2E testing, Mas Chiko review

Jun 28                GO LIVE (external deadline to Mas Chiko)
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

**Your move:** Copy this into Notion. Set calendar reminders for May 26, Jun 2, Jun 9 as "SPRINT START" alarms. Tell your wife those are work days. Then close this tab and go enjoy the weekend guilt-free—**because the deadline is set and you know exactly what to do.**
