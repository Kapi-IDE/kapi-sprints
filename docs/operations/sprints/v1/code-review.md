# Code Review: Sprint v1

*Reviewer: AI · Date: feb 24*

## Summary

Sprint v1 ships four skill files and updates to the demo data. The skills are intentionally thin — readable and forkable are more important than exhaustive. Two findings worth addressing in v2.

## Per-File Review

### `.claude/skills/prd/SKILL.md` ✅

Correct structure. Reads the right files before starting (board, backlog, status, git log). Process is well-sequenced: summarize → suggest → brainstorm → propose → write. Output format is explicit. Board.md update instructions are clear.

One note: no explicit handling of "what if sprints/$ARGUMENTS/ doesn't exist yet?" — the skill should create the directory. Low priority since `mkdir -p` in the write step handles it implicitly.

### `.claude/skills/dev/SKILL.md` ✅

Agent init step is the key addition over a naive implementation. Posting `available` before starting work means the human can see who's active in the Team sidebar in real time.

The TDD cycle is appropriately strict: implement → build check → mark done → commit. One commit per task keeps the git log readable.

Finding: the skill doesn't handle the case where `tasks.md` has no unchecked tasks (sprint already done). Should print a clear message rather than silently searching.

### `.claude/skills/test/SKILL.md` ✅

Correct approach: sequential, stops on first failure. The board.md Activity write is important — gives humans visibility into QA results without opening a terminal.

Finding: `git push origin dev` assumes the remote is named `origin` and the branch is `dev`. Should check `git remote -v` first or document the assumption clearly for OSS users who may have different setups.

### `.claude/skills/post/SKILL.md` ✅

Clean and fast — the "parse, write, confirm" framing is right. Signal type table is clear. The `available` and `handoff` types added here go beyond the kapi-platform version, which is the right evolution.

### Demo data files ✅

`preflight.md`, `review.md`, `code-review.md`, entries — all now describe kapi-sprints v1, not a hypothetical auth app. The self-hosting story is coherent end-to-end.

## Findings for v2

1. `/dev` should handle "no unchecked tasks" gracefully — print "Sprint $ARGUMENTS is complete. Run /test." instead of searching indefinitely
2. `/test` should document or check the `origin`/`dev` assumption for OSS portability
