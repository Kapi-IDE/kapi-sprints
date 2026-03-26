# Layer 6 — HITL

**Read these files:**
- `lib/manifest-transformer.ts` — search for `hitl`, `triggers`, `escalation`
- `lib/hitl/` — what's in the HITL runtime?
- `app/api/chat/route.ts` — does it evaluate HITL triggers?
- `app/api/hitl/` — does the queue serve real data?

**Key question:** Is the HITL queue serving real items from the tenant's deployed blueprint, or demo data?
