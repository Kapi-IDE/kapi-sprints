# Code Review: Sprint v1

*Reviewer: AI · Date: jan 16 6pm*

## Summary

Sprint v1 ships a solid foundation. The auth implementation follows best practices with httpOnly cookies and bcrypt. CI/CD is correctly configured. Two findings that should be addressed in v2.

## Per-Task Review

### T01 — Initialize repository ✅

Correct stack choice. Tailwind v4 configured properly. One note: `geist` font imported from Google Fonts — consider self-hosting for privacy/performance in v2.

### T02 — CI/CD pipeline ✅

Staging auto-deploy on `dev` push works correctly. Production workflow correctly requires manual confirmation. Branch protection rules on `main` are configured. Good.

### T03 — Pre-commit hooks ✅

Husky + lint-staged catches type errors before commit. No bypass flags allowed. Good practice.

### T04 — Users table ✅

Prisma schema is clean. `passwordHash` naming is correct (never `password`). `createdAt` uses `@default(now())`. Migration runs cleanly.

### T05 — Auth API routes ⚠️

Implementation is correct but two findings:
1. **Rate limiting missing** — signup and login endpoints have no rate limiting. A brute-force attack on /login is trivially easy. Add `express-rate-limit` or middleware-level rate limiting before v2.
2. **Error messages leak existence** — "user not found" vs "wrong password" lets an attacker enumerate valid emails. Return the same generic error for both cases.

### T06 — Middleware ✅

Correct use of Next.js middleware for session validation. The matcher config properly protects `/dashboard/*` while leaving `/login` and `/api/auth/*` open.

### T07 — Logout ✅

Cookie cleared correctly with same attributes as set (httpOnly, SameSite). POST method correct (GET logout is a CSRF vulnerability).

### T08 — Integration tests ✅

3 Playwright scenarios pass. Coverage is adequate for v1. Add happy-path for signup in v2.

### T09 — Staging deploy ✅

Staging URL healthy. Smoke test passes.

## Findings for v2

1. Add rate limiting to /api/auth/login (5 req/min per IP)
2. Normalize auth error messages (no user enumeration)
3. Self-host Geist font
