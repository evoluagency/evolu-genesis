import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const file=readFileSync(new URL('../docs/CONSULTATIVE_RELEASE_ACCEPTANCE_V1.json',import.meta.url));
const manifest=JSON.parse(file.toString('utf8'));
const blobSha=createHash('sha1').update('blob '+file.length+'\0').update(file).digest('hex');
const EXPECTED_SHA='b7e9d36cf5cc2c318b4ea40bcf85e787a5439e03';
const LOCAL_REPO='evoluagency/evolu-genesis';
const REQUIRED_SOURCE_GATES=new Set([
 'INTELLIGENCE_SCOPE_SOURCE',
 'INTELLIGENCE_SIGNED_REPLAY_CONTRACT',
 'GENESIS_HOST_TRANSPORT_CONTRACT',
 'GENESIS_SYNTHETIC_PRESENTATION',
]);
const REQUIRED_EXTERNAL_GATES=new Set([
 'INTEGRATED_CONSULTATION_JWT_RLS_E2E',
 'PRIVATE_BFF_CANONICAL_SCOPE',
 'OPERATIONAL_SIGNER_AND_KEY_ROTATION',
 'DISTRIBUTED_REPLAY_DURABILITY',
 'INDEPENDENT_LOCALE_AND_CONTENT_CHECK',
 'EVIDENCE_PROVENANCE_AND_VALIDITY',
 'GENESIS_LIVE_VISUAL_ACCESSIBILITY',
 'PRIVACY_COST_AUDIT_AND_OBSERVABILITY',
 'RELEASE_REVIEW_AND_ROLLBACK',
]);
const FIELDS=['schemaVersion','kind','scope','lifecycle',
 'evidenceBasis','decision','permissions','priorGateB','gates'];
const HISTORY_KEYS=['kind','recordedStatus','recordedE2E','recordedAt',
 'executionBoundary','source','evidenceLevel',
 'integratedConsultationVerified','releaseAuthorization'];
const PERMISSION_KEYS=['deploy','merge','showModelAnswer',
 'operationalWrites','autonomousLearning','paidInference'];
function exactKeys(record,keys){
 return record!==null&&typeof record==='object'&&!Array.isArray(record)&&
  Object.keys(record).sort().join('|')===[...keys].sort().join('|');
}
/**
 * Validates a strictly pre-release SOURCE_ONLY matrix. This cannot grant
 * operational approval even when it passes, and intentionally rejects any
 * claim that a live gate is already certified. New release protocol/version
 * plus independent evidence verification is required for a real release.
 */
