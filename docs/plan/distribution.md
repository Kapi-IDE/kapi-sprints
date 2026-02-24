# Distribution Strategy

> Self-hosted marketplace on day one. Official Anthropic marketplace in parallel.

---

## Primary: Self-Hosted Marketplace (GitHub)

No approval needed. Ship immediately.

### Install Flow

```bash
# Add marketplace (one-time)
claude plugin marketplace add kapihq/kapi-sprints

# Install plugin
claude plugin install kapi-sprints@kapihq

# Start dashboard (separate terminal)
npx kapi-sprints dashboard
```

### Marketplace File

`plugin/.claude-plugin/marketplace.json`:

```json
{
  "name": "kapihq",
  "owner": {
    "name": "Kapi AI",
    "email": "hello@getkapi.com",
    "url": "https://getkapi.com"
  },
  "plugins": [
    {
      "name": "kapi-sprints",
      "source": {
        "source": "github",
        "repo": "kapihq/kapi-sprints"
      },
      "version": "0.1.0",
      "description": "Sprint workflow system with blackboard coordination for Claude Code",
      "category": "productivity",
      "keywords": ["sprint", "blackboard", "workflow", "coordination", "multi-agent"]
    }
  ]
}
```

---

## Secondary: Official Anthropic Marketplace

Submit via [plugin directory submission form](https://github.com/anthropics/claude-plugins-official). Unknown approval timeline. Don't gate launch on this.

**Submission criteria** (from their repo):
- Must meet quality and security standards
- Need clear documentation
- Plugin must be functional

**Action:** Submit in parallel with public launch. If accepted, bonus visibility. If not, self-hosted marketplace works fine.

---

## Dashboard: npm

Published as `kapi-sprints` on npm.

```bash
# One-time install
npm install -g kapi-sprints
kapi-sprints dashboard

# Or npx (no install)
npx kapi-sprints dashboard
```

---

## GitHub Repo Setup

### Repo: `kapihq/kapi-sprints`

**Visibility:** Public from day one.

**README.md:** This IS the marketing. See [content-strategy.md](content-strategy.md).

**Key files:**
```
├── LICENSE            # Apache 2.0
├── NOTICE             # Attribution
├── README.md          # The story
├── CONTRIBUTING.md    # How to contribute (keep simple)
├── plugin/            # Claude Code plugin
├── dashboard/         # Next.js dashboard
└── docs/              # This plan (public — shows the thinking)
```

**Topics/tags:** `claude-code`, `claude-code-plugin`, `sprint`, `blackboard-architecture`, `ai-development`, `multi-agent`, `workflow`

---

## Community Marketplaces

Also list on community directories for extra visibility:

| Directory | URL | Action |
|-----------|-----|--------|
| claudecodemarketplace.com | https://claudecodemarketplace.com | Submit listing |
| claudemarketplaces.com | https://claudemarketplaces.com | Submit listing |
| cc-marketplace (ananddtyagi) | GitHub | PR to add to their catalog |

These are low-effort, high-visibility placements.

---

## Launch Sequence

| Day | Action |
|-----|--------|
| **D-7** | Repo public (silent). README polished. |
| **D-1** | Test full install flow on clean machine. |
| **D0** | LinkedIn post #1 (blackboard architecture story) |
| **D0** | Submit to Anthropic official marketplace |
| **D0** | Submit to community directories |
| **D+3** | LinkedIn post #2 (checkpoint/resume) |
| **D+7** | LinkedIn post #3 (anti-pattern: no eval, no governance) |
| **D+14** | LinkedIn post #4 (repo launch post, link everything) |

---

*See [content-strategy.md](content-strategy.md) for LinkedIn post details.*
