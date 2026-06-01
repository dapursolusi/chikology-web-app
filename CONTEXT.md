# Chikology — Domain Glossary

## Auth & Users

- **Authentication**: Supabase Auth with Google OAuth + email/password. No email verification (auto-confirm for MVP).
- **Session**: Managed by Supabase via cookies. Refreshed in `proxy.ts` on every request. Server-side check in dashboard layout as defense-in-depth.
- **User identity**: Two layers — `auth.users` (Supabase-managed) and `public.users` (app-level, created via DB trigger on signup). The `public.users.id` matches `auth.users.id`.
- **Proxy**: Next.js 16 file convention (`src/proxy.ts`) that replaced `middleware.ts`. Used for session refresh + route protection.

## Products

- **Face Detection / Stress Analysis**: Groq Llama 4 Scout (server-side). 5-tier stress level with Indonesian-language messages and interventions. Face is cropped 70% center before sending. Result card shows structured fields: pesan (message), ciri (indicators), risiko (risk), intervensi (intervention).
- **Journal**: Tiptap rich-text editor. Mood selector (5 levels: very_calm → very_stressed). History list. Connects to face scanner for pre-filled mood.
- **E-Book**: Chapter-gated content. Sequential purchase (chapter N requires chapter N-1). PDF served via short-expiry signed Supabase URLs.

## Scanner Flow

- **ScannerFlow**: Wrapper component (`src/components/dashboard/scanner/ScannerFlow.tsx`) that orchestrates the scan flow: PreScanQuestionnaire → FaceScanner → result. Manages questionnaire answers state and passes them to the scanner.
- **PreScanQuestionnaire**: Optional form shown before camera activates. Multiple-choice questions with "Lainnya" (other) textarea option. Can be skipped via confirmation modal. Lives at `src/components/dashboard/scanner/PreScanQuestionnaire.tsx`.
- **StressResultCard**: Extracted result card component (`src/components/dashboard/scanner/StressResultCard.tsx`). Displays tier, emoji, label, pesan, ciri, risiko, intervensi. Includes consultation CTA (WhatsApp) and privacy tagline. Ciri + risiko in expandable section.
- **Consultation CTA**: "Butuh rekomendasi lebih dalam? Jadwalkan konsultasi dengan Mas Chiko" → WA link (`wa.me/6287853186759`). Appears on result card after scan.
- **Privacy Tagline**: "Datamu aman, privasi terjamin" — appears on: dashboard header, result card, landing page footer.

## Journaling

- **Journal History**: List of past journal entries, newest first, in `JournalHistory.tsx`.
- **Save to Journal**: Scan result can be saved to journal. Pre-fills mood tier from scan. Triggered by "Simpan ke Jurnal" button on result card.
