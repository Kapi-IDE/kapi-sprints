# Code Review: Sprint v1

*Reviewer: AI · Date: feb 24*

## Summary

Sprint v1 ships four skill files, comprehensive demo data, a story-driven README, and two educational guides. The skills are intentionally thin — readable and forkable. Two findings for v2.

## Per-File Review

### `.claude/skills/prd/SKILL.md` ✅

Correct structure. Reads the right files before starting (board, backlog, status, git log). Process is well-sequenced: summarize → suggest → brainstorm → propose → write. Output format is explicit. Board.md update instructions are clear.

One note: no explicit handling of "what if sprints/$ARGUMENTS/ doesn't exist yet?" — the skill should create the directory. Low priority since `mkdir -p` in the write step handles it implicitly.

### `.claude/skills/dev/SKILL.md` ✅

Agent init step is the key addition over a naive implementation. Posting `available` before starting work means the human can see who's active in the Team sidebar in real time.

The TDD cycle is appropriately strict: implement → build check → mark done → commit. One commit per task keeps the git log readable.

Finding: the skill doesn't handle the case where `tasks.md` has no unchecked tasks. Should print a clear message rather than silently searching.

### `.claude/skills/test/SKILL.md` ✅

Sequential, stops on first failure. The board.md Activity write gives humans visibility into QA results without opening a terminal.

Finding: `git push origin dev` assumes the remote is named `origin` and the branch is `dev`. Should document this assumption for OSS users who may have different setups.

### `.claude/skills/post/SKILL.md` ✅

Clean signal protocol. Type table is clear. The `available` and `handoff` types go beyond basic blackboard writes — they're the seed of the HITL signal framework documented in `docs/guides/hitl-evaluation.md`.

### Demo data (v1/*.md, entries/, board.md) ✅

All files now describe kapi-sprints. The self-hosting story is coherent end to end. Entry file timestamps match frontmatter. Board.md sections are accurate.

### README.md ✅

Story-driven, not a feature list. Correctly mentions 4 shipped skills (not aspirational 12). Links to getkapi.com. Quick Start is 4 commands. Blackboard Pattern section educates without overselling.

### NOTICE ✅

Standard Apache 2.0 attribution. "Originally created by Kapi AI (https://getkapi.com)" — persists in all derivatives.

### `docs/guides/blackboard-pattern.md` ✅

Self-contained explainer. Traces from Hearsay-II to kapi-sprints. Practical examples with board.md format. Shareable standalone.

### `docs/guides/backwards-build.md` ✅

Methodology guide using v1 as the worked example. Foundation Gate concept explained clearly. Good contrast with vibe coding.

## Findings for v2

1. `/dev` should handle "no unchecked tasks" gracefully — print "Sprint complete. Run /test." instead of searching indefinitely
2. `/test` should document the `origin`/`dev` remote/branch assumption for OSS portability
