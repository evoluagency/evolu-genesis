export class ReconciliationController {
    platform;
    intelligence;
    config;
    context = null;
    analysis = null;
    constructor(platform, intelligence, config) {
        this.platform = platform;
        this.intelligence = intelligence;
        this.config = config;
    }
    async load() {
        const context = await this.platform.getReconciliationContext({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            periodId: this.config.periodId
        });
        const analysis = await this.intelligence.requestReconciliationAnalysis({
            schemaVersion: "1.0.0",
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            reconciliationId: context.reconciliation.reconciliationId,
            periodId: this.config.periodId,
            requestedBy: this.config.actor
        });
        this.context = context;
        this.analysis = analysis;
        await this.platform.recordAnalysisObservation({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            accountingPeriodId: this.config.periodId,
            subjectType: "Reconciliation",
            subjectId: context.reconciliation.reconciliationId,
            analysisId: analysis.analysisId,
            status: analysis.status,
            findingIds: analysis.findings.map(item => item.findingId),
            evidenceRefs: analysis.evidence.map(item => item.evidenceId),
            recommendationIds: analysis.recommendations.map(item => item.recommendationId),
            actor: "intelligence"
        });
        return { context, analysis };
    }
    async createFollowup() {
        const analysis = this.requireAnalysis();
        const item = analysis.missingContext[0];
        if (!item)
            throw new Error("reconciliation_followup_not_required");
        const result = await this.platform.recordPendingItem({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            item,
            recordedBy: this.config.actor
        });
        this.context = await this.platform.getReconciliationContext({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: this.config.cnpjId,
            periodId: this.config.periodId
        });
        return result.item;
    }
    getCurrentContext() {
        if (!this.context)
            throw new Error("reconciliation_context_not_loaded");
        return this.context;
    }
    getCurrentAnalysis() {
        return this.requireAnalysis();
    }
    requireAnalysis() {
        if (!this.analysis)
            throw new Error("reconciliation_analysis_not_loaded");
        return this.analysis;
    }
}
