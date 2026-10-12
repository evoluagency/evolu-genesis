import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  createExecutionHandoffDraft, DelegationPolicyError,
} from "../preview/runtime/features/intelligence/DelegatedExecutionPolicy.js";

const scope = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  companyId: "22222222-2222-4222-8222-222222222222",
  cnpjId: "33333333-3333-4333-8333-333333333333",
};
const now = Date.parse("2026-10-12T19:00:00.000Z");
function plan(overrides = {}) {
  return {
    planId: "plan-uid-0001",
    revision: 1,
    scope,
    summary: "Revisar o cadastro do produto especificado",
    presentedAt: "2026-10-12T18:30:00.000Z",
    expiresAt: "2026-10-12T20:00:00.000Z",
    steps: [{
      stepId: "step-1",
      capability: "platform.product.update_ncm",
      resourceRef: "product:0001",
      expectedEffect: "Alterar somente a classificacao revisada deste produto",
      risk: "LOW",
    }],
    ...overrides,
  };
}
function human(overrides = {}) {
  return {
    kind: "EXPLICIT_EXECUTION_INSTRUCTION",
    planId: "plan-uid-0001",
    revision: 1,
    actorId: "44444444-4444-4444-8444-444444444444",
    scope,
    approvedStepIds: ["step-1"],
    instruction: "Execute os passos do plano apresentado neste produto",
    consentToExecute: true,
    ...overrides,
  };
}
function rejected(fn, code) {
  assert.throws(fn, error => error instanceof DelegationPolicyError && error.code === code);
}
test("explicit human instruction creates only a server-validation draft; NEVER executes", () => {
  const out = createExecutionHandoffDraft(plan(), human(), now);
  assert.equal(out.kind, "SERVER_VALIDATION_REQUIRED");
  assert.equal(out.serverApprovalRequired, true);
  assert.equal(out.executionPerformed, false);
  assert.deepEqual(out.approvedStepIds, ["step-1"]);
  assert.deepEqual(out.scope, scope);
  assert.equal(out.actorId, human().actorId);
  assert.equal("sql" in out, false);
  assert.equal("authorizationToken" in out, false);
});
test("accepting help or implicit consent cannot authorize execution", () => {
  rejected(() => createExecutionHandoffDraft(plan(), human({
    kind: "HELP_ACCEPTED", consentToExecute: false,
    instruction: "Preciso de ajuda",
  }), now), "explicit_instruction_required");
  rejected(() => createExecutionHandoffDraft(plan(), human({
    consentToExecute: false,
  }), now), "explicit_instruction_required");
});
test("blank human execution instruction cannot approve", () => {
  rejected(() => createExecutionHandoffDraft(plan(), human({ instruction: " " }), now), "explicit_instruction_required");
});
test("plan identity or revision mismatch fails closed", () => {
  for (const x of [{ planId: "plan-outro" }, { revision: 2 }]) {
    rejected(() => createExecutionHandoffDraft(plan(), human(x), now), "authorization_plan_scope_mismatch");
  }
});
test("wrong tenant, company group and CNPJ all fail closed", () => {
  for (const field of ["tenantId", "companyId", "cnpjId"]) {
    rejected(() => createExecutionHandoffDraft(plan(), human({
      scope: { ...scope, [field]: "99999999-9999-4999-8999-999999999999" },
    }), now), "authorization_plan_scope_mismatch");
  }
});
test("approval cannot add, omit, repeat or partially select steps", () => {
  const p = plan({ steps: [
    ...plan().steps,
    { stepId: "step-2", capability: "platform.product.note", resourceRef: "product:0001",
      expectedEffect: "Add a review note", risk: "LOW" },
  ] });
  for (const ids of [
    ["step-1"], ["step-1", "step-1"], ["step-1", "step-extra"],
  ]) {
    rejected(() => createExecutionHandoffDraft(p, human({ approvedStepIds: ids }), now), "authorization_step_mismatch");
  }
  const out = createExecutionHandoffDraft(p, human({ approvedStepIds: ["step-2", "step-1"] }), now);
  assert.deepEqual(out.approvedStepIds, ["step-1", "step-2"]);
});
test("expired, future, malformed and excessively long-lasting plans reject", () => {
  for (const patch of [
    { expiresAt: "2026-10-12T18:59:00.000Z" },
    { presentedAt: "2026-10-12T19:10:00.000Z" },
    { expiresAt: "not-a-date" },
    { expiresAt: "2026-10-15T19:10:00.000Z" },
  ]) {
    rejected(() => createExecutionHandoffDraft(plan(patch), human(), now), "expired_or_invalid_plan");
  }
});
test("high-impact or regulated changes never bypass secondary server review", () => {
  for (const risk of ["HIGH", "REGULATED"]) {
    rejected(() => createExecutionHandoffDraft(plan({
      steps: [{ ...plan().steps[0], risk }],
    }), human(), now), "server_risk_escalation_required");
  }
});
test("duplicate steps, invalid capability and illegal plan are rejected", () => {
  for (const patch of [
    { steps: [...plan().steps, ...plan().steps] },
    { steps: [{ ...plan().steps[0], capability: "SELECT * FROM users" }] },
    { planId: "" },
  ]) {
    rejected(() => createExecutionHandoffDraft(plan(patch), human(), now),
      patch.planId === "" ? "invalid_plan" : "invalid_plan_steps");
  }
});
test("missing or spoofed actor cannot produce a handoff", () => {
  rejected(() => createExecutionHandoffDraft(plan(), human({ actorId: "user" }), now),
    "authorization_plan_scope_mismatch");
});

