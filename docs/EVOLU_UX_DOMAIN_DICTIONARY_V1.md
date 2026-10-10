# EVOLU UX Domain Dictionary v1

Status: Frozen for Platform UX V1
Repository target: Platform public UX repository (legacy repository pending rename)

## Product principle

Platform defines the experience. UX Contracts define the common language. Platform supplies state and execution. Intelligence supplies analysis and recommendation. Mocks only replace providers during UX development.

Public labels may remain familiar accounting/tax terms even when internal names are more technical.

## Structural invariants

### D-01 Tenant → Company → CnpjEntity is structural

Tenant
└── Company
    └── 1..N CnpjEntity

`tenantId`, `companyId`, `cnpjId` and `cnpj` are never interchangeable.

- `tenantId`: internal identifier of the accounting/advisory organization.
- `companyId`: internal identifier of a client company.
- `cnpjId`: internal identifier of one CNPJ entity.
- `cnpj`: 14-digit registration number.

### D-02 Every experience declares scope

Canonical scopes:
`tenant`, `company`, `cnpj`, `document`, `analysis`, `approval`.

### D-03 Recommendation has no write authority

`Recommendation` is advisory output. It never mutates Platform state or becomes executable because confidence is high.

### D-04 Decision and ApprovalRecord are distinct

`Decision` is the human choice: accept, reject, adjust, request information, defer.

`ApprovalRecord` is the formal authorization/rejection record for a controlled action.

Not every Decision creates an ApprovalRecord.

### D-05 Execution belongs to Platform

Canonical chain:

Analysis
→ Finding + Evidence
→ Recommendation
→ Decision
→ ApprovalRecord [when required]
→ ActionCommand
→ ActionResult
→ AuditEvent

### D-06 Infrastructure does not enter the domain

Wrong:
`SiegDocument`, `SupabaseCompany`, `OnvioInvoice`, `PlatformAnalysis`, `MockFiscalDocument`.

Correct core domain:
`FiscalDocument`, `Company`, `Analysis`, `Recommendation`.

Allowed only at boundaries:
`SiegFiscalDocumentAdapter`, `OnvioDocumentAdapter`, `MockCompanyContextProvider`, `MockIntelligenceProvider`.

### D-07 insufficient_context is a valid analytical result

Analysis state family:
`queued`, `analyzing`, `completed`, `insufficient_context`, `failed`.

Missing information is not a system error.

## Canonical entities

### Tenant
White-label accounting/advisory organization operating EVOLU.

Fields:
- tenantId
- tenantSlug
- name
- status

`tenantSlug` may support routing/display, never authorization.

### Company
Client business entity managed by a Tenant.

Fields:
- companyId
- tenantId
- legalName
- tradeName
- status

### CnpjEntity
One tax registration/entity associated with a Company.

Fields:
- cnpjId
- companyId
- tenantId
- cnpj
- legalName
- state
- municipalityIbgeCode
- status

### CompanyGroup
Optional grouping of Companies. It does not replace Company.

## Context contracts

`CompanyContext` is a base context, not a super DTO.

Base fields:
- schemaVersion
- tenantId
- companyId
- cnpjId
- referenceDate
- provenance
- capabilities
- dataQuality

Company-level workspace selection is a separate projection:

### CompanyWorkspaceContext
Fields:
- schemaVersion
- tenantId
- companyId
- selectedCnpjId
- cnpjs
- company
- activeAccountingPeriod
- pendingSummary
- capabilities
- provenance
- dataQuality

`CompanyWorkspaceContext` is company-scoped navigation/workspace context. It must not replace the CNPJ-scoped `CompanyContext`.

Specialized CNPJ-scoped projections:

### FiscalCompanyContext
Adds:
- taxProfile
- accountingPeriod
- fiscalSummary

### AccountingCompanyContext
Adds:
- accountingPeriod
- accountingSummary

### DocumentAnalysisContext
Adds:
- document
- relatedDocuments
- pendingItems
- historicalEvidence

### ReconciliationContext
Adds:
- accountingPeriod
- sources
- findings
- pendingItems

Rule: contexts contain only the projection needed for that experience. All CNPJ-scoped decision contexts preserve `schemaVersion`, `tenantId`, `companyId`, `cnpjId`, `provenance` and `capabilities`.

## Fiscal and accounting domain

### AccountingPeriod
Canonical period representation.

Fields:
- periodId
- competence (YYYY-MM)
- status
- openedAt
- closedAt

Canonical PT-BR public label: Competência.

### FiscalDocument
Umbrella entity for NF-e, NFC-e, CT-e, NFS-e and supported fiscal documents.

Fields:
- documentId
- tenantId
- companyId
- cnpjId
- documentType
- documentNumber
- issueDate
- counterparty
- items
- taxSummary
- status

### FiscalDocumentItem
Fields include:
- itemId
- documentId
- description
- quantity
- unitValue
- ncm
- cfop
- cstIcms
- csosn
- taxClassification

### TaxProfile
Fields:
- regime
- validFrom
- validTo
- specialRegimes

### TaxClassification
Classification result/state, not a recommendation.
May contain NCM, CFOP, CST ICMS, CSOSN, PIS/COFINS CST, IPI CST and treatment metadata.

