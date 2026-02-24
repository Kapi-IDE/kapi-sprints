# Project Status

*Last updated: jan 16*

## What's Safe to Demo Today

- User signup and login flows (staging)
- Session persistence across page reloads
- Protected route redirect (visiting /dashboard without auth → /login)
- CI/CD pipeline (push to dev → auto deploy visible in Actions)

## Known Gaps

- No rate limiting on auth endpoints (brute-force possible)
- Auth error messages leak user existence
- No email verification
- Dashboard is a stub page with no real content
- No structured logging or error tracking
- No password reset flow

## Sprint History

### v1 — Foundation (jan 15-16)

Shipped: project scaffold, CI/CD, user auth (signup/login/logout/middleware), integration tests, staging deploy.

9/9 tasks · 2h 45min · 0 blockers

### v2 — (upcoming)

Security hardening (rate limiting, error normalization) + core product features.
