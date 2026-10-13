import assert from "node:assert/strict";
import test from "node:test";
import { validateIntelligencePresentation, IntelligencePresentationError } from
  "../preview/runtime/features/intelligence/PresentationIntent.js";

const scope = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  companyId: "22222222-2222-4222-8222-222222222222",
  cnpjId: "33333333-3333-4333-8333-333333333333",
  pageId: "fiscal.ncm",
};
const now = Date.parse("2026-10-13T14:00:00.000Z");
const base = (patch = {}) => ({
  schemaVersion: "1.0.0", interactionId: "interaction-0001",
  kind: "ASK", scope, expiresAt: "2026-10-13T14:05:00.000Z",
  executionAuthority: "NONE", lifecycleEffect: "NONE",
  blocks: [{type: "QUESTION", prompt: "Qual a composição do produto?",
    responseKey: "product-composition"}],
  ...patch,
});
const shouldFail = (value, code) => assert.throws(
  () => validateIntelligencePresentation(value, scope, now),
  error => error instanceof IntelligencePresentationError && error.code === code,
);
test("dynamic open question is accepted, no predetermined question catalog", () => {
  const out = validateIntelligencePresentation(base({
    blocks: [{type: "QUESTION", prompt: "Qual é o processo produtivo?",
      responseKey: "workstep-001"}],
  }), scope, now);
  assert.equal(out.blocks[0].prompt, "Qual é o processo produtivo?");
  assert.equal(out.executionAuthority, "NONE");
  assert.equal(out.lifecycleEffect, "NONE");
});
test("unknown backend attributes are rejected, never forwarded to renderer", () => {
  shouldFail(base({__protoCommand: "delete_records"}), "unsupported_field");
  shouldFail(base({script: "<script>alert(1)</script>"}), "unsupported_field");
});
test("valid dynamic choices and freeform questions coexist", () => {
  const out = validateIntelligencePresentation(base({blocks: [
    {type:"QUESTION", prompt:"Escolha uma característica", responseKey:"category",
      options:["A","B","Outra"]},
    {type:"QUESTION", prompt:"Explique as exceções", responseKey:"exceptions"},
  ]}), scope, now);
  assert.equal(out.blocks.length, 2);
  assert.equal(out.blocks[0].type, "QUESTION");
  assert.equal(out.blocks[1].type, "QUESTION");
});
test("untrusted extra block fields and executable structures fail closed", () => {
  for(const block of [
    {type:"HTML",html:"<button onclick=alert(1)>Run</button>"},
    {type:"TEXT",text:"Olá",script:"system.execute()"},
    {type:"QUESTION",prompt:"Questão",responseKey:"q",onClick:"execute"},
  ]) shouldFail(base({blocks:[block]}),block.type==="HTML"?"unsupported_block":"unsupported_field");
});
test("scope is bound independently across tenant group CNPJ and page", () => {
  for(const key of ["tenantId","companyId","cnpjId","pageId"]) {
    shouldFail(base({scope:{...scope,[key]:key==="pageId"?"another.page":
      "99999999-9999-4999-8999-999999999999"}}),"scope_mismatch");
  }
});
test("unversioned, malformed and expired intents do not render", () => {
  shouldFail(base({schemaVersion:"9.9.9"}),"invalid_intent");
  shouldFail(base({expiresAt:"2026-10-13T13:59:59.000Z"}),"expired_intent");
  shouldFail(base({expiresAt:"2026-10-13T14:40:00.000Z"}),"expired_intent");
  shouldFail(base({expiresAt:"tomorrow"}),"expired_intent");
});
test("a motor cannot smuggle operational or training effects", () => {
  shouldFail(base({executionAuthority:"APPROVED"}),"forbidden_side_effect");
  shouldFail(base({lifecycleEffect:"TRAINING_STARTED"}),"forbidden_side_effect");
});
test("unsubstantiated legal analysis requires an explicit insufficiency warning or source", () => {
  shouldFail(base({kind:"EXPLAIN",blocks:[{type:"TEXT",text:"Classificação certa"}]}),"insufficient_evidence");
  const withCaution = validateIntelligencePresentation(base({
    kind:"EXPLAIN",blocks:[{type:"NOTICE",level:"CAUTION",text:"Informações insuficientes"}],
  }),scope,now);
  assert.equal(withCaution.kind,"EXPLAIN");
  const withEvidence = validateIntelligencePresentation(base({
    kind:"PRESENT_EVIDENCE",
    blocks:[{type:"EVIDENCE",sourceId:"source-01",title:"Documento técnico",
      excerpt:"Composição declarada no documento"}],
  }),scope,now);
  assert.equal(withEvidence.blocks[0].type,"EVIDENCE");
});
test("planning stage displays a plan but is never an execution instruction", () => {
  const result = validateIntelligencePresentation(base({
    kind:"PLAN_PRESENTED",blocks:[{type:"PLAN",planId:"plan-001",revision:2,
      summary:"Verificar classificações propostas",steps:[
        {stepId:"step-001",description:"Revisar descrição",risk:"LOW"},
        {stepId:"step-002",description:"Conferir a regra aplicável",risk:"HIGH"},
      ]}],
  }),scope,now);
  assert.equal(result.kind,"PLAN_PRESENTED");
  assert.equal(result.executionAuthority,"NONE");
  assert.equal(result.blocks[0].type,"PLAN");
  assert.equal("execute" in result,false);
});
test("plan cannot appear without PLAN_PRESENTED, and duplicate steps reject", () => {
  const plan = {type:"PLAN",planId:"plan-001",revision:1,summary:"Plano ilustrativo",
    steps:[{stepId:"s-01",description:"Conferir",risk:"LOW"}]};
  shouldFail(base({blocks:[plan]}),"invalid_plan_presentation");
  shouldFail(base({kind:"PLAN_PRESENTED",blocks:[{...plan,steps:[plan.steps[0],plan.steps[0]]}]}),"invalid_block");
  shouldFail(base({kind:"PLAN_PRESENTED",blocks:[{...plan,script:"danger"}]}),"unsupported_field");
});
test("silent action cannot contain an accidental user-visible intervention", () => {
  shouldFail(base({kind:"SILENT"}),"invalid_intent");
  const out = validateIntelligencePresentation(base({kind:"SILENT",blocks:[]}),scope,now);
  assert.equal(out.blocks.length,0);
});
test("duplicate question IDs and repeated choices fail closed", () => {
  shouldFail(base({blocks:[
    {type:"QUESTION",prompt:"Primeira",responseKey:"q1"},
    {type:"QUESTION",prompt:"Segunda",responseKey:"q1"},
  ]}),"duplicate_question");
  shouldFail(base({blocks:[{type:"QUESTION",prompt:"Escolha",responseKey:"q",
    options:["Sim","Sim"]}]}),"invalid_block");
});
test("projection does not retain mutable backend references", () => {
  const raw = base();const out = validateIntelligencePresentation(raw,scope,now);
  raw.blocks[0].prompt="Mutado depois da validação";
  assert.equal(out.blocks[0].prompt,"Qual a composição do produto?");
  assert.notEqual(out.scope,raw.scope);
});
