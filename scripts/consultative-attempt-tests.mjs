import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {ConsultativeAttemptReceiptError,projectConsultativeAttemptReceipt} from
 "../preview/runtime/features/intelligence/ConsultativeAttemptReceipt.js";

const scope={tenantId:"11111111-1111-4111-8111-111111111111",
 companyId:"22222222-2222-4222-8222-222222222222",
 cnpjId:"33333333-3333-4333-8333-333333333333",referenceDate:"2026-10-13"};
const id="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const START="2026-10-13T17:00:00.000Z";
const END="2026-10-13T17:00:03.000Z";
const NOW=Date.parse("2026-10-13T17:00:05.000Z");
const expected=(patch={})=>({attemptId:id,startedAt:START,scope,locale:"pt-BR",...patch});
const inner=(patch={})=>({
 schemaVersion:"1.0.0",scope,
 evidence:{status:"SERVER_SNAPSHOT_METADATA_MATCH_NOT_LEGAL_VERIFICATION",
   sourceCount:1,snapshotFingerprintSha256:"f".repeat(64),legalValidityVerified:false},
 locale:{requested:"pt-BR",status:"MODEL_LANGUAGE_NOT_INDEPENDENTLY_VERIFIED",
   modelLanguageVerified:false},
 display:{canShowModelAnswer:false,reasonCode:"LOCALE_UNVERIFIED"},
 lifecycle:"PRE_LEARNING",executionAuthority:"NONE",...patch,
});
const receipt=(patch={})=>({
 schemaVersion:"1.0.0",attemptId:id,startedAt:START,completedAt:END,scope,
 evidenceReceipt:inner(),correlationStatus:"LOCAL_SINGLE_USE_NOT_UPSTREAM_ATTESTED",
 upstreamAttemptAttested:false,
 display:{canShowModelAnswer:false,reasonCode:"LOCALE_UNVERIFIED"},
 lifecycle:"PRE_LEARNING",executionAuthority:"NONE",...patch
});
const run=(r=receipt(),e=expected(),now=NOW)=>
 projectConsultativeAttemptReceipt(r,e,now);
const rejects=fn=>assert.throws(fn,error=>error instanceof ConsultativeAttemptReceiptError);

test("valid local correlation remains unavailable and non-authoritative",()=>{
 const output=run();
 assert.equal(output.state,"UNAVAILABLE");
 assert.equal(output.reasonCode,"LOCALE_UNVERIFIED");
 assert.equal(output.correlation,"LOCAL_ONLY_NOT_UPSTREAM_ATTESTED");
 assert.equal(output.executionAuthority,"NONE");
 assert.equal(Object.isFrozen(output),true);
 assert.equal("answer" in output,false);
});
test("separate session attempt cannot reuse the previous response",()=>{
 rejects(()=>run(receipt({attemptId:"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"})));
 rejects(()=>run(receipt(),expected({
   attemptId:"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
 })));
 rejects(()=>run(receipt(),expected({startedAt:"2026-10-13T16:59:59.000Z"})));
});
test("outdated or temporally impossible attempts cannot show a result",()=>{
 for(const completedAt of [
  "2026-10-13T16:59:59.000Z","2026-10-13T17:01:10.000Z",
  "2026-10-13T17:00:07.000Z","invalid"
 ]) rejects(()=>run(receipt({completedAt})));
 rejects(()=>run(receipt(),expected(),NOW+61_000));
});
test("tenant, group, CNPJ and reference period must match both nested scopes",()=>{
 const other="99999999-9999-4999-8999-999999999999";
 for(const key of ["tenantId","companyId","cnpjId","referenceDate"]){
   const value=key==="referenceDate"?"2026-10-12":other;
   rejects(()=>run(receipt({scope:{...scope,[key]:value}})));
   rejects(()=>run(receipt({evidenceReceipt:inner({scope:{...scope,[key]:value}})})));
 }
});
test("PT/EN switched mid-flight cannot reinterpret the previous answer",()=>{
 rejects(()=>run(receipt(),expected({locale:"en"})));
 rejects(()=>run(receipt({evidenceReceipt:inner({locale:{
  ...inner().locale,requested:"en"
 }})})));
});
test("never promote model language, legal validity or execution authority",()=>{
 for(const input of [
  {upstreamAttemptAttested:true},
  {correlationStatus:"BACKEND_ATTESTED"},
  {executionAuthority:"ALLOWED"},
  {display:{canShowModelAnswer:true,reasonCode:"READY"}},
  {evidenceReceipt:inner({locale:{
   ...inner().locale,modelLanguageVerified:true
  }})},
  {evidenceReceipt:inner({evidence:{
   ...inner().evidence,legalValidityVerified:true
  }})},
 ])rejects(()=>run(receipt(input)));
});
test("extra fields and tampered metadata are rejected rather than echoed",()=>{
 rejects(()=>run(receipt({model:"synthetic"})));
 rejects(()=>run(receipt({schemaVersion:"1.1.0"})));
 rejects(()=>run(receipt({evidenceReceipt:inner({answer:"a generated answer"})})));
 rejects(()=>run(receipt({attemptId:"not-a-uuid"})));
 rejects(()=>run(receipt({evidenceReceipt:inner({
  evidence:{...inner().evidence,snapshotFingerprintSha256:"bad"}
 })})));
});
test("safe projection never reveals nonce, fingerprint, identifiers, source or model text",()=>{
 const result=JSON.stringify(run());
 for(const secret of [id,scope.tenantId,scope.companyId,scope.cnpjId,
  "f".repeat(64),"Confidential Title","generated answer"]){
  assert.equal(result.includes(secret),false,secret);
 }
});
test("invalid receipt roots and missing context are rejected",()=>{
 for(const obj of [null,[],{},{...receipt(),scope:null}]){
   rejects(()=>run(obj));
 }
});
test("consumer has no fetch, storage, credentials or inference code",()=>{
 const src=readFileSync(new URL(
  "../src/features/intelligence/ConsultativeAttemptReceipt.ts",import.meta.url),"utf8");
 assert.doesNotMatch(src,/\bfetch\s*\(|\bgenerateText\s*\(|\.insert\s*\(|\.delete\s*\(/);
 assert.doesNotMatch(src,/localStorage|sessionStorage|process\.env/);
});
