# Platform — Contract-First UX Migration Plan v1

## Current repository reality

The current public experience is static.

The legacy root currently includes HTML, JavaScript, CSS, /demo/ and /docs/.

There is no typed contract layer or provider abstraction in the legacy experience.

The existing interface already contains product semantics worth preserving:

- tenant branding
- selected company
- Fiscal
- Contábil
- Conciliação
- Informações da empresa
- informação pendente
- contextual EVOLU panel
- explicit separation between suggestion and applied change

Do not rewrite the existing experience immediately.

## Migration rule

Preserve the current public experience while introducing the contract-first structure alongside it.

```text
legacy static experience
→ remains deployable
→ new src/domain/contracts/providers is introduced
→ features migrate one-by-one
```

Only remove legacy global-script structures after equivalent flows exist in the modular Platform UX.

## Target structure

```text
src/
  domain/
  contracts/
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
  components/
```

## First implementation slice

Migrate NF-e 70031 / rolamento first.

It exercises:

```text
FiscalDocument
→ insufficient_context
→ PendingItem
→ Evidence
→ Recommendation
→ Decision
→ ApprovalRecord
→ ActionCommand
→ ActionResult
→ AuditEvent
```

## Implementation order

### UX-0 Contract foundation

- add Domain Dictionary and Contract Catalog to /docs
- add initial domain and contract modules
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

### UX-3 Company Workspace

- make Tenant → Company → CnpjEntity explicit
- add CNPJ scope even when the current scenario has one
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
- Mock* outside mock/provider boundary
- companyId/cnpjId interchangeability
- generic pending status
- Recommendation carrying execution authority
- provider-specific fields in component props

## Acceptance test

Migration succeeds if:

```text
MockPlatformProvider → PlatformAdapter
MockIntelligenceProvider → IntelligenceAdapter
```

can be swapped without modifying:

- screen names
- component props
- domain entity names
- user-visible workflow
- state-machine semantics
