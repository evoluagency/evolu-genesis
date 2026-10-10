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
  RecordApprovalRequest,
  RecordDecisionRequest,
  RecordPendingInformationRequest,
  RecordPendingInformationResult,
  RecordPendingItemRequest,
  RecordPendingItemResult
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
  purposePendingItem,
  reconciliationContext
} from "../../mocks/scenarios/nfe-70031.js";
import type {
  Nfe70031EconomicPurpose,
  Nfe70031ScenarioState
} from "../../mocks/scenarios/nfe-70031.js";
import type { PlatformProvider } from "./PlatformProvider.js";

export class MockPlatformProvider implements PlatformProvider {
  private decisions: Decision[] = approvalContext.relatedDecisions.map(item => ({ ...item }));
  private approvals: ApprovalRecord[] = approvalContext.approvals.map(item => ({
    ...item,
    scope: { ...item.scope }
  }));
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

  async getPendingItems(input: {
    tenantId: string;
    companyId?: string;
    cnpjId?: string;
    periodId?: string;
  }): Promise<PendingItemsContext> {
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

    const staticItems = pendingItemsContext.items.filter(
      item => item.pendingItemId !== purposePendingItem.pendingItemId
    );
    const items = [...purposeItems, ...staticItems, ...this.recordedPendingItems].filter(
      item => this.matchesScope(item.scope, input)
    );

    return {
      schemaVersion: pendingItemsContext.schemaVersion,
      tenantId: input.tenantId,
      ...(input.companyId ? { companyId: input.companyId } : {}),
      ...(input.cnpjId ? { cnpjId: input.cnpjId } : {}),
      items
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

  async recordPendingItem(
    request: RecordPendingItemRequest
  ): Promise<RecordPendingItemResult> {
    if (
      request.tenantId !== reconciliationContext.tenantId ||
      request.companyId !== reconciliationContext.companyId ||
      request.cnpjId !== reconciliationContext.cnpjId
    ) {
      throw new Error("mock_pending_item_scope_mismatch");
    }

    const existing = this.recordedPendingItems.find(
      item => item.pendingItemId === request.item.pendingItemId
    );
    if (existing) {
      return {
        item: existing,
        recordedAt: new Date().toISOString()
      };
    }

    this.recordedPendingItems.push({ ...request.item });

    return {
      item: request.item,
      recordedAt: new Date().toISOString()
    };
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

  async getApprovals(input: {
    tenantId: string;
    companyId?: string;
    cnpjId?: string;
    periodId?: string;
  }): Promise<ApprovalContext> {
    const approvals = this.approvals.filter(item => this.matchesScope(item.scope, input));
    const decisionIds = new Set(approvals.map(item => item.decisionId));
    const relatedDecisions = this.decisions.filter(item => decisionIds.has(item.decisionId));
    const recommendationIds = new Set(
      relatedDecisions.map(item => item.recommendationId)
    );
    const relatedRecommendations = approvalContext.relatedRecommendations.filter(
      item => recommendationIds.has(item.recommendationId)
    );
    const hasAwaiting = approvals.some(item => item.status === "awaiting_approval");

    return {
      ...approvalContext,
      tenantId: input.tenantId,
      approvals,
      relatedDecisions,
      relatedRecommendations,
      capabilities: {
        canApprove: hasAwaiting
          ? { status: "allowed" }
          : { status: "unavailable", reasonCode: "no_approval_pending" },
        canReject: hasAwaiting
          ? { status: "allowed" }
          : { status: "unavailable", reasonCode: "no_approval_pending" }
      }
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

    const existingIndex = this.approvals.findIndex(item =>
      request.approvalId
        ? item.approvalId === request.approvalId
        : item.decisionId === request.decisionId
    );
    const existing = existingIndex >= 0 ? this.approvals[existingIndex] : undefined;

    if (existing && !this.matchesScope(existing.scope, {
      tenantId: request.tenantId,
      companyId: request.companyId,
      cnpjId: request.cnpjId,
      ...(request.accountingPeriodId ? { periodId: request.accountingPeriodId } : {})
    })) {
      throw new Error("mock_approval_scope_mismatch");
    }
    if (
      existing &&
      (existing.subjectType !== request.subjectType || existing.subjectId !== request.subjectId)
    ) {
      throw new Error("mock_approval_subject_mismatch");
    }

    const now = new Date().toISOString();
    const scope = {
      tenantId: request.tenantId,
      companyId: request.companyId,
      cnpjId: request.cnpjId,
      ...(request.accountingPeriodId
        ? { accountingPeriodId: request.accountingPeriodId }
        : {})
    };
    const approval: ApprovalRecord = {
      approvalId: existing?.approvalId ?? `approval-mock-${this.approvals.length + 1}`,
      decisionId: request.decisionId,
      scope,
      subjectType: request.subjectType,
      subjectId: request.subjectId,
      status: request.outcome === "approve" ? "approved" : "rejected",
      ...(request.outcome === "approve"
        ? { approvedBy: request.actor, approvedAt: now }
        : { rejectedBy: request.actor, rejectedAt: now })
    };

    if (existingIndex >= 0) this.approvals[existingIndex] = approval;
    else this.approvals.push(approval);
    return approval;
  }

  private matchesScope(
    scope: {
      tenantId: string;
      companyId?: string;
      cnpjId?: string;
      accountingPeriodId?: string;
    },
    input: {
      tenantId: string;
      companyId?: string;
      cnpjId?: string;
      periodId?: string;
    }
  ): boolean {
    if (scope.tenantId !== input.tenantId) return false;
    if (input.companyId && scope.companyId !== input.companyId) return false;
    if (input.cnpjId && scope.cnpjId !== input.cnpjId) return false;
    if (input.periodId && scope.accountingPeriodId !== input.periodId) return false;
    return true;
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
