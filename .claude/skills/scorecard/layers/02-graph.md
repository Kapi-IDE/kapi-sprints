# Layer 2 — Graph

**Read these files:**
- `lib/manifest-transformer.ts` — search for `graph`, `nodes`, `edges`, `agentConfig`
- `lib/graph-router.ts` — how does it select which graph to run?
- `lib/langgraph/` — what graphs exist, are they dynamic or hardcoded?
- `app/api/chat/route.ts` — does the chat route use the graph config?

**Key question:** Does the runtime execute the graph topology from the manifest, or does it fall back to generic templates?
