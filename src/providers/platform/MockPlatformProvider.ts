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
import {
  approvalContext,
  companyContext,
  companyWorkspaceContext,
  createNfe70031ScenarioState,
  mockAccountingPeriods,
  mockBranchCnpj,
  mockCnpj,
  documentAnalysisContext,
  fiscalDocumentsContext,
  pendingItemsContext,
  portfolioContext,
  purposePendingItem
} from "../../mocks/scenarios/nfe-70031.js";
import {
  reconciliationContext,
  reconciliationFinding,
  reconciliationPendingTemplate
} from "../../mocks/scenarios/reconciliation-2026-09.js";
import type {
  Nfe70031EconomicPurpose,
  Nfe70031ScenarioState
} from "../../mocks/scenarios/nfe-70031.js";
import type { PlatformProvider } from "./PlatformProvider.js";

export class MockPlatformProvider implements PlatformProvider {
  private decisions: Decision[] = [];
  private approvals: ApprovalRecord[] = [];
  private recordedPendingItems: PendingItem[] = [];

  constructor(
    private readonly scenarioState: Nfe70031ScenarioState = createNfe70031ScenarioState()
  ) {}

  async getPortfolioContext(): Promise<PortfolioContext> {
    return portfolioContext;
  }

  async getCompanyWorkspaceContext(input: {
    tenantId: string;
    companyId: string;
    cnpjId?: string;
    accountingPeriodId?: string;
  }): Promise<CompanyWorkspaceContext> {
    if (
      input.tenantId !== companyWorkspaceContext.tenantId ||
      input.companyId !== companyWorkspaceContext.companyId
    ) {
      throw new Error("mock_company_workspace_not_found");
    }

    const cnpjIds = companyWorkspaceContext.cnpjs.map(item => item.cnpjId);
    const selectedCnpjId = input.cnpjId ?? companyWorkspaceContext.selectedCnpjId;
    if (!cnpjIds.includes(selectedCnpjId)) {
      throw new Error("mock_cnpj_not_authorized");
    }

    const activeAccountingPeriod =
      input.accountingPeriodId
        ? mockAccountingPeriods.find(period => period.periodId === input.accountingPeriodId)
        : companyWorkspaceContext.activeAccountingPeriod;

    if (!activeAccountingPeriod) {
      throw new Error("mock_accounting_period_not_available");
    }

    return {
      ...companyWorkspaceContext,
      selectedCnpjId,
      activeAccountingPeriod
    };
  }

  async getCompanyContext(input: {
    tenantId: string;
    companyId: string;
    cnpjId: string;
  }): Promise<CompanyContext> {
    if (
      input.tenantId !== companyContext.tenantId ||
      input.companyId !== companyContext.companyId
    ) {
      throw new Error("mock_company_context_not_found");
    }

    const cnpj = [mockCnpj, mockBranchCnpj].find(item => item.cnpjId === input.cnpjId);
    if (!cnpj) {
      throw new Error("mock_cnpj_not_authorized");
    }

    return {
      ...companyContext,
      cnpjId: cnpj.cnpjId
    };
  }

  async getFiscalDocuments(): Promise<FiscalDocumentsContext> {
    return fiscalDocumentsContext;
  }

  async getDocumentAnalysisContext(input: {
    tenantId: string;
    companyId: string;
    cnpjId: string;
    documentId: string;
  }): Promise<DocumentAnalysisContext> {
    if (input.documentId !== documentAnalysisContext.document.documentId) {
      throw new Error("mock_document_not_found");
    }

    const purpose = this.scenarioState.economicPurpose;
    return {
      ...documentAnalysisContext,
      pendingItems:
        purpose && purpose !== "unknown"
          ? []
          : [
              {
                ...purposePendingItem,
                status: "awaiting_information"
              }
            ]
    };
  }

  async getPendingItems(): Promise<PendingItemsContext> {
    const purpose = this.scenarioState.economicPurpose;
    const purposeItems =
      purpose && purpose !== "unknown"
        ? []
        : [
            {
              ...purposePendingItem,
              status: "awaiting_information" as const
            }
          ];

    return {
      ...pendingItemsContext,
      items: [...purposeItems, ...this.recordedPendingItems]
    };
  }

  async getReconciliationContext(input: {
    tenantId: string;
    companyId: string;
    cnpjId: string;
    periodId: string;
  }): Promise<ReconciliationContext> {
    if (
      input.tenantId !== reconciliationContext.tenantId ||
      input.companyId !== reconciliationContext.companyId ||
      input.cnpjId !== reconciliationContext.cnpjId ||
      input.periodId !== reconciliationContext.accountingPeriod.periodId
    ) {
      throw new Error("mock_reconciliation_not_found");
    }

    return {
      ...reconciliationContext,
      pendingItems: this.recordedPendingItems.filter(
        item =>
          item.subject.type === "Reconciliation" &&
          item.subject.id === reconciliationContext.reconciliation.reconciliationId
      )
    };
  }

