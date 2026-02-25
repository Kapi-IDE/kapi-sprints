# Sprint v1 Tasks

## Block A: Real-Time File Watching

- [ ] **T01: Add chokidar + SSE endpoint** (M)
  What: Server-Sent Events route that watches .md files via chokidar and pushes change events to connected browsers
  Files: app/api/watch/route.ts, lib/watcher.ts, package.json (add chokidar dep)
  Logic:
    - `lib/watcher.ts` — module-level singleton: `chokidar.watch(['docs/**/*.md', 'kapi-sprints.config.md'], { ignoreInitial: true })`. Export `getWatcher()` to reuse across requests.
    - `app/api/watch/route.ts` — GET handler returns SSE stream (`text/event-stream`). On each chokidar `change` / `add` / `unlink` event, write `data: {path}\n\n` to the stream. Keep connection alive with a 30s comment ping (`': ping\n\n'`).
    - Install: `npm install chokidar`
  Test: Start dev server. Open `localhost:3000/v1`. Edit `docs/operations/blackboard/board.md`. Network tab shows `GET /api/watch` as EventStream with a new event within 1s.

- [ ] **T02: Client EventSource replaces 30s polling** (S)
  What: Connect to /api/watch via EventSource; call router.refresh() on each event; remove the setInterval poll
  Files: app/[version]/_components/DevDashboard.tsx
  Logic:
    - Remove: `const id = setInterval(() => router.refresh(), 30_000)` and its `useEffect` (currently at line ~1231)
    - Add `useEffect`:
      ```ts
      useEffect(() => {
        const es = new EventSource('/api/watch')
        es.onmessage = () => router.refresh()
        es.onerror = () => es.close()
        return () => es.close()
      }, [router])
      ```
  Depends: T01
  Test: Edit `board.md`. Dashboard updates within 2 seconds. No 30s poll visible in Network tab.

## Block B: CLI Packaging

- [ ] **T03: Create bin/cli.js entry point** (S)
  What: Node CLI that handles `kapi-sprints dashboard` — checks for config file, starts Next.js on port 3838
  Files: bin/cli.js
  Logic:
    ```js
    #!/usr/bin/env node
    const { execSync, spawn } = require('child_process')
    const path = require('path')
    const fs = require('fs')

    const command = process.argv[2]

    if (command === 'dashboard') {
      const configPath = path.join(process.cwd(), 'kapi-sprints.config.md')
      if (!fs.existsSync(configPath)) {
        console.error('Error: kapi-sprints.config.md not found in current directory.')
        console.error('Run /sprint init in Claude Code to set up your project first.')
        process.exit(1)
      }
      const port = process.argv[3] || '3838'
      console.log(`Starting Kapi Sprints dashboard on http://localhost:${port}`)
      const next = spawn('node', [path.join(__dirname, '..', 'node_modules', '.bin', 'next'), 'dev', '--port', port], {
        stdio: 'inherit',
        env: { ...process.env, KAPI_SPRINTS_PROJECT_ROOT: process.cwd() }
      })
      next.on('exit', code => process.exit(code))
    } else {
      console.log('Usage: kapi-sprints dashboard [port]')
    }
    ```
  Test: Run `node bin/cli.js dashboard` from a dir without `kapi-sprints.config.md` → error message and exit 1. Run from a dir with the file → Next.js starts on 3838.

- [ ] **T04: Update package.json for npm distribution** (S)
  What: Add bin field, set name to kapi-sprints, set default port to 3838 in next.config.ts
  Files: package.json, next.config.ts
  Logic:
    - `package.json`: add `"bin": { "kapi-sprints": "./bin/cli.js" }`, set `"name": "kapi-sprints"`, add `"files": ["bin/", "app/", "lib/", "public/", "next.config.ts", "tsconfig.json", "package.json"]`
    - `next.config.ts`: no port hardcoding needed — port is passed by CLI at runtime
    - Mark `bin/cli.js` as executable: `chmod +x bin/cli.js`
  Depends: T03
  Test: `node -e "const p = require('./package.json'); console.log(p.bin)"` prints `{ 'kapi-sprints': './bin/cli.js' }`.

## Block C: Plugin Structure

- [ ] **T05: Create plugin metadata files** (S)
  What: plugin.json and marketplace.json in plugin/.claude-plugin/ per the distribution spec
  Files: plugin/.claude-plugin/plugin.json, plugin/.claude-plugin/marketplace.json
  Logic:
    - `plugin.json` (from docs/design/plugin.md):
      ```json
      {
        "name": "kapi-sprints",
        "version": "0.1.0",
        "description": "Sprint workflow system with blackboard coordination for Claude Code",
        "homepage": "https://github.com/kapihq/kapi-sprints",
        "author": { "name": "Kapi AI", "url": "https://getkapi.com" },
        "license": "Apache-2.0"
      }
      ```
    - `marketplace.json` (from docs/design/distribution.md): copy the spec verbatim, update repo to `kapihq/kapi-sprints`
    - Create `plugin/README.md` — one paragraph: what this plugin is, install command
  Test: Both JSON files are valid (`node -e "require('./plugin/.claude-plugin/plugin.json')"`). Fields match the spec in docs/design/plugin.md and docs/design/distribution.md.

- [ ] **T06: Copy generalized skills to plugin/skills/** (M)
  What: Copy prd, dev, test, post skills from .claude/skills/ to plugin/skills/ and strip all kapi-platform-specific references
  Files: plugin/skills/prd/SKILL.md, plugin/skills/dev/SKILL.md, plugin/skills/test/SKILL.md, plugin/skills/post/SKILL.md
  Logic:
    - Copy each SKILL.md from `.claude/skills/{name}/SKILL.md` to `plugin/skills/{name}/SKILL.md`
    - Scan each file and remove/replace:
      - Any mention of "Kapi platform", "blueprints", "manifest.yaml", "8-layer architecture", "Azure", "LangGraph", "manifest-transformer"
      - Hard-coded paths to `/Users/bv/...` → use relative paths
      - References to kapi-platform CLAUDE.md → remove, not applicable
    - `prd/SKILL.md`: replace "Kapi-Specific Context" section with a generic "Project Context" note: "Read kapi-sprints.config.md for project-specific layers and conventions"
    - `dev/SKILL.md`: no Kapi-specific content found — verify and copy as-is
    - `test/SKILL.md`: no Kapi-specific content — verify and copy as-is
    - `post/SKILL.md`: no Kapi-specific content — verify and copy as-is
    - Add `plugin/skills/README.md`: list of skills with one-line descriptions
  Test: Grep each plugin skill for "kapi-platform", "blueprint", "manifest", "Azure", "LangGraph" → zero matches.
