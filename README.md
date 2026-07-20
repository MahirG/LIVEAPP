# LIVE SOFTWARE — Web milestone 1

A production-shaped web prototype for discovering live broadcasts, entering an immersive live room, and preparing a creator broadcast. The visual system is deliberately original while applying patterns learned from the strongest live, video, social, and creator products.

## What is included

- Responsive discovery home with featured, upcoming, recommended, and category content
- Explore, inbox, and profile destinations with consistent desktop/mobile navigation
- Six addressable live-room routes with captions, likes, follow state, clean view, chat, and support controls
- Creator studio with real browser camera/microphone permission handling, device preflight, settings, and a simulated countdown
- Accessible keyboard focus, semantic labels, reduced-motion behavior, loading/empty/error-friendly UI patterns
- Reusable TypeScript components and structured sample stream data

## Run locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

The browser verification script uses headless Chromium and Playwright Core. It checks desktop/mobile rendering, navigation, likes, chat, and creator studio screens.

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
| `/studio` | Creator camera and broadcast preflight |
| `/live/[id]` | Immersive viewer room |
| `/inbox` | Notification and activity shell |
| `/profile` | Creator/viewer profile shell |

## Current milestone boundary

This release proves the product direction and interaction architecture. The camera preview uses the real browser media API. Broadcast transport, authentication, durable profiles, storage, realtime chat, moderation services, payments, analytics, and notification delivery are intentionally not connected yet.

The next milestone should add the backend foundation first: identity and permissions, stream lifecycle records, realtime chat/presence, media-provider integration, and observability.
