# LIVE SOFTWARE — Web milestone 2

A production-shaped live-video web application with a responsive viewer/creator experience and a secure, provider-neutral backend foundation.

## What works now

- Responsive live discovery, explore, inbox, profile, and creator-studio experiences
- Addressable live rooms with likes, captions, following, chat, and clean-view controls
- Real browser camera/microphone preflight with a safe practice mode
- Passwordless Supabase authentication using current publishable-key and SSR cookie patterns
- Persistent profiles, follows, streams, chat messages, and safety reports
- Database-enforced stream lifecycle transitions and automatic lifecycle timestamps
- Realtime chat inserts and room presence when Supabase is configured
- Demo fallback when backend settings are absent, so the interface remains fully testable
- Provider-neutral video transport boundary; milestone 2 intentionally keeps delivery in preview mode

## Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Supabase Auth, Postgres, and Realtime
- Playwright Core for end-to-end browser verification
- PGlite for isolated migration execution tests
- GitHub Actions quality gates for every push and pull request

## Run locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs at `http://localhost:3000`. It automatically uses demo mode until valid Supabase settings are added.

## Connect a dedicated Supabase project

Create or select a project dedicated to LIVEAPP. Do not point this migration at an unrelated production database.

1. Copy the Project URL and publishable key from the Supabase **Connect** dialog into `.env.local`.
2. Link the CLI to the dedicated project.
3. Inspect the pending migration with a dry run.
4. Apply it when the target is confirmed.

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --linked --dry-run
npx supabase db push --linked
```

The foundation migration is in `supabase/migrations/20260720203642_live_platform_foundation.sql`.

## Security model

- Every exposed table has Row Level Security enabled.
- Ownership checks use validated `auth.uid()` identity, never user-editable metadata.
- Creator updates are restricted to creator-owned streams.
- Chat writes require an authenticated author and a live stream.
- Invalid stream status transitions are rejected in Postgres.
- Secret/service-role keys are never required by the browser or application routes.
- The new-user trigger is isolated in a non-exposed schema with direct execution revoked.
- Foreign-key and partial indexes cover ownership, discovery, realtime chat, and moderation access paths.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:db
```

`verify:db` executes the full migration in an isolated Postgres-compatible engine and tests profile creation, valid and invalid stream transitions, RLS coverage, and realtime publication.

The browser suite verifies desktop/mobile rendering, navigation, likes, chat, auth setup, creator studio, and the stream-preflight API:

```bash
npm run build
CHROMIUM_PATH=/absolute/path/to/chromium npm run verify:browser
```

If `CHROMIUM_PATH` is omitted, the script asks `@sparticuz/chromium` for a compatible executable.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Live discovery home |
| `/explore` | Browse topics, languages, and regions |
| `/auth` | Passwordless account access |
| `/auth/callback` | Secure auth-code exchange |
| `/studio` | Camera preflight and stream creation |
| `/live/[id]` | Demo or database-backed live viewer room |
| `/api/streams` | Discovery and authenticated stream creation |
| `/api/streams/[id]/transition` | RLS-protected lifecycle transition |
| `/api/health` | Deployment-safe application and database readiness |
| `/inbox` | Notification and activity shell |
| `/profile` | Creator profile and account state |

## Current boundary

Milestone 2 provides the application backend, realtime collaboration, and a clean video-provider interface. Actual multi-viewer video delivery still needs a dedicated WebRTC/live-video provider and credentials. That integration should be milestone 3, followed by moderation automation, notifications, payments, and production observability.

Every push to `main` and every pull request runs the quality workflow in `.github/workflows/quality.yml`.
