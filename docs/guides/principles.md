# Development Principles

These are the durable principles that shape all decisions in this project.
They almost never change. When in doubt, refer here first.

---

## 1. Backwards Build

Every sprint starts from the desired end state, not the first task.

Ask: *"What does done look like?"* then work backwards to the first action.
This ensures every task is clearly necessary and that intermediate states are always deployable.

**In practice**: The PRD describes the accepted, working product. Tasks are ordered so that at every checkpoint, the product works — just with fewer features.

---

## 2. Blackboard Coordination

The blackboard (`docs/operations/blackboard/board.md`) is the single source of truth for sprint state.

All findings, decisions, blockers, and agent status go on the blackboard. No information lives only in a chat message or terminal output. If it matters, it goes on the board.

**In practice**: Post to the blackboard any time you:
- Discover something that changes the plan
- Make an architectural decision
- Hit a blocker
- Complete a major milestone

---

## 3. TDD — Tests First, Always

Write the failing test before writing the implementation.
No task is done until its test passes.

This is not optional. Tests define the contract. Implementation fulfills it.

**In practice**: Every task in `tasks.md` has a `Test:` field. That test is written first.

---

## 4. Ship Continuously

Every task should result in a state that can be deployed to staging.
No task should leave the codebase in a broken, half-built state.

If a task is too large to complete in one sitting without breaking something, split it.

---

## 5. Small, Focused Sprints

A sprint is 3 hours. Not 3 days.

This forces prioritization. Only the highest-value work gets scheduled. Everything else goes in the backlog.

If a sprint is taking longer than 3 hours, something went wrong in planning — the tasks were too large, the scope too broad, or a blocker wasn't surfaced early enough.

---

## 6. Security is Not Optional

Every security issue found in code review must be fixed before going to production.
"We'll do it later" is how breaches happen.

Rate limiting, input validation, proper session handling — these are table stakes, not nice-to-haves.

---

## 7. No Clever Code

Code is read 10x more than it is written.

Prefer boring, obvious, well-named code over clever, compact, or "elegant" code.
If a junior developer can't understand it in 30 seconds, rewrite it.
