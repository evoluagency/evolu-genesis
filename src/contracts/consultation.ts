/**
 * Consultation is distinct from Genesis IntelligenceProvider analysis commands.
 * This DTO follows the existing Intelligence V1 /api/intelligence response, but
 * its client does NOT call that endpoint; only a private authorized host may
 * inject the transport that reaches it.
 */
export interface ConsultationCompanySelection {
  tenantId: string;
  tenantSlug: string;
  companyId: string;
  referenceDate: string;
}
export interface ConsultationMessage {
  role: "user" | "assistant";
  content: string;
}
export interface ConsultationInput {
  input: string;
  history?: ReadonlyArray<ConsultationMessage>;
  companySelection?: ConsultationCompanySelection;
}
export interface ConsultationWireInput {
  input: string;
  history: Array<ConsultationMessage>;
  company_selection?: {
    tenant_id: string;
    tenant_slug: string;
    company_id: string;
    reference_date: string;
  };
}
/**
 * Browser-inert interface. The host owns same-origin auth, capability gating,
 * server-side principal verification, tenant-scoped access and cost limits.
 */
export interface ConsultationTransport {
  send(input: Readonly<ConsultationWireInput>): Promise<unknown>;
}
export interface ConsultationSource {
  sourceId: string;
  title: string;
  domain?: string;
}
export interface ConsultationAnswer {
  answer: string;
  responseMode: string;
  sources: ConsultationSource[];
  companyContext: "VERIFIED" | "NOT_SELECTED";
  /** True only for a server-confirmed selection matching the request. */
  scopeVerified: boolean;
  /** Capability of this adapter is exclusively consultation, never mutation. */
  authority: "INTELLIGENCE_ADVISORY_ONLY";
  lifecycleEffect: "NONE";
  benchmarkUsedAsContext: false;
}
