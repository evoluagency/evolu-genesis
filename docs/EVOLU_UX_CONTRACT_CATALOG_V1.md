# EVOLU UX Contract Catalog v1

Status: Frozen functional catalog for Platform UX V1

Dependency: EVOLU UX Domain Dictionary v1

## Contract rule

Every screen declares:

1. scope
2. primary entity
3. context
4. reads
5. commands or intents
6. states
7. capabilities
8. integration owner

## Screen matrix

| Screen | Scope | Entity | Context | Reads | Commands | States | Owner |
|---|---|---|---|---|---|---|---|
| CompanyPortfolio | tenant | Company | PortfolioContext | CompanySummary[], KPIs, pending counts | OpenCompany, FilterPortfolio | loading/ready/empty/error/forbidden | Platform |
| CompanyWorkspace | company | Company | CompanyContext | identity, CNPJs, active period, pending summary | SelectCnpj, SelectPeriod, OpenFeature | loading/ready/error/forbidden | Platform |
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

## Provider contracts

PlatformProvider representative operations:

- getPortfolioContext
- getCompanyContext
- getFiscalDocuments
- getDocumentAnalysisContext
- getPendingItems
- getApprovals
- recordDecision
- recordApproval
- requestActionExecution

IntelligenceProvider representative operations:

- requestDocumentAnalysis
- requestReconciliationAnalysis
- explainAnalysis

## Mock rule

Mocks implement the same interfaces:

- MockPlatformProvider implements PlatformProvider
- MockIntelligenceProvider implements IntelligenceProvider

Mock-specific fields must not enter screen props.

## NF-e 70031 / rolamento canonical flow

```text
FiscalDocument
→ Analysis
→ insufficient_context
→ PendingItem
→ context supplied
→ reanalysis
→ Finding + Evidence
→ Recommendation
→ Decision
→ ApprovalRecord [if controlled]
→ ActionCommand
→ ActionResult
→ AuditEvent
```

While economic purpose is unknown, historical behavior is Evidence only. No Recommendation is produced until required context is resolved.

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
