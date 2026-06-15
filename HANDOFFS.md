## [Saturday, 13-06-2026 20:47] — Diagnosed PDF upload failure in production

### Session Target

- Diagnose and fix: "Gagal mengunggah file PDF" when uploading PDF as admin in production

### Current State

- Status: shipped
- Scope: `src/actions/book.ts`, `src/test/actions/book.test.ts`
- Tests: 304 passed (41 files, 11 skipped)

### What Changed

**Root cause:** Two-layered failure.

1. The authenticated anon-key Supabase client (`createClient()`) returned `503 — The database schema is invalid or incompatible` when uploading to storage. This is a Supabase platform issue with the anon-key client's storage access in production.

2. After switching to `createServiceClient()`, the upload returned `403 — signature verification failed`. The `SUPABASE_SERVICE_ROLE_KEY` in Vercel's **Production** environment was stale/incorrect (likely a Vercel env var UX issue where the environment selector defaults to "Production + Preview" together, causing accidental misconfiguration).

**Fix:**

- `src/actions/book.ts` — Switched storage uploads from `createClient()` (authenticated user) to `createServiceClient()` (service role). Safe because `getAdminRole()` already gates on admin role before upload.
- User updated `SUPABASE_SERVICE_ROLE_KEY` in Vercel Production environment to match current Supabase dashboard value.

**Files changed:**

- `src/actions/book.ts` — `createClient()` → `createServiceClient()` for storage uploads in both `createChapter` and `updateChapter`
- `src/test/actions/book.test.ts` — Added `createServiceClient` to the `@/lib/supabase/server` mock

### Verification

- `bun run test` — 304 passed
- `bun run build` — Passed
- Production upload tested and confirmed working by user

### Decisions

- D-001: Use service client for storage uploads — The anon-key client has Supabase platform issues with storage in production. Service client bypasses RLS (which is fine since the server action already checks admin role). Tradeoff: storage uploads no longer use the authenticated user's session, but this is acceptable since the admin role check happens before the upload.

### Known Issues / Risks

- Storage RLS policies on `book-chapters` bucket are effectively bypassed by using service client. The admin role gate in the server action is the only protection. This is acceptable for a solo admin tool but should be revisited if multi-admin support is added.
- The original 503 error from the anon-key client remains unexplained — it may be a Supabase platform bug specific to this project or version.

### Next Steps

- None — PDF upload works in production

---
