import type {
  ActionExecutionRequest,
  ApprovalContext,
  CompanyContext,
  CompanyWorkspaceContext,
  DocumentAnalysisContext,
  FiscalDocumentsContext,
  PendingItemsContext,
  PortfolioContext,
  RecordApprovalRequest,
  RecordDecisionRequest
} from "../../contracts/index.js";
import type { ActionResult, ApprovalRecord, Decision } from "../../domain/index.js";
import {
  approvalContext,
  companyContext,
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
    return pendingItemsContext;
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
    if (request.authorization.kind === "approval_record") {
      const approved = this.approvals.some(
        approval =>
          approval.approvalId === request.authorization.approvalId &&
          approval.status === "approved"
      );
      if (!approved) {
        throw new Error("mock_action_not_authorized");
      }
    } else if (!request.authorization.capability || !request.authorization.reason) {
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
