# Chikology — Architecture Map

> Mental health stress tracker + e-book SaaS (Indonesia). Users scan face → get stress tier (1–5) → journal with mood → purchase sequentially-gated e-book chapters. Manual payment verification.

---

## Auth Module

```
Google OAuth → Supabase Auth → /auth/callback → ensureUserRecord() → /dashboard
```

**Auth guard** (`src/lib/supabase/server.ts`): `getAuthUser()` — wraps `createClient()` + `getUser()` into a single async call returning `User | null`. Used by all server actions and API routes.

**Middleware** (`src/proxy.ts` → `src/lib/supabase/middleware.ts`):

- `/dashboard/*` without session → redirect to `/?auth=login`
- `/` with session + ebook not live → redirect to `/dashboard`
- Bypass via `?bypass-redirect=true` query param or cookie

**OAuth callback** (`src/app/auth/callback/route.ts`):

- Exchanges code for session → upserts `users` row via `ensureUserRecord()` → syncs role to metadata → redirects to `/dashboard`

**Clients:**

- Server: `src/lib/supabase/server.ts` (createServerClient with cookie store)
- Browser: `src/lib/supabase/client.ts` (createBrowserClient, `'use client'`)
- Service role: `createServiceClient()` in server.ts (no cookies, admin bypass)

**Role:** `users.role` — `'user'` (default) or `'admin'`.

---

## Module Map

## 1. Landing Page (`/`)

`src/app/(main)/`

| File                        | Role                                                                        |
| --------------------------- | --------------------------------------------------------------------------- |
| `page.tsx`                  | Fetches auth user + ebookLive + chapters. Composes Hero → E-Book → Features |
| `hero.tsx`                  | Hero banner                                                                 |
| `e-book.tsx`                | Chapter grid — authenticated=`EmbeddedChapterRow`, else=`VisitorChapterRow` |
| `features.tsx`              | Features section                                                            |
| `BookCountdown.tsx`         | Pre-launch countdown                                                        |
| `header.tsx` / `footer.tsx` | Shell                                                                       |

---

### 2. Dashboard (`/dashboard`)

**Layout** (`src/app/dashboard/layout.tsx`): Auth gate → fetch role + ebookLive → SidebarProvider + AppSidebar + DashboardHeader.

| Sub-route                     | Page                                     | Components                                                                              |
| ----------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `/dashboard`                  | Stats + quick actions + mood week        | `actions/dashboard.ts`                                                                  |
| `/dashboard/scanner`          | Face scanner                             | ScannerFlow → PreScanQuestionnaire → FaceScanner → StressResultCard                     |
| `/dashboard/journal`          | Journal                                  | JournalPageClient → JournalEditor + MoodSelector + JournalHistory + ScanResultAccordion |
| `/dashboard/book`             | E-book chapter list                      | BookPageClient → ChapterList + PurchaseModal                                            |
| `/dashboard/book/[chapterId]` | PDF reader                               | ReaderClient (PDF.js)                                                                   |
| `/dashboard/admin/book`       | Admin: manage chapters + verify payments | ChapterForm + ChapterTable + AdminVerificationPanel + EbookLiveToggle                   |
| `/dashboard/admin/settings`   | Settings                                 | Settings UI                                                                             |

---

### 3. Scanner — Core Feature #1

```
ScannerFlow (multi-step)
  → PreScanQuestionnaire → saveQuestionnaireResponse()
  → FaceScanner (camera → base64 → POST /api/analyze-face)
  → POST /api/analyze-face:
      Rate limit (DB: 5/day via scan_usage, in-memory burst via rate-limiter.ts)
      AI: OpenRouter (MiniMax-M3), fallback SumoPod (MiniMax-M3)
      Returns { tier: 1-5 } → logs scan_usage
  → StressResultCard (tier + interventions from data/stressLevels.ts)
```

**Shared lib modules:**

| Module                     | Exports                                                                     |
| -------------------------- | --------------------------------------------------------------------------- |
| `src/data/stressLevels.ts` | `Mood`, `MOOD_NUMERIC`, `MOOD_EMOJI`, tier messages/interventions           |
| `src/lib/currency.ts`      | `idrFormatter` singleton (`Intl.NumberFormat` for IDR)                      |
| `src/lib/validators.ts`    | `ALLOWED_IMAGE_TYPES`, `MAX_IMAGE_SIZE_BYTES`                               |
| `src/lib/rate-limiter.ts`  | `getBurstState`, `checkBurst`, `recordBurst` — in-memory burst rate limiter |
| `src/actions/auth.ts`      | `ensureUserRecord()`, `getUserRole()`                                       |

---

### 4. Journal — Core Feature #2

`actions/journal.ts`: `saveJournalEntry()`, `getJournalEntries()`, `deleteJournalEntry()`

Entry: mood (enum) + content (Tiptap) + stressTier (1-5) + recommendation.

---

### 5. E-Book — Monetization

**Sequential gating:** Must own chapter N-1 to purchase chapter N.

**Payment flow:**

```
PurchaseModal → upload proof → submitPaymentProof()
  → payment-proofs bucket (Supabase Storage) + payment_proofs (pending)
  → AdminVerificationPanel → verifyPaymentProof() (approve/reject)
  → chapter_purchases row inserted → chapter unlocked
```

**Reading flow:**

```
/dashboard/book/[chapterId]
  → page.tsx: ownership check via getChapterSignedUrl()
  → ReaderClient: PDF.js via /api/chapters/[id]/view (range support)
  → Download: /api/chapters/[id]/download (pdf-lib watermark)
```

**Admin:**

- `ChapterForm` — create/update chapter metadata + PDF upload
- `EbookLiveToggle` — flip `app_settings.ebook_live`

---

### 6. API Routes (proxy-only, no data mutations)

| Route                             | Purpose                           |
| --------------------------------- | --------------------------------- |
| `POST /api/analyze-face`          | AI stress analysis (rate-limited) |
| `GET /api/chapters/[id]/view`     | PDF proxy with range requests     |
| `GET /api/chapters/[id]/download` | PDF proxy with watermarking       |
| `GET /api/health`                 | DB health check                   |

---

## Data Model (9 tables)

```
users (id, role, email, name, avatarUrl)
  ├── journal_entries (userId, mood, stressTier, content, recommendation)
  ├── scan_usage (userId, scanDate, count) — UNIQUE(userId, scanDate)
  ├── questionnaire_responses (userId, answers)
  ├── chapter_purchases (userId, chapterId) — UNIQUE(userId, chapterId)
  ├── payment_proofs (userId, chapterId, status, proofPath, rejectionReason)
  └── chapter_access_logs (userId, chapterId, eventType, metadata)

book_chapters (id, chapterNumber, priceIdr, isFree, pdfPath, releaseDate)
  └── chapter_purchases, payment_proofs, chapter_access_logs

app_settings (key, value) — singleton: 'ebook_live'
```

---

## Critical Path (money flow)

```
Landing → Login → Scanner (stress tier) → Journal (mood + entry) → Book chapter list → PurchaseModal → admin approves → chapter unlocked → PDF reader
```

---

## Feature Flag

`app_settings` key `ebook_live` — when `false`: landing shows countdown, dashboard redirect. When `true`: full marketing surface + purchases active.
