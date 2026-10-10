import {
  MockPlatformProvider,
  OfficeWorkQueueController,
  mockTenant,
  mockCompany,
  mockCnpj,
  mockBranchCnpj,
  mockPeriod,
  mockPreviousPeriod
} from "../runtime/index.js";

const platform = new MockPlatformProvider();
const controller = new OfficeWorkQueueController(platform, {
  tenantId: mockTenant.tenantId,
  actor: "office-professional-demo"
});

const cnpjByLegacy = {
  m: mockCnpj.cnpjId,
  f: mockBranchCnpj.cnpjId
};

const periodByCompetence = {
  [mockPeriod.competence]: mockPeriod.periodId,
  [mockPreviousPeriod.competence]: mockPreviousPeriod.periodId
};

const bridge = {
  state: null,
  selection: null,
  async load(selection = {}) {
    const portfolio = await platform.getPortfolioContext({
      tenantId: mockTenant.tenantId
    });
    const companyId =
      portfolio.companies.find(item => item.companyId === selection.companyId)?.companyId ??
      portfolio.companies[0]?.companyId;

    if (!companyId) {
      throw new Error("mock_portfolio_empty");
    }

    const cnpjId =
      selection.cnpjId ??
      cnpjByLegacy[selection.cnpj] ??
      mockCnpj.cnpjId;
    const periodId = periodByCompetence[selection.period] ?? mockPeriod.periodId;

    const workspace = await platform.getCompanyWorkspaceContext({
      tenantId: mockTenant.tenantId,
      companyId,
      cnpjId,
      accountingPeriodId: periodId
    });

    const queues = await controller.load({
      companyId,
      cnpjId,
      periodId
    });

    this.selection = {
      companyId,
      cnpjId: workspace.selectedCnpjId,
      cnpj:
        workspace.selectedCnpjId === mockBranchCnpj.cnpjId
          ? "f"
          : "m",
      period: workspace.activeAccountingPeriod.competence
    };
    this.state = {
      portfolio,
      workspace,
      ...queues
    };
    return this.state;
  },
  async decideApproval(approvalId, outcome) {
    await controller.decideApproval(approvalId, outcome);
    const queues = controller.getCurrent();
    this.state = {
      ...this.state,
      ...queues
    };
    return this.state;
  }
};

const params = new URLSearchParams(window.location.search);
await bridge.load({
  cnpjId: params.get("cnpjId") ?? undefined,
  cnpj: params.get("cnpj") ?? "m",
  period: params.get("period") ?? "2026-09"
});

window.EvoluOfficeWorkQueueBridge = bridge;
window.dispatchEvent(new CustomEvent("evolu:office-work-queue-ready"));
