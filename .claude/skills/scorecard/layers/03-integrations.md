# Layer 3 — Integrations (MCP)

**Read these files:**
- `lib/manifest-transformer.ts` — search for `integrations`, `mcp`, `tools`
- `lib/mcp/client.ts` — is `listMCPTools()` called anywhere in the graph execution path?
- `lib/langgraph/tools.ts` — are MCP tools in the agent tool list?
- `lib/canvas/agent-executor.ts` — does canvas execution call MCP tools?

**Key question:** Do LangGraph agents (the primary deployed path) have access to MCP tools, or only the canvas path?
