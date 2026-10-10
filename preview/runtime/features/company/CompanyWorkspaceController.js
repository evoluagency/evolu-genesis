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
        let cnpjId = base.selectedCnpjId;
        if (selection.cnpjId) {
            if (!base.cnpjs.some(item => item.cnpjId === selection.cnpjId)) {
                throw new Error("cnpj_not_authorized");
            }
            if (selection.cnpjId !== base.selectedCnpjId) {
                this.requireCapability(base, "canSelectCnpj");
            }
            cnpjId = selection.cnpjId;
        }
        let accountingPeriod = base.activeAccountingPeriod;
        if (selection.competence) {
            const selectedPeriod = base.availableAccountingPeriods.find(period => period.competence === selection.competence);
            if (!selectedPeriod) {
                throw new Error("accounting_period_not_available");
            }
            if (selectedPeriod.periodId !== base.activeAccountingPeriod.periodId) {
                this.requireCapability(base, "canSelectPeriod");
            }
            accountingPeriod = selectedPeriod;
        }
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
        if (cnpjId !== current.selectedCnpjId) {
            this.requireCapability(current, "canSelectCnpj");
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
        if (period.periodId !== current.activeAccountingPeriod.periodId) {
            this.requireCapability(current, "canSelectPeriod");
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
    requireCapability(context, capabilityName) {
        const capability = context.capabilities[capabilityName];
        if (!capability || capability.status === "forbidden") {
            throw new Error(`${capabilityName}_forbidden`);
        }
        if (capability.status === "unavailable") {
            throw new Error(`${capabilityName}_unavailable${capability.reasonCode ? `:${capability.reasonCode}` : ""}`);
        }
    }
    requireContext() {
        if (!this.context) {
            throw new Error("company_workspace_not_loaded");
        }
        return this.context;
    }
}
