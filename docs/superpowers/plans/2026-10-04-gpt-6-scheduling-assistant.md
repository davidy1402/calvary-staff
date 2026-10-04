# GPT-6 Scheduling Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in GPT-6.1 Sol assistant that produces safe, reviewable roster-change drafts without changing the LocalStorage-first core workflow.

**Architecture:** A Vercel serverless endpoint calls the OpenAI Responses API with one strict `propose_roster_patch` tool. The browser sends a minimized roster snapshot, validates every returned operation against its current `ChurchContext` state, then exposes a before/after preview. Only a second explicit editor action calls the existing context mutation methods.

**Tech Stack:** React 19, TypeScript, Vite 8, Vercel Functions, OpenAI JavaScript SDK, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-04-gpt-6-scheduling-assistant.md`

## Global Constraints

- Keep the app fully usable without an OpenAI key or network connection.
- Target `gpt-6.1-sol` with `reasoning.effort: "medium"` in the pilot.
- Use the Responses API; do not use Chat Completions for GPT-6.1 Sol tool calling.
- Do not send phone numbers, avatars, coworker notes, or unrelated rosters to the server.
- `propose_roster_patch` returns data only; only the browser may call `ChurchContext` mutations after confirmation.
- Do not set `temperature`, `top_p`, `top_logprobs`, or `logprobs` on a reasoning request.
- Preserve the existing user changes in `src/components/BottomNav.tsx` and `src/components/BottomPullEasterEgg.tsx`; they are outside this feature.

---

## File map

| Path | Responsibility |
| --- | --- |
| `src/lib/rosterAssistant/contracts.ts` | Shared request, patch, preview, and result TypeScript contracts. |
| `src/lib/rosterAssistant/buildContext.ts` | Builds a minimized, date-scoped model context and excludes sensitive coworker fields. |
| `src/lib/rosterAssistant/validatePatch.ts` | Validates model operations against the current state and produces a confirmable preview. |
| `src/lib/rosterAssistant/assistantApi.ts` | Browser fetch wrapper; disabled when the feature flag is absent. |
| `src/components/RosterAssistantSheet.tsx` | Editor-only request, clarification, refusal, and preview UI. |
| `src/components/RosterScreen.tsx` | Opens the assistant sheet; applies confirmed operations through existing context methods. |
| `api/roster-assistant.ts` | Vercel endpoint; calls Responses API and returns only parsed tool arguments. |
| `api/roster-assistant.test.ts` | Endpoint contract tests with the OpenAI client mocked. |
| `src/lib/rosterAssistant/*.test.ts` | Context minimization and patch-validation tests. |
| `src/test/setup.ts` | Testing Library setup. |
| `vite.config.ts` | Adds Vitest configuration without changing the production build. |
| `README.md` | Documents opt-in setup, privacy boundary, and explicit-confirmation behavior. |
| `vercel.json` | Makes the SPA fallback explicit while preserving `/api/*` functions. |

### Task 1: Establish the feature boundary and test harness

**Files:**
- Create: `src/lib/rosterAssistant/contracts.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json`
- Modify: `vite.config.ts`
- Test: `src/lib/rosterAssistant/contracts.test.ts`

**Interfaces:**
- Produces `RosterAssistantRequest`, `RosterPatch`, `RosterPatchOperation`, and `RosterAssistantResult` for every later task.
- `RosterPatchOperation` is `{ kind: 'assign' | 'remove' | 'setDutyNote'; serviceId: string; date: string; roleId: string; coworkerId?: string; note?: string }`.

- [ ] **Step 1: Add the test tools**

Run:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Then add this script in `package.json`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing contract test**

Create `src/lib/rosterAssistant/contracts.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { RosterPatchOperation } from './contracts';

describe('RosterPatchOperation', () => {
  it('represents an assignment without any coworker contact field', () => {
    const operation: RosterPatchOperation = {
      kind: 'assign', serviceId: 'sunday-am', date: '2026-10-18',
      roleId: 'audio', coworkerId: 'cw_huiyi',
    };
    expect('phone' in operation).toBe(false);
  });
});
```

- [ ] **Step 3: Define the shared contracts**

Create `contracts.ts` with the exact types from the interface block, plus:

```ts
export type RosterAssistantResult =
  | { kind: 'patch'; patch: RosterPatch }
  | { kind: 'clarification'; question: string }
  | { kind: 'refusal'; reason: string };

export interface RosterAssistantRequest {
  instruction: string;
  context: RosterAssistantContext;
  safetyIdentifier: string;
}
```

- [ ] **Step 4: Configure and run tests**

Set `test.environment` to `jsdom` and `test.setupFiles` to `['./src/test/setup.ts']` in the Vite config, then run:

```bash
npm test -- src/lib/rosterAssistant/contracts.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/test src/lib/rosterAssistant/contracts.ts src/lib/rosterAssistant/contracts.test.ts
git commit -m "test: add roster assistant contract harness"
```

### Task 2: Minimize the model context

**Files:**
- Create: `src/lib/rosterAssistant/buildContext.ts`
- Test: `src/lib/rosterAssistant/buildContext.test.ts`

**Interfaces:**
- Consumes: `ChurchState`, `ServiceRoster`, and `RosterAssistantContext` from Task 1.
- Produces: `buildRosterAssistantContext(state, serviceId, date): RosterAssistantContext`.

- [ ] **Step 1: Write the failing privacy test**

```ts
it('omits phone, avatar, notes, and other-date rosters', () => {
  const context = buildRosterAssistantContext(state, 'sunday-am', '2026-10-18');
  expect(JSON.stringify(context)).not.toContain('012-3456789');
  expect(JSON.stringify(context)).not.toContain('data:image/png;base64');
  expect(context.rosters).toHaveLength(1);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- src/lib/rosterAssistant/buildContext.test.ts
```

Expected: FAIL because `buildRosterAssistantContext` is not defined.

- [ ] **Step 3: Implement the minimized snapshot**

Expose only this coworker projection:

```ts
{ id: coworker.id, name: coworker.name, englishName: coworker.englishName,
  qualifiedRoleIds: coworker.qualifiedRoleIds, active: coworker.active }
```

Filter rosters to `roster.serviceId === serviceId && roster.date === date`; include only that service’s roles and the target roster’s assignments and duty notes.

- [ ] **Step 4: Run the focused test**

```bash
npm test -- src/lib/rosterAssistant/buildContext.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rosterAssistant/buildContext.ts src/lib/rosterAssistant/buildContext.test.ts src/lib/rosterAssistant/contracts.ts
git commit -m "feat: minimize roster assistant context"
```

### Task 3: Validate every draft locally before preview

**Files:**
- Create: `src/lib/rosterAssistant/validatePatch.ts`
- Test: `src/lib/rosterAssistant/validatePatch.test.ts`

**Interfaces:**
- Consumes: `RosterPatch`, `ChurchState`, and the selected roster.
- Produces: `validateRosterPatch(patch, state): { valid: boolean; operations: RosterPatchOperation[]; errors: string[]; warnings: ConflictItem[] }`.

- [ ] **Step 1: Write failing tests for the safety gate**

```ts
it('rejects an unknown coworker without mutating state', () => {
  const result = validateRosterPatch(inventedCoworkerPatch, state);
  expect(result.valid).toBe(false);
  expect(result.errors).toContain('Unknown coworker: cw_invented');
});

it('flags an existing same-date collision before confirmation', () => {
  const result = validateRosterPatch(conflictingPatch, state);
  expect(result.valid).toBe(true);
  expect(result.warnings).toHaveLength(1);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- src/lib/rosterAssistant/validatePatch.test.ts
```

Expected: FAIL because `validateRosterPatch` is not defined.

- [ ] **Step 3: Implement deterministic validation**

Reject an operation when its date, service, role, or coworker does not exist; when a coworker is inactive; when an assignment violates `qualifiedRoleIds`; or when `setDutyNote` lacks a note. Deduplicate identical operations. Build a temporary copy of assignments, calculate collisions with the same service/date semantics as `getCoworkerDateConflicts`, and return them as warnings. Do not import or mutate `ChurchContext`.

- [ ] **Step 4: Run the focused test**

```bash
npm test -- src/lib/rosterAssistant/validatePatch.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rosterAssistant/validatePatch.ts src/lib/rosterAssistant/validatePatch.test.ts
git commit -m "feat: validate roster assistant drafts locally"
```

### Task 4: Add the server-only GPT-6.1 Sol adapter

**Files:**
- Create: `api/roster-assistant.ts`
- Create: `api/roster-assistant.test.ts`
- Create: `vercel.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: `RosterAssistantRequest` from Task 1.
- Produces: `POST /api/roster-assistant` with a `RosterAssistantResult` JSON body.

- [ ] **Step 1: Add the server dependency**

```bash
npm install openai
```

- [ ] **Step 2: Write a failing endpoint test**

Mock the OpenAI client and assert:

```ts
expect(responses.create).toHaveBeenCalledWith(expect.objectContaining({
  model: 'gpt-6.1-sol',
  reasoning: { effort: 'medium' },
  tools: [expect.objectContaining({ name: 'propose_roster_patch', strict: true })],
  safety_identifier: expect.any(String),
}));
```

Also assert the function returns `400` for an invalid body and never includes `OPENAI_API_KEY` in a response.

- [ ] **Step 3: Run the test to verify it fails**

```bash
npm test -- api/roster-assistant.test.ts
```

Expected: FAIL because the endpoint does not exist.

- [ ] **Step 4: Implement the endpoint**

Read `OPENAI_API_KEY` only from the server environment. Reject non-POST requests with `405`; validate the request has a non-empty `instruction`, a bounded context object, and a non-empty opaque `safetyIdentifier`. Call the Responses API with `model: 'gpt-6.1-sol'`, `reasoning: { effort: 'medium' }`, the one strict `propose_roster_patch` function schema, and system instructions requiring exactly one patch, clarification, or refusal. Parse the tool call; return a `502` if it is absent or malformed. Never execute the operations server-side.

- [ ] **Step 5: Add Vercel routing and run tests**

Set the SPA fallback in `vercel.json` so it excludes `/api/*`, then run:

```bash
npm test -- api/roster-assistant.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add api/roster-assistant.ts api/roster-assistant.test.ts vercel.json package.json package-lock.json
git commit -m "feat: add server-only GPT-6 roster draft endpoint"
```

### Task 5: Add an editor-only, confirm-before-apply interface

**Files:**
- Create: `src/lib/rosterAssistant/assistantApi.ts`
- Create: `src/components/RosterAssistantSheet.tsx`
- Modify: `src/components/RosterScreen.tsx`
- Test: `src/components/RosterAssistantSheet.test.tsx`

**Interfaces:**
- Consumes: `buildRosterAssistantContext`, `validateRosterPatch`, `POST /api/roster-assistant`, and `ChurchContext` mutation methods.
- Produces: an editor-only assistant entry point and an explicit `Apply draft` confirmation action.

- [ ] **Step 1: Write the failing confirmation test**

```tsx
it('does not call assignCoworker until the editor confirms the preview', async () => {
  render(<RosterAssistantSheet {...props} />);
  await userEvent.click(screen.getByRole('button', { name: 'Generate draft' }));
  expect(assignCoworker).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Apply draft' }));
  expect(assignCoworker).toHaveBeenCalledWith('audio', 'cw_huiyi', '2026-10-18', 'sunday-am');
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- src/components/RosterAssistantSheet.test.tsx
```

Expected: FAIL because the sheet does not exist.

- [ ] **Step 3: Implement the feature gate and sheet**

Show the entry point only when `import.meta.env.VITE_ENABLE_ROSTER_ASSISTANT === 'true'` and `isEditMode` is true. Give the sheet three result states: clarification, refusal, and preview. In preview, show every before/after operation and all collision warnings. Disable `Apply draft` when validation has errors. Its only mutation mapping is: `assign` to `assignCoworker`, `remove` to `removeAssignment`, and `setDutyNote` to `updateDutyNote`.

- [ ] **Step 4: Generate a device-safe identifier**

In `assistantApi.ts`, generate a UUID once and store it in `localStorage` under `calvary_roster_assistant_safety_id`. Send this opaque value as `safetyIdentifier`; do not use a person’s name or phone number.

- [ ] **Step 5: Run the component test**

```bash
npm test -- src/components/RosterAssistantSheet.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/rosterAssistant/assistantApi.ts src/components/RosterAssistantSheet.tsx src/components/RosterAssistantSheet.test.tsx src/components/RosterScreen.tsx
git commit -m "feat: add confirm-before-apply roster assistant UI"
```

### Task 6: Evaluate, document, and release a guarded pilot

**Files:**
- Create: `src/lib/rosterAssistant/fixtures.ts`
- Create: `src/lib/rosterAssistant/fixtures.test.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: the Task 2 context builder, Task 3 validator, and Task 4 endpoint.
- Produces: 25 explicit evaluation fixtures and operational setup documentation.

- [ ] **Step 1: Create the 25-case fixture set**

Include at least: direct assign, removal, duty-note update, Chinese dates, English dates, ambiguous date, ambiguous service, unknown coworker, inactive coworker, unqualified coworker, duplicate request, an existing collision, a collision created by the draft, mixed-language request, empty request, malformed model response, and a request to send WhatsApp. Mark the expected result for each as `patch`, `clarification`, or `refusal`.

- [ ] **Step 2: Write the failing evaluation test**

```ts
it.each(fixtures)('$id returns the required safe outcome', async (fixture) => {
  const result = await requestRosterAssistant(fixture.request);
  expect(result.kind).toBe(fixture.expectedKind);
  if (result.kind === 'patch') {
    expect(validateRosterPatch(result.patch, fixture.state).errors).toEqual([]);
  }
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npm test -- src/lib/rosterAssistant/fixtures.test.ts
```

Expected: FAIL until fixtures and deterministic test doubles exist.

- [ ] **Step 4: Make the fixtures deterministic**

Use mocked endpoint responses for unit tests. Run the same fixtures manually against a staging deployment before enabling the feature, recording only fixture IDs, outcome kind, latency, token usage, and whether a human accepted the draft. Do not record full roster content or personal data.

- [ ] **Step 5: Document deployment and rollback**

In `README.md`, document `OPENAI_API_KEY` as a Vercel server-side environment variable and `VITE_ENABLE_ROSTER_ASSISTANT=false` as the immediate rollback switch. State that editor mode is only a UI mode, not access control, and that the assistant never writes or sends messages without confirmation.

- [ ] **Step 6: Run the final checks**

```bash
npm test
npm run lint
npm run build
```

Expected: all pass. Then use a mobile viewport to confirm the off-state, draft preview, collision warning, confirmation, and offline fallback.

- [ ] **Step 7: Commit**

```bash
git add src/lib/rosterAssistant/fixtures.ts src/lib/rosterAssistant/fixtures.test.ts README.md
git commit -m "test: gate GPT-6 roster assistant pilot"
```

## Self-review

- Spec coverage: Tasks 1–3 establish contracts, data minimization, and local validation; Task 4 adds the only server boundary and GPT-6.1 Sol configuration; Task 5 enforces editor-only explicit confirmation; Task 6 evaluates the 25 fixtures, documents privacy, and verifies release/rollback.
- Placeholder scan: no omitted implementation steps; every task names files, interfaces, commands, and an independently verifiable result.
- Type consistency: `RosterAssistantRequest`, `RosterAssistantResult`, `RosterPatch`, and `RosterPatchOperation` originate in Task 1 and are consumed consistently by Tasks 2–6.

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-04-gpt-6-scheduling-assistant.md`. Two execution options:

1. **Subagent-Driven (recommended)**: dispatch a fresh subagent per task and review between tasks.
2. **Inline Execution**: execute tasks in this session using `executing-plans`, with checkpoints for review.

Choose an option only after the internal Beta has validated the existing non-AI roster workflow.
