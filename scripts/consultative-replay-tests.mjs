import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {projectUnreleasedConsultativeReplay,ConsultativeReplayReceiptError}
  from "../preview/runtime/features/intelligence/ConsultativeReplayReceipt.js";

const scope={
 tenantId:"11111111-1111-4111-8111-111111111111",
 companyId:"22222222-2222-4222-8222-222222222222",
 cnpjId:"33333333-3333-4333-8333-333333333333",
 referenceDate:"2026-10-13",
};
const id="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const expected=(patch={})=>({attemptId:id,scope,locale:"pt-BR",...patch});
const raw=(patch={})=>({
 schemaVersion:"1.0.0",attemptId:id,scope,locale:"pt-BR",
 signatureVerified:true,singleUseClaimAccepted:true,
 distributedReplayProtectionVerified:false,
 productionReplayStoreCertified:false,
 issuerAuthorizationVerified:false,
 modelLanguageVerified:false,
 lifecycle:"PRE_LEARNING",executionAuthority:"NONE",
 display:{canShowModelAnswer:false,reasonCode:"LOCALE_UNVERIFIED"},
 ...patch
});
const run=(r=raw(),e=expected())=>projectUnreleasedConsultativeReplay(r,e);
const denied=fn=>assert.throws(fn,ConsultativeReplayReceiptError);

test("claimed callback is never confused with production replay certification",()=>{
 const r=run();
 assert.equal(r.state,"UNAVAILABLE");
 assert.equal(r.replayStatus,"CALLBACK_CLAIMED_NOT_DISTRIBUTED_CERTIFIED");
 assert.equal(r.reasonCode,"LOCALE_UNVERIFIED");
 assert.equal(r.executionAuthority,"NONE");
 assert.equal(Object.isFrozen(r),true);
 assert.equal("answer" in r,false);
});
test("another attempt and foreign tenant/group/CNPJ or date reject",()=>{
 const other="99999999-9999-4999-8999-999999999999";
 denied(()=>run(raw({attemptId:other})));
 for(const key of ["tenantId","companyId","cnpjId","referenceDate"]){
  const value=key==="referenceDate"?"2026-10-12":other;
  denied(()=>run(raw({scope:{...scope,[key]:value}})));
  denied(()=>run(raw(),expected({scope:{...scope,[key]:value}})));
 }
});
test("cannot elevate the replay guard or approve legal/model output",()=>{
 for(const patch of [
  {distributedReplayProtectionVerified:true},
  {productionReplayStoreCertified:true},
  {issuerAuthorizationVerified:true},
  {modelLanguageVerified:true},
  {executionAuthority:"APPROVED"},
  {lifecycle:"LEARNING"},
  {singleUseClaimAccepted:false},
  {signatureVerified:false},
  {display:{canShowModelAnswer:true,reasonCode:"READY"}},
 ])denied(()=>run(raw(patch)));
});
test("PT/EN catalog notice stays local and does not reuse foreign language",()=>{
 const en=run(raw({locale:"en"}),expected({locale:"en"}));
 assert.match(en.message,/replay protection/i);
 assert.equal(en.state,"UNAVAILABLE");
 denied(()=>run(raw({locale:"en"})));
 denied(()=>run(raw(),expected({locale:"en"})));
});
test("malformed dates, scope, extra fields and unsupported schema fail",()=>{
 denied(()=>run(raw({schemaVersion:"1.1.0"})));
 denied(()=>run(raw({answer:"private model response"})));
 denied(()=>run(raw({signature:"untrusted"})));
 denied(()=>run(raw({scope:{...scope,extra:"x"}})));
 denied(()=>run(raw(),expected({scope:{...scope,companyId:scope.cnpjId}})));
 denied(()=>run(raw(),expected({scope:{...scope,referenceDate:"2026-02-30"}})));
 denied(()=>run(raw(),expected({locale:"es"})));
 for(const v of [null,[],{},false])denied(()=>run(v));
});
test("returned notice includes neither private identifiers nor store metadata",()=>{
 const projection=JSON.stringify(run());
 for(const secret of [id,scope.tenantId,scope.companyId,scope.cnpjId,
  "digestSha256","retainUntilMs","nonce","private model response"]){
  assert.equal(projection.includes(secret),false,secret);
 }
});
test("consumer includes no HTTP, storage, private keys or inference",()=>{
 const src=readFileSync(new URL(
  "../src/features/intelligence/ConsultativeReplayReceipt.ts",import.meta.url),"utf8");
 assert.doesNotMatch(src,/\bfetch\s*\(|\bgenerateText\s*\(|\.insert\s*\(|\.delete\s*\(/);
 assert.doesNotMatch(src,/localStorage|sessionStorage|process\.env|privateKey/);
});


test("test-only conformance report never substitutes a live signed replay receipt",()=>{
 const report={
  schemaVersion:"1.0.0",
  kind:"REPLAY_STORE_TEST_HARNESS_RESULT",
  checks:["ONE_WINNER_CONCURRENT","NO_PREMATURE_REUSE",
   "DISTINCT_DIGEST","NAMESPACE_ISOLATION"],
  checkedClientHandles:24,
  actualBackendIndependenceVerified:false,
  backendAtomicityCertified:false,
  durabilityCertified:false,
  expiryCertified:false,
  failureIsolationCertified:false,
  JWTAndRLSVerified:false,
  authorizesDeployment:false,
  authorizesModelDisplay:false,
  executionAuthority:"NONE",
 };
 denied(()=>run(report));
 denied(()=>run(raw({...report})));
 denied(()=>run(raw({conformanceReport:report})));
 denied(()=>run(raw({productionReplayStoreCertified:true})));
 denied(()=>run(raw({distributedReplayProtectionVerified:true})));
});


test("hostile receipt access is converted into an opaque boundary error",()=>{
 const privateDiagnostic="secret from upstream tenant and token";
 const base=raw();
 const throwingScope=Object.defineProperty({...base},"scope",{
  enumerable:true,get(){throw new Error(privateDiagnostic);}
 });
 const ownKeysTrap=new Proxy(base,{ownKeys(){throw new Error(privateDiagnostic);}});
 const nestedScope=new Proxy(scope,{get(){throw new Error(privateDiagnostic);}});
 const wrongExpected=Object.defineProperty({...expected()},"locale",{
  enumerable:true,get(){throw new Error(privateDiagnostic);}
 });
 for(const value of [throwingScope,ownKeysTrap,{...base,scope:nestedScope}]){
  assert.throws(()=>run(value),err=>
   err instanceof ConsultativeReplayReceiptError &&
   !String(err.message).includes(privateDiagnostic));
 }
 assert.throws(()=>run(base,wrongExpected),err=>
  err instanceof ConsultativeReplayReceiptError &&
  !String(err.message).includes(privateDiagnostic));
});
