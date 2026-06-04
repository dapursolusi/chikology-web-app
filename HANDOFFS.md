# HANDOFFS

## [Thursday, 04-06-2026 17:43] — Phase 3 Slice 2B — Admin Create Chapter + PDF Upload (SHIPPED)

### Session Target

Ship sub-slice 2B of issue #25 (Phase 3 E-Book system): client-side `ChapterForm` (RHF + zod), `createChapter` server action (admin-gate + PDF upload to `book-chapters` bucket + DB insert + `revalidatePath`), wire into `/dashboard/admin/book` page, raise Next.js server-actions body size limit to 50MB. Edit/delete + payment flow remain in 2C. Lens: full-stack (schema → action → form → page → config).

### Current State

- Status: **shipped** — branch `feat/admin/create-chapter` pushed, PR #27 opened, commit `3d96fa4`.
- Scope: 1 atomic commit, 10 files (4 modified, 6 new)
- Tests: **91/91 pass** across 20 files (+22 new: 5 schema, 8 action, 5 form; +4 pre-existing form list tests still passing)
- Lint: 0 errors, 6 warnings (1 new from `ChapterForm.tsx` RHF `watch()` + 5 pre-existing)
- Build: clean compile, no TypeScript errors, `/dashboard/admin/book` still dynamic
- CI: awaiting preview + quality-gate

### What Changed

