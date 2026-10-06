# EVOLU UX Domain Dictionary v1

Status: Frozen for Platform UX V1

## Product principle

EVOLU is the company.

Platform is the operational product and execution authority.

Intelligence is the analysis and recommendation product.

UX Contracts define the stable language shared by Platform and Intelligence.

Mocks replace providers only during UX development.

## Structural invariants

### D-01 Tenant → Company → CnpjEntity is structural

```text
Tenant
└── Company
    └── 1..N CnpjEntity
```

`tenantId`, `companyId`, `cnpjId` and `cnpj` are never interchangeable.

### D-02 Every experience declares scope

Canonical scopes:

`tenant`, `company`, `cnpj`, `document`, `analysis`, `approval`.

### D-03 Recommendation has no write authority

A Recommendation is advisory output. It never mutates Platform state.

### D-04 Decision and ApprovalRecord are distinct

Decision is the human choice.

ApprovalRecord is the formal authorization or rejection record for a controlled action.

Not every Decision creates an ApprovalRecord.

### D-05 Execution belongs to Platform

```text
Analysis
→ Finding + Evidence
→ Recommendation
→ Decision
→ ApprovalRecord [when required]
→ ActionCommand
→ ActionResult
→ AuditEvent
```

### D-06 Infrastructure does not enter the domain

Reject core names such as `SiegDocument`, `SupabaseCompany`, `OnvioInvoice` or infrastructure-specific component props.

Allowed only at boundaries:

- `SiegFiscalDocumentAdapter`
- `OnvioDocumentAdapter`
- `MockPlatformProvider`
- `MockIntelligenceProvider`

### D-07 insufficient_context is a valid analytical result

Analysis states:

`queued`, `analyzing`, `completed`, `insufficient_context`, `failed`.

Missing information is not a system error.

## Canonical entities

- Tenant
- Company
- CnpjEntity
- CompanyGroup
- AccountingPeriod
- FiscalDocument
- FiscalDocumentItem
- TaxProfile
- TaxClassification
- Analysis
- Finding
- Evidence
- Recommendation
- Decision
- ApprovalRecord
- PendingItem
- ActionCommand
- ActionResult
- AuditEvent
- Reconciliation

## Context rule

CompanyContext is a base context, not a super DTO.

Specialized projections may include:

- FiscalCompanyContext
- AccountingCompanyContext
- DocumentAnalysisContext
- ReconciliationContext

Contexts contain only the projection needed for the experience.

## State families

Resource state:

`idle`, `loading`, `ready`, `empty`, `error`, `forbidden`.

Analysis state:

`queued`, `analyzing`, `completed`, `insufficient_context`, `failed`.

Human workflow:

`draft`, `pending_review`, `awaiting_information`, `awaiting_approval`, `approved`, `rejected`.

Action execution:

`not_requested`, `queued`, `executing`, `succeeded`, `failed`, `cancelled`.

Do not use one generic pending state for all families.

## Suffix semantics

- Context: versioned projection required by an experience or decision
- Summary: reduced representation for list or card
- Request: operation input
- Result: operation output
- Record: persistent formal record
- Event: immutable fact
- Command: explicit mutation request
- Provider: abstract source consumed by UX
- Adapter: implementation translating a core or external system into contracts
- Ref: lightweight stable reference
- Capabilities: operations currently available or authorized

## Provider responsibility

PlatformProvider owns:

- operational reads
- decisions
- approvals
- action execution
- audit state

IntelligenceProvider owns:

- analysis
- findings
- evidence synthesis
- recommendations
- explanations

IntelligenceProvider must not expose mutation methods such as:

- updateDocument
- applyTaxClassification
- saveCompany
- executeRecommendation

## Frozen statement

Platform is the System of Record and execution authority.

Intelligence is the Decision Plane.

UX Contracts are the stable language between them.