  async createReconciliationPendingItem(
    request: CreateReconciliationPendingItemRequest
  ): Promise<PendingItem> {
    if (
      request.tenantId !== reconciliationContext.tenantId ||
      request.companyId !== reconciliationContext.companyId ||
      request.cnpjId !== reconciliationContext.cnpjId ||
      request.reconciliationId !== reconciliationContext.reconciliation.reconciliationId
    ) {
      throw new Error("mock_reconciliation_pending_scope_mismatch");
    }

    if (request.findingId !== reconciliationFinding.findingId) {
      throw new Error("mock_reconciliation_finding_not_found");
    }

    const capability = reconciliationContext.capabilities.canCreatePendingItem;
    if (!capability || capability.status === "forbidden") {
      throw new Error("mock_reconciliation_pending_forbidden");
    }
    if (capability.status === "unavailable") {
      throw new Error("mock_reconciliation_pending_unavailable");
    }

    const existing = this.recordedPendingItems.find(
      item => item.pendingItemId === reconciliationPendingTemplate.pendingItemId
    );
    if (existing) {
      return existing;
    }

    const item: PendingItem = {
      ...reconciliationPendingTemplate,
      assignedTo: request.requestedBy
    };
    this.recordedPendingItems.push(item);
    return item;
  }

  async recordPendingInformation(
    request: RecordPendingInformationRequest
  ): Promise<RecordPendingInformationResult> {
    if (request.pendingItemId !== purposePendingItem.pendingItemId) {
      throw new Error("mock_pending_item_not_found");
    }

    const allowed: Nfe70031EconomicPurpose[] = [
      "maintenance",
      "production",
      "internal_use",
      "unknown"
    ];

    if (
      typeof request.value !== "string" ||
      !allowed.includes(request.value as Nfe70031EconomicPurpose)
    ) {
      throw new Error("mock_pending_information_invalid");
    }

    this.scenarioState.economicPurpose = request.value as Nfe70031EconomicPurpose;

    return {
      pendingItemId: request.pendingItemId,
      status:
        this.scenarioState.economicPurpose === "unknown"
          ? "awaiting_information"
          : "pending_review",
      recordedAt: new Date().toISOString()
    };
  }

  async getApprovals(): Promise<ApprovalContext> {
    return {
      ...approvalContext,
      approvals: [...this.approvals],
      relatedDecisions: [...this.decisions]
    };
  }

  async recordDecision(request: RecordDecisionRequest): Promise<Decision> {
    const decision: Decision = {
      decisionId: `decision-mock-${this.decisions.length + 1}`,
      recommendationId: request.recommendationId,
      analysisId: request.analysisId,
      decision: request.decision,
      ...(request.rationale ? { rationale: request.rationale } : {}),
      decidedBy: request.decidedBy,
      decidedAt: new Date().toISOString()
    };

    this.decisions.push(decision);
    return decision;
  }

  async recordApproval(request: RecordApprovalRequest): Promise<ApprovalRecord> {
    const decision = this.decisions.find(item => item.decisionId === request.decisionId);
    if (!decision) {
      throw new Error("mock_decision_not_found");
    }
    if (request.outcome === "approve" && decision.decision !== "accept") {
      throw new Error("mock_decision_not_approvable");
    }

    const now = new Date().toISOString();
    const approval: ApprovalRecord = {
      approvalId: `approval-mock-${this.approvals.length + 1}`,
      decisionId: request.decisionId,
      subjectType: request.subjectType,
      subjectId: request.subjectId,
      status: request.outcome === "approve" ? "approved" : "rejected",
      ...(request.outcome === "approve"
        ? { approvedBy: request.actor, approvedAt: now }
        : { rejectedBy: request.actor, rejectedAt: now })
    };

    this.approvals.push(approval);
    return approval;
  }

  async requestActionExecution(request: ActionExecutionRequest): Promise<ActionResult> {
    const authorization = request.authorization;

    if (authorization.kind === "approval_record") {
      const approved = this.approvals.some(
        approval =>
          approval.approvalId === authorization.approvalId &&
          approval.status === "approved"
      );
      if (!approved) {
        throw new Error("mock_action_not_authorized");
      }
    } else if (!authorization.capability || !authorization.reason) {
      throw new Error("mock_action_not_authorized");
    }

    return {
      commandId: `command-mock-${request.subjectId}`,
      status: "succeeded",
      changedRecordRefs: [request.subjectId],
      executedAt: new Date().toISOString()
    };
  }
}
