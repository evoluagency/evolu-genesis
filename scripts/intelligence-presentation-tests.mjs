import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
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
  schemaVersion: "1.1.0", locale:"pt-BR", interactionId: "interaction-0001",
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

function browserPreview() {
  const elements = [];
  const doc = {
    createElement(tag) {
      const node = {
        tag, children:[], dataset:{}, textContent:"", handlers:{},
        append(...items){this.children.push(...items);},
        addEventListener(name,fn){this.handlers[name]=fn;},
      };
      elements.push(node);
      return node;
    },
    createDocumentFragment(){
      return {tag:"#fragment",children:[],append(...items){this.children.push(...items);}};
    },
  };
  const window = {};
  doc.documentElement = {lang:"pt-BR"};
  const localeCode=readFileSync(new URL("../preview/shared-ux/intelligence-i18n.js",import.meta.url),"utf8");
  vm.runInNewContext(localeCode,{window,document:doc},{timeout:1000});
  const code = readFileSync(new URL("../preview/shared-ux/intelligence-intent-ui.js",import.meta.url),"utf8");
  vm.runInNewContext(code,{window,document:doc},{timeout:1000});
  return {window,doc,elements,code};
}
test("UI renderer supports engine-directed arbitrary question and human choices",()=>{
  const {window,doc,elements}=browserPreview();
  const host=doc.createElement("div");let called=0;
  const intent=validateIntelligencePresentation(base({blocks:[
    {type:"TEXT",text:"Qual é o contexto?"},
    {type:"QUESTION",prompt:"Descreva a finalidade de uso, se possível.",
      responseKey:"purpose",options:["Uso interno","Revenda"]},
  ]}),scope,now);
  window.EvoluIntelligenceIntentUI.render(host,intent,(_key,value)=>{
    assert.equal(_key,"purpose");assert.equal(value,"Uso interno");called++;
  });
  assert.equal(called,0,"rendering must not choose or execute options");
  const buttons=elements.filter(x=>x.tag==="button");
  assert.equal(buttons.length,2);
  buttons[0].handlers.click();
  assert.equal(called,1);
});
test("UI renderer treats HTML-like AI strings as text, never markup",()=>{
  const {window,doc,elements,code}=browserPreview();
  const host=doc.createElement("div");
  const payload=validateIntelligencePresentation(base({blocks:[
    {type:"TEXT",text:'<img src=x onerror="alert(1)">'},
  ]}),scope,now);
  window.EvoluIntelligenceIntentUI.render(host,payload);
  assert.equal(elements.filter(x=>x.tag==="img"||x.tag==="script").length,0);
  assert.ok(elements.some(x=>x.textContent.includes("<img src=x")));
  assert.doesNotMatch(code,/\.innerHTML\s*=|insertAdjacentHTML|new Function\s*\(|\beval\s*\(/);
});
test("UI renderer rejects unknown blocks and side-effect requests without changing host",()=>{
  const {window,doc}=browserPreview();const host=doc.createElement("div");
  for(const patch of [
    {blocks:[{type:"EXECUTE",command:"delete"}]},
    {lifecycleEffect:"TRAIN"},
    {executionAuthority:"AUTO"},
  ]){
    assert.throws(()=>window.EvoluIntelligenceIntentUI.render(host,
      {...base(),...patch}),/invalid_presentation_intent/);
    assert.equal(host.children.length,0);
  }
});
test("synthetic layer loads intent examples but has no live execution or network",()=>{
  const overlay=readFileSync(new URL("../preview/shared-ux/intelligence-layer.js",import.meta.url),"utf8");
  assert.doesNotThrow(()=>new Function(overlay));
  assert.match(overlay,/EvoluIntelligenceIntentUI\.render\(/);
  assert.match(overlay,/function exampleIntent\(/);
  const i18n=readFileSync(new URL("../preview/shared-ux/intelligence-i18n.js",import.meta.url),"utf8");
  assert.match(i18n,/NENHUMA EXECUÇÃO/);
  assert.match(i18n,/NO EXECUTION/);
  assert.match(overlay,/document.addEventListener\("ux:locale"/);
  assert.doesNotMatch(overlay,/\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\b|\blocalStorage\b|\bsessionStorage\b/);
  for(const page of ["tenant-advisory-workspace","tenant-fiscal-workspace"]){
    const html=readFileSync(new URL("../preview/"+page+"/index.html",import.meta.url),"utf8");
    assert.match(html,/intelligence-intent-ui\.js/);
    assert.match(html,/intelligence-i18n\.js/);
    assert.ok(html.indexOf("intelligence-i18n.js")<html.indexOf("intelligence-intent-ui.js") &&
      html.indexOf("intelligence-intent-ui.js")<html.indexOf("intelligence-layer.js"),
      "Renderer must be available before layer initialization");
  }
});

test("source contract rejects an intent in a locale different from Platform selection",()=>{
  const en = base({locale:"en",blocks:[{type:"QUESTION",prompt:"What is the product composition?",responseKey:"composition"}]});
  shouldFail(en,"locale_mismatch");
  shouldFail(base({locale:undefined}),"locale_mismatch");
  const accepted=validateIntelligencePresentation(en,scope,now,"en");
  assert.equal(accepted.locale,"en");
  assert.equal(accepted.blocks[0].prompt,"What is the product composition?");
});
test("one shared PT/EN catalog updates labels with the Platform html lang",()=>{
  const {window,doc}=browserPreview();
  assert.equal(window.EvoluIntelligenceI18n.locale(),"pt-BR");
  assert.equal(window.EvoluIntelligenceI18n.t("trigger"),"Abrir EVOLU Intelligence");
  assert.equal(window.EvoluIntelligenceI18n.t("rendererAssumptions"),"Premissas");
  doc.documentElement.lang="en";
  assert.equal(window.EvoluIntelligenceI18n.locale(),"en");
  assert.equal(window.EvoluIntelligenceI18n.t("trigger"),"Open EVOLU Intelligence");
  assert.equal(window.EvoluIntelligenceI18n.t("rendererAssumptions"),"Assumptions");
  assert.match(window.EvoluIntelligenceI18n.t("planSimulationBody",{planId:"p01",revision:4}),/revision 4/);
  doc.documentElement.lang="pt-BR";
  assert.match(window.EvoluIntelligenceI18n.t("planSimulationBody",{planId:"p01",revision:4}),/revisão 4/);
});
test("renderer requires matching locale and translates chrome, preserving authored answers",()=>{
  const {window,doc,elements}=browserPreview();
  const host=doc.createElement("div");
  const enIntent=validateIntelligencePresentation(base({
    locale:"en",
    blocks:[{type:"QUESTION",prompt:"Why is this category relevant?",responseKey:"reason"}],
  }),scope,now,"en");
  assert.throws(()=>window.EvoluIntelligenceIntentUI.render(host,enIntent),/invalid_presentation_intent/);
  assert.equal(host.children.length,0);
  doc.documentElement.lang="en";
  window.EvoluIntelligenceIntentUI.render(host,enIntent);
  assert.ok(elements.some(x=>x.textContent==="Answer using the conversation field below."));
  assert.ok(elements.some(x=>x.textContent==="Why is this category relevant?"));
  doc.documentElement.lang="pt-BR";
  assert.throws(()=>window.EvoluIntelligenceIntentUI.render(host,enIntent),/invalid_presentation_intent/);
});
test("all hard-coded Intelligence UI keys have PT and EN translations",()=>{
  const {window,doc}=browserPreview();
  const layer=readFileSync(new URL("../preview/shared-ux/intelligence-layer.js",import.meta.url),"utf8");
  const renderer=readFileSync(new URL("../preview/shared-ux/intelligence-intent-ui.js",import.meta.url),"utf8");
  const keys=[...layer.matchAll(/\bbind\([^,]+,\s*"([a-zA-Z]+)"/g)].map(m=>m[1])
    .concat([...layer.matchAll(/\bt\("([a-zA-Z]+)"/g)].map(m=>m[1]))
    .concat([...renderer.matchAll(/\bt\("([a-zA-Z]+)"/g)].map(m=>m[1]));
  assert.ok(keys.length>28);
  for(const locale of ["pt-BR","en"]){
    doc.documentElement.lang=locale;
    for(const key of new Set(keys)){
      assert.doesNotThrow(()=>window.EvoluIntelligenceI18n.t(key),locale+" "+key);
    }
  }
});
test("Platform shell remains single owner of locale and theme toggles",()=>{
  const shell=readFileSync(new URL("../preview/shared-ux/shell.js",import.meta.url),"utf8");
  const layer=readFileSync(new URL("../preview/shared-ux/intelligence-layer.js",import.meta.url),"utf8");
  assert.match(shell,/document\.dispatchEvent\(new CustomEvent\('ux:locale'/);
  assert.match(shell,/document\.dispatchEvent\(new CustomEvent\('ux:theme'/);
  assert.match(layer,/document\.addEventListener\("ux:locale"/);
  assert.doesNotMatch(layer,/data-locale-toggle|data-theme-toggle/);
  assert.match(layer,/function exampleIntent\(/);
  assert.match(layer,/locale: i18n\.locale\(\)/);
});
