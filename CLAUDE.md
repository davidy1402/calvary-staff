# Calvary Staff (CCCJB Connect)

Serving roster web app (PWA-style) for Calvary Community Church Johor Bahru. Members check their next serving date, time, venue and role on a phone. Coordinators edit the roster and share WhatsApp updates. Chinese first, English supported.

## Commands

```bash
npm install
npm run dev        # Vite dev server, reachable on the LAN for real phone testing
npm run lint       # oxlint (not eslint)
npm run test       # 7 plain node test files in tests/, run with --experimental-strip-types
npm run build      # tsc -b && vite build, run this before every PR
```

Node 20 in CI. Copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Without them the app should still work from LocalStorage.

## Stack and layout

React 19, TypeScript, Vite 8, Tailwind v4, Lucide icons.

- `src/context/ChurchContext.tsx`: app state, LocalStorage persistence and cloud sync wiring
- `src/lib/supabaseSync.ts`: reads and writes roster data (`DB*` row types map to app types)
- `src/lib/adminSession.ts`: coordinator edit session, stored in LocalStorage key `calvary_admin_session`, expires after 7 days
- `src/lib/supabase.ts`: client, gated by `isSupabaseConfigured`
- `src/data`, `src/types`, `src/utils`, `src/components`: static data, shared types, helpers, UI
- `supabase/schema.sql`, `supabase/functions/verify-admin-pin`, `supabase/functions/admin-data`: database schema and Edge Functions
- `tests/`: dependency-free tests (roster sync queue and feedback, elder mode, closest assignments, senior care, app header, date utils)
- `docs/redesign-audit`, `docs/ui/bottom-sheet-motion.md`: design audit and motion notes

Deploys to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`). Treat `main` as production.

## Rules that must hold

- Cloud writes go only through the `admin-data` Edge Function, which checks the admin session on the server. Never write to Supabase tables directly from the browser.
- The coordinator PIN is never stored in the browser or the repo. `ADMIN_PIN_SALT` and `ADMIN_PIN_HASH` live in Supabase function secrets. See `supabase/README.md`.
- Anonymous reads of the volunteer roster are intentional. Do not add phone numbers or other private fields to anything readable without the admin session.
- Local editor mode only prevents accidental edits. It does not verify who the person is.
- Schedule-changing actions must preview and ask for confirmation.
- Show truthful save, failure, sync and share states. Do not claim offline cold start works: there is no service worker registration.
- Conflict detection only finds multiple assignments on the same date, not overlapping time ranges. Some service time strings hold several sessions, so do not guess a member's exact session from them.

## Product and UI standards (from PRODUCT.md)

- Phone first, 320 to 430 CSS px. Touch targets at least 44 by 44 px. Main flows must not depend on swipe or hover.
- Put the next practical serving action first, before greetings or install prompts.
- Calm, warm, direct tone. No purple gradients, neon glows, dense card grids, tiny text, or emoji as interface icons.
- Keep `public/logo.png` and `public/logo-white.png`. Do not replace the logo.
- Support light and dark mode, large text and the elder care mode. Wrap long names and Chinese lines cleanly.
- One place for each setting (Profile or Settings). Do not duplicate buttons in headers.
- Project copy avoids em dashes and middle dots.

## Known doc drift

`README.md` and `PRODUCT.md` still describe the older LocalStorage-only beta and say "no Supabase". The code now syncs through Supabase when configured. Trust the code. When you touch those docs, bring them up to date.

## Before you finish

Run `npm run lint`, `npm run test`, `npm run build`. For UI changes, check at 375 px wide in light and dark mode.
