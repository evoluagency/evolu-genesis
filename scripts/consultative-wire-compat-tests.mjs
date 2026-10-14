/**
 * Consumer contract against the exact synthetic transport receipt shared with
 * Intelligence's producer tests. JSON alone is NOT an authentic signature.
 * This code must never approve showing the model response or run a provider.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {projectUnreleasedSignedConsultation,SignedConsultationBoundaryError}
 from '../preview/runtime/features/intelligence/ConsultativeSignedVerification.js';
import {projectUnreleasedConsultativeReplay,ConsultativeReplayReceiptError}
 from '../preview/runtime/features/intelligence/ConsultativeReplayReceipt.js';

const fixtureBytes=readFileSync(new URL(
 './fixtures/consultative-host-receipts-v1.json',import.meta.url));
const fixture=JSON.parse(fixtureBytes.toString('utf8'));
test('identical golden transport bytes are pinned across both repositories',()=>{
 const sha=createHash('sha1')
  .update('blob '+fixtureBytes.length+'\0').update(fixtureBytes).digest('hex');
 assert.equal(sha,'f12223e71131432a1f9cb82d91cf7731388a0f59');
});
function clone(v){return structuredClone(v);}
function rejectsSigned(raw,expected=fixture.expected){
 assert.throws(()=>projectUnreleasedSignedConsultation(raw,expected),SignedConsultationBoundaryError);
}
function rejectsReplay(raw,expected=fixture.expected){
 assert.throws(()=>projectUnreleasedConsultativeReplay(raw,expected),ConsultativeReplayReceiptError);
}
test('signature fixture provides only authored, unavailable PT notice',()=>{
 assert.equal(fixture.fixtureKind,'SYNTHETIC_SOURCE_ONLY_NO_TRUST');
 assert.equal(fixture.intendedUse,'CONTRACT_TESTS_ONLY');
 const out=projectUnreleasedSignedConsultation(
  fixture.signedVerificationResult,fixture.expected);
 assert.equal(out.state,'UNAVAILABLE');
 assert.equal(out.executionAuthority,'NONE');
 assert.equal(out.reasonCode,'LOCALE_UNVERIFIED');
 assert.equal(out.evidenceStatus,'SIGNATURE_RESULT_REQUIRES_PRIVATE_HOST_VERIFICATION');
 assert.equal('answer' in out,false);
});
test('replay fixture provides only authored, unavailable PT notice',()=>{
 const out=projectUnreleasedConsultativeReplay(
  fixture.replayClaimResult,fixture.expected);
 assert.equal(out.state,'UNAVAILABLE');
 assert.equal(out.executionAuthority,'NONE');
 assert.equal(out.reasonCode,'LOCALE_UNVERIFIED');
 assert.equal(out.replayStatus,'CALLBACK_CLAIMED_NOT_DISTRIBUTED_CERTIFIED');
 assert.equal('answer' in out,false);
});
test('real proof cannot be replaced with a simulated test report',()=>{
 const simulated={
  kind:'REPLAY_STORE_TEST_HARNESS_RESULT',checks:['ONE_WINNER_CONCURRENT'],
  backendAtomicityCertified:false,authorizesModelDisplay:false
 };
 rejectsReplay(simulated);
 rejectsSigned(simulated);
 rejectsReplay({...fixture.replayClaimResult,simulated});
 rejectsSigned({...fixture.signedVerificationResult,simulated});
});
test('cross-attempt, cross-company, wrong version and false flags reject',()=>{
 const other='99999999-9999-4999-8999-999999999999';
 for(const [field,val] of [
  ['attemptId','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],
  ['schemaVersion','1.1.0'],
  ['executionAuthority','EXECUTE'],
  ['modelLanguageVerified',true],
  ['issuerAuthorizationVerified',true],
 ]){
  rejectsSigned({...fixture.signedVerificationResult,[field]:val});
  rejectsReplay({...fixture.replayClaimResult,[field]:val});
 }
 const scope={...fixture.expected.scope,cnpjId:other};
 rejectsSigned({...fixture.signedVerificationResult,scope});
 rejectsReplay({...fixture.replayClaimResult,scope});
 rejectsSigned(fixture.signedVerificationResult,{
  ...fixture.expected,scope:{...fixture.expected.scope,companyId:other}
 });
 rejectsReplay(fixture.replayClaimResult,{
  ...fixture.expected,scope:{...fixture.expected.scope,companyId:other}
 });
});
test('model text, private request, raw signature or evidence must never be transported',()=>{
 const secret='private model tax conclusion, JWT and company document';
 const signed=clone(fixture.signedVerificationResult);
 const replay=clone(fixture.replayClaimResult);
 for(const key of ['answer','question','signature','nonce','sources','principal']){
  rejectsSigned({...signed,[key]:secret});
  rejectsReplay({...replay,[key]:secret});
 }
 const projected=[
  projectUnreleasedSignedConsultation(signed,fixture.expected),
  projectUnreleasedConsultativeReplay(replay,fixture.expected)
 ];
 for(const p of projected){
  const serialized=JSON.stringify(p);
  assert.equal(serialized.includes(secret),false);
  assert.equal(serialized.includes(fixture.expected.attemptId),false);
  assert.equal(serialized.includes(fixture.expected.scope.cnpjId),false);
  assert.equal(serialized.includes(fixture.expected.scope.tenantId),false);
 }
});
test('source-only signature claims never elevate client-side trust',()=>{
 for(const patch of [
  {signatureVerified:false},{signatureMeaning:'MODEL_SELF_DECLARED'},
  {distributedReplayProtectionVerified:true},
  {display:{canShowModelAnswer:true,reasonCode:'READY'}}
 ])rejectsSigned({...fixture.signedVerificationResult,...patch});
 for(const patch of [
  {signatureVerified:false},{singleUseClaimAccepted:false},
  {productionReplayStoreCertified:true},
  {distributedReplayProtectionVerified:true},
  {display:{canShowModelAnswer:true,reasonCode:'READY'}}
 ])rejectsReplay({...fixture.replayClaimResult,...patch});
});
