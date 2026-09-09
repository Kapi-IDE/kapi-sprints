# Claude Code Agent Teams — research notes, and why we did not build on them (February 2026)

> **A dated record, re-checked 2026-09-09.** Researched 2026-02-18, when agent teams were new. Everything below describes the feature as it was then; the re-check note is the next section and says what has and has not changed. Moved here from the `kapi-platform` repo, where it sat unfiled since February.

## Re-check, 2026-09-09 — the gap this note identified has not closed

The note's central claim was that agent teams give you **task coordination and messaging but no shared knowledge store**, and that this is the gap a blackboard fills. That is still true in the current documentation: the architecture is still team lead, teammates, task list and mailbox, with no place for findings, decisions or evolving understanding. The limitations it listed are also unchanged — no session resumption for in-process teammates, one team per session, no nested teams, the lead is fixed, permissions are set at spawn.

**What the note proposed is not what got built, and the difference is the useful part.** It proposed layering a blackboard *on top of* agent teams. In practice the five-agent team that runs the Kapi platform repo uses **no agent teams at all** — no team config exists on the machine and the experimental flag is unset. It runs five independent long-lived sessions coordinated by three things:

| | agent teams | what the platform team actually uses |
|---|---|---|
| topology | one lead spawns teammates; lead fixed, one team per session, no nesting | five peer sessions, no lead, each started by the human |
| lifetime | teammates die with the lead; `/resume` does not restore them | sessions live for days across many tasks |
| task list | shared JSON with dependency tracking and file-locked claiming | GitHub Issues, plus owed-by-name rows on the blackboard |
| messaging | mailbox files between teammates | cross-session messaging, which the docs now name as the lighter option to reach for first |
| shared knowledge | none | a durable blackboard, an append-only log, and dated episodes |
| permissions | every teammate inherits the lead's mode at spawn | per-lane authority — only the release agent may push |
| context on start | project files, not the lead's history | the same project files, plus a blackboard that outlives every session |

**Two reasons the peer-session shape won, both worth stating for anyone choosing between them.** Coordination has to survive a session ending, and a team's config is removed when its lead exits, so durable state cannot live there. And authority is per-lane rather than per-team: one agent alone may push and deploy, which a model where every teammate inherits the lead's permission mode cannot express.

Agent teams remain the better tool for what they are for — bounded parallel exploration inside one session, where several teammates attack a question at once and the lead synthesizes. That is a different job from a standing team with fixed roles and a memory.

---

## What Are Agent Teams?

An **experimental** feature that orchestrates multiple independent Claude Code sessions working together on a shared project. Instead of one session blocking on one task at a time, you spawn a team with a designated **team lead** plus multiple **teammates** — each with their own context window, working independently but coordinated through a shared task list and direct inter-agent messaging.

Key differentiator: Unlike Subagents (which only report results back to the main agent), teammates in Agent Teams **communicate directly with each other** and can self-organize around shared work.

---

## Architecture — Four Core Components

| Component | Role |
|-----------|------|
| **Team Lead** | Main session that creates team, spawns teammates, coordinates work, synthesizes results |
| **Teammates** | Separate Claude Code instances, each with own context window, working on assigned tasks |
| **Task List** | Shared work items stored in `~/.claude/tasks/{team-name}/` with dependency tracking |
| **Mailbox** | Direct messaging system for teammate-to-teammate communication (not routed through lead) |

### Task Coordination Mechanics

- Tasks have states: `pending` → `in_progress` → `completed`
- Tasks can depend on other tasks (blocking semantics)
- When a blocking task completes, dependent tasks automatically unblock
- Teammates self-claim the next unblocked task using file locking (prevents race conditions)
- The lead can assign tasks explicitly or let teammates self-organize

### Communication Pattern

- Teammates send messages directly to each other (automatic delivery)
- Teammates notify the lead when idle
- All agents access the shared task list
- Lead can message any teammate directly without going through others

---

## Relationship to Skills and the Task Tool

### Hierarchy

```
┌─ Skills
│  └─ Reusable prompt fragments that run in main conversation context
│     (no parallelism, no independent agents)
│
├─ Subagents (Task tool within a session)
│  └─ Independent agents spawned by main agent
│     └─ Own context window
│     └─ Report results back to caller only
│     └─ DO NOT communicate with each other
│     └─ Run within single session
│
└─ Agent Teams (Experimental)
   └─ Orchestrated multiple sessions
   └─ Teammates have own context windows
   └─ Teammates message each other DIRECTLY
   └─ Shared task list with dependency tracking
   └─ True parallelism across sessions
```

