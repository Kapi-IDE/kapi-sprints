# Sprint v2 Tasks

## Block A: Config Portability (Captain — infra/config)

- [x] **T01: Fix project.config.ts paths** (S)
  What: Remove hardcoded absolute paths, make relative
  Files: project.config.ts
  Logic:
    line 24: change opsDir from '/Users/bv/Code/active/kapi-sprints/kapi' to 'kapi'
    line 36: change KAPI_DIR from hardcoded absolute to path.join(process.cwd(), 'kapi')
    line 8: change name from 'Kapi Platform' to 'Kapi Sprints'
  Test: npm run build passes, dashboard loads with relative paths

- [x] **T02: Clear Gemini key from .mcp.json** (S)
  What: Ship with empty key so students fill in their own
  Files: .mcp.json
  Logic:
    set GEMINI_API_KEY to "" (empty string)
    keep GEMINI_PROXY_URL as-is (students use same proxy)
    do NOT add .mcp.json to .gitignore — students need the structure
  Test: .mcp.json has empty key, shim starts in disabled mode without key

- [x] **T03: Fix API route path references** (S)
  What: Verify all API routes use KAPI_DIR from config, not hardcoded paths
  Files: app/api/agents/[agentId]/route.ts, app/api/backlog/route.ts, app/api/backlog/promote/route.ts
  Logic:
    grep for dirname(process.cwd()) or hardcoded /Users/bv paths
    replace with import { KAPI_DIR } from '@/project.config'
    verify all routes resolve to kapi/ relative to project root
  Test: API routes work after config change

- [x] **T04: Gitignore ephemeral state** (S)
  What: Add blackboard-live.yaml to .gitignore, keep durable state committed
  Files: .gitignore
  Logic:
    add: kapi/blackboard-live.yaml (ephemeral, recreated on server start)
    add: kapi/agents/ (auto-created on registration)
    do NOT ignore: kapi/backlog.md, kapi/sprints/, kapi/decisions.yaml, kapi/snapshot.yaml, kapi/lessons.md
  Test: git status shows blackboard-live.yaml as untracked after gitignore update

## Block B: UI Portability (Copilot — pages/UI)

- [x] **T05: Dynamic sprint link in sidebar** (S)
  What: Sidebar Sprint link currently hardcoded to /sprints/v1, should detect current sprint
  Files: app/_components/sidebar.tsx
  Logic:
    read kapi/snapshot.yaml to get current sprint id
    or accept currentSprint as a prop passed from the page
    fallback to /sprints/v1 if no sprint detected
  Test: Sidebar shows correct sprint link after creating v2

- [x] **T06: Verify get-started page** (S)
  What: Ensure all paths and commands on get-started page are correct
  Files: app/get-started/page.tsx
  Logic:
    check every path reference points to kapi/ not docs/operations/
    check every command works (npm run dev, not npx kapi-sprints dashboard)
    check project.config.ts reference, not kapi-sprints.config.md
  Test: Every command and path on the page exists

- [x] **T07: Update README with student setup** (M)
  What: Add clear setup instructions for MAI students
  Files: README.md
  Logic:
    add Quick Start section:
      1. Clone repo
      2. npm install && cd blackboard && bun install && cd ..
      3. Set GEMINI_API_KEY in .mcp.json (get key from MAI instructor)
      4. npm run dev → localhost:8791
      5. Open Claude Code: claude (in repo root)
    document what they get: dashboard, agents, sprints, Gemini tools
    document the mai_gk_ key flow
  Test: A student can follow the README and get running

- [ ] **T08: Verify full portability** (S)
  What: End-to-end test — clone to temp dir, install, run, verify
  Files: none (verification task)
  Logic:
    git clone to /tmp/kapi-sprints-test
    npm install, cd blackboard && bun install
    npm run dev — dashboard loads at :8791
    npm run build — passes
    no errors referencing /Users/bv or absolute paths
  Depends: T01-T07
  Test: Clean clone works end-to-end
