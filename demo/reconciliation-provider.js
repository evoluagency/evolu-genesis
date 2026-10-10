import {
  MockPlatformProvider,
  MockIntelligenceProvider,
  ReconciliationController,
  mockTenant,
  mockCompany,
  mockCnpj,
  mockPeriod
} from "../preview/runtime/index.js";

async function initializeReconciliationBridge() {
  const platform = new MockPlatformProvider();
  const intelligence = new MockIntelligenceProvider();
  const controller = new ReconciliationController(platform, intelligence, {
    tenantId: mockTenant.tenantId,
    companyId: mockCompany.companyId,
    cnpjId: mockCnpj.cnpjId,
    periodId: mockPeriod.periodId,
    actor: "demo-user"
  });

  const loaded = await controller.load();

  const bridge = {
    context: loaded.context,
    analysis: loaded.analysis,
    async createFollowup() {
      const item = await controller.createFollowup();
      this.context = controller.getCurrentContext();
      return item;
    }
  };

  window.EvoluReconciliationBridge = bridge;
  window.dispatchEvent(new CustomEvent("evolu:reconciliation-ready"));
}

window.addEventListener("evolu:reconciliation-reset", () => {
  void initializeReconciliationBridge();
});

await initializeReconciliationBridge();