### When to Use Each

| Feature | Skills | Subagents | Agent Teams |
|---------|--------|-----------|-------------|
| **Parallelism** | Sequential | Concurrent within 1 session | True parallel (separate sessions) |
| **Inter-agent comm** | N/A | No (only report to caller) | Yes (direct messaging) |
| **Context isolation** | None | Own context window | Own context window |
| **Token cost** | Low | Medium (summarized) | High (each session counts) |
| **Best for** | Reusable templates | Quick focused tasks | Complex coordinated work |

The **Task tool** in settings controls which subagents can be spawned within a session. Agent Teams don't use the Task tool — they spawn separate Claude Code instances entirely.

---

## Shared State Mechanism

### Storage Locations

```
~/.claude/teams/{team-name}/
  └── config.json              # Team metadata, member array

~/.claude/tasks/{team-name}/
  └── {task-id}.json           # Individual task state + dependency info
```

### `config.json` Contains

- `members` array: each teammate's name, agent ID, agent type
- Team context (available for all teammates to read)
- Teammates discover each other by reading this file

### Task Files Include

- Task state (pending/in-progress/completed)
- Dependencies array (which tasks block this one)
- Task assignment (which teammate owns it)
- Task description and context

### Blackboard Pattern Resemblance

This is similar to a **Blackboard System** (Nii, 1986 — classical MAS). Shared knowledge source accessible to all agents, with control over task claiming via file locking to prevent conflicts.

**What's missing vs a full Blackboard**: No shared *knowledge* store. Agent Teams has task coordination and messaging, but no structured place for findings, decisions, or evolving shared understanding. That's the gap our blackboard design fills.

---

## Setup and Configuration

### Enable Agent Teams (Experimental)

```json
// ~/.claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Or via environment:
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
```

### Display Modes

Configure in `settings.json`:
```json
{
  "teammateMode": "auto"  // "auto" | "in-process" | "tmux"
}
```

| Mode | Requirement | Behavior |
|------|-------------|----------|
| **in-process** | None (works anywhere) | All teammates in main terminal, cycle with `Shift+Down` |
| **split-panes** (tmux) | tmux or iTerm2 + it2 CLI | Each teammate in own pane, click to interact |
| **auto** (default) | Optional tmux | Uses split-panes if in tmux, in-process otherwise |

Install tmux for split-pane mode:
```bash
brew install tmux  # macOS
```

---

## Starting and Running Agent Teams

### Simple Invocation

```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles:
one teammate on UX, one on technical architecture, one playing devil's advocate.
```

Claude automatically:
1. Creates team config and task list
2. Spawns teammates for each role
3. Coordinates work through shared tasks
4. Synthesizes findings when done

### Explicit Teammate Specification

```
Create an agent team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

### Navigation (in-process mode)

- `Shift+Down` — cycle through teammates
- Type → message current teammate
- Enter → view teammate's session
- Escape → interrupt teammate's current turn
- `Ctrl+T` — toggle task list visibility

---

## Key Features

### Assign vs. Self-Claim

```
# Lead explicitly assigns work
Give the security reviewer the authentication module task

