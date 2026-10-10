export class OfficeWorkQueueController {
    platform;
    config;
    state = null;
    selection = {};
    constructor(platform, config) {
        this.platform = platform;
        this.config = config;
    }
    async load(selection = {}) {
        this.selection = { ...selection };
        const [pending, approvals] = await Promise.all([
            this.platform.getPendingItems({
                tenantId: this.config.tenantId,
                ...selection
            }),
            this.platform.getApprovals({
                tenantId: this.config.tenantId,
                ...selection
            })
        ]);
        this.state = { pending, approvals };
        return this.state;
    }
    async decideApproval(approvalId, outcome) {
        const state = this.requireState();
        const approval = state.approvals.approvals.find(item => item.approvalId === approvalId);
        if (!approval) {
            throw new Error("approval_not_in_current_queue");
        }
        if (approval.status !== "awaiting_approval") {
            throw new Error("approval_already_decided");
        }
        const companyId = approval.scope.companyId;
        const cnpjId = approval.scope.cnpjId;
        if (!companyId || !cnpjId) {
            throw new Error("approval_scope_incomplete");
        }
        const result = await this.platform.recordApproval({
            approvalId: approval.approvalId,
            tenantId: approval.scope.tenantId,
            companyId,
            cnpjId,
            ...(approval.scope.accountingPeriodId
                ? { accountingPeriodId: approval.scope.accountingPeriodId }
                : {}),
            decisionId: approval.decisionId,
            subjectType: approval.subjectType,
            subjectId: approval.subjectId,
            outcome,
            actor: this.config.actor
        });
        await this.load(this.selection);
        return result;
    }
    getCurrent() {
        return this.requireState();
    }
    requireState() {
        if (!this.state) {
            throw new Error("office_work_queue_not_loaded");
        }
        return this.state;
    }
}
