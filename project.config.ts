import path from 'path'

// ─── Project Configuration ─────────────────────────────────────────────────
// Edit this file to brand the dashboard for your project.

export const PROJECT = {
  /** Your project name — shown in the sidebar header */
  name: 'Kapi Platform',

  /** 2-letter initials (fallback when logo image is not used) */
  short: 'KP',

  /** One-line description (shown in README / about) */
  description: 'Enterprise AI Agent Platform — sprint dashboard',

  /** Link to your source repo (used in README) */
  repo: 'https://github.com/Kapi-IDE/kapi-pm',

  /**
   * Absolute path to the target project's docs/operations/ directory.
   * The dashboard reads sprint data, blackboard, backlog, etc. from here.
   * Defaults to ./docs/operations in the current working directory.
   */
  opsDir: '/Users/bv/Code/active/kapi-platform/docs/operations',
}

/** Resolved absolute path to the operations directory */
export const OPS_DIR = path.isAbsolute(PROJECT.opsDir)
  ? PROJECT.opsDir
  : path.join(process.cwd(), PROJECT.opsDir)

/** Resolved absolute path to the docs root (parent of operations) */
export const DOCS_DIR = path.dirname(OPS_DIR)
