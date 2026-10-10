export class HistoryController {
    platform;
    intelligence;
    config;
    state = null;
    constructor(platform, intelligence, config) {
        this.platform = platform;
        this.intelligence = intelligence;
        this.config = config;
    }
    async load(selection = {}) {
        const [audit, analyses] = await Promise.all([
            this.platform.getAuditHistory({
                tenantId: this.config.tenantId,
                ...selection
            }),
            this.intelligence.getAnalysisHistory({
                tenantId: this.config.tenantId,
                ...(selection.companyId ? { companyId: selection.companyId } : {}),
                ...(selection.cnpjId ? { cnpjId: selection.cnpjId } : {})
            })
        ]);
        this.state = { audit, analyses };
        return this.state;
    }
    getCurrent() {
        if (!this.state)
            throw new Error("history_not_loaded");
        return this.state;
    }
}