### Reconciliation
Process of comparing sources/records and identifying divergences.
Use `ReconciliationResult` for output.

## Intelligence domain

### Analysis
Container for analytical work.

Fields:
- analysisId
- type
- status
- scope
- createdAt
- completedAt
- findings
- evidence
- recommendations
- missingContext

### Finding
A factual/analytical observation.

Examples:
- XML × bookkeeping divergence
- missing economic purpose
- NCM inconsistent with evidence
- unsupported treatment

Fields:
- findingId
- type
- severity
- title
- description
- evidenceRefs

### Evidence
Support for a Finding, Analysis or Recommendation.

Fields:
- evidenceId
- type
- label
- value
- source
- asOf
- confidence

Historical behavior is Evidence, not automatic truth.

### Recommendation
Fields:
- recommendationId
- analysisId
- type
- title
- rationale
- evidenceRefs
- confidence
- requiresApproval
- proposedChange

`proposedChange` describes intent only.

### Decision
Fields:
- decisionId
- recommendationId
- analysisId
- decision: accept | reject | adjust | request_information | defer
- rationale
- decidedBy
- decidedAt

### ApprovalRecord
Formal authorization/rejection record. It is not an execution command.

Fields:
- approvalId
- decisionId
- scope: tenantId + companyId/cnpjId/accountingPeriodId when applicable
- subjectType
- subjectId
- status
- approvedBy / approvedAt
- rejectedBy / rejectedAt

## Operational action domain

### ActionCommand
Explicit request for Platform mutation.

Every command carries a non-null authorization basis. Approval-based actions use an `ApprovalRecord` reference; actions explicitly permitted without a formal approval use a direct permission/capability reference with actor and reason. A missing approval ID must never become an implicit authorization bypass.

Fields:
- commandId
- tenantId
- companyId
- cnpjId
- actionType
- subjectId
- authorization
- payload
- requestedBy
- requestedAt

### ActionResult
Fields:
- commandId
- status
- changedRecordRefs
- executedAt
- failure

### AuditEvent
Immutable trace event.

Fields:
- eventId
- eventType
- tenantId
- companyId
- cnpjId
- actor
- subject
- occurredAt
- metadata

## Pending work domain

### PendingItem

Operational work item. Every item carries explicit scope; portfolio/work-queue views must not infer ownership only from the currently selected screen context.

Types:
- information_request
- review
- reconciliation
- approval
- document_issue
- data_quality_issue

Fields:
- pendingItemId
- type
- scope: tenantId + companyId/cnpjId/accountingPeriodId when applicable
- title
- description
- status
- subject
- assignedTo
- dueAt

Do not introduce a generic `Task` domain type for these workflows.

## State families

Resource state:
`idle`, `loading`, `ready`, `empty`, `error`, `forbidden`

Analysis state:
`queued`, `analyzing`, `completed`, `insufficient_context`, `failed`

Human workflow:
`draft`, `pending_review`, `awaiting_information`, `awaiting_approval`, `approved`, `rejected`

Action execution:
`not_requested`, `queued`, `executing`, `succeeded`, `failed`, `cancelled`

Never use one generic `pending` state for all families.

## Suffix semantics

- Context: versioned projection required by an experience/decision
- Summary: reduced representation for list/card
- Request: operation/query input
- Result: operation/query output
- Record: persistent formal record
- Event: immutable fact
- Command: explicit mutation request
- Provider: abstract source consumed by UX
- Adapter: implementation translating a core/external system into contracts
- Ref: lightweight stable reference
- Capabilities: explicit operation availability/authorization descriptors; each capability has status `allowed | forbidden | unavailable` and may carry a reasonCode

## Providers and adapters

UX consumes:
- PlatformProvider
- IntelligenceProvider

During Platform:
- MockPlatformProvider
- MockIntelligenceProvider

Later:
- PlatformAdapter
- IntelligenceAdapter

External systems remain behind Platform:
- SiegFiscalDocumentAdapter
- OnvioDocumentAdapter
- ErpAccountingAdapter

UX must never import them directly.

## Canonical provider responsibility

PlatformProvider:
- operational reads
- decisions
- approvals
- action execution
- audit state

IntelligenceProvider:
- analysis
- findings
- evidence synthesis
- recommendations
- explanations

IntelligenceProvider must not expose:
- updateDocument
- applyTaxClassification
- saveCompany
- executeRecommendation

## Conceptual lint

Reject core-domain declarations matching:
- Platform*
- Supabase*
- Sieg*
- Onvio*
- Dominio*
- Mock* outside mock/provider boundaries
- generic Database/Table/Row names

Reject:
- companyId/cnpjId interchangeability
- generic pending status
- recommendation carrying execution authority
- infrastructure fields in component props

## Existing Platform compatibility

Current Platform already follows several principles:
- familiar accounting/fiscal public terminology
- public “Informações da empresa” while internal code uses `context-ledger`
- explicit distinction between suggestion and applied change
- missing context treated as part of workflow
- synthetic data and no production runtime

The current repository is static, so these contracts must be introduced behind the existing UX before visual flows are migrated.

## Frozen statement

Platform is the executable UX specification.
Platform is the System of Record and execution authority.
Intelligence is the Decision Plane.
UX Contracts are the stable language between them.
