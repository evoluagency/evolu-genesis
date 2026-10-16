/**
 * UX-7B: strict presentation boundary for the EXISTING private Platform BFF
 * POST /api/ux/intelligence/consult/v1. This module never sends a request.
 *
 * Existing Platform v1.0.0 consult results have no attested response language,
 * so their answer MUST NOT be presented as localized Genesis Intelligence UX.
 * Even a future v1.1.0 localeVerified flag is NOT signed issuer proof, an
 * independently verified answer language, a certified replay claim, or a
 * release authorization. Until an explicit host-attested integration exists,
 * this bridge is intentionally unable to render ANY model answer.
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

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
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

// Untrusted host objects must not run getters, expose inherited authority,
// or switch a validated field before it is used in the presentation path.
// Ignore extra BFF metadata: it is not evidence of authorization.
function ownFields(value: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!obj(value)) deny("platform_consultative_contract_mismatch");
  const prototype=Object.getPrototypeOf(value);
  if (prototype!==Object.prototype && prototype!==null) {
    deny("platform_consultative_contract_mismatch");
  }
  const ownKeys=Reflect.ownKeys(value);
  if (ownKeys.length>256 || ownKeys.some(key=>typeof key!=="string")) {
    deny("platform_consultative_contract_mismatch");
  }
  const output:Record<string,unknown> = Object.create(null);
  for (const key of keys) {
    const descriptor=Object.getOwnPropertyDescriptor(value,key);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      deny("platform_consultative_contract_mismatch");
    }
    output[key]=descriptor.value;
  }
  return Object.freeze(output);
}
function copyResponse(raw: unknown): Record<string, unknown> {
  const root=ownFields(raw,[
    "schemaVersion","sourceKind","lifecycle","tenantId","companyId",
    "cnpjId","referenceDate","decision","answer","responseMode","model",
    "costGuard","evidence","capabilities","dataQuality","provenance",
  ]);
  const costGuard=ownFields(root.costGuard,["allowed"]);
  const evidence=ownFields(root.evidence,["retrievalDecision"]);
  const capabilities=ownFields(root.capabilities,["canApprove","canExecute","canLearn"]);
  const checkStatus=(v:unknown)=>ownFields(v,["status"]);
  if (!Array.isArray(root.provenance) || root.provenance.length!==1 ||
      Object.getPrototypeOf(root.provenance)!==Array.prototype) {
    deny("platform_consultative_contract_mismatch");
  }
  const sourceDescriptor=Object.getOwnPropertyDescriptor(root.provenance,"0");
  if (!sourceDescriptor || !sourceDescriptor.enumerable ||
      !("value" in sourceDescriptor)) deny("platform_consultative_contract_mismatch");
  const provenance=ownFields(sourceDescriptor.value,["source","observedAt"]);
  const objRoot=raw as Record<string,unknown>;
  const locale=Object.getOwnPropertyDescriptor(objRoot,"answerLocale");
  const verified=Object.getOwnPropertyDescriptor(objRoot,"localeVerified");
  if ((locale && (!locale.enumerable || !("value" in locale))) ||
      (verified && (!verified.enumerable || !("value" in verified)))) {
    deny("platform_consultative_contract_mismatch");
  }
  return Object.freeze({
    ...root,
    costGuard,evidence,
    capabilities:Object.freeze({
      canApprove:checkStatus(capabilities.canApprove),
      canExecute:checkStatus(capabilities.canExecute),
      canLearn:checkStatus(capabilities.canLearn),
    }),
    provenance:Object.freeze([provenance]),
    answerLocale:locale?.value,localeVerified:verified?.value,
  });
}
/**
 * A single detached, frozen read of fields supplied by the private host.
 * The snapshot is NOT authentication or a display grant. It is reused by
 * retrieval consistency and the presentation projection to avoid rereading
 * a foreign getter/proxy or a mutable response between stages.
 */
export function snapshotPrivatePlatformResponse(
  raw: unknown,
): Readonly<Record<string, unknown>> {
  try { return copyResponse(raw); }
  catch { deny("platform_consultative_contract_mismatch"); }
}

/**
 * Builds only the EXACT shape already accepted by Platform's guarded route.
 * No web fetch, token, credential, history, model selection, or execution.
 */
function createPlatformConsultativeInvocationUnchecked(
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
  state: "UNAVAILABLE";
  /** Projection ONLY, never approval, fiscal classification or authority to act. */
  intent: IntelligenceViewIntent;
  /** Source version actually validated by this bridge, for traceability. */
  sourceSchema: "1.0.0" | "1.1.0";
}>;

