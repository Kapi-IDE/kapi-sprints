---
type: queue
role: Test
timestamp: Mar 25 06PM
title: Bug — targeted directives broadcast to all agents
---

Targeted directives (with assigned_to set to a specific agent) are broadcast to all agents via channel notifications. They should only notify the targeted agent. See blackboard/server.ts broadcastToAgents — needs filtering by assigned_to before broadcast.
