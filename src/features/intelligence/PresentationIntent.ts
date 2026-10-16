/**
 * EVOLU Intelligence → Genesis presentation protocol V1 (proposal).
 *
 * The motor chooses WHAT to ask/explain, Genesis chooses HOW to render.
 * Strict, scope-bound, UI-only projection. Not a command execution API.
 */
export type IntelligenceViewScope = Readonly<{
  tenantId: string;
  companyId: string; // group, NOT CNPJ ID
  cnpjId: string; // establishment ID
  pageId: string;
}>;
export type IntelligenceLocale = "pt-BR" | "en";
export type IntelligenceViewKind =
  | "SILENT" | "INVITE" | "ASK" | "EXPLAIN" | "COMPARE_SCENARIOS"
  | "PRESENT_EVIDENCE" | "PLAN_PRESENTED" | "UNAVAILABLE";

export type IntelligenceViewBlock =
  | Readonly<{ type: "TEXT"; text: string }>
  | Readonly<{ type: "QUESTION"; prompt: string; responseKey: string; options?: readonly string[] }>
  | Readonly<{ type: "EVIDENCE"; sourceId: string; title: string; excerpt: string }>
  | Readonly<{ type: "SCENARIO"; title: string; summary: string; assumptions: readonly string[]; risks: readonly string[] }>
  | Readonly<{ type: "NOTICE"; level: "INFO" | "CAUTION"; text: string }>
  | Readonly<{ type: "PLAN"; planId: string; revision: number; summary: string; steps: readonly Readonly<{
    stepId: string; description: string; risk: "LOW" | "HIGH" | "REGULATED"
  }>[] }>;

export type IntelligenceViewIntent = Readonly<{
  schemaVersion: "1.1.0";
  locale: IntelligenceLocale;
  interactionId: string;
  kind: IntelligenceViewKind;
  scope: IntelligenceViewScope;
  expiresAt: string;
  lifecycleEffect: "NONE";
  executionAuthority: "NONE";
  blocks: readonly IntelligenceViewBlock[];
}>;

export class IntelligencePresentationError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "IntelligencePresentationError";
  }
}
function fail(code: string): never { throw new IntelligencePresentationError(code); }
function record(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function t(v: unknown, max = 2000): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}
function id(v: unknown): v is string { return t(v, 128) && /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(v); }
function uuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
}
function strings(v: unknown, maxItems: number): string[] {
  if (!Array.isArray(v) || v.length > maxItems || !v.every(x => t(x, 500))) fail("invalid_block");
  return v.map(x => String(x));
}
function exactKeys(value: Record<string, unknown>, keys: string[]): void {
  if (Object.keys(value).some(x => !keys.includes(x))) fail("unsupported_field");
}
function copyBlock(v: unknown): IntelligenceViewBlock {
  if (!record(v)) return fail("invalid_block");
  switch (v.type) {
    case "TEXT":
      exactKeys(v, ["type", "text"]);
      if (!t(v.text, 6000)) return fail("invalid_block");
      return { type: "TEXT", text: v.text };
    case "QUESTION":
      exactKeys(v, ["type", "prompt", "responseKey", "options"]);
      if (!t(v.prompt, 2000) || !id(v.responseKey)) return fail("invalid_block");
      if (v.options !== undefined) {
        const options = strings(v.options, 8);
        if (!options.length || new Set(options).size !== options.length) return fail("invalid_block");
        return { type: "QUESTION", prompt: v.prompt, responseKey: v.responseKey, options };
      }
      return { type: "QUESTION", prompt: v.prompt, responseKey: v.responseKey };
    case "EVIDENCE":
      exactKeys(v, ["type", "sourceId", "title", "excerpt"]);
      if (!id(v.sourceId) || !t(v.title, 300) || !t(v.excerpt, 2400)) return fail("invalid_block");
      return { type: "EVIDENCE", sourceId: v.sourceId, title: v.title, excerpt: v.excerpt };
    case "SCENARIO":
      exactKeys(v, ["type", "title", "summary", "assumptions", "risks"]);
      if (!t(v.title, 160) || !t(v.summary, 1600)) return fail("invalid_block");
      return { type: "SCENARIO", title: v.title, summary: v.summary,
        assumptions: strings(v.assumptions, 8), risks: strings(v.risks, 8) };
    case "NOTICE":
      exactKeys(v, ["type", "level", "text"]);
      if (!["INFO", "CAUTION"].includes(String(v.level)) || !t(v.text, 2000)) return fail("invalid_block");
      return { type: "NOTICE", level: v.level as "INFO" | "CAUTION", text: v.text };
    case "PLAN": {
      exactKeys(v, ["type", "planId", "revision", "summary", "steps"]);
      if (!id(v.planId) || !Number.isSafeInteger(v.revision) ||
          (v.revision as number) < 1 || !t(v.summary, 2000) ||
          !Array.isArray(v.steps) || v.steps.length < 1 || v.steps.length > 12) return fail("invalid_block");
      const stepIds = new Set<string>();
      const steps: {stepId: string; description: string; risk: "LOW" | "HIGH" | "REGULATED"}[] = [];
      for (const s of v.steps as unknown[]) {
        if (!record(s)) return fail("invalid_block");
        exactKeys(s, ["stepId", "description", "risk"]);
        if (!id(s.stepId) || stepIds.has(s.stepId) || !t(s.description, 1000) ||
            !["LOW", "HIGH", "REGULATED"].includes(String(s.risk))) return fail("invalid_block");
        stepIds.add(s.stepId);
        steps.push({stepId: s.stepId, description: s.description, risk: s.risk as "LOW" | "HIGH" | "REGULATED"});
      }
      return { type: "PLAN", planId: v.planId, revision: v.revision as number,
        summary: v.summary, steps };
    }
    default: return fail("unsupported_block");
  }
}

