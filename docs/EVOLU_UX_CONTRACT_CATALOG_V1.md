# EVOLU UX Contract Catalog v1

Status: Frozen functional catalog for Platform UX V1
Dependency: EVOLU UX Domain Dictionary v1

## Contract rule

Every screen must declare:
1. scope
2. primary entity
3. context
4. reads
5. commands/intents
6. states
7. capabilities
8. integration owner

## Screen matrix

| Screen | Scope | Entity | Context | Reads | Commands | States | Owner |
|---|---|---|---|---|---|---|---|
| CompanyPortfolio | tenant | Company | PortfolioContext | CompanySummary[], KPIs, pending counts | OpenCompany, FilterPortfolio | loading/ready/empty/error/forbidden | Platform |
| CompanyWorkspace | company | Company | CompanyWorkspaceContext | identity, CNPJs, active period, pending summary | SelectCnpj, SelectPeriod, OpenFeature | loading/ready/error/forbidden | Platform |
| CompanyInformation | cnpj | CnpjEntity | CompanyContext | identity, tax profile, provenance, known/unknown facts | RequestInformation, OpenEvidence | loading/ready/empty/error/forbidden | Platform |
| FiscalDocuments | cnpj | FiscalDocument | FiscalDocumentsContext | document summaries, filters, totals | FilterDocuments, OpenDocument | loading/ready/empty/error/forbidden | Platform |
| FiscalDocumentDetail | document | FiscalDocument | DocumentAnalysisContext | document, items, classification, pending, analysis | RequestDocumentAnalysis, OpenEvidence, RequestInformation | loading/ready/analyzing/insufficient_context/error/forbidden | Platform + Intelligence |
| RecommendationPanel | analysis | Recommendation | AnalysisContext | rationale, evidence, confidence, proposed change | RecordDecision, RequestMoreContext | pending_review/awaiting_information/approved/rejected/error | Intelligence + Platform record |
| PendingItems | tenant/company/cnpj | PendingItem | PendingItemsContext | unresolved items, subject, owner, due date | OpenPendingItem, Assign, ResolveWithInformation | loading/ready/empty/error/forbidden | Platform |
| Approvals | tenant/company/cnpj | ApprovalRecord | ApprovalContext | pending approvals, recommendation, decision, evidence | Approve, Reject, OpenEvidence | loading/ready/empty/awaiting_approval/approved/rejected/error | Platform |
| Reconciliation | cnpj | Reconciliation | ReconciliationContext | source summaries, findings, evidence, differences | RequestReconciliationAnalysis, RequestReview, OpenSource | loading/analyzing/completed/insufficient_context/empty/error | Platform + Intelligence |
| AccountingEntries | cnpj | AccountingEntry | AccountingEntriesContext | entries, account mapping, provenance | FilterEntries, OpenEntry, RequestReview | loading/ready/empty/error/forbidden | Platform |
| AnalysisHistory | company/cnpj | Analysis | AnalysisHistoryContext | analyses, findings, decisions | OpenAnalysis | loading/ready/empty/error | Platform/Intelligence projection |
| AuditHistory | company/cnpj | AuditEvent | AuditHistoryContext | immutable event timeline | FilterAudit, OpenSubject | loading/ready/empty/error/forbidden | Platform |
| EvoluPanel | contextual | Analysis | AssistantContext | active screen context, entity refs, pending items | RequestAnalysis, RequestExplanation, RequestInformation | idle/loading/ready/insufficient_context/error | Intelligence |

## Context catalog

### PortfolioContext
Fields:
- schemaVersion
- tenantId
- companies: CompanySummary[]
- metrics
- pendingSummary
- capabilities
- provenance

### CompanyContext
Base CNPJ-scoped decision context.

Fields:
- schemaVersion
- tenantId
- companyId
- cnpjId
- referenceDate
- capabilities
- provenance
- dataQuality

### CompanyWorkspaceContext
Company-scoped navigation/workspace projection.

Fields:
- schemaVersion
- tenantId
- companyId
- selectedCnpjId
- cnpjs: CnpjEntitySummary[]
- company
- activeAccountingPeriod
- availableAccountingPeriods
- pendingSummary
- capabilities
- provenance
- dataQuality

### FiscalDocumentsContext
Fields:
- schemaVersion
- tenantId
- companyId
- cnpjId
- accountingPeriod
- documents: FiscalDocumentSummary[]
- filters
- summary
- capabilities
- provenance

### DocumentAnalysisContext
Fields:
- schemaVersion
- tenantId
- companyId
- cnpjId
- referenceDate
- document
- analysis
- pendingItems
- historicalEvidence
- capabilities
- provenance
- dataQuality

### ReconciliationContext
Fields:
- schemaVersion
- tenantId
- companyId
- cnpjId
- accountingPeriod
- sources
- findings
- evidence
- pendingItems
- capabilities
- provenance

### ApprovalContext
Fields:
- schemaVersion
- tenantId
- approvals
- relatedDecisions
- relatedRecommendations
- capabilities

Each `ApprovalRecord` carries the operational scope of the formal authorization. Queue filtering and approval writes must preserve that scope.

## Request/result contracts