function plainNotice(locale: IntelligenceLocale, reason:
  "BLOCKED" | "LOCALE_UNVERIFIED" | "HOST_ATTESTATION_REQUIRED"): string {
  if (locale === "en") {
    if (reason === "BLOCKED") return "The governed consultation is unavailable or blocked. No analysis was authorized for display.";
    if (reason === "LOCALE_UNVERIFIED") return "The response language was not verified by the server. No analysis has been presented.";
    return "The private host has not certified signing authority, single-use replay protection, evidence and answer language. No analysis was presented.";
  }
  if (reason === "BLOCKED") return "A consulta governada está indisponível ou bloqueada. Nenhuma análise foi autorizada para exibição.";
  if (reason === "LOCALE_UNVERIFIED") return "O idioma da resposta não foi verificado pelo servidor. Nenhuma análise foi apresentada.";
  return "O servidor privado ainda não certificou a assinatura, a proteção contra reutilização, as evidências e o idioma. Nenhuma análise foi apresentada.";
}
function intentFor(
  request: ExplicitHumanConsultation,
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
    kind: "UNAVAILABLE",
    scope,
    expiresAt: new Date(now + 5 * 60 * 1000).toISOString(),
    lifecycleEffect: "NONE",
    executionAuthority: "NONE",
    blocks: [{ type: "NOTICE", level: "CAUTION", text: caution }],
  };
  return validateIntelligencePresentation(raw, scope, now, request.locale);
}
/**
 * The host must supply a response from the authenticated, scope-verifying
 * Platform BFF. The bridge is defense in depth and NEVER substitutes server
 * auth/RLS, principal validation, origin pinning or paid-inference cost guard.
 */
function projectPrivatePlatformConsultationUnchecked(
  raw: unknown,
  request: ExplicitHumanConsultation,
  now = Date.now(),
): SafeConsultationProjection {
  checkExpected(request);
  raw=copyResponse(raw);
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
      (!obj(raw.capabilities.canApprove) || raw.capabilities.canApprove.status !== "unavailable") ||
      (!obj(raw.capabilities.canExecute) || raw.capabilities.canExecute.status !== "unavailable") ||
      (!obj(raw.capabilities.canLearn) || raw.capabilities.canLearn.status !== "unavailable")) {
    deny("platform_consultative_contract_mismatch");
  }
  const schema = raw.schemaVersion as "1.0.0" | "1.1.0";
  const blockedByUpstream = raw.decision !== "ADVISORY_ONLY" ||
    raw.costGuard.allowed !== true ||
    raw.responseMode !== "MODEL" ||
    raw.model === "NONE";
  if (blockedByUpstream) {
    return { state: "UNAVAILABLE", sourceSchema: schema,
      intent: intentFor(request,
        plainNotice(request.locale, "BLOCKED"), now) };
  }
  // Preserve the proposed response-size ceiling without ever displaying it.
  if (schema === "1.1.0" && raw.answer.length > 6000) {
    deny("platform_presentation_size_limit");
  }
  // Neither a valid 1.0.0 BFF envelope nor 1.1.0 localeVerified boolean
  // is proof of independent language verification, issuer authorization or
  // distributed replay certification. The presentational V1 bundle also
  // explicitly returns canShowModelAnswer=false. No raw model text leaves
  // this bridge while the integrated release gate remains blocked.
  const reason = schema !== "1.1.0" ||
    raw.answerLocale !== request.locale || raw.localeVerified !== true
    ? "LOCALE_UNVERIFIED" : "HOST_ATTESTATION_REQUIRED";
  return { state: "UNAVAILABLE", sourceSchema: schema,
    intent: intentFor(request,plainNotice(request.locale,reason),now) };
}

/**
 * The public response boundary is never allowed to throw a foreign proxy or
 * getter diagnostic. No result from this V1 bridge grants model display.
 */
export function projectPrivatePlatformConsultation(
  raw:unknown,request:ExplicitHumanConsultation,now=Date.now(),
):SafeConsultationProjection {
  try { return projectPrivatePlatformConsultationUnchecked(raw,request,now); }
  catch(error) {
    if (error instanceof PlatformConsultativeBoundaryError) throw error;
    deny("platform_consultative_contract_mismatch");
  }
}
export function createPlatformConsultativeInvocation(
  request:ExplicitHumanConsultation,
):PlatformConsultativeInvocation {
  try { return createPlatformConsultativeInvocationUnchecked(request); }
  catch(error) {
    if (error instanceof PlatformConsultativeBoundaryError) throw error;
    deny("invalid_human_consultation");
  }
}
