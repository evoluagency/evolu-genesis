import type {
  ConsultationAnswer,
  ConsultationCompanySelection,
  ConsultationInput,
  ConsultationSource,
  ConsultationTransport,
  ConsultationWireInput,
} from "../../contracts/consultation.js";

export class ConsultationContractError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "ConsultationContractError";
  }
}

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function nonempty(value: unknown, max = 6000): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}
function isoDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T00:00:00.000Z");
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
function checkSelection(value: ConsultationCompanySelection): void {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(value.tenantId) || !uuid.test(value.companyId) || !uuid.test(value.cnpjId) ||
      !/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(value.tenantSlug) ||
      !isoDay(value.referenceDate)) {
    throw new ConsultationContractError("consultation_invalid_selection");
  }
}
function validateSource(value: unknown): ConsultationSource {
  if (!object(value) || !nonempty(value.source_id, 160) || !nonempty(value.title, 500)) {
    throw new ConsultationContractError("consultation_invalid_sources");
  }
  if (value.domain !== undefined && !nonempty(value.domain, 120)) {
    throw new ConsultationContractError("consultation_invalid_sources");
  }
  const item: ConsultationSource = { sourceId: value.source_id, title: value.title };
  if (typeof value.domain === "string") item.domain = value.domain;
  return item;
}

/**
 * Maps the existing Intelligence V1 wire contract to Genesis presentation.
 * It does NOT fetch, log in, persist, train, start inference or authorize a
 * tenant. Every invocation requires a separately injected authorized server
 * transport; caller scope validation here is only defense in depth.
 */
export class ConsultativeIntelligenceAdapter {
  constructor(private readonly transport: ConsultationTransport) {}

  async ask(input: ConsultationInput): Promise<ConsultationAnswer> {
    if (!nonempty(input.input, 6000)) {
      throw new ConsultationContractError("consultation_invalid_input");
    }
    const history = input.history ?? [];
    if (history.length > 20 || history.some(message =>
      !message || !["user", "assistant"].includes(message.role) ||
      !nonempty(message.content, 6000))) {
      throw new ConsultationContractError("consultation_invalid_history");
    }

    const wire: ConsultationWireInput = {
      input: input.input.trim(),
      history: history.map(item => ({ role: item.role, content: item.content })),
    };
    if (input.companySelection !== undefined) {
      checkSelection(input.companySelection);
      wire.company_selection = {
        tenant_id: input.companySelection.tenantId,
        tenant_slug: input.companySelection.tenantSlug,
        // Intelligence V1 uses company_id for the CNPJ record ID.
        company_id: input.companySelection.cnpjId,
        reference_date: input.companySelection.referenceDate,
      };
    }

    const data: unknown = await this.transport.send(wire);
    if (!object(data) || !nonempty(data.answer, 120000) ||
        !nonempty(data.response_mode, 100) ||
        !/^(MODEL|SAFE_FALLBACK|AI_COST_GUARD|RETRIEVAL_[A-Z0-9_]+)$/.test(data.response_mode) ||
        data.lifecycle_effect !== "NONE" ||
        !object(data.benchmark) || data.benchmark.used_as_context !== false ||
        !object(data.company_context) || !object(data.knowledge) ||
        !Array.isArray(data.knowledge.sources) || data.knowledge.sources.length > 100) {
      throw new ConsultationContractError("consultation_invalid_response");
    }

    const context = data.company_context;
    const selected = input.companySelection;
    if (selected) {
      if (context.status !== "VERIFIED" || context.principal_verified !== true ||
          context.tenant_id !== selected.tenantId ||
          context.company_id !== selected.cnpjId ||
          context.reference_date !== selected.referenceDate) {
        throw new ConsultationContractError("consultation_scope_mismatch");
      }
    } else if (context.status !== "NOT_SELECTED") {
      throw new ConsultationContractError("consultation_scope_mismatch");
    }

    const sources: ConsultationSource[] = data.knowledge.sources.map(validateSource);
    return {
      answer: data.answer,
      responseMode: data.response_mode,
      sources,
      companyContext: selected ? "VERIFIED" : "NOT_SELECTED",
      verifiedScope: selected ? "TENANT_CNPJ_ONLY" : "NONE",
      authority: "INTELLIGENCE_ADVISORY_ONLY",
      lifecycleEffect: "NONE",
      benchmarkUsedAsContext: false,
    };
  }
}
