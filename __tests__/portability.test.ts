import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'

describe('portability — no hardcoded paths', () => {
  it('has no hardcoded /Users/ paths in source files (excluding config and generated)', () => {
    // Grep for /Users/ in .ts/.tsx files, excluding:
    // - project.config.ts (intentionally has absolute paths)
    // - node_modules/
    // - .next/
    // - __tests__/ (test fixtures may reference paths)
    // - .claude/ (skill configs)
    // - CLAUDE.md files (documentation)
    // - blackboard-live.yaml (runtime state)
    const result = execSync(
      `grep -rn "/Users/" --include="*.ts" --include="*.tsx" . ` +
      `--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=__tests__ --exclude-dir=.claude ` +
      `| grep -v "project.config.ts" ` +
      `| grep -v "CLAUDE.md" ` +
      `| grep -v "blackboard-live" ` +
      `| grep -v ".yaml" ` +
      `|| true`,
      { encoding: 'utf-8', cwd: '/Users/bv/Code/active/kapi-sprints' }
    ).trim()

    const lines = result.split('\n').filter(l => l.trim())
    if (lines.length > 0) {
      console.log('Hardcoded paths found:\n' + lines.join('\n'))
    }
    expect(lines.length).toBe(0)
  })

  it('project.config.ts is the only source of absolute paths', () => {
    // Verify that project.config.ts exports the path constants
    // and other files import from it rather than hardcoding
    const result = execSync(
      `grep -rn "KAPI_DIR\\|OPS_DIR\\|DOCS_DIR" --include="*.ts" --include="*.tsx" . ` +
      `--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=__tests__ ` +
      `| grep "import" | grep -v "project.config" || true`,
      { encoding: 'utf-8', cwd: '/Users/bv/Code/active/kapi-sprints' }
    ).trim()

    const imports = result.split('\n').filter(l => l.trim())
    // Every file that uses KAPI_DIR/OPS_DIR/DOCS_DIR should import from project.config
    for (const line of imports) {
      expect(line).toMatch(/@\/project\.config|\.\.\/.*project\.config|project\.config/)
    }
  })

  it('no hardcoded paths in markdown data files', () => {
    // Check kapi/ markdown files for absolute paths (excluding lessons.md which documents history)
    const result = execSync(
      `grep -rn "/Users/" kapi/ --include="*.md" --include="*.yaml" ` +
      `| grep -v "lessons.md" ` +
      `| grep -v "blackboard-live" ` +
      `| grep -v "sprints/" ` +
      `|| true`,
      { encoding: 'utf-8', cwd: '/Users/bv/Code/active/kapi-sprints' }
    ).trim()

    const lines = result.split('\n').filter(l => l.trim())
    if (lines.length > 0) {
      console.log('Hardcoded paths in data files:\n' + lines.join('\n'))
    }
    expect(lines.length).toBe(0)
  })
})
