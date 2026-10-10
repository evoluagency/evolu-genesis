export type TenantId = string;
export type CompanyId = string;
export type CnpjId = string;
export type DocumentId = string;
export type AnalysisId = string;
export type RecommendationId = string;
export type DecisionId = string;
export type ApprovalId = string;
export type PendingItemId = string;
export type CommandId = string;

export type Scope = "tenant" | "company" | "cnpj" | "document" | "analysis" | "approval";

export type CapabilityStatus = "allowed" | "forbidden" | "unavailable";

export interface Capability {
  status: CapabilityStatus;
  reasonCode?: string;
  description?: string;
}

export type Capabilities = Readonly<Record<string, Capability>>;

export type ResourceState = "idle" | "loading" | "ready" | "empty" | "error" | "forbidden";
export type AnalysisStatus = "queued" | "analyzing" | "completed" | "insufficient_context" | "failed";
export type HumanWorkflowStatus =
  | "draft"
  | "pending_review"
  | "awaiting_information"
  | "awaiting_approval"
  | "approved"
  | "rejected";
export type ActionExecutionStatus =
  | "not_requested"
  | "queued"
  | "executing"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface Tenant {
  tenantId: TenantId;
  tenantSlug: string;
  name: string;
  status: "active" | "inactive";
}

export interface Company {
  companyId: CompanyId;
  tenantId: TenantId;
  legalName: string;
  tradeName?: string;
  status: "active" | "inactive";
}

export interface CnpjEntity {
  cnpjId: CnpjId;
  companyId: CompanyId;
  tenantId: TenantId;
  cnpj: string;
  legalName: string;
  establishmentType?: "head_office" | "branch";
  state?: string;
  municipalityIbgeCode?: string;
  status: "active" | "inactive";
}

export interface CompanyGroup {
  companyGroupId: string;
  tenantId: TenantId;
  name: string;
  companyIds: CompanyId[];
}

export interface AccountingPeriod {
  periodId: string;
  competence: `${number}-${number}`;
  status: "open" | "closed";
  openedAt?: string;
  closedAt?: string;
}

export interface TaxProfile {
  regime: string;
  validFrom: string;
  validTo?: string;
  specialRegimes: string[];
}

export interface TaxClassification {
  ncm?: string;
  cfop?: string;
  cstIcms?: string;
  csosn?: string;
  cstPis?: string;
  cstCofins?: string;
  cstIpi?: string;
  treatment?: string;
}

export interface FiscalDocumentItem {
  itemId: string;
  documentId: DocumentId;
  description: string;
  quantity: number;
  unitValue: number;
  taxClassification: TaxClassification;
}

export interface FiscalDocument {
  documentId: DocumentId;
  tenantId: TenantId;
  companyId: CompanyId;
  cnpjId: CnpjId;
  documentType: "nfe" | "nfce" | "cte" | "nfse" | "other";
  documentNumber: string;
  issueDate: string;
  counterparty: {
    name: string;
    taxId?: string;
  };
  items: FiscalDocumentItem[];
  taxSummary: Record<string, number | string | null>;
  status: string;
}

export interface Evidence {
  evidenceId: string;
  type: string;
  label: string;
  value: unknown;
  source: string;
  asOf?: string;
  confidence?: number;
}

export interface Finding {
  findingId: string;
  type: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  evidenceRefs: string[];
}

export interface Recommendation {
  recommendationId: RecommendationId;
  analysisId: AnalysisId;
  type: string;
  title: string;
  rationale: string;
  evidenceRefs: string[];
  confidence?: number;
  requiresApproval: boolean;
  proposedChange?: Readonly<Record<string, unknown>>;
}

export type DecisionValue = "accept" | "reject" | "adjust" | "request_information" | "defer";

export interface Decision {
  decisionId: DecisionId;
  recommendationId: RecommendationId;
  analysisId: AnalysisId;
  decision: DecisionValue;
  rationale?: string;
  decidedBy: string;
  decidedAt: string;
}

export interface OperationalScopeRef {
  tenantId: TenantId;
  companyId?: CompanyId;
  cnpjId?: CnpjId;
  accountingPeriodId?: string;
}

export interface ApprovalRecord {
  approvalId: ApprovalId;
  decisionId: DecisionId;
  scope: OperationalScopeRef;
  subjectType: string;
  subjectId: string;
  status: "awaiting_approval" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
}

export type PendingItemType =
  | "information_request"
  | "review"
  | "reconciliation"
  | "approval"
  | "document_issue"
  | "data_quality_issue";

export interface PendingItem {
  pendingItemId: PendingItemId;
  type: PendingItemType;
  scope: OperationalScopeRef;
  title: string;
  description: string;
  status: HumanWorkflowStatus;
  subject: {
    type: string;
    id: string;
  };
  assignedTo?: string;
  dueAt?: string;
}

export interface Analysis {
  analysisId: AnalysisId;
  type: string;
  status: AnalysisStatus;
  scope: Scope;
  createdAt: string;
  completedAt?: string;
  findings: Finding[];
  evidence: Evidence[];
  recommendations: Recommendation[];
  missingContext: PendingItem[];
}

export type ActionAuthorizationRef =
  | {
      kind: "approval_record";
      approvalId: ApprovalId;
    }
  | {
      kind: "direct_permission";
      capability: string;
      actor: string;
      reason: string;
    };

export interface ActionCommand {
  commandId: CommandId;
  tenantId: TenantId;
  companyId: CompanyId;
  cnpjId: CnpjId;
  actionType: string;
  subjectId: string;
  authorization: ActionAuthorizationRef;
  payload: Readonly<Record<string, unknown>>;
  requestedBy: string;
  requestedAt: string;
}

export interface ActionResult {
  commandId: CommandId;
  status: ActionExecutionStatus;
  changedRecordRefs: string[];
  executedAt?: string;
  failure?: string;
}

export interface AuditEvent {
  eventId: string;
  eventType: string;
  tenantId: TenantId;
  companyId?: CompanyId;
  cnpjId?: CnpjId;
  actor: string;
  subject: {
    type: string;
    id: string;
  };
  occurredAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface Reconciliation {
  reconciliationId: string;
  tenantId: TenantId;
  companyId: CompanyId;
  cnpjId: CnpjId;
  periodId: string;
  status: AnalysisStatus;
}
