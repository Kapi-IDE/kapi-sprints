# Contributing to Kapi Sprints

Thanks for your interest. Here's how to contribute.

## Before You Start

Read [docs/concepts/vision.md](docs/concepts/vision.md) — the design philosophy shapes all decisions. Key points:

- **Backwards Build** — define done before writing code
- **Blackboard coordination** — all state goes through board.md
- **TDD** — write the failing test first
- **Ship continuously** — every commit should be deployable

## Development

```bash
git clone https://github.com/kapihq/kapi-sprints.git
cd kapi-sprints
npm install
npm run dev        # localhost:3000
```

## Making Changes

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes — follow the principles above
4. Verify: `npm run build` must pass
5. Submit a PR with a clear description of what and why

## What to Contribute

Check [kapi/backlog.md](kapi/backlog.md) for ideas. High-value areas:

- Real-time file watching (SSE)
- New Claude Code skills
- Dashboard UI improvements
- Documentation and guides

## What Not to Change

- `docs/history/sprints/v1/` — this is the self-hosting demo data. Don't modify.
- `docs/concepts/vision.md` — design philosophy is stable.
- Blackboard format (`board.md` sections, entry frontmatter) — parsers depend on it.

## License

By contributing, you agree that your contributions will be licensed under Apache 2.0.
