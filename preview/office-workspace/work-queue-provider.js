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
  async load(selection = {}) {
    const cnpjId = cnpjByLegacy[selection.cnpj] ?? mockCnpj.cnpjId;
    const periodId = periodByCompetence[selection.period] ?? mockPeriod.periodId;

    this.state = await controller.load({
      companyId: mockCompany.companyId,
      cnpjId,
      periodId
    });
    return this.state;
  },
  async decideApproval(approvalId, outcome) {
    await controller.decideApproval(approvalId, outcome);
    this.state = controller.getCurrent();
    return this.state;
  }
};

const params = new URLSearchParams(window.location.search);
await bridge.load({
  cnpj: params.get("cnpj") ?? "m",
  period: params.get("period") ?? "2026-09"
});

window.EvoluOfficeWorkQueueBridge = bridge;
window.dispatchEvent(new CustomEvent("evolu:office-work-queue-ready"));