function validatePreReleaseMatrix(value){
 if(!exactKeys(value,FIELDS)||
    value.schemaVersion!=='1.0.0'||
    value.kind!=='EVOLU_CONSULTATIVE_RELEASE_ACCEPTANCE_V1'||
    value.scope!=='GENESIS_INTELLIGENCE_FIRST_AUTHENTICATED_CONSULTATIVE_RELEASE'||
    value.lifecycle!=='PRE_LEARNING'||
    value.evidenceBasis!=='SOURCE_ONLY_SYNTHETIC_CI_NO_LIVE_PROOF'||
    value.decision!=='BLOCKED'||
    !exactKeys(value.permissions,PERMISSION_KEYS)||
    PERMISSION_KEYS.some(key=>value.permissions[key]!==false)||
    !exactKeys(value.priorGateB,HISTORY_KEYS)||
    value.priorGateB.kind!=='INTELLIGENCE_PLATFORM_READ_HISTORICAL_RECORD'||
    value.priorGateB.recordedStatus!=='CLOSED'||
    value.priorGateB.recordedE2E!=='PASSED'||
    value.priorGateB.recordedAt!=='2026-09-22T10:25:59Z'||
    value.priorGateB.executionBoundary!=='EVOLU_APPLICATION_SERVER'||
    value.priorGateB.source!=='evolu2/intelligence/config/platform-read-runtime.multiplus-validation.v1.json'||
    value.priorGateB.evidenceLevel!=='REPOSITORY_RECORDED_NOT_INDEPENDENTLY_REEXECUTED'||
    value.priorGateB.integratedConsultationVerified!==false||
    value.priorGateB.releaseAuthorization!==false||
    !Array.isArray(value.gates)||
    value.gates.length!==REQUIRED_SOURCE_GATES.size+REQUIRED_EXTERNAL_GATES.size)
  return false;
 const seen=new Set();
 for(const gate of value.gates){
  if(!exactKeys(gate,['id','owner','state','evidencePaths','nextProof'])||
     typeof gate.id!=='string'||seen.has(gate.id)||
     typeof gate.owner!=='string'||gate.owner.length===0||
     typeof gate.nextProof!=='string'||gate.nextProof.trim().length<15||
     !Array.isArray(gate.evidencePaths))return false;
  seen.add(gate.id);
  if(REQUIRED_SOURCE_GATES.has(gate.id)){
   if(gate.state!=='SOURCE_TESTED'||gate.evidencePaths.length<1)return false;
  }else if(REQUIRED_EXTERNAL_GATES.has(gate.id)){
   if(gate.state!=='E2E_PENDING'||gate.evidencePaths.length!==0)return false;
  }else return false;
  for(const path of gate.evidencePaths){
   if(typeof path!=='string'||
      !/^(evolu2\/intelligence|evoluagency\/evolu-genesis)\/(test|scripts)\/[a-z0-9._/-]+\.mjs$/.test(path)||
      path.includes('..'))return false;
  }
 }
 return [...REQUIRED_SOURCE_GATES,...REQUIRED_EXTERNAL_GATES].every(x=>seen.has(x));
}
test('both PRs pin the same complete, source-only, Git-blob acceptance manifest',()=>{
 assert.equal(blobSha,EXPECTED_SHA);
 assert.equal(validatePreReleaseMatrix(manifest),true);
 assert.equal(manifest.decision,'BLOCKED');
 for(const field of PERMISSION_KEYS)assert.equal(manifest.permissions[field],false);
});
test('local SOURCE_TESTED entries refer to real repository test scripts',()=>{
 const prefix=LOCAL_REPO+'/';
 let count=0;
 for(const gate of manifest.gates){
  for(const evidencePath of gate.evidencePaths){
   if(!evidencePath.startsWith(prefix))continue;
   const relative=evidencePath.slice(prefix.length);
   assert.equal(existsSync(new URL('../'+relative,import.meta.url)),true,
    'Missing source-only test: '+relative);
   count++;
  }
 }
 assert.ok(count>=2);
});
test('CI green cannot forge release approval or promote external gates',()=>{
 const forbidden=[
  m=>{m.decision='APPROVED';},
  m=>{m.permissions.deploy=true;},
  m=>{m.permissions.showModelAnswer=true;},
  m=>{m.permissions.merge=true;},
  m=>{m.permissions.paidInference=true;},
  m=>{m.permissions.autonomousLearning=true;},
  m=>{m.permissions.operationalWrites=true;},
  m=>{m.priorGateB.integratedConsultationVerified=true;},
  m=>{m.priorGateB.releaseAuthorization=true;},
  m=>{m.priorGateB.recordedStatus='CURRENT_RELEASE_APPROVED';},
  m=>{m.lifecycle='LEARNING';},
  m=>{m.evidenceBasis='CERTIFIED_PRODUCTION';},
  m=>{m.gates.find(g=>g.id==='INTEGRATED_CONSULTATION_JWT_RLS_E2E').state='SOURCE_TESTED';},
  m=>{m.gates.find(g=>g.id==='DISTRIBUTED_REPLAY_DURABILITY').state='CERTIFIED';},
  m=>{m.gates.find(g=>g.id==='GENESIS_SYNTHETIC_PRESENTATION').state='PRODUCTION_READY';},
  m=>{m.gates[0].evidencePaths=[];},
  m=>{m.gates.splice(0,1);},
  m=>{m.gates.push({...m.gates[0]});},
  m=>{m.gates[0].approval='automatic';},
 ];
 for(const edit of forbidden){
  const altered=structuredClone(manifest);
  edit(altered);
  assert.equal(validatePreReleaseMatrix(altered),false,JSON.stringify(altered));
 }
});
test('each unresolved operational gate states the evidence needed',()=>{
 for(const gate of manifest.gates.filter(g=>REQUIRED_EXTERNAL_GATES.has(g.id))){
  assert.equal(gate.state,'E2E_PENDING');
  assert.equal(gate.evidencePaths.length,0);
  assert.ok(gate.nextProof.length>=15);
 }
});

test('historical Gate B record never satisfies the new cross-repo consultation gate',()=>{
 assert.equal(manifest.priorGateB.recordedStatus,'CLOSED');
 assert.equal(manifest.priorGateB.recordedE2E,'PASSED');
 assert.equal(manifest.priorGateB.integratedConsultationVerified,false);
 assert.equal(manifest.priorGateB.releaseAuthorization,false);
 const integrated=manifest.gates.find(g=>g.id==='INTEGRATED_CONSULTATION_JWT_RLS_E2E');
 assert.equal(integrated?.state,'E2E_PENDING');
 assert.deepEqual(integrated?.evidencePaths,[]);
});