test("floating layer does not call services, store traces or execute operations", () => {
  const overlay = readFileSync(new URL("../preview/shared-ux/intelligence-layer.js", import.meta.url), "utf8");
  const css = readFileSync(new URL("../preview/shared-ux/intelligence-layer.css", import.meta.url), "utf8");
  assert.doesNotThrow(() => new Function(overlay));
  assert.doesNotMatch(overlay, /\bfetch\s*\(|\bXMLHttpRequest\s*\(|\bWebSocket\s*\(/);
  assert.doesNotMatch(overlay, /\blocalStorage\b|\bsessionStorage\b|\bsendBeacon\b/);
  assert.doesNotMatch(overlay, /\b(?:eval|Function)\s*\(/);
  assert.match(overlay, /Simular autorização/);
  assert.match(overlay, /NENHUMA EXECUÇÃO/);
  assert.match(css, /background:transparent!important/);
  assert.match(css, /var\(--card\)/);
  assert.match(css, /var\(--accent\)/);
});
test("transparent Intelligence mark remains alpha PNG inside background-free SVG", () => {
  const svg = readFileSync(new URL("../preview/shared-ux/intelligence-mark-transparent.svg", import.meta.url), "utf8");
  assert.doesNotMatch(svg, /<(?:rect|circle|path)\b/);
  const match = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  assert.ok(match);
  const png = Buffer.from(match[1], "base64");
  assert.equal(png.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(png.readUInt32BE(16), 48);
  assert.equal(png.readUInt32BE(20), 48);
  assert.equal(png[25], 6, "PNG RGBA alpha is required");
});
test("two Genesis page surfaces opt into the same independent contextual layer", () => {
  for (const page of ["tenant-advisory-workspace", "tenant-fiscal-workspace"]) {
    const html = readFileSync(new URL(`../preview/${page}/index.html`, import.meta.url), "utf8");
    assert.match(html, /shared-ux\/intelligence-layer\.css/);
    assert.match(html, /shared-ux\/intelligence-layer\.js/);
  }
});

test("observation is disabled by default and opt-out discards collected signals", () => {
  const overlay = readFileSync(new URL("../preview/shared-ux/intelligence-layer.js", import.meta.url), "utf8");
  assert.match(overlay, /observeCheck\.checked = false/);
  assert.match(overlay, /if \(!observeCheck\.checked\) return/);
  assert.match(overlay, /observations\.length = 0/);
  assert.match(overlay, /observeCheck\.addEventListener\("change"/);
  assert.match(overlay, /Permitir sugestões contextuais nesta página/);
  assert.doesNotMatch(overlay, /localStorage|sessionStorage|indexedDB/);
});
