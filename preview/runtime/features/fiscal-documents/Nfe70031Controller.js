export class Nfe70031Controller {
    platform;
    intelligence;
    config;
    analysis = null;
    recommendation = null;
    decision = null;
    approval = null;
    purpose = null;
    constructor(platform, intelligence, config) {
        this.platform = platform;
        this.intelligence = intelligence;
        this.config = config;
    }
    async load() {
        const context = await this.platform.getDocumentAnalysisContext({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            documentId: this.config.documentId
        });
        const analysis = await this.intelligence.requestDocumentAnalysis({
            schemaVersion: "1.0.0",
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            documentId: this.config.documentId,
            purpose: "economic_purpose_review",
            requestedBy: this.config.actor
        });
        this.analysis = analysis;
        this.recommendation = analysis.recommendations[0] ?? null;
        await this.recordAnalysisObservation(analysis);
        return { context, analysis };
    }
    async recordPurpose(purpose) {
        await this.platform.recordPendingInformation({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            pendingItemId: this.config.pendingItemId,
            value: purpose,
            recordedBy: this.config.actor
        });
        this.purpose = purpose;
        this.decision = null;
        this.approval = null;
        const analysis = await this.intelligence.requestDocumentAnalysis({
            schemaVersion: "1.0.0",
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            documentId: this.config.documentId,
            purpose: "economic_purpose_review",
            requestedBy: this.config.actor
        });
        this.analysis = analysis;
        this.recommendation = analysis.recommendations[0] ?? null;
        await this.recordAnalysisObservation(analysis);
        return analysis;
    }
    async recordRecommendationDecision(value) {
        if (!this.analysis || !this.recommendation)
            throw new Error("recommendation_not_available");
        const decision = await this.platform.recordDecision({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            accountingPeriodId: this.config.accountingPeriodId,
            subjectType: "FiscalDocument",
            subjectId: this.config.documentId,
            analysisId: this.analysis.analysisId,
            recommendationId: this.recommendation.recommendationId,
            decision: value,
            decidedBy: this.config.actor
        });
        this.decision = decision;
        this.approval = null;
        return decision;
    }
    async recordApproval(outcome) {
        if (!this.decision || !this.recommendation)
            throw new Error("decision_not_available");
        const approval = await this.platform.recordApproval({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            accountingPeriodId: this.config.accountingPeriodId,
            decisionId: this.decision.decisionId,
            subjectType: "FiscalDocument",
            subjectId: this.config.documentId,
            outcome,
            actor: this.config.actor
        });
        this.approval = approval;
        return approval;
    }
    async executeApprovedAction() {
        if (!this.approval || this.approval.status !== "approved")
            throw new Error("approval_not_granted");
        if (!this.purpose || this.purpose === "unknown")
            throw new Error("economic_purpose_not_resolved");
        const request = {
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            authorization: {
                kind: "approval_record",
                approvalId: this.approval.approvalId
            },
            actionType: "record_economic_purpose",
            subjectType: "FiscalDocument",
            subjectId: this.config.documentId,
            payload: {
                economicPurpose: this.purpose
            },
            requestedBy: this.config.actor
        };
        return this.platform.requestActionExecution(request);
    }
    async getAuditHistory() {
        return this.platform.getAuditHistory({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            periodId: this.config.accountingPeriodId,
            subject: {
                type: "FiscalDocument",
                id: this.config.documentId
            }
        });
    }
    async recordAnalysisObservation(analysis) {
        await this.platform.recordAnalysisObservation({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            accountingPeriodId: this.config.accountingPeriodId,
            subjectType: "FiscalDocument",
            subjectId: this.config.documentId,
            analysisId: analysis.analysisId,
            status: analysis.status,
            findingIds: analysis.findings.map(item => item.findingId),
            evidenceRefs: analysis.evidence.map(item => item.evidenceId),
            recommendationIds: analysis.recommendations.map(item => item.recommendationId),
            actor: "intelligence"
        });
    }
}
