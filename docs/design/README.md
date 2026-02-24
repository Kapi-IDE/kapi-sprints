# Kapi Sprints — OSS Plan

> Open-source sprint workflow system for Claude Code. Brand vehicle for Kapi AI.

*Last Updated: February 2026*

---

## Strategic Goal

**Primary:** Brand/thought leadership for Balaji + Kapi credibility ("we eat our own cooking").

**Secondary:** Get PMs to trust the blackboard pattern by experiencing it firsthand. PMs who coordinate 5 Claude Code terminals via a blackboard will viscerally understand why Kapi's blueprint orchestration works the way it does.

**Not a goal:** MAI workshops, community contributions, or revenue.

---

## Product Name

**Kapi Sprints** — brand right in the name. Every GitHub star, npm install, LinkedIn share has "Kapi" in it.

---

## Architecture Summary

Two packages, one monorepo:

```
kapihq/kapi-sprints/
├── plugin/          # Claude Code plugin (skills, agents, commands, hooks)
├── dashboard/       # Next.js app (npx kapi-sprints dashboard)
└── README.md        # The story — this is the marketing
```

**Filesystem IS the API.** Skills write markdown. Dashboard reads markdown. They never talk directly.

```
Plugin (Claude Code)          Dashboard (Next.js)
  skills write .md    →    chokidar watches .md → WebSocket → UI
  /sprint commands          localhost:3838
```

---

## Plan Index

| Doc | What | Status |
|-----|------|--------|
| [architecture.md](architecture.md) | Monorepo structure, package boundaries | ✅ Spec'd |
| [plugin.md](plugin.md) | Skills, agents, commands, hooks | ✅ Spec'd |
| [dashboard.md](dashboard.md) | Next.js dashboard architecture | ✅ Spec'd |
| [onboarding.md](onboarding.md) | Backwards build flow (`/sprint init`, `/sprint spec`) | ✅ Spec'd |
| [distribution.md](distribution.md) | Marketplace, GitHub, self-hosted | ✅ Spec'd |
| [licensing.md](licensing.md) | Apache 2.0 decision | ✅ Spec'd |
| [content-strategy.md](content-strategy.md) | LinkedIn posts, README story | ✅ Spec'd |

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Distribution | Self-hosted marketplace (GitHub) | No approval gate, ship immediately |
| Dashboard | Separate Next.js process | Full Next.js power, not crammed into MCP |
| License | Apache 2.0 | Enterprise-friendly, mandatory attribution, patent protection |
| Terminology | Blueprints (complete) + Skills (composable) | Two-tier model, differentiates from OpenClaw |
| Onboarding | Backwards build flow | Plugin IS the Kapi pitch — specify before building |

---

## Strategic Funnel

```
PM finds kapi-sprints on GitHub/LinkedIn
         ↓
Installs, runs /checkpoint and /resume
         ↓
Thinks: "This blackboard coordination is powerful"
         ↓
Sees: "Built by Kapi — we use this pattern for AI agent orchestration"
         ↓
Visits getkapi.com → "Oh, blueprints coordinate skills
the same way this coordinates terminals"
         ↓
Trust is pre-built. PM already experienced the pattern.
```

---

## Timeline

| Phase | What | When |
|-------|------|------|
| **1** | Spec complete (this plan) | Now |
| **2** | Extract plugin from Kapi codebase | Week 1-2 |
| **3** | Generalize skills (remove Kapi-specific references) | Week 2-3 |
| **4** | Dashboard extraction + npx CLI | Week 3-4 |
| **5** | README + NOTICE + LICENSE | Week 4 |
| **6** | GitHub repo public + LinkedIn post #1 | Week 5 |
| **7** | LinkedIn post series (3-4 posts over 2 weeks) | Week 5-7 |

---

*This plan cascades from the Kapi Q1 2026 Launch Plan. Kapi Sprints is a brand vehicle, not a product.*
