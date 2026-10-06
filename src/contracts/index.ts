import type {
  AccountingPeriod,
  Analysis,
  AnalysisStatus,
  ApprovalRecord,
  CnpjEntity,
  CnpjId,
  Company,
  CompanyId,
  Decision,
  DecisionValue,
  Evidence,
  Finding,
  FiscalDocument,
  PendingItem,
  Recommendation,
  Reconciliation,
  TenantId,
  ActionResult
} from "../domain/index.js";

export type SchemaVersion = "1.0.0";

export interface ProvenanceEntry {
  source: string;
  observedAt?: string;
  reference?: string;
}

export interface DataQuality {
  completeness?: number;
  freshness?: string;
  issues: string[];
}

export interface CompanySummary {
  companyId: CompanyId;
  legalName: string;
  tradeName?: string;
  cnpjCount: number;
  pendingCount: number;
}

export interface CnpjEntitySummary {
  cnpjId: CnpjId;
  cnpj: string;
  legalName: string;
}

export interface FiscalDocumentSummary {
  documentId: string;
  documentType: FiscalDocument["documentType"];
  documentNumber: string;
  issueDate: string;
  counterpartyName: string;
  status: string;
}

export interface DocumentCapabilities {
  canRequestAnalysis: boolean;
  canRequestInformation: boolean;
  canRecordDecision: boolean;
  canRequestApproval: boolean;
  canExecuteApprovedAction: boolean;
}

export interface PortfolioContext {
  schemaVersion: SchemaVersion;
  tenantId: TenantId;
  companies: CompanySummary[];
  metrics: Readonly<Record<string, number>>;
  pendingSummary: Readonly<Record<string, number>>;
  capabilities: Readonly<Record<string, boolean>>;
  provenance: ProvenanceEntry[];
}

export interface CompanyContext {
  schemaVersion: SchemaVersion;
  tenantId: TenantId;
  companyId: CompanyId;
  selectedCnpjId: CnpjId;
  cnpjs: CnpjEntitySummary[];
  company: Company;
  activeAccountingPeriod: AccountingPeriod;
  pendingSummary: Readonly<Record<string, number>>;
  capabilities: Readonly<Record<string, boolean>>;
  provenance: ProvenanceEntry[];
  dataQuality: DataQuality;
}

export interface FiscalDocumentsContext {
  schemaVersion: SchemaVersion;
  tenantId: TenantId;
  companyId: CompanyId;
  cnpjId: CnpjId;
  accountingPeriod: AccountingPeriod;
  documents: FiscalDocumentSummary[];
  filters: Readonly<Record<string, unknown>>;
  summary: Readonly<Record<string, number>>;
  capabilities: Readonly<Record<string, boolean>>;
  provenance: ProvenanceEntry[];
}

export interface DocumentAnalysisContext {
  schemaVersion: SchemaVersion;
  tenantId: TenantId;
  companyId: CompanyId;
  cnpjId: CnpjId;
  referenceDate: string;
  document: FiscalDocument;
  analysis?: Analysis;
  pendingItems: PendingItem[];
  historicalEvidence: Evidence[];
  capabilities: DocumentCapabilities;
  provenance: ProvenanceEntry[];
  dataQuality: DataQuality;
}

export interface ReconciliationContext {
  schemaVersion: SchemaVersion;
  tenantId: TenantId;
  companyId: CompanyId;
  cnpjId: CnpjId;
  accountingPeriod: AccountingPeriod;
  reconciliation: Reconciliation;
  sources: ProvenanceEntry[];
  findings: Finding[];
  evidence: Evidence[];
  pendingItems: PendingItem[];
  capabilities: Readonly<Record<string, boolean>>;
  provenance: ProvenanceEntry[];
}

export interface PendingItemsContext {
  schemaVersion: SchemaVersion;
  tenantId: TenantId;
  companyId?: CompanyId;
  cnpjId?: CnpjId;
  items: PendingItem[];
}

export interface ApprovalContext {
  schemaVersion: SchemaVersion;
  tenantId: TenantId;
  approvals: ApprovalRecord[];
  relatedDecisions: Decision[];
  relatedRecommendations: Recommendation[];
  capabilities: Readonly<Record<string, boolean>>;
}

export interface DocumentAnalysisRequest {
  schemaVersion: SchemaVersion;
  tenantId: TenantId;
  companyId: CompanyId;
  cnpjId: CnpjId;
  documentId: string;
  purpose:
    | "tax_classification_review"
    | "economic_purpose_review"
    | "document_consistency_review";
  requestedBy: string;
}

export interface DocumentAnalysisResult {
  schemaVersion: SchemaVersion;
  analysisId: string;
  status: AnalysisStatus;
  findings: Finding[];
  evidence: Evidence[];
  recommendations: Recommendation[];
  missingContext: PendingItem[];
}

export interface RecordDecisionRequest {
  analysisId: string;
  recommendationId: string;
  decision: DecisionValue;
  rationale?: string;
  decidedBy: string;
}

export interface RecordApprovalRequest {
  decisionId: string;
  subjectType: string;
  subjectId: string;
  outcome: "approve" | "reject";
  rationale?: string;
  actor: string;
}

export interface ActionExecutionRequest {
  tenantId: TenantId;
  companyId: CompanyId;
  cnpjId: CnpjId;
  approvalId: string;
  actionType: string;
  subjectId: string;
  payload: Readonly<Record<string, unknown>>;
  requestedBy: string;
}

export interface ReconciliationAnalysisRequest {
  schemaVersion: SchemaVersion;
  tenantId: TenantId;
  companyId: CompanyId;
  cnpjId: CnpjId;
  periodId: string;
  requestedBy: string;
}

export interface ReconciliationAnalysisResult {
  schemaVersion: SchemaVersion;
  status: AnalysisStatus;
  findings: Finding[];
  evidence: Evidence[];
  recommendations: Recommendation[];
  missingContext: PendingItem[];
}

export interface ExplainAnalysisRequest {
  schemaVersion: SchemaVersion;
  analysisId: string;
  audience?: "accounting" | "tax" | "management";
}

export interface ExplainAnalysisResult {
  schemaVersion: SchemaVersion;
  analysisId: string;
  explanation: string;
}

export type { CnpjEntity, FiscalDocument, ActionResult };
