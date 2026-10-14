import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 projectUnreleasedConsultativeBundle,ConsultativeBundleProjectionError,
} from '../preview/runtime/features/intelligence/ConsultativeVerificationBundle.js';
const fixture=JSON.parse(readFileSync(new URL(
 './fixtures/consultative-host-receipts-v1.json',import.meta.url),'utf8'));
const raw=()=>structuredClone(fixture.bundleResult);
const project=(data=raw(),exp=fixture.expected)=>
 projectUnreleasedConsultativeBundle(data,exp);
const denied=(f)=>assert.throws(f,ConsultativeBundleProjectionError);

test('source-only golden receipts together still yield unavailable notice',()=>{
 const out=project();
 assert.equal(out.state,'UNAVAILABLE');
 assert.equal(out.reasonCode,'LOCALE_UNVERIFIED');
 assert.equal(out.verificationStatus,'LOCAL_PRESENTATION_ONLY_NOT_HOST_ATTESTED');
 assert.equal(out.executionAuthority,'NONE');
 assert.equal(out.locale,'pt-BR');
 assert.equal(Object.isFrozen(out),true);
 assert.equal('answer' in out,false);
});
test('do not permit swapping signed or replay attempt identifiers',()=>{
 const other='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 denied(()=>project({...raw(),attemptId:other}));
 denied(()=>project({...raw(),signedVerificationResult:{
  ...fixture.signedVerificationResult,attemptId:other,
 }}));
 denied(()=>project({...raw(),replayClaimResult:{
  ...fixture.replayClaimResult,attemptId:other,
 }}));
});
test('scope mismatch in either receipt fails for every tenant dimension',()=>{
 const other='99999999-9999-4999-8999-999999999999';
 for(const key of ['tenantId','companyId','cnpjId','referenceDate']){
  const value=key==='referenceDate'?'2026-10-12':other;
  const foreign={...fixture.expected.scope,[key]:value};
  denied(()=>project({...raw(),signedVerificationResult:{
   ...fixture.signedVerificationResult,scope:foreign,
  }}));
  denied(()=>project({...raw(),replayClaimResult:{
   ...fixture.replayClaimResult,scope:foreign,
  }}));
 }
});
test('locale mismatch never promotes English response into Portuguese context',()=>{
 denied(()=>project({...raw(),signedVerificationResult:{
  ...fixture.signedVerificationResult,locale:'en',
 }}));
 denied(()=>project({...raw(),replayClaimResult:{
  ...fixture.replayClaimResult,locale:'en',
 }}));
});
test('outer bundle authority escalation and added secret fields always reject',()=>{
 for(const patch of [
  {executionAuthority:'CAN_EXECUTE'},
  {lifecycle:'LEARNING'},
  {display:{canShowModelAnswer:true,reasonCode:'READY'}},
  {question:'Private sensitive question'},
  {answer:'Wrong fiscal interpretation'},
  {signature:'untrusted'},
  {authorization:'APPROVED'},
  {schemaVersion:'2.0.0'},
  {kind:'PRODUCTION_ATTESTED'},
 ]){
  denied(()=>project({...raw(),...patch}));
 }
});
test('inner replay certifications or model answer display cannot be elevated',()=>{
 for(const patch of [
  {issuerAuthorizationVerified:true},
  {distributedReplayProtectionVerified:true},
  {productionReplayStoreCertified:true},
  {modelLanguageVerified:true},
  {display:{canShowModelAnswer:true,reasonCode:'READY'}},
 ]){
  denied(()=>project({...raw(),replayClaimResult:{
   ...fixture.replayClaimResult,...patch,
  }}));
 }
});
test('unknown, missing and deceptive nested results deny without data leakage',()=>{
 for(const payload of [null,false,[],{},{
  ...raw(),signedVerificationResult:null,
 },{
  ...raw(),replayClaimResult:{},
 },{
  ...raw(),signedVerificationResult:{
   ...fixture.signedVerificationResult,signatureMeaning:'SELF_ASSERTED',
  },
 }])denied(()=>project(payload));
 const json=JSON.stringify(project());
 for(const secret of [
  fixture.expected.attemptId,fixture.expected.scope.tenantId,
  fixture.expected.scope.cnpjId,'JWT','model answer','signature',
 ])assert.equal(json.includes(secret),false,secret);
});
test('English authored safety shell also remains unavailable',()=>{
 const en={...raw(),
  signedVerificationResult:{...fixture.signedVerificationResult,locale:'en'},
  replayClaimResult:{...fixture.replayClaimResult,locale:'en'},
 };
 const out=project(en,{...fixture.expected,locale:'en'});
 assert.equal(out.locale,'en');
 assert.match(out.message,/private host/);
 assert.equal(out.state,'UNAVAILABLE');
});