### DocumentAnalysisRequest
Fields:
- schemaVersion = 1.0.0
- tenantId
- companyId
- cnpjId
- documentId
- purpose:
  - tax_classification_review
  - economic_purpose_review
  - document_consistency_review
- requestedBy

### DocumentAnalysisResult
Fields:
- schemaVersion = 1.0.0
- analysisId
- status
- findings
- evidence
- recommendations
- missingContext

### RecordDecisionRequest
Fields:
- analysisId
- recommendationId
- decision: accept | reject | adjust | request_information | defer
- rationale

### RecordApprovalRequest
Fields:
- decisionId
- subjectType
- subjectId
- outcome: approve | reject
- rationale

### ActionExecutionRequest
Fields:
- authorization: ActionAuthorizationRef
- actionType
- subjectId
- payload

Returns ActionResult.

## Capability contracts

Capabilities are explicit and should not be inferred only from missing data.

Each capability is an object with:
- status: `allowed | forbidden | unavailable`
- reasonCode: optional stable explanation code
- description: optional human-readable explanation

Example DocumentCapabilities:
- canRequestAnalysis
- canRequestInformation
- canRecordDecision
- canRequestApproval
- canExecuteApprovedAction

`forbidden` means the actor is not authorized. `unavailable` means the operation cannot currently be performed because of workflow state, missing prerequisite, closed period or unsupported feature. The UX must render these as different states.

## Provider contracts

### PlatformProvider
Representative operations:
- getPortfolioContext
- getCompanyWorkspaceContext
- getCompanyContext
- getFiscalDocuments
- getDocumentAnalysisContext
- getReconciliationContext
- getPendingItems
- getReconciliationContext
- getApprovals
- getAuditHistory
- recordAnalysisObservation
- recordPendingItem
- recordPendingInformation
- recordDecision
- recordApproval
- requestActionExecution

### IntelligenceProvider
Representative operations:
- requestDocumentAnalysis
- requestReconciliationAnalysis
- explainAnalysis

## Mock rule

Mocks implement the same interfaces:
- MockPlatformProvider implements PlatformProvider
- MockIntelligenceProvider implements IntelligenceProvider

Mock-specific fields must not enter screen props.

Wrong:
`demoScenarioName`, `mockAnalysisStep`

Correct FiscalDocumentDetail props:
- document
- analysis
- pendingItems
- capabilities

## NF-e 70031 / rolamento canonical flow

Initial:
- FiscalDocument = NF-e 70031
- Item = Rolamento
- known: supplier, description, NCM, CFOP, taxes
- unknown: economic purpose

State:
- AnalysisStatus = insufficient_context
- PendingItem.type = information_request

Then:
RequestDocumentAnalysis
→ Finding: economic purpose missing
→ Evidence: similar historical operations
→ no Recommendation until context is resolved
→ context supplied
→ reanalysis
→ Recommendation
→ Decision
→ ApprovalRecord if controlled
→ ActionCommand
→ Platform
→ ActionResult
→ AuditEvent

## Route intent vocabulary

Recommended future UX routes:

/portfolio
/company/:companyId
/company/:companyId/cnpj/:cnpjId
/company/:companyId/cnpj/:cnpjId/fiscal/documents
/company/:companyId/cnpj/:cnpjId/fiscal/documents/:documentId
/company/:companyId/cnpj/:cnpjId/accounting/entries
/company/:companyId/cnpj/:cnpjId/reconciliation
/company/:companyId/cnpj/:cnpjId/pending-items
/company/:companyId/cnpj/:cnpjId/approvals
/company/:companyId/cnpj/:cnpjId/audit

These are UX routes, not backend API routes.

## Integration ownership

| Contract | Today | Later | Authority |
|---|---|---|---|
| PortfolioContext | MockPlatformProvider | PlatformAdapter | Platform |
| CompanyWorkspaceContext | MockPlatformProvider | PlatformAdapter | Platform |
| CompanyContext | MockPlatformProvider | PlatformAdapter | Platform |
| FiscalDocumentsContext | MockPlatformProvider | PlatformAdapter | Platform |
| DocumentAnalysisContext | MockPlatformProvider + MockIntelligenceProvider | PlatformAdapter + IntelligenceAdapter | Split |
| DocumentAnalysisResult | MockIntelligenceProvider | IntelligenceAdapter | Intelligence |
| Decision | MockPlatformProvider | PlatformAdapter | Platform record |
| ApprovalRecord | MockPlatformProvider | PlatformAdapter | Platform |
| ActionResult | MockPlatformProvider | PlatformAdapter | Platform |
| AuditEvent | MockPlatformProvider | PlatformAdapter | Platform |
| ReconciliationAnalysisResult | MockIntelligenceProvider | IntelligenceAdapter | Intelligence |

## Definition of done for a screen

A Platform screen is contract-complete only when:
- scope is declared
- primary entity is canonical
- input context is versioned
- reads are explicit
- commands/intents are explicit
- states cover loading/empty/error/forbidden where applicable
- insufficient_context is modeled where applicable
- capabilities are explicit
- no infrastructure name leaks into domain
- mock provider can be replaced without changing component props
