# Chikology — Domain Glossary

## Auth & Users

- **Authentication**: Supabase Auth with Google OAuth + email/password. No email verification (auto-confirm for MVP).
- **Session**: Managed by Supabase via cookies. Refreshed in `proxy.ts` on every request. Server-side check in dashboard layout as defense-in-depth.
- **User identity**: Two layers — `auth.users` (Supabase-managed) and `public.users` (app-level, created via DB trigger on signup). The `public.users.id` matches `auth.users.id`.
- **Proxy**: Next.js 16 file convention (`src/proxy.ts`) that replaced `middleware.ts`. Used for session refresh + route protection.

## Products

- **Face Detection / Stress Analysis**: Groq Llama 4 Scout (server-side). 5-tier stress level with Indonesian-language messages and interventions. Face is cropped 70% center before sending.
- **Journal**: Tiptap rich-text editor. Mood selector (5 levels: very_calm → very_stressed). History list. Connects to face scanner for pre-filled mood.
- **E-Book**: Chapter-gated content. Sequential purchase (chapter N requires chapter N-1). PDF served via short-expiry signed Supabase URLs.
