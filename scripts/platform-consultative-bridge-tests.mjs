import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {
  PlatformConsultativeBoundaryError,
  createPlatformConsultativeInvocation,
  projectPrivatePlatformConsultation,
} from "../preview/runtime/features/intelligence/PlatformConsultativeViewBridge.js";
import {validateIntelligencePresentation} from
  "../preview/runtime/features/intelligence/PresentationIntent.js";

const NOW=Date.parse("2026-10-13T16:00:00.000Z");
const scope={
  tenantId:"11111111-1111-4111-8111-111111111111",
  companyId:"22222222-2222-4222-8222-222222222222",
  cnpjId:"33333333-3333-4333-8333-333333333333",
  tenantSlug:"tenant-alpha",referenceDate:"2026-10-13",
  pageId:"fiscal.workspace",
};
const query=(patch={})=>({
  scope,locale:"pt-BR",question:"Quais evidências existem para a classificação?",humanInitiated:true,...patch,
});
const result=(patch={})=>({
  schemaVersion:"1.0.0",tenantId:scope.tenantId,companyId:scope.companyId,cnpjId:scope.cnpjId,
  sourceKind:"intelligence_consultative_answer",lifecycle:"PRE_LEARNING",
  referenceDate:scope.referenceDate,decision:"ADVISORY_ONLY",
  answer:"O enquadramento demanda análise das características técnicas e das normas aplicáveis.",
  responseMode:"MODEL",model:"openai/gpt-oss-20b",
  evidence:{retrievalDecision:"PASSED",retrievedSourceCount:1},
  costGuard:{allowed:true,accountedUsd:0,code:null},
  provenance:[{source:"Intelligence.POST /api/intelligence",observedAt:"2026-10-13T15:55:00.000Z"}],
  capabilities:{
    canApprove:{status:"unavailable",reasonCode:"approval_contract_not_connected"},
    canExecute:{status:"unavailable",reasonCode:"execution_not_authorized"},
    canLearn:{status:"unavailable",reasonCode:"pre_learning"},
  },
  dataQuality:{issues:["source_evidence_review_required"]},
  ...patch,
});
function fails(fn,code){
  assert.throws(fn,e=>e instanceof PlatformConsultativeBoundaryError&&e.code===code);
}
test("exact private Platform BFF invocation has no model, token, history or write operation",()=>{
 const inv=createPlatformConsultativeInvocation(query());
 assert.deepEqual(inv,{
  service:"intelligence",operation:"requestConsultativeAnswerSource",tenantSlug:"tenant-alpha",
  payload:{tenantId:scope.tenantId,companyId:scope.companyId,cnpjId:scope.cnpjId,
    referenceDate:"2026-10-13",question:"Quais evidências existem para a classificação?"},
 });
 assert.notEqual(inv.payload.companyId,inv.payload.cnpjId);
 assert.equal(JSON.stringify(inv).includes("authorization"),false);
 assert.equal(JSON.stringify(inv).includes("history"),false);
});
test("help acceptance or passive activity cannot create an inference request",()=>{
 for(const value of [undefined,false,"help_accepted"]){
  fails(()=>createPlatformConsultativeInvocation(query({humanInitiated:value})),
    "invalid_human_consultation");
 }
});
test("invalid company/group/CNPJ/date/slug/page binding rejected before transport",()=>{
 const wrong="99999999-9999-4999-8999-999999999999";
 for(const change of [
  {tenantId:"tenant"}, {companyId:"company"}, {cnpjId:"company"},
  {companyId:scope.cnpjId}, {tenantSlug:"unsafe/path"}, {pageId:".."},
  {referenceDate:"2026-02-30"},{referenceDate:"2026-10-13T01:00:00Z"},
  {tenantId:wrong,cnpjId:"xxx"},
 ]){
  fails(()=>createPlatformConsultativeInvocation(query({scope:{...scope,...change}})),
    "invalid_human_consultation");
 }
});
test("unsupported locale and empty/short/overlong question fail before transport",()=>{
 for(const change of [
  {locale:"es"},{question:""},{question:"Hi"},
  {question:"abc".repeat(600)},
 ]){
  fails(()=>createPlatformConsultativeInvocation(query(change)),"invalid_human_consultation");
 }
});
test("UTF-8 byte ceiling matches 2048-byte Platform BFF request limit",()=>{
 fails(()=>createPlatformConsultativeInvocation(query({
  question:"Consultar "+("商".repeat(650)),
 })),"platform_request_limit");
});
test("existing v1 Platform response cannot be passed off as locally verified pt-BR",()=>{
 const o=projectPrivatePlatformConsultation(result(),query(),NOW);
 assert.equal(o.state,"UNAVAILABLE");assert.equal(o.sourceSchema,"1.0.0");
 assert.equal(o.intent.kind,"UNAVAILABLE");
 assert.equal(o.intent.locale,"pt-BR");assert.equal(o.intent.executionAuthority,"NONE");
 assert.doesNotMatch(JSON.stringify(o),/enquadramento demanda análise/);
 validateIntelligencePresentation(o.intent,{tenantId:scope.tenantId,companyId:scope.companyId,
   cnpjId:scope.cnpjId,pageId:scope.pageId},NOW,"pt-BR");
});
test("english user cannot be shown untranslated existing Platform v1 consultation",()=>{
 const o=projectPrivatePlatformConsultation(result(),query({locale:"en"}),NOW);
 assert.equal(o.state,"UNAVAILABLE");assert.equal(o.intent.locale,"en");
 assert.match(JSON.stringify(o),/response language was not verified/i);
 assert.doesNotMatch(JSON.stringify(o),/O enquadramento demanda/);
});
test("blocked, failed model and cost denied results never expose advisory body",()=>{
 for(const patch of [
  {decision:"BLOCKED"},
  {costGuard:{allowed:false}},
  {responseMode:"SAFE_FALLBACK"},
  {responseMode:"AI_COST_GUARD"},
  {responseMode:"RETRIEVAL_EVIDENCE_INSUFFICIENT"},
  {model:"NONE"},
 ]){
  const o=projectPrivatePlatformConsultation(result(patch),query(),NOW);
  assert.equal(o.state,"UNAVAILABLE");
  assert.equal(o.intent.kind,"UNAVAILABLE");
  assert.doesNotMatch(JSON.stringify(o),/enquadramento demanda análise/);
 }
});
test("cross-tenant, group, CNPJ and date responses all fail closed",()=>{
 const bad="99999999-9999-4999-8999-999999999999";
 for(const patch of [
  {tenantId:bad},{companyId:bad},{cnpjId:bad},{referenceDate:"2026-10-12"}
 ]){
  fails(()=>projectPrivatePlatformConsultation(result(patch),query(),NOW),
    "platform_consultative_contract_mismatch");
 }
});
test("untrusted capabilities or missing provenance cannot be interpreted as an approval",()=>{
 for(const patch of [
  {capabilities:{...result().capabilities,canExecute:{status:"allowed"}}},
  {capabilities:{...result().capabilities,canApprove:{status:"allowed"}}},
  {capabilities:{...result().capabilities,canLearn:{status:"allowed"}}},
  {provenance:[]},{provenance:[{source:"foreign",observedAt:"2026-10-13T15:55:00Z"}]},
  {sourceKind:"operational_command"},{lifecycle:"LEARNING"},
 ]){
  fails(()=>projectPrivatePlatformConsultation(result(patch),query(),NOW),
    "platform_consultative_contract_mismatch");
 }
});
test("version 1.1.0 cannot assert locale by a bare caller-supplied locale",()=>{
 for(const patch of [
  {schemaVersion:"1.1.0",answerLocale:"en",localeVerified:false},
  {schemaVersion:"1.1.0",answerLocale:"pt-BR",localeVerified:false},
  {schemaVersion:"1.1.0",answerLocale:"en",localeVerified:true},
 ]){
  const o=projectPrivatePlatformConsultation(result(patch),query(),NOW);
  assert.equal(o.state,"UNAVAILABLE");
 }
});
test("future BFF v1.1 may project verified pt-BR advisory, but only read-only with caution",()=>{
 const s=result({schemaVersion:"1.1.0",answerLocale:"pt-BR",localeVerified:true});
 const o=projectPrivatePlatformConsultation(s,query(),NOW);
 assert.equal(o.state,"PRESENTABLE");assert.equal(o.sourceSchema,"1.1.0");
 assert.equal(o.intent.kind,"EXPLAIN");assert.equal(o.intent.blocks[0].type,"TEXT");
 assert.equal(o.intent.blocks[1].type,"NOTICE");assert.equal(o.intent.blocks[1].level,"CAUTION");
 assert.equal(o.intent.executionAuthority,"NONE");assert.equal(o.intent.lifecycleEffect,"NONE");
 assert.equal(JSON.stringify(o).includes("source_evidence_review_required"),false,
  "future projected view must not copy BFF metadata");
});
test("future BFF v1.1 can deliver verified English only when exact language matches",()=>{
 const en=result({schemaVersion:"1.1.0",answerLocale:"en",localeVerified:true,
  answer:"The classification requires verified technical characteristics."});
 const o=projectPrivatePlatformConsultation(en,query({locale:"en"}),NOW);
 assert.equal(o.state,"PRESENTABLE");
 assert.equal(o.intent.locale,"en");
 assert.match(o.intent.blocks[1].text,/qualified professional/i);
});
test("long future answer and malformed upstream contracts reject",()=>{
 const valid={schemaVersion:"1.1.0",answerLocale:"pt-BR",localeVerified:true};
 fails(()=>projectPrivatePlatformConsultation(result({...valid,answer:"x".repeat(7000)}),query(),NOW),
  "platform_presentation_size_limit");
 for(const change of [
  {schemaVersion:"7.0.0"}, {model:3},
  {responseMode:"ACTION_EXECUTED"},{costGuard:{allowed:"yes"}},
  {answer:""},{provenance:[{source:"Intelligence.POST /api/intelligence",observedAt:"bad"}]},
 ]){
  fails(()=>projectPrivatePlatformConsultation(result(change),query(),NOW),
    "platform_consultative_contract_mismatch");
 }
});
test("bridge uses no fetch, credentials, storage or inference endpoint",()=>{
 const c=readFileSync(new URL("../src/features/intelligence/PlatformConsultativeViewBridge.ts",import.meta.url),"utf8");
 assert.doesNotMatch(c,/\bfetch\s*\(|\bXMLHttpRequest\b|new WebSocket\(/);
 assert.doesNotMatch(c,/\blocalStorage\b|\bsessionStorage\b/);
 assert.doesNotMatch(c,/\.env\b|SERVICE_ROLE_KEY|access_token/);
 assert.match(c,/POST \/api\/ux\/intelligence\/consult\/v1/);
});
