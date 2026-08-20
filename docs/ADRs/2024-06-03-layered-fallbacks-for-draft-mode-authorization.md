# Layer independent fallback mechanisms for draft-mode authorization instead of relying on a single bypass token source

## Status

Accepted

## Context

`enableDraftHandler` authorizes requests to enter Next.js Draft Mode by validating a bypass token against Vercel's `VERCEL_AUTOMATION_BYPASS_SECRET`. The handler originally read that token exclusively from the `_vercel_jwt` cookie set by Vercel's Protection Bypass for Automation feature.

Two independent gaps in that single-source design surfaced within a few months of each other:

- Vercel strips the `x-vercel-protection-bypass` and `x-vercel-set-bypass-cookie` query parameters on redirect, so any client that only had the bypass token as a query parameter (and no cookie yet) had no way to authorize the very first request. PR #8 ("feat: support x-vercel-protection-bypass in query as fallback," commit `cb3397b`, merged 2024-04-26) described the cookie-only implementation as "brittle" for this reason.
- Vercel's Protection Bypass for Automation feature is unavailable on free "Hobby" tier accounts at all, regardless of cookie or query-parameter handling. Sites on Hobby plans had no supported way to authorize the handler. PR #54 ("feat: support x-contentful-preview-secret for hobby accounts," commit `dab58a8`, merged 2024-06-03) added a Contentful-specific alternative for exactly this case.

## Decision

Authorize the request against whichever of three independent sources is present, checked in this order (`lib/app-router/handlers/enable-draft.ts`):

1. `x-vercel-protection-bypass` query parameter, checked against `VERCEL_AUTOMATION_BYPASS_SECRET` (PR #8).
2. `x-contentful-preview-secret` query parameter, checked against a `CONTENTFUL_PREVIEW_SECRET` environment variable (PR #54) — a Contentful-managed fallback for accounts where Vercel's own bypass secret isn't available.
3. The `_vercel_jwt` cookie, parsed for its embedded bypass token and audience (the original mechanism), used only when neither query parameter is present.

Each source is independent: any one succeeding authorizes the request, and the two secrets (`VERCEL_AUTOMATION_BYPASS_SECRET` and `CONTENTFUL_PREVIEW_SECRET`) are validated against their respective sources, not interchangeably.

## Consequences

### Positive

- Removes the brittleness of depending solely on the `_vercel_jwt` cookie for the first authorized request.
- Extends draft-mode support to Vercel Hobby accounts, which have no access to Vercel's own bypass mechanism.
- Each fallback was added independently and additively — neither required touching the others' code paths.

### Negative

- Three independent authorization paths must each be understood, tested, and kept secure going forward, rather than one.
- The `_vercel_jwt` cookie path and the two query-parameter paths compute `aud`/host validation differently in the handler, which is easy to lose track of when reasoning about the code as "one bypass check."

### Neutral

- `ARCHITECTURE.md`'s current description of this logic ("cookie or `CONTENTFUL_PREVIEW_SECRET`") does not mention the `x-vercel-protection-bypass` query-parameter path from PR #8 — the doc undercounts the fallback chain by one source relative to the actual code.
