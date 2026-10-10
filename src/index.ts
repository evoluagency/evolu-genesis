export * from "./domain/index.js";
export * from "./contracts/index.js";

export type { PlatformProvider } from "./providers/platform/PlatformProvider.js";
export type { IntelligenceProvider } from "./providers/intelligence/IntelligenceProvider.js";

export { MockPlatformProvider } from "./providers/platform/MockPlatformProvider.js";
export { MockIntelligenceProvider } from "./providers/intelligence/MockIntelligenceProvider.js";

export * from "./mocks/scenarios/nfe-70031.js";

export * from "./features/fiscal-documents/Nfe70031Controller.js";
export * from "./features/company/CompanyWorkspaceController.js";
export * from "./features/reconciliation/ReconciliationController.js";
export * from "./mocks/scenarios/reconciliation-2026-09.js";
