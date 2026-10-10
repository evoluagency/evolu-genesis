import type {
  ActionExecutionRequest,
  ApprovalContext,
  CompanyContext,
  CompanyWorkspaceContext,
  DocumentAnalysisContext,
  FiscalDocumentsContext,
  PendingItemsContext,
  PortfolioContext,
  ReconciliationContext,
  CreateReconciliationPendingItemRequest,
  RecordApprovalRequest,
  RecordDecisionRequest,
  RecordPendingInformationRequest,
  RecordPendingInformationResult
} from "../../contracts/index.js";
import type { ActionResult, ApprovalRecord, Decision, PendingItem } from "../../domain/index.js";

export interface PlatformProvider {
  getPortfolioContext(input: { tenantId: string }): Promise<PortfolioContext>;
  getCompanyWorkspaceContext(input: {
    tenantId: string;
    companyId: string;
    cnpjId?: string;
    accountingPeriodId?: string;
  }): Promise<CompanyWorkspaceContext>;
  getCompanyContext(input: { tenantId: string; companyId: string; cnpjId: string }): Promise<CompanyContext>;
  getFiscalDocuments(input: { tenantId: string; companyId: string; cnpjId: string; periodId?: string }): Promise<FiscalDocumentsContext>;
  getDocumentAnalysisContext(input: { tenantId: string; companyId: string; cnpjId: string; documentId: string }): Promise<DocumentAnalysisContext>;
  getPendingItems(input: { tenantId: string; companyId?: string; cnpjId?: string }): Promise<PendingItemsContext>;
  getReconciliationContext(input: {
    tenantId: string;
    companyId: string;
    cnpjId: string;
    periodId: string;
  }): Promise<ReconciliationContext>;
  getApprovals(input: { tenantId: string; companyId?: string; cnpjId?: string }): Promise<ApprovalContext>;

  createReconciliationPendingItem(request: CreateReconciliationPendingItemRequest): Promise<PendingItem>;
  recordPendingInformation(request: RecordPendingInformationRequest): Promise<RecordPendingInformationResult>;
  recordDecision(request: RecordDecisionRequest): Promise<Decision>;
  recordApproval(request: RecordApprovalRequest): Promise<ApprovalRecord>;
  requestActionExecution(request: ActionExecutionRequest): Promise<ActionResult>;
}
