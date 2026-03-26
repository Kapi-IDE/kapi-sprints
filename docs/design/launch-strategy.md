# Launch Strategy

> Brand vehicle for Kapi AI. Open-source the patterns, keep the platform.

---

## Strategic Goal

**Primary:** Brand/thought leadership for Balaji + Kapi credibility ("we eat our own cooking").

**Secondary:** Get PMs to trust the blackboard pattern by experiencing it firsthand. PMs who coordinate Claude Code terminals via a blackboard will viscerally understand why Kapi's orchestration works the way it does.

```
PM finds kapi-sprints on GitHub/LinkedIn
         ↓
Installs, runs /checkpoint and /resume
         ↓
Thinks: "This blackboard coordination is powerful"
         ↓
Sees: "Built by Kapi" → visits getkapi.com
         ↓
Trust is pre-built. PM already experienced the pattern.
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| License | **Apache 2.0** | Enterprise-friendly, mandatory attribution (NOTICE file persists Kapi brand in all forks), patent protection |
| Distribution | Self-hosted marketplace (GitHub) | No approval gate, ship immediately |
| Dashboard | Separate Next.js process | Full Next.js power, not crammed into MCP |
| Terminology | Skills (composable) | Differentiates from other plugin patterns |

### Why Apache 2.0 (not MIT)

| Option | Rejected because |
|--------|-----------------|
| MIT | No attribution requirement. Forks remove Kapi branding. |
| GPL/AGPL | Enterprise legal teams block it. |
| CC BY 4.0 | Not designed for software. |
| **Apache 2.0** ✅ | Enterprise-friendly + mandatory NOTICE file + patent grant |

---

## Distribution

### Plugin: Self-Hosted Marketplace (GitHub)

```bash
# Install (no approval needed)
claude plugin marketplace add kapihq/kapi-sprints
claude plugin install kapi-sprints@kapihq
```

Also submit to:
- Anthropic official marketplace (in parallel, don't gate on it)
- Community directories (claudecodemarketplace.com, etc.)

### Dashboard: npm

```bash
npx kapi-sprints dashboard        # No install
npm install -g kapi-sprints       # Global install
```

### GitHub Repo: `kapihq/kapi-sprints`

Public from day one. Topics: `claude-code`, `sprint`, `blackboard-architecture`, `multi-agent`, `workflow`

---

## Content Strategy

### README as Marketing

The README tells a story, not a feature list:

```
Problem → Agents have no coordination
Solution → Blackboard pattern from 1986
How → Skills write markdown, dashboard reads
Quick Start → 3 commands to running
Built by → Kapi AI (the bridge to getkapi.com)
```

### LinkedIn Post Series (4 posts over 2 weeks)

| Post | Hook | Topic |
|------|------|-------|
| D0 | "I run 5-6 AI agents simultaneously. Here's the 1986 pattern that makes it work." | Blackboard architecture |
| D+3 | "Your AI coding assistant forgets everything between sessions. Mine doesn't." | Context recovery |
| D+7 | "The anti-pattern killing AI-assisted development: no eval, no governance, just vibes." | Scorecard + governance |
| D+14 | "We open-sourced our sprint system. Here's what 8 sprints taught us." | Repo launch |

### Quora Cross-Posting

Repurpose LinkedIn posts as answers (Balaji's 500K followers). Target questions about AI coding coordination, workflow, quality.

### Open vs. Internal

| Open (kapi-sprints) | Internal (Kapi platform) |
|---------------------|--------------------------|
| Blackboard pattern | Blueprint manifest schema |
| Sprint workflow + skills | Multi-agent orchestration |
| Dashboard UI | Enterprise features |
| Backwards build methodology | Customer data |

**Principle:** Open the patterns. Keep the platform.

---

## Launch Sequence

| Day | Action |
|-----|--------|
| D-7 | Repo public (silent). README polished. |
| D-1 | Test full install on clean machine. |
| D0 | LinkedIn #1 + Anthropic submission + community directories |
| D+3 | LinkedIn #2 (context recovery) |
| D+7 | LinkedIn #3 (anti-pattern governance) |
| D+14 | LinkedIn #4 (repo launch, link everything) |
