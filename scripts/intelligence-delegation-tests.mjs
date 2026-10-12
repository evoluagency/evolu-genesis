import assert from "node:assert/strict";
import test from "node:test";
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
