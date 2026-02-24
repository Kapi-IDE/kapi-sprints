# Sprint v1 Tasks

## Block A: Setup

- [ ] **T01: Initialize repository** (S)
  What: Create Next.js 15 project with TypeScript, Tailwind CSS, ESLint, Prettier
  Files: package.json, next.config.ts, tsconfig.json, .eslintrc.json
  Test: `npm run build` exits 0; `npm run lint` exits 0

- [ ] **T02: Set up CI/CD pipeline** (M)
  What: GitHub Actions workflow — push to `dev` auto-deploys to staging; production requires manual confirmation
  Files: .github/workflows/deploy-staging.yml, .github/workflows/deploy-prod.yml
  Test: Push a commit to dev branch and verify staging deploy completes

- [ ] **T03: Configure pre-commit hooks** (S)
  What: Husky + lint-staged — run ESLint and type-check on staged files before commit
  Files: .husky/pre-commit, package.json (lint-staged config)
  Test: Introduce a lint error, try to commit, verify it is rejected

## Block B: Auth

- [ ] **T04: Create users table + Prisma schema** (S)
  What: PostgreSQL via Prisma — users table with id, email, passwordHash, createdAt
  Files: prisma/schema.prisma, lib/db.ts
  Test: `npx prisma migrate dev` completes; can insert a test user via Prisma Studio

- [ ] **T05: Implement signup and login API routes** (M)
  What: POST /api/auth/signup (hash password with bcrypt, create user), POST /api/auth/login (verify password, set httpOnly session cookie)
  Files: app/api/auth/signup/route.ts, app/api/auth/login/route.ts, lib/auth.ts
  Logic:
    - Signup: validate email format, check duplicate, hash with bcrypt(12), insert, set cookie
    - Login: find by email, compare hash, set signed session cookie (7 day expiry)
    - Cookie: httpOnly, SameSite=Strict, Secure in prod
  Test: POST /api/auth/signup with valid email+password returns 200 and Set-Cookie header

- [ ] **T06: Auth middleware + protected routes** (S)
  What: Next.js middleware reads session cookie, redirects unauthenticated users to /login
  Files: middleware.ts, app/(auth)/login/page.tsx, app/(protected)/dashboard/page.tsx
  Test: Visiting /dashboard without a session cookie redirects to /login

- [ ] **T07: Logout route + session invalidation** (S)
  What: POST /api/auth/logout clears the session cookie
  Files: app/api/auth/logout/route.ts
  Test: After login, POST /logout, then GET /dashboard → redirects to /login

## Block C: Deploy

- [ ] **T08: Write integration tests for auth flows** (M)
  What: Playwright e2e tests covering: signup → dashboard visible, login with wrong password → error, logout → redirects to login
  Files: tests/auth.spec.ts
  Test: `npx playwright test` passes all 3 scenarios

- [ ] **T09: Deploy to staging and smoke test** (S)
  What: Push to dev branch, confirm GitHub Actions deploy completes, run smoke test against staging URL
  Files: (no code changes — ops task)
  Test: Staging URL returns 200, signup flow works end-to-end in browser
