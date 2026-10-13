export * from "./domain/index.js";
export * from "./contracts/index.js";

export type { PlatformProvider } from "./providers/platform/PlatformProvider.js";
export type { IntelligenceProvider } from "./providers/intelligence/IntelligenceProvider.js";
export type { GatewayTransport, GatewayInvocation } from "./providers/adapters/GatewayTransport.js";
export { AdapterContractError } from "./providers/adapters/GatewayTransport.js";
export { PlatformAdapter } from "./providers/platform/PlatformAdapter.js";
export { IntelligenceAdapter } from "./providers/intelligence/IntelligenceAdapter.js";

export { MockPlatformProvider } from "./providers/platform/MockPlatformProvider.js";
export { MockIntelligenceProvider } from "./providers/intelligence/MockIntelligenceProvider.js";

export * from "./mocks/scenarios/nfe-70031.js";

export * from "./features/fiscal-documents/Nfe70031Controller.js";
export * from "./features/company/CompanyWorkspaceController.js";
export * from "./features/reconciliation/ReconciliationController.js";
export * from "./features/pending-items/OfficeWorkQueueController.js";
export * from "./features/history/HistoryController.js";

// Consultation is distinct from IntelligenceProvider's four canonical analysis methods.
export type {
  ConsultationCompanySelection, ConsultationMessage, ConsultationInput,
  ConsultationWireInput, ConsultationTransport, ConsultationSource, ConsultationAnswer,
} from "./contracts/consultation.js";
export {
  ConsultativeIntelligenceAdapter, ConsultationContractError,
} from "./providers/intelligence/ConsultativeIntelligenceAdapter.js";

 // Scoped contextual Intelligence presentation and guarded host facade.
export type {
  IntelligenceLocale, IntelligenceViewScope, IntelligenceViewIntent,
  IntelligenceViewKind, IntelligenceViewBlock,
} from "./features/intelligence/PresentationIntent.js";
export {
  validateIntelligencePresentation, IntelligencePresentationError,
} from "./features/intelligence/PresentationIntent.js";
export type {
  PlatformConsultativeScope, ExplicitHumanConsultation,
  PlatformConsultativeInvocation, SafeConsultationProjection,
} from "./features/intelligence/PlatformConsultativeViewBridge.js";
export {
  createPlatformConsultativeInvocation, projectPrivatePlatformConsultation,
  PlatformConsultativeBoundaryError,
} from "./features/intelligence/PlatformConsultativeViewBridge.js";
export type {
  AuthenticatedPageSnapshot, HostContextReader, ConsultativeHostTransport,
  AccessTokenProvider, SameOriginFetch,
} from "./features/intelligence/LivePlatformConsultation.js";
export {
  PLATFORM_CONSULTATIVE_ENDPOINT, LiveConsultationBoundaryError,
  SameOriginPlatformConsultativeTransport, LiveConsultationCoordinator,
} from "./features/intelligence/LivePlatformConsultation.js";

// Authenticated-host consultation errors are mapped to localized, non-sensitive notices.
export type { ConsultativeNoticeKind, ConsultativeHostNotice } from "./features/intelligence/ConsultativeStatus.js";
export { describeConsultativeFailure } from "./features/intelligence/ConsultativeStatus.js";
