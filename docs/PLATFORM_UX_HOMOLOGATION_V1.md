# Platform UX Homologation v1

**Status:** STATIC_AND_BEHAVIORAL_CLOSURE_COMPLETE — BROWSER_HOMOLOGATION_PENDING  
**Baseline:** `main@4343eb2967a4d2e59e7e1eb9857bd100a9e77115`  
**Scope:** Platform UX V1 with synthetic providers  
**Out of scope:** UX-7 real adapters / production backend integration

## 1. Closure statement

UX-0 through UX-6 are implemented on the current Platform UX baseline.

This document does **not** declare final visual homologation. The canonical UX specification explicitly requires real browser interaction for layout, zoom, language, table accessibility and cross-page Shell checks. Static/source validation cannot substitute those tests.

The remaining work before a final UX freeze is therefore a browser homologation pass, not a redesign or another feature migration.

## 2. Implemented migration slices

| Slice | State | Evidence |
|---|---|---|
| UX-0 — UX Contracts | complete | domain dictionary, contract catalog and typed contracts on `main` |
| UX-1 — Providers | complete | PlatformProvider, IntelligenceProvider and mock implementations |
| UX-2 — Fiscal Document Detail | complete | NF-e 70031 consumes providers; Recommendation → Decision → ApprovalRecord → ActionResult separation enforced |
| UX-3 — Company Workspace | complete | Tenant → Company → 1..N CnpjEntity and accounting-period context are provider-driven |
| UX-4 — Reconciliation | complete | Evidence → Finding → missingContext; operational PendingItem only through explicit Platform action |
| UX-5 — Pending Items + Approvals | complete | scope-aware first-class queues in Office; ApprovalRecord remains separate from execution |
| UX-6 — Audit + History | complete | Platform AuditHistory + Intelligence AnalysisHistory; existing NF-e timeline reads provider history |
| UX-7 — Real adapters | intentionally deferred | integration phase, not a requirement for synthetic UX closure |

## 3. Canonical regression matrix

Status vocabulary:

- **BEHAVIOR_VERIFIED** — code path was executed against mock providers/controllers and the invariant was observed.
- **SOURCE_VERIFIED** — implementation and route/state logic were inspected and satisfy the stated invariant.
- **BROWSER_PENDING** — source contains the required support, but the specification requires real browser interaction/visual evidence before final approval.

| Test | Expected result | Status | Evidence / observation |
|---|---|---|---|
| T-01 | Office → pending item/document in ≤3 clicks | SOURCE_VERIFIED | route matrix J-01/J-02 validates at 2/3 clicks; contextual URLs are generated without undefined segments |
| T-02 | Company Home → Finance → movement in ≤3 clicks | SOURCE_VERIFIED | J-03 validates at 3 clicks with CNPJ/period preserved |
| T-03 | only authorized Company financial role can answer | SOURCE_VERIFIED | read-only Company mode omits answer actions; normal Company financial role retains reply action |
| T-04 | read-only Finance has no entry/import/send controls | SOURCE_VERIFIED | viewer route is explicit; send route is rejected; preview removes mutation controls for viewer |
| T-05 | switching Matriz/Filial changes scoped records | BEHAVIOR_VERIFIED | CompanyWorkspaceController/MockPlatformProvider enforce authorized CNPJ scope and preserve period |
| T-06 | Aug/Sep data do not bleed across periods | SOURCE_VERIFIED | finance fixtures are keyed by Company/CNPJ/period; Sep-only synthetic import is explicitly blocked in Aug |
| T-07 | evidence/source remains distinct from tax conclusion | SOURCE_VERIFIED | Fiscal/Accounting and Finance wording/state logic explicitly separates evidence review from tax conclusion |
| T-08 | received Company response remains pending until review | SOURCE_VERIFIED | `open → answered → resolved` are distinct states; explicit professional resolve action is required |
| T-09 | evidence review requires sufficient rationale | SOURCE_VERIFIED | review rationale has minimum 12-character validation before review can be recorded |
| T-10 | Advisory context can be released only after review and open items resolved | SOURCE_VERIFIED | `canShare() = role === accounting && flow().state === ready`; `ready` requires all records reviewed and no unresolved requests |
| T-11 | editing after package v1 makes prior version stale | SOURCE_VERIFIED | submitted packet stores fingerprint; changed source data returns state `changed` and displays stale/resubmit state |
| T-12 | resending creates v2 and requires revalidation | SOURCE_VERIFIED | handoff increments `version`, stores new fingerprint, resets movement/document review flags and `released:false` |
| T-13 | sidebar toggle changes width without overlap | BROWSER_PENDING | shared Shell contains collapsed-state layout logic; actual visual overlap must be tested |
| T-14 | short viewport / 200% zoom remains usable | BROWSER_PENDING | responsive/overflow rules exist; actual 200% zoom and short-height behavior must be observed |
| T-15 | English long text is preserved | BROWSER_PENDING | PT/EN dictionaries exist across primary workspaces; clipping/wrapping requires browser observation |
| T-16 | long tables remain fully accessible | BROWSER_PENDING | pagination/scroll containers exist; row accessibility under actual viewport/zoom must be observed |
| T-17 | five primary pages keep coherent Shell/access boundaries | BROWSER_PENDING | route contracts and shared Shell are present; cross-page visual/interaction consistency requires browser run |
| T-18 | Intelligence suggestion never executes autonomously | BEHAVIOR_VERIFIED | NF-e flow requires explicit Decision → ApprovalRecord → separate ActionCommand; unauthorized/fake approval execution is blocked |

