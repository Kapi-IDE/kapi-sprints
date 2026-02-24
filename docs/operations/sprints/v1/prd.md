# Sprint v1 — Foundation

*Backwards Build sprint: start from the deployed, working product and work backwards to the first task.*

## Goal

Ship a working foundation: project scaffolding, CI/CD pipeline, user authentication, and a basic dashboard. Every task should result in a deployable, passing-tests state.

## Acceptance Criteria

- [ ] Repository has CI/CD that auto-deploys to staging on push to `dev`
- [ ] Users can sign up, log in, and log out with email + password
- [ ] Authenticated users see a dashboard page (can be a stub)
- [ ] All lint and type checks pass
- [ ] Test coverage for auth flows

## Out of Scope

- Third-party OAuth (v2)
- Email verification (v2)
- Settings page design (v2)

---

## Task Breakdown

| Block | Name | Time |
|-------|------|------|
| A: Setup | Project scaffolding + CI | 45 min |
| B: Auth | User authentication | 90 min |
| C: Deploy | Testing + staging deploy | 45 min |

**Total: ~180 min (3 hours)**

---

## Backwards Build Approach

Start from the end state and work backwards:

**Done state**: Users can log in and see a dashboard → staging deploy is green

**Work backwards**:
1. Dashboard page exists and is protected by auth middleware ← Block B
2. Auth flows work (signup, login, session, logout) ← Block B
3. Database has users table ← Block B
4. CI/CD pipeline deploys on push ← Block A
5. Project is initialized with correct stack ← Block A

**TDD rule**: Write the test before the implementation. No task is done until the test passes.