- `src/schemas/chapter.ts` (new) — zod schema with cross-field refinement: `is_free === true` forces `price_idr === 0` (with `path: ['price_idr']`). `pdf` accepts `File | FileList | null | undefined` (FormData yields `File`; RHF uncontrolled file input yields `FileList`; schema's `readFile` transform handles both). Refinements: PDF must be `application/pdf`, size ≤ 50MB.
- `src/schemas/chapter.test.ts` (new) — 11 tests: happy path, missing title, missing chapter_number, negative price, is_free+price>0 rejected, is_free+price=0 accepted, non-PDF rejected, >50MB rejected, undefined pdf accepted, blank release_date accepted, custom path.
- `src/actions/book.ts` (modified) — added `BOOK_BUCKET = 'book-chapters'`, `formDataToRaw(fd)` helper, `createChapter(formData)` server action: `requireAdmin()` → zod parse → storage upload `<chapter_number>-<Date.now()>.pdf` → `db.insert(bookChapters)` with `priceIdr: is_free ? 0 : price_idr` and `releaseDate` normalized (blank string → null) → `revalidatePath('/dashboard/admin/book')`. Catches PG error `code === '23505'` → friendly `'Nomor bab sudah digunakan'`. Storage error → `'Gagal mengunggah file PDF'`.
- `src/test/actions/book.test.ts` (modified) — extended `vi.hoisted` with `insert`/`values`/`returning` chain + `mockUpload`/`mockStorageFrom`; extended supabase server mock with `storage.from(...).upload()`. Added 8 `createChapter` tests: 401 unauth, 403 not-admin, validation error empty title, validation error is_free+price>0, insert+skip-PDF when `is_free`, upload path includes chapter_number+timestamp, friendly error on 23505, storage error surfaces.
- `src/components/dashboard/admin/ChapterForm.tsx` (new) — client component, `useForm<ChapterFormValues>` with `zodResolver(chapterSchema)`, `useEffect` watches `is_free` and auto-zeros + disables `price_idr`. Submits FormData; on success resets form + `toast.success`; server error rendered in `role="alert"`. Renders Card with form + `<ChapterTable chapters={chapters} />` below.
- `src/components/dashboard/admin/ChapterForm.test.tsx` (new) — 9 tests: 4 list-view (kept from pre-existing scaffolding) + 5 new (renders all fields, shows validation errors, disables+zeroes price on is_free, submits FormData, surfaces server error). Uses `fireEvent.change` for inputs, `fireEvent.click` for checkbox (more reliable in jsdom than `userEvent` for RHF uncontrolled file inputs).
- `src/app/dashboard/admin/book/page.tsx` (modified) — replaced bare `<ChapterTable>` with `<ChapterForm chapters={chapters} />`. Role gate + `notFound()` for non-admin unchanged.
- `next.config.ts` (modified) — added `experimental: { serverActions: { bodySizeLimit: '50mb' } }` to support 50MB PDF uploads.
- `package.json` + `bun.lock` (modified) — pre-existing uncommitted deps (`react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, `lucide-react`); no new installs in this session.

### Verification

- `bun run test` → **91/91 pass** across 20 files (was 69 before; +22 new).
- `bun run lint` → 0 errors, 6 warnings. New warning: `react-hooks/incompatible-library` on `ChapterForm.tsx:50` for `watch('is_free')` — RHF's `watch` is incompatible with React Compiler, so the compiler skips memoizing the component. Documented in the warning text as expected behavior, not a fix-required item.
- `bun run build` → clean compile, no TS errors. New dynamic route `/dashboard/admin/book` still registered.
- `rtk git push -u origin feat/admin/create-chapter` → pushed.
- `rtk gh pr create --base main` → PR #27 created with body summarizing scope + verification + Closes #25.

### Decisions

- **D-034** — `ChapterForm` is a "section" component: receives `chapters: ChapterRow[]` and renders Card with form (top) + `<ChapterTable>` (bottom). Lets the page stay simple (one import) and the 4 pre-existing list-view tests pass unchanged.
- **D-035** — Schema's `pdf` field uses `.transform(readFile)` (where `readFile` converts FileList → File) instead of RHF's `setValueAs`. Reason: `setValueAs` runs on registration, but `zodResolver` validates the input shape before applying transforms at the top level; using schema-level transform keeps validation, transforms, and output shape consistent. `File` calls also still work (action passes `pdfEntry instanceof File ? pdfEntry : null`).
- **D-036** — Form's onSubmit extracts `File` from `FileList` explicitly (`values.pdf instanceof File ? values.pdf : values.pdf[0]`) so the type system is happy with `fd.append('pdf', file)`. Avoids any in-test type assertions.
- **D-037** — Server error uses `'error' in result` discriminator (matches existing journal.ts ad-hoc shape). The documented `Result<T>` discriminated union migration remains a separate refactor issue.
- **D-038** — Used `fireEvent.change` / `fireEvent.click` instead of `userEvent.type` / `userEvent.click` for RHF controlled inputs. `user.type` on `<input type="number">` in jsdom + RHF uncontrolled input was unreliable for triggering form submission with valid numeric values.
- **D-039** — Schema's `release_date` is plain `z.string().optional()` (no transform). The action normalizes blank string to `null` before insert. Reason: the transform caused a zod input/output type mismatch with `useForm<z.input<...>>` (output was `string | null` but form expected `string | undefined`). Pushing normalization to the action side is simpler and the schema test still asserts the empty-string pass-through.
- **D-040** — `next.config.ts` uses `experimental.serverActions.bodySizeLimit: '50mb'` (string). Next.js 16 expects this as a string in KB/MB/GB. Matches the schema's 50MB cap.

### Known Issues / Risks

- New lint warning on `ChapterForm.tsx:50` (RHF `watch` incompatible with React Compiler) — cosmetic, compiler skips memoization of the component, doesn't affect runtime. Documented in the warning text.
- No e2e browser test that the full upload flow actually persists the PDF in Supabase Storage and the row in `book_chapters`. Unit tests cover the behavior (mocked storage + DB) but a real upload requires a logged-in admin session. Same risk as 2A: manual browser smoke test pending.
- The storage upload happens before the DB insert. If the DB insert fails after a successful upload, the orphan PDF file remains in the bucket. Acceptable for v1 (admin can manually clean up); a future improvement would be a try/catch that deletes the uploaded file on DB failure.
- `revalidatePath('/dashboard/admin/book')` only refreshes that route. If the chapter list is consumed elsewhere (e.g., `/dashboard/library`), it won't auto-refresh there. Deferred — library page is post-MVP.
- `drizzle-kit push` is still the migration strategy (per HANDOFFS D-023). No schema changes in 2B that need a migration.

### Next Steps (ordered)

1. ~~Create atomic commit on `feat/admin/create-chapter`~~ ✓ done (commit `3d96fa4`)
2. ~~Push branch, `gh pr create`~~ ✓ done (PR #27)
3. **Wait for CI quality-gate** (Vercel preview + prettier + lint + test)
4. **Self-review the diff in the GitHub UI** before merge (no debug, no leaks, no env values)
5. **Wait for green, then `gh pr merge --squash --delete-branch`** → branch will be deleted
6. **Manual browser smoke test** (post-merge, before declaring 2B complete in production):
   - Set one user's role to 'admin' in dev Supabase SQL
   - Log in as that user, visit `/dashboard/admin/book`
   - Submit the form with: title="Bab Test", chapter_number=1, price_idr=0, is_free=on
   - Verify chapter appears in the list below the form (table refreshes from `revalidatePath`)
   - Submit again with chapter_number=1 → expect "Nomor bab sudah digunakan" error
   - Submit a 60MB PDF → expect schema rejection error
   - Submit a `.txt` file → expect schema rejection error
7. **Open follow-up issue for sub-slice 2C** (edit + hide + payment flow). Body should reference #15 and inherit `ready-for-agent`.
8. **Update `docs/SCHEDULES.md`** in the next session to reflect 2B shipped (ahead of June 10–12 estimate) and re-plan 2C dates.

### Blockers

- None. Manual smoke test (step 6) requires a logged-in browser session; follow-up issue (step 7) is housekeeping.