## 4. Route/journey evidence

The current `preview/shared-ux/routes.js` validates eleven journeys (J-01…J-11).

Observed static results:
- every journey has a unique ID;
- every declared journey stays within three meaningful clicks;
- Company Finance preserves Matriz/Filial and competence;
- Office pending-item navigation preserves CNPJ and competence;
- a read-only Company role cannot build the Finance send route;
- Office Approvals is first-class through `tab=approvals`;
- route query parameters are treated as navigation context, never authorization.

This is route-contract evidence, not a substitute for clicking the pages in a browser.

## 5. Version/review cycle evidence

The Finance/Accounting synthetic flow implements the V1 package semantics required by T-10/T-12:

```text
Company draft
→ handoff v1
→ Accounting review
→ pending clarification, when necessary
→ explicit evidence review
→ ready
→ explicit release to Advisory

Any source-data edit after handoff
→ fingerprint mismatch
→ changed / stale
→ previous release no longer current
→ resubmit
→ v2
→ previous movement/document reviews reset
→ revalidation required
→ ready
→ release again
```

The handoff action increments the packet version and sets `released:false`. It also resets movement/document review flags. Therefore a resubmitted package cannot inherit the prior review as current.

## 6. Browser homologation still required

Final UX approval requires one interactive run covering at least:

| Gate | Required browser evidence |
|---|---|
| T-13 | toggle expanded/collapsed sidebar on primary Tenant and Company pages; confirm no overlap or hidden controls |
| T-14 | 1440×900, 1366×768, 1280×720, short-height viewport, mobile breakpoint and browser zoom 200%; confirm no silent clipping |
| T-15 | switch to English on primary pages and dialogs; confirm headings/buttons/help text wrap without collision |
| T-16 | exercise lists/tables with pagination and scroll; confirm every row/control remains reachable by keyboard and pointer |
| T-17 | navigate Office, Company Home, Finance, Fiscal/Accounting and Advisory; confirm shared Shell, active navigation, context and access-boundary copy |

Recommended evidence per run:
- page / route;
- viewport;
- role;
- Company/CNPJ/competence;
- interaction path;
- expected result;
- observed result;
- screenshot if available;
- PASS / FAIL;
- corrective commit when FAIL.

## 7. Nomenclature gate

The current baseline passed a repository-wide text scan of the UX source/document set for the retired naming.

Allowed:
- technical repository slug `evolu-genesis` until repository rename.

Not allowed in product/domain/docs/UI language:
- retired product name;
- `EVOLU Platform` as the product name;
- `EVOLU Intelligence` as the product name.

Canonical:
- EVOLU = company/brand;
- Platform = operational product;
- Intelligence = intelligence product;
- UX Contracts = shared language;
- mocks = temporary implementations.

## 8. Engineering caveat

UX-6 passed behavioral runtime regression and static request/contract consistency checks. A fresh independent `tsc` run for the final reconciled UX-6 head was **not** executed in the review environment because the repository could not be materialized there due to network resolution limits. This document does not misrepresent that check as completed.

This caveat is an engineering verification item; it does not change the browser-homologation boundary above.

## 9. Freeze decision

Current state:

```text
UX implementation          COMPLETE through UX-6
Contract-first migration   COMPLETE through UX-6
Nomenclature freeze        COMPLETE
Static/behavioral QA       COMPLETE for T-01…T-12 and T-18
Browser homologation       PENDING for T-13…T-17
Real adapters              UX-7 / separate integration phase
```

Final UX V1 freeze may be declared after T-13…T-17 receive browser evidence with no unresolved blocking defect.

No new UX feature or redesign should be introduced merely to complete this gate. Any failure should be corrected as the smallest possible defect against the current approved architecture.
