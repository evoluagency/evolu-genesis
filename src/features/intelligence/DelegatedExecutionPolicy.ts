/**
 * Genesis boundary for plans proposed by EVOLU Intelligence.
 *
 * IMPORTANT: A successful result is ONLY a handoff DRAFT requiring trusted
 * Platform/BFF reauthorization. It is never an operational capability token.
 * Nothing in this module fetches, writes, infers, persists or executes.
 */
export type DelegationScope = Readonly<{
  tenantId: string;
  companyId: string; // Platform business group
  cnpjId: string; // Platform establishment; never substitute companyId
}>;

export type DelegationStep = Readonly<{
  stepId: string;
  capability: string;
  resourceRef: string;
  expectedEffect: string;
  risk: "LOW" | "HIGH" | "REGULATED";
}>;

export type DelegationPlan = Readonly<{
  planId: string;
  revision: number;
  scope: DelegationScope;
  summary: string;
  steps: readonly DelegationStep[];
  presentedAt: string;
  expiresAt: string;
}>;

export type HumanPlanInstruction = Readonly<{
  kind: "EXPLICIT_EXECUTION_INSTRUCTION";
  planId: string;
  revision: number;
  actorId: string;
  scope: DelegationScope;
  approvedStepIds: readonly string[];
  instruction: string;
  consentToExecute: true;
}>;

export type ExecutionHandoffDraft = Readonly<{
  kind: "SERVER_VALIDATION_REQUIRED";
  planId: string;
  revision: number;
  scope: DelegationScope;
  actorId: string;
  approvedStepIds: readonly string[];
  serverApprovalRequired: true;
  executionPerformed: false;
}>;

export class DelegationPolicyError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "DelegationPolicyError";
  }
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const slug = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,127}$/;
const capabilityId = /^[a-z][a-z0-9._:-]{2,100}$/;
function reject(code: string): never { throw new DelegationPolicyError(code); }
function sameScope(a: DelegationScope, b: DelegationScope): boolean {
  return a.tenantId === b.tenantId &&
    a.companyId === b.companyId && a.cnpjId === b.cnpjId;
}
function validScope(scope: DelegationScope): boolean {
  return !!scope && uuid.test(scope.tenantId) &&
    uuid.test(scope.companyId) && uuid.test(scope.cnpjId);
}
function validTime(value: string): number {
  const t = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isFinite(t) && /Z$/.test(value) ? t : NaN;
}
export function validateDelegationPlan(plan: DelegationPlan, now = Date.now()): void {
  if (!plan || !slug.test(plan.planId) || !Number.isSafeInteger(plan.revision) ||
      plan.revision < 1 || !validScope(plan.scope) || typeof plan.summary !== "string" ||
      !plan.summary.trim() || plan.summary.length > 2000) reject("invalid_plan");
  if (!Array.isArray(plan.steps) || plan.steps.length < 1 || plan.steps.length > 12) {
    reject("invalid_plan_steps");
  }
  const steps = new Set<string>();
  for (const step of plan.steps) {
    if (!step || !slug.test(step.stepId) || steps.has(step.stepId) ||
        !capabilityId.test(step.capability) || !slug.test(step.resourceRef) ||
        typeof step.expectedEffect !== "string" ||
        !step.expectedEffect.trim() || step.expectedEffect.length > 1500 ||
        !["LOW","HIGH","REGULATED"].includes(step.risk)) {
      reject("invalid_plan_steps");
    }
    steps.add(step.stepId);
  }
  const presented = validTime(plan.presentedAt), expiration = validTime(plan.expiresAt);
  if (!Number.isFinite(presented) || !Number.isFinite(expiration) ||
      presented > now || expiration <= now || expiration <= presented ||
      expiration - presented > 24 * 60 * 60 * 1000) reject("expired_or_invalid_plan");
}

/**
 * Acknowledge a SPECIFIC displayed plan. "Preciso de ajuda" is not execution
 * consent. Freeform instructions must be bound to exact plan, revision and
 * affected steps by the human-facing confirmation UI. The server must
 * independently look up the immutable plan and check role/risk/authorization.
 */
export function createExecutionHandoffDraft(
  plan: DelegationPlan,
  instruction: HumanPlanInstruction,
  now = Date.now(),
): ExecutionHandoffDraft {
  validateDelegationPlan(plan, now);
  if (!instruction || instruction.kind !== "EXPLICIT_EXECUTION_INSTRUCTION" ||
      instruction.consentToExecute !== true ||
      typeof instruction.instruction !== "string" ||
      !instruction.instruction.trim() || instruction.instruction.length > 2000) {
    reject("explicit_instruction_required");
  }
  if (!uuid.test(instruction.actorId) || instruction.planId !== plan.planId ||
      instruction.revision !== plan.revision || !validScope(instruction.scope) ||
      !sameScope(instruction.scope, plan.scope)) {
    reject("authorization_plan_scope_mismatch");
  }
  const intended = plan.steps.map(step => step.stepId).sort();
  if (!Array.isArray(instruction.approvedStepIds) ||
      instruction.approvedStepIds.length !== intended.length ||
      [...instruction.approvedStepIds].sort().some((id, i) => id !== intended[i])) {
    reject("authorization_step_mismatch");
  }
  // The first connected runtime must enforce secondary/regulated approvals
  // on the server. The UX does not generate operational handoffs for these.
  if (plan.steps.some(step => step.risk !== "LOW")) {
    reject("server_risk_escalation_required");
  }
  return {
    kind: "SERVER_VALIDATION_REQUIRED",
    planId: plan.planId,
    revision: plan.revision,
    actorId: instruction.actorId,
    scope: { ...plan.scope },
    approvedStepIds: [...intended],
    serverApprovalRequired: true,
    executionPerformed: false,
  };
}
