# Layer 4 — Knowledge

**Read these files:**
- `lib/manifest-transformer.ts` — search for `knowledge`, `rag`, `topK`, `threshold`
- `lib/rag/` — what does the RAG pipeline read from tenant config?
- `app/api/chat/route.ts` — how is RAG invoked and is it config-driven?

**Key question:** Which RAG parameters (topK, threshold, chunking, vector store) are config-driven vs hardcoded?
