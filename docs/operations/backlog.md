# Backlog

Ideas and future work that haven't been scheduled into a sprint yet.
Use `/post queue [idea]` from Claude Code to add items here.

---

## Inbox

<!-- Items added via /post queue or promoted from decisions -->
[ ] Implement `/sprint init` with Foundation Gate — scans for docs/foundation/{vision,market,spec}.md, generates each conversationally if missing, validates for completeness (thin = ⚠️), then scaffolds sprint structure. Replaces old permissive "point me to a file" flow. See docs/design/onboarding.md for full spec.
[ ] Build `/sprint` command dispatcher — routes `init`, `prd`, `preflight`, `post`, `review` subcommands
[ ] Add rate limiting to /api/auth/login (5 req/min per IP) — from v1 code review
[ ] Normalize auth error messages to prevent user enumeration — from v1 code review
[ ] Self-host Geist font for privacy/performance
[ ] Add OAuth (Google, GitHub) — many users prefer this to email/password
[ ] Email verification on signup
[x] Set up CI/CD pipeline — done in v1 T02

---

## Done

[x] Initialize repository — v1 T01
[x] User authentication — v1 T04-T07
