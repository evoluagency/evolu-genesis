export class CompanyWorkspaceController {
    platform;
    config;
    context = null;
    constructor(platform, config) {
        this.platform = platform;
        this.config = config;
    }
    async load(selection = {}) {
        const base = await this.platform.getCompanyWorkspaceContext({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId
        });
        const cnpjId = selection.cnpjId &&
            base.cnpjs.some(item => item.cnpjId === selection.cnpjId)
            ? selection.cnpjId
            : base.selectedCnpjId;
        const accountingPeriod = selection.competence
            ? base.availableAccountingPeriods.find(period => period.competence === selection.competence) ?? base.activeAccountingPeriod
            : base.activeAccountingPeriod;
        const context = await this.platform.getCompanyWorkspaceContext({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId,
            accountingPeriodId: accountingPeriod.periodId
        });
        this.context = context;
        return context;
    }
    async selectCnpj(cnpjId) {
        const current = this.requireContext();
        if (!current.cnpjs.some(item => item.cnpjId === cnpjId)) {
            throw new Error("cnpj_not_authorized");
        }
        this.context = await this.platform.getCompanyWorkspaceContext({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId,
            accountingPeriodId: current.activeAccountingPeriod.periodId
        });
        return this.context;
    }
    async selectCompetence(competence) {
        const current = this.requireContext();
        const period = current.availableAccountingPeriods.find(item => item.competence === competence);
        if (!period) {
            throw new Error("accounting_period_not_available");
        }
        this.context = await this.platform.getCompanyWorkspaceContext({
            tenantId: this.config.tenantId,
            companyId: this.config.companyId,
            cnpjId: current.selectedCnpjId,
            accountingPeriodId: period.periodId
        });
        return this.context;
    }
    getCurrent() {
        return this.requireContext();
    }
    requireContext() {
        if (!this.context) {
            throw new Error("company_workspace_not_loaded");
        }
        return this.context;
    }
}
