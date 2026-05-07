# Architecture — @contentful/vercel-nextjs-toolkit

## Overview

A zero-dependency Next.js helper library. A single `enableDraftHandler` function (with App Router and Pages Router variants) that validates a Vercel bypass token and activates Next.js Draft Mode so content editors can preview unpublished Contentful content.

## How It Works

```
Content Editor in Contentful
  │
  │  Clicks "Open Preview" → Contentful generates preview URL:
  │  https://your-site.com/api/enable-draft?path=/blog/my-post&token=<bypass>
  ▼
Next.js route (app/api/enable-draft/route.ts or pages/api/enable-draft.ts)
  └── enableDraftHandler(request)
        │
        ├── 1. Parse request URL → extract path, bypass token, host
        ├── 2. Validate bypass token:
        │       a. Try _vercel_jwt cookie (Vercel Protection Bypass JWT)
        │       b. Fall back to CONTENTFUL_PREVIEW_SECRET env var
        │       c. In development: relaxed validation
        ├── 3. Call draftMode().enable() (Next.js Draft Mode)
        └── 4. Redirect to requested path
```

## Module Map

| File | Role |
|------|------|
| `lib/app-router/handlers/enable-draft.ts` | App Router handler — `(request: NextRequest) => Promise<Response>` |
| `lib/pages-router/handlers/enable-draft.ts` | Pages Router handler — `(req: NextApiRequest, res: NextApiResponse) => Promise<void>` |
| `lib/utils/vercelJwt.ts` | Gets + parses the `_vercel_jwt` cookie; validates bypass token |
| `lib/utils/url.ts` | Parses request URL; builds redirect URL with bypass cookie |
| `lib/types.ts` | `VercelJwt` interface — `{ bypass, aud, iat, sub }` |

## Build Pipeline

```
tsc → type checking
Vite → dual build:
  dist/app-router.js    (ESM)
  dist/app-router.cjs   (CJS)
  dist/pages-router.js  (ESM)
  dist/pages-router.cjs (CJS)
  dist/app-router/index.d.ts
  dist/pages-router/index.d.ts
```

Built via `vite build` with `vite-plugin-dts` for type generation. `prepack` runs `npm run build` automatically before any `npm publish`.

## Token Validation Logic

```
Request arrives at /api/enable-draft?path=...&token=<bypass>
  │
  ├── Check _vercel_jwt cookie:
  │     → Parse JWT (no signature verification — Vercel signs it, we just decode)
  │     → Compare jwt.bypass against VERCEL_AUTOMATION_BYPASS_SECRET
  │     → If match: valid ✓
  │
  ├── Fallback: Compare ?token query param against CONTENTFUL_PREVIEW_SECRET
  │     → If match: valid ✓
  │
  └── NODE_ENV=development: simplified bypass (supports local dev without Vercel)
```

## Release

Fully automated via semantic-release on the `main` branch. GitHub Actions workflow: lint → build → test → semantic-release → publish to GitHub Packages.

## Key Dependencies

| Package | Role |
|---------|------|
| `next` | Peer dep — App Router and Pages Router types |
| `vite` + `vite-plugin-dts` | Build tooling (dev only) |
| `vitest` | Test runner (dev only) |
| `semantic-release` | Automated versioning + publish (dev only) |