test('complete golden transport envelope is rejected if externally augmented',()=>{
 assert.deepEqual(raw(),fixture.bundleResult);
 const additions=[
  {signature:'attacker-controlled',source:'external'},
  {productionAuthorization:true},
  {tenantId:'99999999-9999-4999-8999-999999999999'},
  {retryable:true},
 ];
 for(const patch of additions)denied(()=>project({...raw(),...patch}));
});
test('throwing nested getters and proxies cannot leak an upstream diagnostic',()=>{
 const base=raw();
 const poison='confidential upstream exception';
 const getter=Object.defineProperty({...base},'replayClaimResult',{
  enumerable:true,get(){throw new Error(poison);}
 });
 const proxy=new Proxy(base,{
  ownKeys(){throw new Error(poison);}
 });
 const nested=new Proxy(base.replayClaimResult,{
  get(){throw new Error(poison);}
 });
 for(const candidate of [
  getter,proxy,{...base,replayClaimResult:nested},
 ]){
  assert.throws(()=>project(candidate),e=>
   e instanceof ConsultativeBundleProjectionError &&
   !String(e.message).includes(poison));
 }
});

test('self-consistent forged bundle cannot replace independently expected host attempt',()=>{
 const foreignAttemptId='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 const foreignScope={...fixture.expected.scope,
  tenantId:'99999999-9999-4999-8999-999999999999',
  referenceDate:'2026-10-12',
 };
 const forged={...raw(),attemptId:foreignAttemptId,
  signedVerificationResult:{
   ...fixture.signedVerificationResult,attemptId:foreignAttemptId,scope:foreignScope,
  },
  replayClaimResult:{
   ...fixture.replayClaimResult,attemptId:foreignAttemptId,scope:foreignScope,
  },
 };
 denied(()=>project(forged,fixture.expected));
 // Presentation-only validation is not authentication: a foreign record
 // may be internally consistent, but must never be treated as proof.
 const matchingForeignExpected={
  ...fixture.expected,attemptId:foreignAttemptId,scope:foreignScope,
 };
 const projection=project(forged,matchingForeignExpected);
 assert.equal(projection.state,'UNAVAILABLE');
 assert.equal(projection.verificationStatus,
  'LOCAL_PRESENTATION_ONLY_NOT_HOST_ATTESTED');
 assert.equal(projection.executionAuthority,'NONE');
});


test('untrusted expected host selection is snapshotted, never read twice',()=>{
 const hiddenDiagnostic='sensitive private host context';
 const foreignTenant='99999999-9999-4999-8999-999999999999';
 let reads=0;
 const shifting=Object.defineProperty({...fixture.expected},'scope',{
  enumerable:true,get(){
   reads++;
   return reads%2===1?fixture.expected.scope:{
    ...fixture.expected.scope,tenantId:foreignTenant,
   };
  },
 });
 const hidden=Object.defineProperty({...fixture.expected},'locale',{
  enumerable:true,get(){throw new Error(hiddenDiagnostic);}
 });
 const prototype=Object.assign(Object.create({authorized:true}),fixture.expected);
 const poisonousScope=new Proxy(fixture.expected.scope,{
  ownKeys(){throw new Error(hiddenDiagnostic);}
 });
 for(const ctx of [
  shifting,hidden,prototype,
  {...fixture.expected,scope:poisonousScope},
  {...fixture.expected,undocumentedAccessGrant:true},
  {...fixture.expected,scope:{...fixture.expected.scope,extra:'unsafe'}},
 ]){
  assert.throws(()=>project(raw(),ctx),error=>
   error instanceof ConsultativeBundleProjectionError &&
   !error.message.includes(hiddenDiagnostic));
 }
 assert.equal(reads,0,'getter must never be evaluated');
});
test('validated scope and locale remain fixed across both nested projections',()=>{
 const source=raw();
 const expected={...fixture.expected,scope:{...fixture.expected.scope}};
 const projection=project(source,expected);
 assert.equal(projection.state,'UNAVAILABLE');
 assert.equal(projection.locale,'pt-BR');
 assert.equal(projection.executionAuthority,'NONE');
 expected.scope.tenantId='99999999-9999-4999-8999-999999999999';
 assert.equal(projection.state,'UNAVAILABLE');
});
