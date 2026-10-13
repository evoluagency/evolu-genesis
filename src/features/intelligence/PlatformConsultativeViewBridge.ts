/**
 * UX-7B: strict presentation boundary for the EXISTING private Platform BFF
 * POST /api/ux/intelligence/consult/v1. This module never sends a request.
 *
 * Existing Platform v1.0.0 consult results have no attested response language,
 * so their answer MUST NOT be presented as localized Genesis Intelligence UX.
 * A future BFF v1.1.0 can attest the actual answer language explicitly.
 */
import {
  validateIntelligencePresentation,
  type IntelligenceLocale,
  type IntelligenceViewIntent,
  type IntelligenceViewScope,
} from "./PresentationIntent.js";

export type PlatformConsultativeScope = IntelligenceViewScope & Readonly<{
  tenantSlug: string;
  referenceDate: string;
}>;

export type ExplicitHumanConsultation = Readonly<{
  scope: PlatformConsultativeScope;
  locale: IntelligenceLocale;
  question: string;
  humanInitiated: true;
}>;

export type PlatformConsultativeInvocation = Readonly<{
  service: "intelligence";
  operation: "requestConsultativeAnswerSource";
  tenantSlug: string;
  payload: Readonly<{
    tenantId: string;
    companyId: string; // canonical Platform business group
    cnpjId: string; // canonical Platform establishment
    referenceDate: string;
    question: string;
  }>;
}>;

