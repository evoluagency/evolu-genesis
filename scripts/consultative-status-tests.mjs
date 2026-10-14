import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import {describeConsultativeFailure} from
  "../preview/runtime/features/intelligence/ConsultativeStatus.js";
import {projectUnreleasedSignedConsultation} from
  "../preview/runtime/features/intelligence/ConsultativeSignedVerification.js";
import {projectUnreleasedConsultativeReplay} from
  "../preview/runtime/features/intelligence/ConsultativeReplayReceipt.js";
import {projectUnreleasedConsultativeBundle} from
  "../preview/runtime/features/intelligence/ConsultativeVerificationBundle.js";

test("PT/EN session errors always require explicit sign-in",()=>{
 for(const locale of ["pt-BR","en"]){
  for(const code of ["AUTH_REQUIRED","session_unavailable","authenticated_context_required"]){
   const result=describeConsultativeFailure({code},locale);
   assert.equal(result.kind,"SESSION_REQUIRED");
   assert.equal(result.nextAction,"SIGN_IN");
   assert.equal(result.retryable,false);
   assert.equal(result.locale,locale);
  }
 }
});
test("authorization never promotes denial to generic retry",()=>{
 for(const code of ["SCOPE_NOT_AUTHORIZED","scope_mismatch","INGESTION_MODULE_NOT_AUTHORIZED"]){
  const result=describeConsultativeFailure({code},"pt-BR");
  assert.equal(result.kind,"SCOPE_DENIED");
  assert.equal(result.nextAction,"REVIEW_SELECTION");
 }
});
test("input errors require editing rather than automatic re-submission",()=>{
 for(const code of ["INVALID_SCOPE","INVALID_REQUEST","invalid_human_consultation",
  "INVALID_CONSULTATIVE_REQUEST","platform_request_limit"]){
  const result=describeConsultativeFailure({code},"en");
  assert.equal(result.kind,"INPUT_INVALID");
  assert.equal(result.nextAction,"EDIT_QUESTION");
 }
});
test("session or context change cancels without retrying paid inference",()=>{
 for(const code of ["consultation_cancelled","consultation_context_changed",
  "REQUEST_ABORTED","coordinator_disposed"]){
  const result=describeConsultativeFailure({code},"pt-BR");
  assert.equal(result.kind,"CANCELLED");
  assert.equal(result.retryable,false);
  assert.equal(result.nextAction,"NONE");
 }
});
test("multiple questions cannot trigger parallel automatic retry",()=>{
 const out=describeConsultativeFailure({code:"consultation_in_flight"},"en");
 assert.equal(out.kind,"IN_PROGRESS");
 assert.equal(out.nextAction,"NONE");
});
test("unknown or malformed upstream body is NEVER reflected into UI text",()=>{
 const secret="jwt.private.secret-and-company-tax-data";
 for(const input of [
  {code:"NEW_SERVER_ERROR",message:secret},
  {code:secret,message:secret},
  {code:{nested:secret},message:secret},
  {message:secret},new Error(secret),null,secret,
 ]){
  const result=describeConsultativeFailure(input,"pt-BR");
  assert.equal(result.kind,"SERVICE_UNAVAILABLE");
  assert.equal(result.retryable,false);
  assert.equal(result.nextAction,"NONE");
  assert.equal(JSON.stringify(result).includes(secret),false);
 }
});
test("translated copy does not translate or disclose user/model content",()=>{
 const pt=describeConsultativeFailure({code:"SCOPE_NOT_AUTHORIZED"},"pt-BR");
 const en=describeConsultativeFailure({code:"SCOPE_NOT_AUTHORIZED"},"en");
 assert.notEqual(pt.title,en.title);
 assert.ok(pt.detail.includes("CNPJ"));
 assert.ok(en.detail.includes("group"));
 assert.equal(Object.isFrozen(pt),true);
 assert.throws(()=>describeConsultativeFailure({}, "es"),/invalid_consultative_locale/);
});
test("source mapper must remain independent of fetch, credentials, storage and engine",()=>{
 const source=readFileSync(new URL(
  "../src/features/intelligence/ConsultativeStatus.ts",import.meta.url),"utf8");
 assert.doesNotMatch(source,/\bfetch\s*\(|\bexecute\s*\(|\bgenerateText\s*\(/);
 assert.doesNotMatch(source,/localStorage|sessionStorage|service_role|process\.env/);
});


test("unknown claim outcome, invalid Ed25519 proof and stale attempt never recommend retry",()=>{
 const codes=[
  "CONSULTATIVE_REPLAY_GUARD_UNAVAILABLE",
  "CONSULTATIVE_SIGNATURE_NOT_VERIFIED",
  "CONSULTATIVE_ATTEMPT_NOT_CORRELATED",
  "CONSULTATIVE_PRESENTATION_CHECK_FAILED",
  "INVALID_CONSULTATIVE_REPLAY_RECEIPT",
  "INVALID_SIGNED_CONSULTATION_RESULT",
 ];
 for(const locale of ["pt-BR","en"]){
  for(const code of codes){
   const result=describeConsultativeFailure({code,message:"internal-secret-token"},locale);
   assert.equal(result.kind,"VERIFICATION_BLOCKED");
   assert.equal(result.nextAction,"NONE");
   assert.equal(result.retryable,false);
   assert.equal(result.locale,locale);
   assert.equal(JSON.stringify(result).includes("internal-secret-token"),false);
  }
 }
});
test("generic transport errors remain separate from unknown claim outcomes",()=>{
 const verification=describeConsultativeFailure({
  code:"CONSULTATIVE_REPLAY_GUARD_UNAVAILABLE",
  message:"request may already have been committed"
 },"en");
 const generic=describeConsultativeFailure({
  code:"private_platform_unavailable",
 },"en");
 assert.equal(verification.retryable,false);
 assert.equal(generic.kind,"SERVICE_UNAVAILABLE");
 assert.equal(generic.nextAction,"NONE");
 assert.notEqual(verification.title,generic.title);
});


test("hostile upstream code getters or proxies fail closed without retry",()=>{
 const secret="sensitive-upstream-auth-and-tenant-data";
 const throwing=Object.defineProperty({},"code",{
  get(){throw new Error(secret);}
 });
 const proxy=new Proxy({},{
  get(_target,key){if(key==="code")throw new Error(secret);return undefined;}
 });
 for(const input of [throwing,proxy]){
  for(const locale of ["pt-BR","en"]){
   const notice=describeConsultativeFailure(input,locale);
   assert.equal(notice.kind,"VERIFICATION_BLOCKED");
   assert.equal(notice.retryable,false);
   assert.equal(notice.nextAction,"NONE");
   assert.equal(notice.locale,locale);
   assert.equal(JSON.stringify(notice).includes(secret),false);
  }
 }
});
test("genuine Error.code remains recognized without exposing Error.message",()=>{
 const e=Object.assign(new Error("sensitive diagnostic"),{
  code:"CONSULTATIVE_REPLAY_GUARD_UNAVAILABLE"
 });
 const result=describeConsultativeFailure(e,"pt-BR");
 assert.equal(result.kind,"VERIFICATION_BLOCKED");
 assert.equal(result.nextAction,"NONE");
 assert.equal(JSON.stringify(result).includes("sensitive diagnostic"),false);
});


test("replay store qualification errors are safe, localized and never retried",()=>{
 for(const code of ["REPLAY_STORE_CONFORMANCE_FAILED",
   "REPLAY_STORE_NOT_CERTIFIED","REPLAY_STORE_ATOMICITY_UNKNOWN"]){
  for(const locale of ["pt-BR","en"]){
   const notice=describeConsultativeFailure({
    code,message:"db://private.example/secret/tenant-uuid"
   },locale);
   assert.equal(notice.kind,"VERIFICATION_BLOCKED");
   assert.equal(notice.nextAction,"NONE");
   assert.equal(notice.retryable,false);
   assert.equal(notice.locale,locale);
   assert.equal(JSON.stringify(notice).includes("db://"),false);
  }
 }
});

test('bundle rejection stays non-retryable',()=>{
 for(const code of ['CONSULTATIVE_VERIFICATION_BUNDLE_REJECTED','INVALID_CONSULTATIVE_VERIFICATION_BUNDLE']){
  for(const locale of ['pt-BR','en']){
   const result=describeConsultativeFailure({code,message:'internal-secret'},locale);
   assert.equal(result.kind,'VERIFICATION_BLOCKED');
   assert.equal(result.nextAction,'NONE');
   assert.equal(result.retryable,false);
   assert.equal(JSON.stringify(result).includes('internal-secret'),false);
  }
 }
});


test("source normalization failure after a possible model request cannot retry",()=>{
 for(const locale of ["pt-BR","en"]){
  const out=describeConsultativeFailure({
   code:"CONSULTATIVE_SOURCE_NOT_VERIFIED",
   message:"private model output and internal CNPJ must never be rendered",
  },locale);
  assert.equal(out.kind,"VERIFICATION_BLOCKED");
  assert.equal(out.retryable,false);
  assert.equal(out.nextAction,"NONE");
  assert.equal(out.locale,locale);
  assert.equal(JSON.stringify(out).includes("internal CNPJ"),false);
 }
});

test("actual receipt projection failures map to no-retry UI in both languages",()=>{
 const failures=[
  ()=>projectUnreleasedSignedConsultation(null,null),
  ()=>projectUnreleasedConsultativeReplay(null,null),
  ()=>projectUnreleasedConsultativeBundle(null,null),
 ];
 const codes=[
  "INVALID_SIGNED_CONSULTATION_RESULT",
  "INVALID_CONSULTATIVE_REPLAY_RECEIPT",
  "INVALID_CONSULTATIVE_VERIFICATION_BUNDLE",
 ];
 for(let index=0;index<failures.length;index++){
  let error;
  try{failures[index]();}catch(e){error=e;}
  assert.equal(error?.code,codes[index]);
  for(const locale of ["pt-BR","en"]){
   const notice=describeConsultativeFailure(error,locale);
   assert.equal(notice.kind,"VERIFICATION_BLOCKED");
   assert.equal(notice.nextAction,"NONE");
   assert.equal(notice.retryable,false);
   assert.equal(notice.locale,locale);
  }
 }
});

test("an unknown lost-ACK or malformed host error is never an automatic or suggested retry",()=>{
 const inputs=[
  null,undefined,{code:"HOST_CONNECTION_LOST"},
  {code:"TIMEOUT_AFTER_PROVIDER_EXECUTION"},
  {code:"ACK_MISSING",message:"sensitive private source content"},
  {code:"",message:"host response uncertain"},
  new Error("uncertain backend execution"),
 ];
 for(const locale of ["pt-BR","en"]){
  for(const value of inputs){
   const notice=describeConsultativeFailure(value,locale);
   assert.equal(notice.kind,"SERVICE_UNAVAILABLE");
   assert.equal(notice.retryable,false);
   assert.equal(notice.nextAction,"NONE");
   assert.equal(notice.locale,locale);
   assert.equal(JSON.stringify(notice).includes("private source content"),false);
  }
 }
});
