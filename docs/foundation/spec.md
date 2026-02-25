# Product Spec

## Core Flows

1. **Sprint planning** — PM runs `/prd v1`, brainstorms with Claude, produces `prd.md` + `tasks.md`
2. **Task execution** — Dev runs `/dev v1`, agent picks next task, implements with TDD, commits, updates board
3. **QA gate** — Dev runs `/test v1`, build + type check + lint must pass before pushing
4. **Blackboard coordination** — Any participant runs `/post [type] [message]` to share findings, decisions, blockers
5. **Dashboard monitoring** — Human opens `localhost:3000`, sees sprint progress, blackboard state, team status

## MVP Scope

- 4 Claude Code skills: `/prd`, `/dev`, `/test`, `/post`
- Next.js dashboard reading markdown files: overview, build, QA, review, stream, docs
- Blackboard with structured sections: blockers, decisions, findings, directives, agent status, activity
- Self-hosting demo: v1 sprint describes building kapi-sprints itself
- Educational guides: Blackboard Pattern, Backwards Build
- Apache 2.0 with NOTICE attribution

## Out of Scope

- Real-time file watching (v2 — currently reads on page load)
- CLI packaging / `npx kapi-sprints dashboard` (v2)
- Plugin marketplace distribution (v2)
- `/resume`, `/checkpoint`, `/scorecard`, `/sprint init` skills (v2)
- Authentication, payments, database (not applicable — kapi-sprints is file-based)
- Signal routing and HITL collaboration modes (v2+ — see hitl-evaluation.md)

## Success Criteria

- A stranger can clone the repo, run `npm run dev`, and understand the product in 5 minutes
- Dashboard shows coherent, self-referential sprint data (no placeholder content)
- README tells the blackboard story and links to Kapi AI
- Guides are standalone and shareable on LinkedIn
