import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started · Kapi Sprints',
}

// ─── Foundation Doc card ──────────────────────────────────────────────────────

interface FoundationDocProps {
  number: number
  title: string
  path: string
  description: string
  questions: string[]
  sections: string[]
}

function FoundationDoc({ number, title, path, description, questions, sections }: FoundationDocProps) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{path}</p>
        </div>
      </div>
      <div className="px-5 py-4 space-y-4">
        <p className="text-sm text-zinc-400">{description}</p>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Claude asks</p>
          <ul className="space-y-1.5">
            {questions.map((q, i) => (
              <li key={i} className="text-xs text-zinc-400 flex gap-2">
                <span className="text-zinc-600 shrink-0 mt-px">›</span>
                <span className="italic">&ldquo;{q}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Generates</p>
          <ul className="space-y-1">
            {sections.map((s, i) => (
              <li key={i} className="text-xs text-zinc-500 font-mono flex gap-2">
                <span className="text-emerald-600">##</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ─── Foundation Check mockup ──────────────────────────────────────────────────

function FoundationCheckMissing() {
  const items = [
    { label: 'Vision & Mission', sub: 'Why does this exist? Who is it for?' },
    { label: 'Market & Users',   sub: 'Who pays? What pain? What alternatives?' },
    { label: 'Product Spec',     sub: 'What are you building? Core flows?' },
  ]
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-zinc-800/60 border-b border-zinc-700/50 text-[11px] text-zinc-400 uppercase tracking-widest">
        Foundation Check
      </div>
      <div className="p-4 space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-red-400 shrink-0">❌</span>
            <div>
              <p className="text-zinc-200 text-xs font-semibold">{item.label}</p>
              <p className="text-zinc-500 text-[11px] mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-zinc-800 space-y-2">
          <p className="text-zinc-500 text-xs">You need all 3 before your first sprint.</p>
          <p className="text-zinc-400 text-xs">I&apos;ll help you write them — takes ~15 min.</p>
          <button className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors">
            Start with Vision →
          </button>
        </div>
      </div>
    </div>
  )
}

function FoundationCheckPartial() {
  const items = [
    { label: 'Vision & Mission', path: 'docs/foundation/vision.md', status: 'ok'   as const },
    { label: 'Market & Users',   path: 'Thin — no ICP',             status: 'warn' as const },
    { label: 'Product Spec',     path: 'docs/foundation/spec.md',   status: 'ok'   as const },
  ]
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-zinc-800/60 border-b border-zinc-700/50 text-[11px] text-zinc-400 uppercase tracking-widest">
        Foundation Check
      </div>
      <div className="p-4 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="shrink-0">
              {item.status === 'ok'   && <span className="text-emerald-400">✅</span>}
              {item.status === 'warn' && <span className="text-amber-400">⚠️</span>}
            </span>
            <div>
              <p className="text-zinc-200 text-xs font-semibold">{item.label}</p>
              <p className={`text-[11px] mt-0.5 ${item.status === 'warn' ? 'text-amber-500' : 'text-zinc-500'}`}>
                {item.path}
              </p>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-zinc-800 space-y-2">
          <p className="text-zinc-400 text-xs">Market doc needs an Ideal Customer Profile.</p>
          <p className="text-zinc-500 text-xs">Want me to help flesh it out?</p>
          <div className="flex gap-2 mt-2">
            <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors">
              Fix Market Doc
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-500 text-xs hover:bg-zinc-700 transition-colors">
              Skip — sprint anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Flow step ────────────────────────────────────────────────────────────────

function FlowStep({ label, sub, connector = true }: { label: string; sub?: string; connector?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
        {label}
      </div>
      {sub && <p className="text-[10px] text-zinc-600 max-w-[160px]">{sub}</p>}
      {connector && <div className="text-zinc-700 text-lg leading-none">↓</div>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* Nav */}
      <nav className="h-9 flex items-center px-4 gap-3 border-b border-zinc-800/80 bg-zinc-950 select-none">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/kapi_logo.png" alt="Kapi Sprints" width={16} height={16} className="object-contain opacity-80" />
          <span className="text-xs font-medium text-zinc-400">Kapi Sprints</span>
        </Link>
        <span className="text-zinc-800">/</span>
        <span className="text-xs font-mono text-zinc-300">get started</span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/v1" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">
            → open dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">

        {/* Hero */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest font-mono">
              Setup
            </span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
            Before your first sprint
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            You don&apos;t start by coding. You don&apos;t even start by speccing features.
            You start by knowing <em className="text-zinc-200 not-italic font-medium">why</em>.
          </p>
          <div className="pt-2">
            <code className="text-sm bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-emerald-400 font-mono">
              /sprint init
            </code>
            <span className="text-zinc-600 text-sm ml-3">— run this once, before everything else</span>
          </div>
        </div>

        {/* Flow */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-zinc-100">The Foundation Gate</h2>
          <p className="text-sm text-zinc-400">
            <code className="font-mono text-zinc-300">/sprint init</code> won&apos;t let you create a sprint until three foundation docs exist.
            Missing docs get generated conversationally — takes about 15 minutes total.
          </p>

          <div className="flex flex-col items-center gap-0 py-4">
            <FlowStep label="/sprint init" />
            <FlowStep label="Foundation check" sub="Scans for 3 required docs" />
            <div className="grid grid-cols-3 gap-4 w-full max-w-xl py-2">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">Missing</div>
                <p className="text-[10px] text-zinc-600">Claude generates via conversation (~15 min)</p>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-mono">Thin ⚠️</div>
                <p className="text-[10px] text-zinc-600">Claude suggests what to flesh out</p>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">All ✅</div>
                <p className="text-[10px] text-zinc-600">Proceed to sprint setup</p>
              </div>
            </div>
            <div className="text-zinc-700 text-lg leading-none">↓</div>
            <FlowStep label="Quality layers" sub="Claude reads your docs, suggests what to audit" />
            <FlowStep label="Sprint scaffold" sub="Creates v1 directory + blackboard" />
            <FlowStep label="/preflight v1" connector={false} sub="Validate before you build" />
          </div>
        </section>

        {/* Before / After */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-zinc-100">What the check looks like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Fresh project</p>
              <FoundationCheckMissing />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Docs exist, one thin</p>
              <FoundationCheckPartial />
            </div>
          </div>
        </section>

        {/* Three docs */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">The three foundation docs</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Generated conversationally if they don&apos;t exist. You answer questions, Claude writes the doc.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FoundationDoc
              number={1}
              title="Vision & Mission"
              path="docs/foundation/vision.md"
              description="Why does this exist? What world are you creating, and how?"
              questions={[
                'What problem does this solve that nobody else is solving well?',
                'If this succeeds wildly in 3 years, what does the world look like?',
                'Who specifically suffers without this?',
              ]}
              sections={['Vision', 'Mission', 'Why Now', 'Why You']}
            />
            <FoundationDoc
              number={2}
              title="Market & Users"
              path="docs/foundation/market.md"
              description="Who pays? What pain? What have they tried that failed?"
              questions={[
                'Who is the primary buyer? Describe them specifically.',
                'What do they do today without your product?',
                'What have they tried that failed? Why?',
                'How much do they pay for the current bad solution?',
              ]}
              sections={['Ideal Customer Profile', 'Current Alternatives', 'Willingness to Pay', 'Market Size']}
            />
            <FoundationDoc
              number={3}
              title="Product Spec"
              path="docs/foundation/spec.md"
              description="What exactly are you building? What are the core flows?"
              questions={[
                'What are the 3–5 core user flows?',
                'What\'s the simplest version that delivers value?',
                'What are you explicitly NOT building?',
              ]}
              sections={['Core Flows', 'MVP Scope', 'Out of Scope', 'Success Criteria']}
            />
          </div>
        </section>

        {/* What you get */}
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">What gets generated</h2>
            <p className="text-sm text-zinc-400 mt-1">
              After the foundation gate passes, <code className="font-mono text-zinc-300">/sprint init</code> scaffolds everything you need.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-zinc-800/60 border-b border-zinc-700/50 text-[11px] text-zinc-400 uppercase tracking-widest font-mono">
              Output
            </div>
            <div className="px-5 py-4 font-mono text-xs space-y-2">
              {[
                'kapi-sprints.config.md',
                'docs/foundation/vision.md',
                'docs/foundation/market.md',
                'docs/foundation/spec.md',
                'docs/operations/sprints/v1/',
                'docs/operations/blackboard/',
              ].map((path) => (
                <div key={path} className="flex items-center gap-3">
                  <span className="text-emerald-500">✓</span>
                  <span className="text-zinc-300">{path}</span>
                </div>
              ))}
              <p className="text-zinc-600 text-[11px] pt-2 border-t border-zinc-800 mt-3">
                Then run <span className="text-zinc-400">/preflight v1</span> to validate before your first sprint.
              </p>
            </div>
          </div>
        </section>

        {/* Commands reference */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-zinc-100">Sprint commands</h2>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden divide-y divide-zinc-800/60">

            <div className="px-5 py-2 bg-zinc-800/40">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Setup — run once</span>
            </div>
            {[
              { cmd: '/sprint init',  desc: 'Foundation gate + project scaffold' },
            ].map(({ cmd, desc }) => (
              <div key={cmd} className="flex items-center gap-4 px-5 py-3">
                <code className="text-xs font-mono text-emerald-400 w-44 shrink-0">{cmd}</code>
                <span className="text-xs text-zinc-400">{desc}</span>
              </div>
            ))}

            <div className="px-5 py-2 bg-zinc-800/40">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Sprint — repeat each version</span>
            </div>
            {[
              { cmd: '/preflight v1',   desc: 'Pre-sprint health check — go/no-go verdict' },
              { cmd: '/prd v1',         desc: 'Plan the sprint — interactive, produces tasks.md' },
              { cmd: '/dev v1',         desc: 'Implement tasks with TDD + Playwright screenshots' },
              { cmd: '/scorecard v1',   desc: 'Audit quality layers defined in your config' },
              { cmd: '/walkthrough v1', desc: 'Generate sprint review narrative' },
            ].map(({ cmd, desc }) => (
              <div key={cmd} className="flex items-center gap-4 px-5 py-3">
                <code className="text-xs font-mono text-emerald-400 w-44 shrink-0">{cmd}</code>
                <span className="text-xs text-zinc-400">{desc}</span>
              </div>
            ))}

            <div className="px-5 py-2 bg-zinc-800/40">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Blackboard — anytime</span>
            </div>
            {[
              { cmd: '/post',       desc: 'Post a finding, blocker, or decision to the board' },
              { cmd: '/checkpoint', desc: 'Save agent session state to the blackboard' },
              { cmd: '/resume',     desc: 'Restore context after a break or crash' },
            ].map(({ cmd, desc }) => (
              <div key={cmd} className="flex items-center gap-4 px-5 py-3">
                <code className="text-xs font-mono text-emerald-400 w-44 shrink-0">{cmd}</code>
                <span className="text-xs text-zinc-400">{desc}</span>
              </div>
            ))}

          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-8 py-8 space-y-5">
          <p className="text-zinc-300 text-sm font-semibold">Ready? Here&apos;s the sequence.</p>
          <div className="space-y-3">
            {[
              { n: '1', code: '/sprint init',                         note: 'in Claude Code — foundation gate + scaffold' },
              { n: '2', code: 'npx kapi-sprints dashboard',           note: 'in a separate terminal — opens the dashboard' },
              { n: '3', code: '/preflight v1',                        note: 'back in Claude Code — validate before building' },
              { n: '4', code: '/prd v1',                              note: 'plan your first sprint' },
            ].map(({ n, code, note }) => (
              <div key={n} className="flex items-start gap-4">
                <span className="text-[10px] font-bold text-emerald-700 font-mono mt-2 shrink-0 w-4">{n}.</span>
                <div>
                  <code className="text-sm text-emerald-400 font-mono bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800 block">
                    {code}
                  </code>
                  <p className="text-[11px] text-zinc-600 mt-1.5 font-mono">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
