# UX-7 — Gateway adapters and integration readiness (candidate)

Status: **INTEGRATION_BOUNDARY_IMPLEMENTED — REAL_BACKEND_NOT_CONNECTED**

Baseline: UX-0…UX-6 on EVOLU Genesis main. This is a review-only integration slice.

## Scope

- PlatformAdapter implements the existing PlatformProvider interface.
- IntelligenceAdapter implements the existing IntelligenceProvider interface.
- Neither adapter changes UX screens, feature controllers or domain names.
- GatewayTransport is deliberately injected; there is **no hardcoded production endpoint, token, Supabase key, deployment, or environment fallback**.
- A no-network test gateway delegates to existing mock providers to verify replaceability at the controller boundary.

## Authority and threat model

Platform owns source-of-record contexts, operational decisions, approvals, commands and append-only audit events. Intelligence owns analytical results and analysis history. Intelligence never writes Platform audit directly.

Only a backend-for-frontend or comparably trusted application gateway may implement the transport for production. The gateway must authenticate the session and determine the **effective** tenant, company, CNPJ, period, entitlements, permissions and capabilities from trusted server-side state. Request payload identity fields are untrusted selectors, not authorization.

Adapter-level guards reject mismatched tenant/CNPJ/period records, version changes, mismatched subject IDs, approval identity replacement and unacknowledged analysis observations. These are **defense in depth only**. They are not a substitute for server-side RLS/authorization or full runtime payload schema validation.

## Gateway method contract (candidate, not deployed)

Input: `{ service: "platform" | "intelligence", operation: string, payload: unknown }`.

Output: the exact response type declared by PlatformProvider/IntelligenceProvider. `recordAnalysisObservation` is acknowledged with `{ accepted: true }` after durable Platform audit persistence. Errors must fail closed, not be silently converted into empty contexts.

Allowed Platform operations: getPortfolioContext, getCompanyWorkspaceContext, getCompanyContext, getFiscalDocuments, getDocumentAnalysisContext, getPendingItems, getReconciliationContext, getApprovals, getAuditHistory, recordAnalysisObservation, recordPendingItem, recordPendingInformation, recordDecision, recordApproval, requestActionExecution.

Allowed Intelligence operations: requestDocumentAnalysis, requestReconciliationAnalysis, explainAnalysis, getAnalysisHistory.

A production transport must use a **fixed operation allowlist**, not arbitrary target method invocation. This test-only in-process delegation is not a production transport implementation.

## Approval and execution

- `recordApproval` must change the **same** existing ApprovalRecord when `approvalId` is present; duplicate decisions are rejected by the server.
- Approval must never automatically call `requestActionExecution`.
- ActionCommand is a separate explicit execution boundary. ApprovalRecord / direct_permission authorization must be checked against persisted server state before any execution.
- Writes must enforce actor permissions, idempotency/replay rules, server-side scope, and immutable audit lineage. No client-side validation authorizes a write.

## Verification

Run `npm run test:adapters` (builds the TS preview runtime then runs the Node-only no-network contract suite). This includes provider substitution through Office queue / NF-e / History controllers, scoped queues, stable approval identity, no implicit execution, and negative scope/schema checks.

## Blocking gates for real integration

1. Identify the canonical Platform service/BFF endpoints, stable protocol (HTTP/RPC), and session authentication boundary. No production route names are guessed here.
2. Approve the Intelligence read/analysis gateway boundary and authorization propagation for tenant/company/CNPJ.
3. Provide a disposable/staging environment with synthetic user, tenant, two companies, two CNPJs and two accounting periods; no tests against real fiscal records.
4. Add exhaustive runtime validation and deny-by-default auth tests: tenant/CNPJ IDOR, privilege/capability denial, period close, duplicate approval, tampered subject, replay/idempotency, stale record, observed-analysis audit ACK.
5. Execute end-to-end request tracing with correlation/causation IDs, immutable event lineage, no unauthorized writes, and rollback checks.
6. Complete the existing browser homologation T-13…T-17 independently; UX-7 must not silently declare UX V1 visually homologated.

**Merge policy:** candidate adapter layer is reviewable separately; real transport wiring, deployment and live operations stay blocked until all applicable gates are evidenced.
