import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {
  ConsultativeReceiptError,projectConsultativeVerificationReceipt,
} from "../preview/runtime/features/intelligence/ConsultativeVerificationReceipt.js";

const TENANT="11111111-1111-4111-8111-111111111111";
const GROUP="22222222-2222-4222-8222-222222222222";
const CNPJ="33333333-3333-4333-8333-333333333333";
const OTHER="99999999-9999-4999-8999-999999999999";
const scope={tenantId:TENANT,companyId:GROUP,cnpjId:CNPJ,referenceDate:"2026-10-13"};
const digest="f".repeat(64);
const receipt=(patch={})=>({
  schemaVersion:"1.0.0",
  scope:{...scope},
  evidence:{
    status:"SERVER_SNAPSHOT_METADATA_MATCH_NOT_LEGAL_VERIFICATION",
    sourceCount:2,snapshotFingerprintSha256:digest,
    legalValidityVerified:false,
  },
  locale:{
    requested:"pt-BR",
    status:"MODEL_LANGUAGE_NOT_INDEPENDENTLY_VERIFIED",
    modelLanguageVerified:false,
  },
  display:{canShowModelAnswer:false,reasonCode:"LOCALE_UNVERIFIED"},
  lifecycle:"PRE_LEARNING",executionAuthority:"NONE",
  ...patch
});
const run=(patch={},locale="pt-BR")=>
  projectConsultativeVerificationReceipt(receipt(patch),scope,locale);
const rejects=(fn)=>assert.throws(fn,
  e=>e instanceof ConsultativeReceiptError &&
    e.code==="INVALID_CONSULTATIVE_RECEIPT");

test("valid receipt always results in unavailable, never in a model answer",()=>{
  const r=run();
  assert.equal(r.state,"UNAVAILABLE");
  assert.equal(r.evidenceState,"METADATA_MATCHED_NOT_LEGAL_REVIEWED");
  assert.equal(r.reasonCode,"LOCALE_UNVERIFIED");
  assert.equal(r.executionAuthority,"NONE");
  assert.equal(Object.isFrozen(r),true);
  assert.equal("answer" in r,false);
});

test("legitimate zero-hit is not interpreted as verified evidence",()=>{
  const r=run({evidence:{
    ...receipt().evidence,status:"NO_RETRIEVED_SOURCE",sourceCount:0
  }});
  assert.equal(r.evidenceState,"NO_RETRIEVED_SOURCE");
  assert.equal(r.state,"UNAVAILABLE");
});

test("English metadata must match requested language, with authored English notice",()=>{
  const r=run({locale:{...receipt().locale,requested:"en"}},"en");
  assert.equal(r.locale,"en");
  assert.match(r.message,/language was not verified/i);
  assert.equal(r.state,"UNAVAILABLE");
});

test("the receipt cannot promote the generated answer to presentable",()=>{
  for(const patch of [
    {display:{...receipt().display,canShowModelAnswer:true}},
    {display:{...receipt().display,reasonCode:"READY"}},
    {locale:{...receipt().locale,modelLanguageVerified:true}},
    {locale:{...receipt().locale,status:"CATALOG_EXACT_LANGUAGE"}},
    {evidence:{...receipt().evidence,legalValidityVerified:true}},
    {executionAuthority:"APPROVED"},
    {lifecycle:"LEARNING"},
  ])rejects(()=>run(patch));
});

test("foreign tenants, groups, CNPJs and reference dates cannot use a receipt",()=>{
  for(const [key,value] of [
    ["tenantId",OTHER],["companyId",OTHER],["cnpjId",OTHER],
    ["referenceDate","2026-10-12"]
  ])rejects(()=>run({scope:{...scope,[key]:value}}));
});

test("date, scope and stale-context updates never coerce the request identity",()=>{
  rejects(()=>projectConsultativeVerificationReceipt(receipt(),{
    ...scope,companyId:CNPJ
  },"pt-BR"));
  rejects(()=>projectConsultativeVerificationReceipt(receipt(),{
    ...scope,referenceDate:"today"
  },"pt-BR"));
  rejects(()=>run({locale:{...receipt().locale,requested:"en"}}));
  rejects(()=>projectConsultativeVerificationReceipt(receipt(),scope,"es"));
});

test("inconsistent evidence counts, invalid digest and metadata are rejected",()=>{
  for(const ev of [
    {...receipt().evidence,sourceCount:0},
    {...receipt().evidence,status:"NO_RETRIEVED_SOURCE",sourceCount:2},
    {...receipt().evidence,sourceCount:101},
    {...receipt().evidence,sourceCount:-1},
    {...receipt().evidence,snapshotFingerprintSha256:"x".repeat(64)},
    {...receipt().evidence,snapshotFingerprintSha256:"f".repeat(16)},
    {...receipt().evidence,status:"LEGALLY_VERIFIED"},
  ])rejects(()=>run({evidence:ev}));
});

test("future schema and extra authorization or model fields fail closed",()=>{
  for(const patch of [
    {schemaVersion:"1.1.0"},
    {canExecute:true},
    {model:"paid"},
    {answer:"Unreviewed legal answer"},
    {authorization:"Bearer never-publish"},
    {evidence:{...receipt().evidence,extra:"approval"}},
  ])rejects(()=>run(patch));
});

test("raw legal text, model output, source metadata and fingerprint are not disclosed",()=>{
  const r=run();
  const serialized=JSON.stringify(r);
  for(const secret of [TENANT,GROUP,CNPJ,digest,
    "Confidential Source", "Bearer","company_id","canShowModelAnswer"]){
    assert.equal(serialized.includes(secret),false,secret);
  }
});

test("null, arrays, malformed shapes and missing fields fail closed",()=>{
  for(const input of [null,[],{},{"locale":"pt-BR"},{...receipt(),scope:null}]){
    rejects(()=>projectConsultativeVerificationReceipt(input,scope,"pt-BR"));
  }
});

test("source boundary contains no transport, token access, state storage or execution",()=>{
  const text=readFileSync(new URL(
    "../src/features/intelligence/ConsultativeVerificationReceipt.ts",import.meta.url),"utf8");
  assert.doesNotMatch(text,/\bfetch\s*\(|\bgenerateText\s*\(|\.insert\s*\(|\.delete\s*\(/);
  assert.doesNotMatch(text,/localStorage|sessionStorage|service_role|process\.env/);
});
