# GPT-6 Scheduling Assistant Specification

## Background

CCCJB Connect is a React/Vite PWA whose roster, coworkers, and permissions currently live only in browser LocalStorage. It has no OpenAI SDK, API route, server, or model configuration. The product must retain its offline, zero-backend roster workflow during its core Beta.

## Product decision

Do not add AI to the core Beta path. After the core Beta is accepted by the internal group, introduce it as an opt-in **Roster Draft Assistant** behind a feature flag. It converts a coordinator's natural-language request into a proposed roster patch; it never edits the roster, sends WhatsApp, or makes a pastoral decision autonomously.

## Target model

Use `gpt-6.1-sol` through the Responses API with `reasoning.effort: "medium"` for the pilot. It is the appropriate default here: OpenAI positions it as near-Astra performance at a lower cost for complex coding, computer-use, and professional work. The application has a small number of high-consequence scheduling requests, so correctness and clear uncertainty matter more than maximum throughput.

Do not use GPT-6 Astra in the end-user path initially. Keep it as an offline evaluation comparator only if the Sol pilot misses the acceptance criteria. Do not add GPT-6 Luna until a measured high-volume, lower-risk workload exists.

## Required user flow

1. An editor types a Chinese or English request, for example: “10 月 18 日早堂的音响改给惠仪，备注 8:30 到。”
2. The client sends only the relevant service, date, roles, assignments, coworker names/IDs, and role qualifications to a server endpoint.
3. The server asks GPT-6.1 Sol for exactly one of: a roster patch, a clarification question, or a refusal/explanation.
4. The client validates the returned patch against the current LocalStorage state and existing conflict rules.
5. The editor sees an explicit before/after preview, including conflicts. Nothing changes until the editor confirms.
6. On confirmation, the client calls the existing `ChurchContext` mutation methods. The existing LocalStorage backup/export and offline browsing behavior remain unchanged.

## Non-goals

- No OpenAI key in browser code, source control, LocalStorage, or exported backups.
- No automatic roster writes, WhatsApp sends, or background actions.
- No cloud database, account system, or synchronization between devices in this phase.
- No phone number, avatar, coworker notes, full roster history, or unrelated personal data in model input.
- No claim that LocalStorage editor mode is authentication or authorization.

## Architecture

- Host the existing Vite application and one same-origin serverless endpoint on Vercel for the opt-in pilot. The API key remains in Vercel environment variables.
- Use the Responses API because GPT-6.1 Sol requires it for tool calling. Define one strict `propose_roster_patch` function tool. The server returns the tool arguments as data; it never executes a mutation itself.
- Use a separate client-side validator as the final authority. It validates IDs, dates, role eligibility, deduplicates IDs, and marks any cross-service conflict before a preview can be confirmed.
- Send a stable, random, privacy-preserving device identifier as `safety_identifier`; never derive it from a name, phone number, email, or IP address.

## Acceptance criteria

- The feature is disabled unless `VITE_ENABLE_ROSTER_ASSISTANT=true`.
- A malformed or model-invented patch cannot alter LocalStorage.
- A valid draft needs an explicit editor confirmation before `ChurchContext` mutation methods run.
- The API payload excludes `Coworker.phone`, `Coworker.avatar`, `Coworker.notes`, and unrelated rosters.
- The 25-fixture evaluation set achieves 100% valid response shapes, 100% no-write-on-clarification/refusal behavior, and no unflagged collision in the fixtures that contain a collision.
- `npm run lint` and `npm run build` pass, and the assistant flow is manually checked on a mobile viewport and offline mode.

## References

- Official OpenAI documentation: https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra
- Official OpenAI pricing: https://platform.openai.com/pricing
