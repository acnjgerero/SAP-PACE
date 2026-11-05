# Catalog agent in the service-catalog app

Status: idea, not started
Logged: 2026-11-05

## Idea

Add an AI chat to `app/service-catalog`. Users can ask about active services and requests, and ask the agent to update records. Every update needs user approval before it runs.

## How the agent works

- Built with `@cap-js/agents`, which gets its tools from `@cap-js/mcp`.
- `describe` lists entities and fields.
- `query` runs `SELECT` only.
- `call` runs unbound actions and functions only.
- There is no create, update or delete tool, so every update must be an action we write.

## Design

- Create a separate `CatalogAgentService`. Do not annotate `Catalog`, because everything in an `@agent` service is exposed to the agent.
- Expose Services, Plans, and only the request fields the agent needs.
- Leave out `clientName` and the POC fields unless the model is approved for that data.
- Use narrow unbound actions, with no generic "update anything" action.
- Annotate every action with `@agent.hitl`.
- Validate in each handler and return the old and new values.
- Leave delete out for now.

## Planned actions

| Action | Purpose |
|---|---|
| `setServiceActive(serviceID, active)` | Activate or deactivate a service |
| `updateServiceDescription(serviceID, description)` | Edit a description |
| `updatePlanPrice(planID, newPrice)` | Change a price |
| `updateRequestStatus(requestID, status)` | Move a request to a new status |
| `updateRequestQuantity(lineID, quantity)` | Change a quantity |

## AGENTS.md rules

- `status = true` means active; `false` means inactive.
- Answer only from tool results.
- Find the exact record before proposing a change.
- If several records match, ask the user which one.
- After a change, report the old and new values.

## Todos

### 1. Read-only agent

- [ ] Run `npm add @cap-js/agents`
- [ ] Create `srv/catalog-agent-service.cds`
- [ ] Create `srv/AGENTS.md`
- [ ] Test "Show active services" in the Chat Preview

### 2. First update action

- [ ] Add `setServiceActive` and its handler in `srv/catalog-agent-service.js`
- [ ] Test approve: the status changes only after approval
- [ ] Test reject: nothing changes
- [ ] Test an unclear request: "Deactivate the AI service" should ask AI Core or SAP AI Launchpad

### 3. Other actions

- [ ] Add the remaining actions one at a time

### 4. Fiori chat

- [ ] Add a Chat button to the list page with a controller extension
- [ ] Add a dialog or side panel that calls `/a2a/<service>`
- [ ] Show proposed changes with Approve and Reject buttons
- [ ] Refresh the list after an approved change

### 5. Deployment

- [ ] Add roles to the agent service
- [ ] Add `/odata` and `/a2a` routes to `app/service-catalog/xs-app.json`
- [ ] Configure the SAP AI Core model under `cds.requires.llm`

## To check

- How a client sends an approval or rejection. The CAP guide does not explain it, so test in the Chat Preview first.
- Which user the agent acts as.
- Whether the actions can be called through OData without approval. If so, protect them with roles.
- Draft: cds 10 rejects direct updates to a record with an open draft. Actions should show that error clearly if draft is added later.

## Notes

- `@cap-js/agents` is pre-1.0 (0.9.10 when logged), and the Chat Preview is Alpha.
- Local development defaults to the `auto` model, which sends sample data to the local Claude Code, Codex or OpenCode setup. Use `mock` to test the wiring only.
- The deployment needs a HANA database available to the Cloud Foundry space.

## References

- [CAP agents guide](https://cap.cloud.sap/docs/guides/ai/cap-agents)
- [`@cap-js/agents` on GitHub](https://github.com/cap-js/agents)
- [`@cap-js/mcp` on GitHub](https://github.com/cap-js/mcp)
