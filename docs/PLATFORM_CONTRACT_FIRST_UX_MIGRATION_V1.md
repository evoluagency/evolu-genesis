# Platform — Contract-First Migration Plan v1

> Canonical architecture source: [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md). Architecture decisions must be updated there before or together with UX implementation.

## Current repository reality

The current `Platform public UX repository` repository is a static public experience.

Current structure includes:
- index.html
- landing.js
- script.js
- v22.js
- v23.js
- CSS files
- /demo/
- /docs/

There is currently no:
- package.json
- src/
- typed contract layer
- provider abstraction layer

The existing operational demo already contains useful product semantics:
- Tenant branding (NEXUS)
- selected company (ACME Industrial)
- Fiscal Documents
- Accounting Entries
- Reconciliation
- public label “Informações da empresa”
- internal `context-ledger`
- contextual EVOLU panel
- explicit separation between suggestion and applied change

Therefore, do not rewrite the existing demo immediately.

## Migration rule

Preserve the current public demo while introducing the new contract-first structure alongside it.

legacy static demo
→ remains deployable
→ new src/domain/contracts/providers is introduced
→ features migrate one-by-one

Only remove legacy global-script structures after equivalent flows exist in the modular UX.

## Target structure

src/
  domain/
    tenant/
    company/
    fiscal/
    accounting/
    analysis/
    recommendation/
    approval/
    audit/

  contracts/
    contexts/
    requests/
    results/
    commands/
    events/
    capabilities/

  providers/
    platform/
      PlatformProvider
      MockPlatformProvider
    intelligence/
      IntelligenceProvider
      MockIntelligenceProvider

  mocks/
    scenarios/
    fixtures/

  features/
    portfolio/
    company-workspace/
    fiscal-documents/
    accounting-entries/
    reconciliation/
    pending-items/
    approvals/
    audit-history/
    evolu/

  components/
    domain/
    ui/

## Current → canonical mapping

| Current Platform concept | Canonical next concept |
|---|---|
| NEXUS tenant brand | Tenant instance |
| ACME Industrial | Company instance |
| implicit single CNPJ | explicit CnpjEntity |
| context-ledger internal page | CompanyInformation backed by CompanyContext |
| “Informações da empresa” | keep public label |
| “Informação pendente” | PendingItem |
| historical pattern | Evidence[] |
| suggestion/proposal | Recommendation |
| user confirmation | Decision or ApprovalRecord depending authority |
| “Alteração aplicada” | ActionResult + AuditEvent |
| EVOLU panel | EvoluPanel consuming IntelligenceProvider |
| guided deterministic flow | mocks/scenarios |
| static demo state | provider-backed contexts |

## First implementation slice

Migrate the existing NF-e 70031 / rolamento scenario first.

It exercises the full contract chain:

FiscalDocument
→ insufficient_context
→ PendingItem
→ Evidence
→ Recommendation
→ Decision
→ ApprovalRecord [when required]
→ ActionCommand with explicit authorization
→ ActionResult
→ AuditEvent

## Implementation order

### UX-0 Contract foundation
- add Domain Dictionary and Contract Catalog to /docs
- add initial domain/contract modules
- no visual change
- no backend connection

### UX-1 Providers
- PlatformProvider
- IntelligenceProvider
- mock implementations
- move deterministic synthetic data behind providers

### UX-2 Fiscal Document Detail
- migrate NF-e 70031
- model insufficient_context
- separate Recommendation, Decision, Approval and Execution
- pending information is recorded through PlatformProvider
- reanalysis is requested through IntelligenceProvider
- feature orchestration is isolated from presentation in Nfe70031Controller
- static preview runtime is compiler-generated from the typed source contracts

### UX-3 Company Workspace
- make Tenant → Company → CnpjEntity explicit
- use `CompanyWorkspaceContext` for company-scoped selection/navigation
- keep `CompanyContext` and specialized decision contexts CNPJ-scoped
- add CNPJ scope even when current mock has one
- preserve competence/period context

### UX-4 Reconciliation
- differences become Finding
- support/history becomes Evidence
- unresolved work becomes PendingItem

### UX-5 Pending Items and Approvals
- first-class queues
- no generic Task domain

### UX-6 Audit and history
- AuditEvent
- source/evidence/decision/action traceability

### UX-7 Replace mocks
- PlatformAdapter
- IntelligenceAdapter
- no feature-component rewrite allowed

## Conceptual lint

Reject:
- infrastructure-prefixed domain names
- Platform* entities
- Mock* outside mock/provider boundary
- companyId/cnpjId interchangeability
- generic pending status
- Recommendation carrying execution authority
- provider-specific fields in component props

## Acceptance test

Migration succeeds if:

MockPlatformProvider → PlatformAdapter
and
MockIntelligenceProvider → IntelligenceAdapter

can be swapped without modifying:
- screen names
- component props
- domain entity names
- user-visible workflow
- state-machine semantics
