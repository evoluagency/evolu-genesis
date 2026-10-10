import type {
  ActionExecutionRequest,
  ApprovalContext,
  CompanyContext,
  CompanyWorkspaceContext,
  DocumentAnalysisContext,
  FiscalDocumentsContext,
  PendingItemsContext,
  PortfolioContext,
  ProvidePendingItemInformationRequest,
  ProvidePendingItemInformationResult,
  RecordApprovalRequest,
  RecordDecisionRequest
} from "../../contracts/index.js";
import type { ActionResult, ApprovalRecord, Decision } from "../../domain/index.js";
import {
  approvalContext,
  companyContext,
  createNfe70031ScenarioState,
  companyWorkspaceContext,
  documentAnalysisContext,
  fiscalDocumentsContext,
  pendingItemsContext,
  portfolioContext
} from "../../mocks/scenarios/nfe-70031.js";
import type { PlatformProvider } from "./PlatformProvider.js";

export class MockPlatformProvider implements PlatformProvider {
  private decisions: Decision[] = [];
  private approvals: ApprovalRecord[] = [];

  constructor(
    private readonly scenarioState: Nfe70031ScenarioState = createNfe70031ScenarioState()
  ) {}

  async getPortfolioContext(): Promise<PortfolioContext> {
    return portfolioContext;
  }

  async getCompanyWorkspaceContext(): Promise<CompanyWorkspaceContext> {
    return companyWorkspaceContext;
  }

  async getCompanyContext(): Promise<CompanyContext> {
    return companyContext;
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
    return documentAnalysisContext;
  }

  async getPendingItems(): Promise<PendingItemsContext> {
    if (this.scenarioState.economicPurpose && this.scenarioState.economicPurpose !== "unknown") {
      return { ...pendingItemsContext, items: [] };
    }

    return {
      ...pendingItemsContext,
      items: [
        {
          ...purposePendingItem,
          description:
            this.scenarioState.economicPurpose === "unknown"
              ? "A empresa informou que ainda não sabe a finalidade econômica desta operação."
              : purposePendingItem.description
        }
      ]
    };
  }

  async providePendingItemInformation(
    request: ProvidePendingItemInformationRequest
  ): Promise<ProvidePendingItemInformationResult> {
    if (request.pendingItemId !== purposePendingItem.pendingItemId) {
      throw new Error("mock_pending_item_not_found");
    }

    const value = request.response.economicPurpose;
    if (
      value !== "maintenance" &&
      value !== "production" &&
      value !== "internal_use" &&
      value !== "unknown"
    ) {
      throw new Error("mock_pending_item_invalid_response");
    }

    this.scenarioState.economicPurpose = value as Nfe70031EconomicPurpose;

    return {
      pendingItem: {
        ...purposePendingItem,
        status: value === "unknown" ? "awaiting_information" : "pending_review"
      },
      acceptedContext: {
        economicPurpose: value
      }
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
