# Tickets — Template and Guidelines

Use this scaffold for every ticket. Keep scope tight and acceptance criteria explicit.

## Ticket Scaffold

### <Ticket ID> — <Short, imperative title>

**Problem**  
One sentence describing the gap in the user flow.

**Scope**  
What to change, where (files), and what NOT to touch.

**Acceptance Criteria (AC)**
- [ ] AC-1 …
- [ ] AC-2 …
- [ ] AC-3 …

**Definition of Done (DoD)**
- [ ] No console errors; lint/typecheck/tests green
- [ ] Playwright smoke added/updated (path: `tests/e2e/<area>.spec.ts`)
- [ ] Minimal docs updated if behavior is user-visible (`README`/`UI_GUIDELINES`)
- [ ] Screenshots embedded inline in PR body (required views per template); CI artifact "screenshots" uploaded

**Where**
- UI: `src/pages/...`, `src/components/...`
- Logic/Mocks: `src/lib/mocks/...`, `fixtures/...`

**Test Notes**  
- How to reproduce and verify quickly (URLs, user actions, expected text/aria)

---

## Usage
- Create tickets in the tracker using this exact scaffold.
- For prioritised execution, list P0 items in `docs/TICKETS_P0.md` (first unchecked runs next).
- Keep future items in `docs/TICKETS_BACKLOG.md` until ready to ticketize and move to P0.
- Link ticket ID in branch names and PRs, per Workflow rule 100-01.


