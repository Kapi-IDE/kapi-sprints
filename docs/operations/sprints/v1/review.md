# Sprint v1 Review — Foundation

*Generated: jan 16 7pm · Duration: 2h 45min · Tasks: 9/9*

## What We Built

Sprint v1 shipped the complete foundation for the project. Starting from zero, we now have:

- A deployable Next.js 15 app with TypeScript and Tailwind CSS
- A CI/CD pipeline that auto-deploys to staging on every `dev` push
- Full user authentication (signup, login, logout) with httpOnly session cookies
- Protected routes via Next.js middleware
- Integration tests for all auth flows
- A live staging environment

## Task-by-Task Narrative

### T01 — Repository initialization (15 min)

`npx create-next-app@latest` gave us the scaffold. Stripped the default page content, configured Tailwind v4, and added `eslint-config-next`. First commit: `feat: initialize project`.

### T02 — CI/CD pipeline (25 min)

Two GitHub Actions workflows. `deploy-staging.yml` triggers on push to `dev`, SSHes into the staging server, pulls, runs `npm ci && npm run build`, and restarts PM2. `deploy-prod.yml` is manual-only and requires typing "production" in the confirmation field to prevent accidents.

### T03 — Pre-commit hooks (10 min)

Husky `pre-commit` runs `lint-staged` over `.ts` and `.tsx` files. Any ESLint error or TypeScript error blocks the commit. Takes ~3 seconds. Worth it to keep the main branch clean.

### T04 — Database + Prisma schema (20 min)

Prisma schema with a `User` model: `id` (cuid), `email` (unique), `passwordHash`, `createdAt`. Migration ran cleanly. Seeded one test user for local dev.

### T05 — Auth API routes (45 min)

The most time-intensive task. Signup validates email format, checks for duplicates, hashes with `bcrypt(12)`, inserts, and sets a signed session cookie. Login verifies the hash, reuses the same cookie-setting logic. The session value is a signed JWT (7-day expiry) — the signing key is in `SESSION_SECRET` env var. One finding noted in code review: error messages should be normalized to prevent user enumeration.

### T06 — Middleware (15 min)

`middleware.ts` reads the session cookie on every request to `/dashboard/*`. If missing or invalid, redirects to `/login?next=<original-url>` so the user lands back after login. The matcher config was the tricky part — had to explicitly exclude `/api/auth/*` from protection.

### T07 — Logout (10 min)

One API route: POST clears the cookie by setting `maxAge: 0`. The logout button in the nav calls this then redirects client-side to `/login`.

### T08 — Integration tests (30 min)

Three Playwright scenarios: (1) sign up → land on dashboard, (2) login with wrong password → error message, (3) login → logout → try to access dashboard → redirect to login. All pass.

### T09 — Staging deploy (15 min)

Pushed to `dev`, watched the Actions workflow, confirmed green. Smoke-tested the staging URL manually. Auth flow works end-to-end in the browser.

## What's Next (v2)

The code review surfaced two security items to fix before production:
1. Rate limiting on `/api/auth/login`
2. Normalized error messages (no user enumeration)

Beyond security, v2 will add the core product features: main dashboard UI, settings page, and the first user-facing feature.