# Teammates self-claim (default)
After finishing, teammate automatically claims next unblocked task
```

### Plan Approval (for risky refactors)

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

Teammate plans in read-only mode → submits plan → lead approves/rejects → teammate proceeds or revises.

### Direct Communication

```
Ask the researcher teammate to focus on edge cases
Ask the debugger teammate to test the security fix
```

### Shutdown

```
Ask the researcher teammate to shut down
```

Teammate can approve or reject gracefully.

### Clean Up Team

```
Clean up the team
```

Removes all shared resources. **Must be done by lead, not teammates** (leads have correct team context).

---

## Permissions and Quality Gates

### Inherited Permissions

```bash
# If lead runs with --dangerously-skip-permissions
claude --dangerously-skip-permissions
# All teammates inherit this mode at spawn
```

### Quality Gate Hooks

```json
// .claude/settings.json
{
  "hooks": {
    "TeammateIdle": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/validate-teammate-work.sh"
          }
        ]
      }
    ],
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/verify-task-complete.sh"
          }
        ]
      }
    ]
  }
}
```

Exit with code 2 to block completion and send feedback back to teammate.

---

## Best Practices

### When Agent Teams Shine

1. **Research & Review** — multiple investigators check different aspects in parallel
2. **New Modules** — teammates own independent pieces without stepping on each other
3. **Competing Hypotheses** — debug by testing multiple theories simultaneously
4. **Cross-Layer Coordination** — frontend, backend, tests developed in parallel with synchronization points

### When to Avoid

- Sequential tasks (coordination overhead > benefit)
- Same-file edits (conflicts)
- Tasks with many dependencies (bottlenecks)
- High-latency operations (subagents are faster)

### Practical Tips

- Task size: self-contained units that produce clear deliverables (function, test file, review report)
- Aim for 5-6 tasks per teammate (keeps everyone productive, allows reassignment)
- Always wait for teammates to finish before proceeding
- Start with research/review tasks (clearest value, fewest coordination issues)
- Monitor progress and steer as needed (don't let team run unattended)
- Give teammates enough context in spawn prompt (they don't inherit lead's history)
- Avoid file conflicts (different teammates → different files)

---

## Token Cost Considerations

Agent teams use **significantly more tokens** than single-session work:

- Each teammate is a full Claude Code instance
- Token usage scales linearly with number of active teammates
- Each teammate maintains full context window (compaction happens independently)
- Communication overhead between agents

**Cost analysis:**
- **Research/review tasks**: Usually worthwhile (parallelism value > token cost)
- **Routine tasks**: Single session is more cost-effective
- **Background teammates**: Pre-approved permissions to avoid chatty permission handling

Use `/cost` command in Claude Code for detailed breakdown.

---

## Known Limitations (Experimental)

- No session resumption with in-process teammates (after `/resume`, teammates may be invalid)
- Task status can lag (teammates sometimes don't mark tasks complete)
- Shutdown is slow (teammates finish current request before stopping)
- One team per session (can't have multiple concurrent teams in one lead)
- No nested teams (teammates cannot spawn their own teams)
- Lead is fixed (can't promote teammate to lead)
- Permissions set at spawn (can't specify per-teammate modes at creation)
- Split panes requires tmux or iTerm2 (not available in VS Code integrated terminal, Windows Terminal, Ghostty)
- Orphaned tmux sessions possible (manual cleanup: `tmux ls`, `tmux kill-session`)

---

## Relevance to Kapi Sprint Workflow

### What Agent Teams provides that we need

- Shared task list with dependencies → replaces manual task tracking across terminals
- Direct teammate messaging → replaces Balaji manually carrying context between terminals
- `TeammateIdle` / `TaskCompleted` hooks → natural integration point for blackboard auto-posting

### What Agent Teams does NOT provide (our blackboard fills)

- Shared knowledge store (findings, decisions, evolving understanding)
- Checkpoint/resume across work sessions
- Role-based posting thresholds (what's worth sharing vs noise)
- Coordination narrative ("here's what was decided and why")
- Context recovery after days/weeks away

### Proposed layering

```
Agent Teams (built-in)          Blackboard (our addition)
========================        ==========================
Task list + dependencies   +    Shared knowledge store
Mailbox (1:1 messages)     +    /checkpoint (session debrief)
TeammateIdle hooks         +    /resume (session briefing)
                           +    /post (human escape hatch)
                           +    Auto-posting from sprint skills
```

---

## Sources

- [Orchestrate teams of Claude Code sessions — Claude Code Docs](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Agent Teams: The Complete Guide 2026](https://claudefa.st/blog/guide/agents/agent-teams)
- [Agent Teams in Claude Code — Daniel Avila, Medium, Feb 2026](https://medium.com/@dan.avila7/agent-teams-in-claude-code-d6bb90b3333b)
- [How to Set Up and Use Claude Code Agent Teams — Dára Sobaloju, Medium, Feb 2026](https://darasoba.medium.com/how-to-set-up-and-use-claude-code-agent-teams-and-actually-get-great-results-9a34f8648f6d)
- [Claude Code Swarms — Addy Osmani](https://addyosmani.com/blog/claude-code-agent-teams/)
- [Create custom subagents — Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