export class PlatformConsultativeBoundaryError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "PlatformConsultativeBoundaryError";
  }
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;
const slug = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;
const pageId = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,127}$/;
function deny(code: string): never { throw new PlatformConsultativeBoundaryError(code); }
function obj(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function day(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T00:00:00.000Z");
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
function validScope(s: PlatformConsultativeScope): boolean {
  return !!s && uuid.test(s.tenantId) && uuid.test(s.companyId) &&
    uuid.test(s.cnpjId) && s.companyId !== s.cnpjId &&
    slug.test(s.tenantSlug) && pageId.test(s.pageId) && day(s.referenceDate);
}
function checkExpected(request: ExplicitHumanConsultation): void {
  if (!request || request.humanInitiated !== true || !validScope(request.scope) ||
      (request.locale !== "pt-BR" && request.locale !== "en") ||
      typeof request.question !== "string" ||
      request.question.trim().length < 10 || request.question.trim().length > 1400) {
    deny("invalid_human_consultation");
  }
}

/**
 * Builds only the EXACT shape already accepted by Platform's guarded route.
 * No web fetch, token, credential, history, model selection, or execution.
 */
export function createPlatformConsultativeInvocation(
  request: ExplicitHumanConsultation,
): PlatformConsultativeInvocation {
  checkExpected(request);
  const s = request.scope;
  const invocation: PlatformConsultativeInvocation = {
    service: "intelligence",
    operation: "requestConsultativeAnswerSource",
    tenantSlug: s.tenantSlug,
    payload: {
      tenantId: s.tenantId,
      companyId: s.companyId,
      cnpjId: s.cnpjId,
      referenceDate: s.referenceDate,
      question: request.question.trim(),
    },
  };
  // The BFF enforces a 2048-byte request cap, including multi-byte UTF-8.
  if (new TextEncoder().encode(JSON.stringify(invocation)).byteLength > 2048) {
    deny("platform_request_limit");
  }
  return invocation;
}

export type SafeConsultationProjection = Readonly<{
  state: "PRESENTABLE" | "UNAVAILABLE";
  /** Projection ONLY, never approval, fiscal classification or authority to act. */
  intent: IntelligenceViewIntent;
  /** Source version actually validated by this bridge, for traceability. */
  sourceSchema: "1.0.0" | "1.1.0";
}>;

function plainNotice(locale: IntelligenceLocale, reason: "BLOCKED" | "LOCALE_UNVERIFIED"): string {
  if (locale === "en") {
    return reason === "BLOCKED"
      ? "The governed consultation is unavailable or blocked. No analysis was authorized for display."
      : "The response language was not verified by the server. No analysis has been presented.";
  }
  return reason === "BLOCKED"
    ? "A consulta governada está indisponível ou bloqueada. Nenhuma análise foi autorizada para exibição."
    : "O idioma da resposta não foi verificado pelo servidor. Nenhuma análise foi apresentada.";
}
function reviewNotice(locale: IntelligenceLocale): string {
  return locale === "en"
    ? "Advisory content only. Verify sources, applicability and tax rules with a qualified professional before any action."
    : "Conteúdo exclusivamente consultivo. Confira as fontes, a aplicabilidade e as regras tributárias com profissional habilitado antes de qualquer ação.";
}
function intentFor(
  request: ExplicitHumanConsultation,
  kind: "UNAVAILABLE" | "EXPLAIN",
  text: string,
  caution: string,
  now: number,
): IntelligenceViewIntent {
  const scope: IntelligenceViewScope = {
    tenantId: request.scope.tenantId,
    companyId: request.scope.companyId,
    cnpjId: request.scope.cnpjId,
    pageId: request.scope.pageId,
  };
  // A deterministic UI interaction identifier; not an authorization ID.
  const raw = {
    schemaVersion: "1.1.0",
    locale: request.locale,
    interactionId: "platform-consultation-readonly",
    kind,
    scope,
    expiresAt: new Date(now + 5 * 60 * 1000).toISOString(),
    lifecycleEffect: "NONE",
    executionAuthority: "NONE",
    blocks: kind === "EXPLAIN" ?
      [{ type: "TEXT", text }, { type: "NOTICE", level: "CAUTION", text: caution }] :
      [{ type: "NOTICE", level: "CAUTION", text: caution }],
  };
  return validateIntelligencePresentation(raw, scope, now, request.locale);
}
/**
 * The host must supply a response from the authenticated, scope-verifying
 * Platform BFF. The bridge is defense in depth and NEVER substitutes server
 * auth/RLS, principal validation, origin pinning or paid-inference cost guard.
 */
export function projectPrivatePlatformConsultation(
  raw: unknown,
  request: ExplicitHumanConsultation,
  now = Date.now(),
): SafeConsultationProjection {
  checkExpected(request);
  if (!obj(raw) || !["1.0.0", "1.1.0"].includes(String(raw.schemaVersion)) ||
      raw.sourceKind !== "intelligence_consultative_answer" ||
      raw.lifecycle !== "PRE_LEARNING" ||
      raw.tenantId !== request.scope.tenantId ||
      raw.companyId !== request.scope.companyId ||
      raw.cnpjId !== request.scope.cnpjId ||
      raw.referenceDate !== request.scope.referenceDate ||
      !["BLOCKED", "ADVISORY_ONLY"].includes(String(raw.decision)) ||
      typeof raw.answer !== "string" || !raw.answer.trim() ||
      raw.answer.length > 10000 ||
      typeof raw.responseMode !== "string" ||
      !/^(MODEL|SAFE_FALLBACK|AI_COST_GUARD|RETRIEVAL_[A-Z0-9_]+)$/.test(raw.responseMode) ||
      typeof raw.model !== "string" ||
      !obj(raw.costGuard) || typeof raw.costGuard.allowed !== "boolean" ||
      !obj(raw.evidence) || typeof raw.evidence.retrievalDecision !== "string" ||
      !obj(raw.capabilities) || !obj(raw.dataQuality) ||
      !Array.isArray(raw.provenance) || raw.provenance.length !== 1 ||
      !obj(raw.provenance[0]) ||
      raw.provenance[0].source !== "Intelligence.POST /api/intelligence" ||
      typeof raw.provenance[0].observedAt !== "string" ||
      !Number.isFinite(Date.parse(raw.provenance[0].observedAt)) ||
      raw.capabilities.canApprove?.status !== "unavailable" ||
      raw.capabilities.canExecute?.status !== "unavailable" ||
      raw.capabilities.canLearn?.status !== "unavailable") {
    deny("platform_consultative_contract_mismatch");
  }
  const schema = raw.schemaVersion as "1.0.0" | "1.1.0";
  const blockedByUpstream = raw.decision !== "ADVISORY_ONLY" ||
    raw.costGuard.allowed !== true ||
    raw.responseMode !== "MODEL" ||
    raw.model === "NONE";
  if (blockedByUpstream) {
    return { state: "UNAVAILABLE", sourceSchema: schema,
      intent: intentFor(request, "UNAVAILABLE", "",
        plainNotice(request.locale, "BLOCKED"), now) };
  }
  // v1.0.0 BFF does NOT declare response locale. NEVER claim the answer
  // is translated just because the browser locale is PT or EN.
  if (schema !== "1.1.0" || raw.answerLocale !== request.locale ||
      raw.localeVerified !== true) {
    return { state: "UNAVAILABLE", sourceSchema: schema,
      intent: intentFor(request, "UNAVAILABLE", "",
        plainNotice(request.locale, "LOCALE_UNVERIFIED"), now) };
  }
  // Version 1.1.0 is proposed for a future private BFF. Its explicit locale
  // must be bound to an actually verified upstream response, never copied
  // blindly from a caller-supplied selector.
  if (raw.answer.length > 6000) deny("platform_presentation_size_limit");
  return { state: "PRESENTABLE", sourceSchema: schema,
    intent: intentFor(request, "EXPLAIN", raw.answer,
      reviewNotice(request.locale), now) };
}
