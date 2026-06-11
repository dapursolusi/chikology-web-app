## [Wednesday, 11-06-2026 13:26] — Pre-launch landing page polish

### Session Target

- Polish landing page before soft launch: remove counseling references, simplify nav/footer, add Google icon to auth buttons, clean up hero copy, remove logo image.

### Current State

- Status: shipped
- Scope: `src/components/navbar1.tsx`, `src/components/login-form.tsx`, `src/components/signup-form.tsx`, `src/components/layout/footer.tsx`, `src/components/sections/home/hero.tsx`, `src/components/sections/home/features.tsx`, `src/components/logo.tsx`

### What Changed

- `src/components/navbar1.tsx` — Removed "Konseling" from Layanan dropdown, removed "Harga" and "Blog" top-level nav items
- `src/components/login-form.tsx` — Added Google "G" SVG icon to "Masuk dengan Google" button
- `src/components/signup-form.tsx` — Added Google "G" SVG icon to "Daftar dengan Google" button
- `src/components/layout/footer.tsx` — Simplified to 2 columns: brand + Layanan (Jurnal Harian, Deteksi Mood); removed Produk/Perusahaan/Dukungan columns; removed "konseling profesional" from description
- `src/components/sections/home/hero.tsx` — Removed "What's new | Read more" badge; changed subheadline to "Jurnal harian, deteksi mood dengan AI, dan panduan kesehatan mental dalam satu tempat."; removed unused `next/link` import
- `src/components/sections/home/features.tsx` — Replaced "Konseling" feature card with "Jurnal Harian"; removed "dukungan konseling profesional" from section description; removed "Jadwalkan konsultasi dengan Mas Chiko" CTA
- `src/components/logo.tsx` — Removed CDN SVG image, simplified to text-only "Chikology" link

### Verification

- Commands run: `bun run lint`, `bun run build`
- Results: Lint 0 errors (8 pre-existing warnings), build successful (all routes compiled)

### Decisions

- D-001: Replaced Konseling feature card with Jurnal Harian instead of removing the column — keeps 3-column grid and highlights an actual service
- D-002: Used inline Google SVG icon instead of a package — avoids adding a dependency for one icon

### Known Issues / Risks

- "Jadwalkan konsultasi dengan Mas Chiko" CTA still exists in dashboard StressResultCard.tsx and ReaderClient.tsx (out of scope for this landing page polish)

### Next Steps (ordered)

1. Merge PR #67
2. Consider whether to remove "konsultasi" CTA from StressResultCard as well
3. Soft launch

### Blockers (if any)

- none
