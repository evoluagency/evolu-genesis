import { approvalContext, companyContext, createNfe70031ScenarioState, companyWorkspaceContext, documentAnalysisContext, fiscalDocumentsContext, pendingItemsContext, portfolioContext, purposePendingItem } from "../../mocks/scenarios/nfe-70031.js";
export class MockPlatformProvider {
    scenarioState;
    decisions = [];
    approvals = [];
    constructor(scenarioState = createNfe70031ScenarioState()) {
        this.scenarioState = scenarioState;
    }
    async getPortfolioContext() {
        return portfolioContext;
    }
    async getCompanyWorkspaceContext() {
        return companyWorkspaceContext;
    }
    async getCompanyContext() {
        return companyContext;
    }
    async getFiscalDocuments() {
        return fiscalDocumentsContext;
    }
    async getDocumentAnalysisContext(input) {
        if (input.documentId !== documentAnalysisContext.document.documentId) {
            throw new Error("mock_document_not_found");
        }
        return documentAnalysisContext;
    }
    async getPendingItems() {
        if (this.scenarioState.economicPurpose && this.scenarioState.economicPurpose !== "unknown") {
            return { ...pendingItemsContext, items: [] };
        }
        return {
            ...pendingItemsContext,
            items: [
                {
                    ...purposePendingItem,
                    description: this.scenarioState.economicPurpose === "unknown"
                        ? "A empresa informou que ainda não sabe a finalidade econômica desta operação."
                        : purposePendingItem.description
                }
            ]
        };
    }
    async providePendingItemInformation(request) {
        if (request.pendingItemId !== purposePendingItem.pendingItemId) {
            throw new Error("mock_pending_item_not_found");
        }
        const value = request.response.economicPurpose;
        if (value !== "maintenance" &&
            value !== "production" &&
            value !== "internal_use" &&
            value !== "unknown") {
            throw new Error("mock_pending_item_invalid_response");
        }
        this.scenarioState.economicPurpose = value;
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
    async getApprovals() {
        return {
            ...approvalContext,
            approvals: [...this.approvals],
            relatedDecisions: [...this.decisions]
        };
    }
    async recordDecision(request) {
        const decision = {
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
    async recordApproval(request) {
        const now = new Date().toISOString();
        const approval = {
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
    async requestActionExecution(request) {
        const authorization = request.authorization;
        if (authorization.kind === "approval_record") {
            const approved = this.approvals.some(approval => approval.approvalId === authorization.approvalId &&
                approval.status === "approved");
            if (!approved) {
                throw new Error("mock_action_not_authorized");
            }
        }
        else if (!authorization.capability || !authorization.reason) {
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