/** Fail closed before rendering. Untrusted strings are plain TEXT only. */
export function validateIntelligencePresentation(
  raw: unknown, expected: IntelligenceViewScope, now = Date.now(),
  expectedLocale: IntelligenceLocale = "pt-BR",
): IntelligenceViewIntent {
  if (!record(raw)) fail("invalid_intent");
  exactKeys(raw, ["schemaVersion", "interactionId", "kind", "scope", "expiresAt", "locale",
    "lifecycleEffect", "executionAuthority", "blocks"]);
  if (raw.schemaVersion !== "1.1.0" || !id(raw.interactionId) ||
      !["SILENT", "INVITE", "ASK", "EXPLAIN", "COMPARE_SCENARIOS",
        "PRESENT_EVIDENCE", "PLAN_PRESENTED", "UNAVAILABLE"].includes(String(raw.kind))) {
    fail("invalid_intent");
  }
  if ((expectedLocale !== "pt-BR" && expectedLocale !== "en") ||
      (raw.locale !== "pt-BR" && raw.locale !== "en") ||
      raw.locale !== expectedLocale) fail("locale_mismatch");
  if (!record(raw.scope) || !record(expected)) fail("invalid_scope");
  exactKeys(raw.scope, ["tenantId", "companyId", "cnpjId", "pageId"]);
  if (!uuid(expected.tenantId) || !uuid(expected.companyId) || !uuid(expected.cnpjId) ||
      !id(expected.pageId) ||
      raw.scope.tenantId !== expected.tenantId ||
      raw.scope.companyId !== expected.companyId ||
      raw.scope.cnpjId !== expected.cnpjId ||
      raw.scope.pageId !== expected.pageId) fail("scope_mismatch");
  if (raw.executionAuthority !== "NONE" || raw.lifecycleEffect !== "NONE") fail("forbidden_side_effect");
  if (typeof raw.expiresAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(raw.expiresAt)) fail("expired_intent");
  const expiration = Date.parse(raw.expiresAt);
  if (!Number.isFinite(expiration) || expiration <= now || expiration > now + 15 * 60 * 1000) {
    fail("expired_intent");
  }
  if (!Array.isArray(raw.blocks) || raw.blocks.length > 10 ||
      (raw.kind !== "SILENT" && raw.blocks.length === 0) ||
      (raw.kind === "SILENT" && raw.blocks.length !== 0)) fail("invalid_intent");
  const blocks = (raw.blocks as unknown[]).map(copyBlock);
  if (new Set(blocks.filter(b => b.type === "QUESTION").map(b => b.responseKey)).size !==
      blocks.filter(b => b.type === "QUESTION").length) fail("duplicate_question");
  if ((raw.kind === "PLAN_PRESENTED") !== blocks.some(b => b.type === "PLAN")) {
    fail("invalid_plan_presentation");
  }
  if (["EXPLAIN", "COMPARE_SCENARIOS", "PRESENT_EVIDENCE"].includes(raw.kind as string) &&
      !blocks.some(b => b.type === "EVIDENCE" || (b.type === "NOTICE" && b.level === "CAUTION"))) {
    fail("insufficient_evidence");
  }
  return {
    schemaVersion: "1.1.0",
    locale: expectedLocale,
    interactionId: raw.interactionId as string,
    kind: raw.kind as IntelligenceViewKind,
    scope: {tenantId: expected.tenantId, companyId: expected.companyId,
      cnpjId: expected.cnpjId, pageId: expected.pageId},
    expiresAt: raw.expiresAt,
    lifecycleEffect: "NONE",
    executionAuthority: "NONE",
    blocks,
  };
}
