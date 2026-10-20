import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {
  LiveConsultationBoundaryError, LiveConsultationCoordinator,
  SameOriginPlatformConsultativeTransport, PLATFORM_CONSULTATIVE_ENDPOINT,
} from "../preview/runtime/features/intelligence/LivePlatformConsultation.js";

const scope={tenantId:"11111111-1111-4111-8111-111111111111",
  companyId:"22222222-2222-4222-8222-222222222222",
  cnpjId:"33333333-3333-4333-8333-333333333333",
  tenantSlug:"tenant-alpha",referenceDate:"2026-10-13",pageId:"fiscal.workspace"};
const snapshot=()=>({scope:{...scope},locale:"pt-BR",sessionEpoch:"epoch-0001"});
const question="Explique a fundamentação técnica indicada para este produto";
const raw=(patch={})=>({
  schemaVersion:"1.0.0",tenantId:scope.tenantId,companyId:scope.companyId,cnpjId:scope.cnpjId,
  sourceKind:"intelligence_consultative_answer",lifecycle:"PRE_LEARNING",referenceDate:scope.referenceDate,
  decision:"ADVISORY_ONLY",answer:"Resposta sintética sem comprovação do idioma.",
  responseMode:"MODEL",model:"synthetic",evidence:{retrievalDecision:"READY",retrievedSourceCount:1},
  costGuard:{allowed:true,accountedUsd:0,code:null},
  provenance:[{source:"Intelligence.POST /api/intelligence",observedAt:"2026-10-13T17:00:00.000Z"}],
  capabilities:{canApprove:{status:"unavailable"},canExecute:{status:"unavailable"},canLearn:{status:"unavailable"}},
  dataQuality:{issues:["requires_professional_review"]},...patch,
});
const run=(transport,reader=snapshot)=>new LiveConsultationCoordinator(reader,transport);
const token="test.subject.signature";
const ok=(data=raw())=>new Response(JSON.stringify(data),{
  status:200,headers:{"content-type":"application/json; charset=utf-8"},
});
function deferred(){let resolve;const promise=new Promise(yes=>{resolve=yes});return {promise,resolve}}
function rejects(fn,code){return assert.rejects(fn,e=>e instanceof LiveConsultationBoundaryError&&e.code===code)}

test("construction and passive observation never cause consultation; explicit ask returns gated result",async()=>{
 let calls=0;
 const coordinator=run({request:async()=>{calls++;return raw()}});
 assert.equal(calls,0);
 const out=await coordinator.askExplicitly(question);
 assert.equal(calls,1);assert.equal(out.state,"UNAVAILABLE");
 assert.equal(out.intent.executionAuthority,"NONE");
 coordinator.dispose();
});
test("same-origin request contains only exact Platform BFF envelope and trusted Bearer token",async()=>{
 let path,options;
 const t=new SameOriginPlatformConsultativeTransport(
  {getAccessToken:async()=>token},async(p,o)=>{path=p;options=o;return ok()});
 const controller=run(t);
 await controller.askExplicitly(question);
 assert.equal(path,PLATFORM_CONSULTATIVE_ENDPOINT);
 assert.equal(path,"/api/ux/intelligence/consult/v1");
 assert.equal(options.method,"POST");assert.equal(options.mode,"same-origin");
 assert.equal(options.credentials,"same-origin");assert.equal(options.redirect,"error");
 assert.equal(options.cache,"no-store");assert.equal(options.referrerPolicy,"no-referrer");
 assert.equal(options.headers.Authorization,"Bearer "+token);
 const body=JSON.parse(options.body);
 assert.deepEqual(Object.keys(body).sort(),["operation","payload","service","tenantSlug"]);
 assert.equal(body.payload.companyId,scope.companyId);assert.equal(body.payload.cnpjId,scope.cnpjId);
 assert.equal(body.payload.question,question);
  assert.equal(body.payload.locale,"pt-BR");
  assert.equal("locale" in body,false);
 controller.dispose();
});
test("missing or invalid session token denies before fetch",async()=>{
 for(const candidate of [null,"","short","has whitespace token"]){
  let count=0;
  const t=new SameOriginPlatformConsultativeTransport(
   {getAccessToken:async()=>candidate},async()=>{count++;return ok()});
  const c=run(t);
  await rejects(()=>c.askExplicitly(question),"private_platform_unavailable");
  assert.equal(count,0);c.dispose();
 }
});
test("HTTP errors, wrong content-type and malformed JSON never leak upstream body",async()=>{
 const responses=[
  new Response("secret error",{status:503,headers:{"content-type":"text/plain"}}),
  new Response("forbidden",{status:403,headers:{"content-type":"application/json"}}),
  new Response("{}",{status:200,headers:{"content-type":"text/html"}}),
  new Response("{ broken",{status:200,headers:{"content-type":"application/json"}}),
 ];
 for(const response of responses){
  const t=new SameOriginPlatformConsultativeTransport(
   {getAccessToken:async()=>token},async()=>response);
  const c=run(t);
  await rejects(()=>c.askExplicitly(question),"private_platform_unavailable");
  c.dispose();
 }
});
test("response larger than 64KiB is denied from headers or streaming bytes",async()=>{
 const responses=[
  new Response("{}",{status:200,headers:{"content-type":"application/json","content-length":"90000"}}),
  new Response(JSON.stringify({body:"x".repeat(70000)}),{status:200,headers:{"content-type":"application/json"}}),
 ];
 for(const response of responses){
  const t=new SameOriginPlatformConsultativeTransport(
   {getAccessToken:async()=>token},async()=>response);
  const c=run(t);
  await rejects(()=>c.askExplicitly(question),"private_platform_unavailable");c.dispose();
 }
});
test("pending duplicate rejects immediately, preventing accidental second inference",async()=>{
 const task=deferred();let calls=0;
 const c=run({request:async()=>{calls++;return task.promise}});
 const first=c.askExplicitly(question);
 await rejects(()=>c.askExplicitly(question),"consultation_in_flight");
 assert.equal(calls,1);task.resolve(raw());await first;c.dispose();
});
test("change of tenant, group, CNPJ, page, period, slug, locale or session discards late replies",async()=>{
 const other="99999999-9999-4999-8999-999999999999";
 const patches=[
  {scope:{...scope,tenantId:other}},{scope:{...scope,companyId:other}},
  {scope:{...scope,cnpjId:other}},{scope:{...scope,pageId:"advisory.workspace"}},
  {scope:{...scope,referenceDate:"2026-10-12"}},{scope:{...scope,tenantSlug:"tenant-beta"}},
  {locale:"en"},{sessionEpoch:"epoch-0002"},
 ];
 for(const patch of patches){
  let active=snapshot();const task=deferred();
  const c=run({request:async()=>task.promise},()=>active);
  const pending=c.askExplicitly(question);
  active={...active,...patch};
  task.resolve(raw());
  await rejects(()=>pending,"consultation_context_changed");c.dispose();
 }
});
test("explicit invalidate aborts in-flight request even if transport ignores signal",async()=>{
 const task=deferred();let signal;
 const c=run({request:async(_v,s)=>{signal=s;return task.promise}});
 const pending=c.askExplicitly(question);
 c.invalidate();assert.equal(signal.aborted,true);
 task.resolve(raw());
 await rejects(()=>pending,"consultation_context_changed");c.dispose();
});
test("new session can issue next request without ever displaying old session reply",async()=>{
 const task=deferred();let count=0;
 const c=run({request:async()=>{count++;return count===1?task.promise:raw()}});
 const old=c.askExplicitly(question);c.invalidate();
 const current=await c.askExplicitly(question);
 assert.equal(current.state,"UNAVAILABLE");task.resolve(raw());
 await rejects(()=>old,"consultation_context_changed");
 assert.equal(count,2);c.dispose();
});
test("missing session, invalid input and disposed coordinator never invoke transport",async()=>{
 let count=0;const t={request:async()=>{count++;return raw()}};
 const a=run(t,()=>null);
 await rejects(()=>a.askExplicitly(question),"authenticated_context_required");
 const b=run(t,()=>({...snapshot(),sessionEpoch:""}));
 await rejects(()=>b.askExplicitly(question),"authenticated_context_required");
 const c=run(t);await assert.rejects(()=>c.askExplicitly("sim"),/invalid_human_consultation/);
 c.dispose();await rejects(()=>c.askExplicitly(question),"coordinator_disposed");
 assert.equal(count,0);
});
test("synthetic Genesis UX stays free of transport, local credentials and inference",()=>{
 const source=readFileSync(new URL("../src/features/intelligence/LivePlatformConsultation.ts",import.meta.url),"utf8");
 const preview=readFileSync(new URL("../preview/shared-ux/intelligence-layer.js",import.meta.url),"utf8");
 assert.doesNotMatch(preview,/LiveConsultationCoordinator|SameOriginPlatformConsultativeTransport|fetch\s*\(/);
 assert.match(source,/\/api\/ux\/intelligence\/consult\/v1/);
 assert.doesNotMatch(source,/localStorage|sessionStorage|apikey|service_role|intelligence-evolu2\.vercel/);
 assert.doesNotMatch(source,/document\.cookie|fetch\(["']https?:\/\//);
});

test("context switch during asynchronous JWT retrieval prevents even the outbound BFF request",async()=>{
  const tokenTask=deferred();let calls=0;
  let current=snapshot();
  const transport=new SameOriginPlatformConsultativeTransport(
    {getAccessToken:async()=>tokenTask.promise},
    async()=>{calls++;return ok()},
  );
  const controller=run(transport,()=>current);
  const pending=controller.askExplicitly(question);
  current={...current,locale:"en",sessionEpoch:"epoch-0002"};
  tokenTask.resolve(token);
  await rejects(()=>pending,"private_platform_unavailable");
  assert.equal(calls,0,"paid inference route must never be called after a context change");
  controller.dispose();
});
test("explicit invalidation during token acquisition prevents outbound requests",async()=>{
  const tokenTask=deferred();let calls=0;
  const transport=new SameOriginPlatformConsultativeTransport(
    {getAccessToken:async()=>tokenTask.promise},
    async()=>{calls++;return ok()},
  );
  const controller=run(transport);
  const pending=controller.askExplicitly(question);
  controller.invalidate();
  tokenTask.resolve(token);
  // Explicit invalidation changes the current session incarnation.
  // The abort-race settles it immediately as consultation_context_changed.
  await rejects(()=>pending,"consultation_context_changed");
  assert.equal(calls,0);
  controller.dispose();
});


test("MODEL must be preceded by Intelligence retrieval READY, not legacy PASSED",async()=>{
  for(const decision of ["PASSED","NEEDS_CONTEXT","EVIDENCE_INSUFFICIENT",
    "CONTEXT_CONFLICT","UNKNOWN"]){
    const c=run({request:async()=>raw({
      evidence:{retrievalDecision:decision,retrievedSourceCount:1}
    })});
    await rejects(()=>c.askExplicitly(question),"invalid_consultative_retrieval");
    c.dispose();
  }
});

test("RETRIEVAL_* failure mode must match exact non-READY retrieval decision",async()=>{
  for(const patch of [
    {responseMode:"RETRIEVAL_NEEDS_CONTEXT",
      evidence:{retrievalDecision:"READY",retrievedSourceCount:1}},
    {responseMode:"RETRIEVAL_NEEDS_CONTEXT",
      evidence:{retrievalDecision:"EVIDENCE_INSUFFICIENT",retrievedSourceCount:1}},
    {responseMode:"RETRIEVAL_CONTEXT_CONFLICT",
      evidence:{retrievalDecision:"NEEDS_CONTEXT",retrievedSourceCount:1}},
    {responseMode:"RETRIEVAL_NOT_A_GATE",
      evidence:{retrievalDecision:"READY",retrievedSourceCount:1}},
  ]){
    const c=run({request:async()=>raw(patch)});
    await rejects(()=>c.askExplicitly(question),"invalid_consultative_retrieval");
    c.dispose();
  }
});

test("cost denial and safe fallback cannot invent an eligible retrieval decision",async()=>{
  for(const responseMode of ["AI_COST_GUARD","SAFE_FALLBACK"]){
    const c=run({request:async()=>raw({
      responseMode,
      evidence:{retrievalDecision:"NEEDS_CONTEXT",retrievedSourceCount:1},
    })});
    await rejects(()=>c.askExplicitly(question),"invalid_consultative_retrieval");
    c.dispose();
  }
});

test("coherent non-READY retrieval is unavailable without rendering upstream text",async()=>{
  for(const decision of ["NEEDS_CONTEXT","EVIDENCE_INSUFFICIENT","CONTEXT_CONFLICT"]){
    const c=run({request:async()=>raw({
      decision:"BLOCKED",responseMode:"RETRIEVAL_"+decision,model:"NONE",
      costGuard:{allowed:false,accountedUsd:0,code:"RETRIEVAL_GATE"},
      evidence:{retrievalDecision:decision,retrievedSourceCount:0}
    })});
    const output=await c.askExplicitly(question);
    assert.equal(output.state,"UNAVAILABLE");
    assert.equal(output.intent.executionAuthority,"NONE");
    assert.doesNotMatch(JSON.stringify(output),/Resposta sintética sem comprovação/);
    c.dispose();
  }
});


test("explicit invalidation settles an ignored-abort transport without response or second cost",async()=>{
 let requests=0;
 const never=new Promise(()=>{});
 const c=run({request:async()=>{
  requests++;
  if(requests===1)return never;
  return raw();
 }});
 const abandoned=c.askExplicitly(question);
 assert.equal(requests,1);
 c.invalidate();
 await rejects(()=>abandoned,"consultation_context_changed");
 const fresh=await c.askExplicitly(question);
 assert.equal(fresh.state,"UNAVAILABLE");
 assert.equal(fresh.intent.executionAuthority,"NONE");
 assert.equal(requests,2);
 c.dispose();
});
test("dispose settles a hung transport even when the transport ignores AbortSignal",async()=>{
 let requests=0;
 const c=run({request:()=>{requests++;return new Promise(()=>{});}});
 const old=c.askExplicitly(question);
 assert.equal(requests,1);
 c.dispose();
 await rejects(()=>old,"consultation_context_changed");
 await rejects(()=>c.askExplicitly(question),"coordinator_disposed");
 assert.equal(requests,1);
});
test("aborted transport resolving or rejecting late never changes the next session",async()=>{
 for(const finish of ["resolve","reject"]){
  const first=deferred();let attempts=0;
  const c=run({request:async()=>{
   attempts++;
   if(attempts===1)return first.promise;
   return raw();
  }});
  const discarded=c.askExplicitly(question);
  c.invalidate();
  await rejects(()=>discarded,"consultation_context_changed");
  const newResult=await c.askExplicitly(question);
  assert.equal(newResult.state,"UNAVAILABLE");
  if(finish==="resolve")first.resolve(raw({answer:"OLD SESSION PRIVATE ANSWER"}));
  else first.resolve(Promise.reject(new Error("PRIVATE UPSTREAM ERROR")));
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(newResult.state,"UNAVAILABLE");
  assert.doesNotMatch(JSON.stringify(newResult),/OLD SESSION PRIVATE ANSWER|PRIVATE UPSTREAM ERROR/);
  assert.equal(attempts,2);
  c.dispose();
 }
});


test("foreign host getters and proxy traps fail before any paid BFF dispatch",async()=>{
 const privateDetail="PRIVATE_JWT_OR_TENANT_METADATA";
 const poison=()=>{throw new Error(privateDetail);};
 const rootGetter=Object.defineProperty({...snapshot()},"sessionEpoch",{
  enumerable:true,get:poison,
 });
 const scopeGetter=Object.defineProperty({...scope},"companyId",{
  enumerable:true,get:poison,
 });
 const hostileProxy=new Proxy(snapshot(),{ownKeys:poison});
 const foreign=Object.assign(Object.create({authorized:true}),snapshot());
 const scopeProxy=new Proxy({...scope},{getOwnPropertyDescriptor:poison});
 const malicious=[
  rootGetter,{...snapshot(),scope:scopeGetter},hostileProxy,foreign,
  {...snapshot(),scope:scopeProxy},
  {...snapshot(),canExecute:true},
  {...snapshot(),scope:{...scope,privateToken:"never trust"}},
 ];
 for(const hostile of malicious){
  let calls=0;
  const c=run({request:async()=>{calls++;return raw();}},()=>hostile);
  await assert.rejects(()=>c.askExplicitly(question),error=>
   error instanceof LiveConsultationBoundaryError &&
   error.code==="authenticated_context_required" &&
   !error.message.includes(privateDetail));
  assert.equal(calls,0);
  c.dispose();
 }
});
test("the first host selection is not modified by a getter while building the request",async()=>{
 let invoked=0;
 const changing=Object.defineProperty({...scope},"cnpjId",{
  enumerable:true,get(){
   invoked++;
   return invoked===1?scope.cnpjId:"99999999-9999-4999-8999-999999999999";
  },
 });
 let sent=0;
 const c=run({request:async()=>{sent++;return raw();}},
  ()=>({...snapshot(),scope:changing}));
 await rejects(()=>c.askExplicitly(question),"authenticated_context_required");
 assert.equal(invoked,0);
 assert.equal(sent,0);
 c.dispose();
});
test("a hostile host replacement while token is pending rejects before network dispatch",async()=>{
 let host=snapshot(),outbound=0;
 const t=new SameOriginPlatformConsultativeTransport(
  {getAccessToken:async()=>{host=Object.defineProperty({...snapshot()},"locale",{
    enumerable:true,get(){throw new Error("PRIVATE_HOST_LOCALE");}
   });return token;}},
  async()=>{outbound++;return ok()},
 );
 const c=run(t,()=>host);
 await rejects(()=>c.askExplicitly(question),"private_platform_unavailable");
 assert.equal(outbound,0);
 c.dispose();
});
test("immutable host snapshots cannot be changed by a later mutable selection",async()=>{
 let host=snapshot(),outbound=0;
 const c=run({request:async(invocation)=>{
  outbound++;
  assert.equal(invocation.payload.companyId,scope.companyId);
  host={...host,scope:{...host.scope,companyId:
   "99999999-9999-4999-8999-999999999999"}};
  return raw();
 }},()=>host);
 await rejects(()=>c.askExplicitly(question),"consultation_context_changed");
 assert.equal(outbound,1);
 c.dispose();
});


test("a future locale-verified response remains hidden throughout the live coordinator",async()=>{
 for(const locale of ["pt-BR","en"]){
  let calls=0;
  const answer="CONFIDENTIAL_UNATTESTED_MODEL_ANSWER";
  const host=()=>({...snapshot(),locale});
  const c=run({request:async()=>{
   calls++;
   return raw({
    schemaVersion:"1.1.0",answerLocale:locale,localeVerified:true,
    answer,distributedReplayProtectionVerified:true,
    issuerAuthorizationVerified:true,productionReplayStoreCertified:true,
    verificationBundle:{display:{canShowModelAnswer:true}},
   });
  }},host);
  const out=await c.askExplicitly(question);
  assert.equal(calls,1);
  assert.equal(out.state,"UNAVAILABLE");
  assert.equal(out.intent.kind,"UNAVAILABLE");
  assert.equal(out.intent.executionAuthority,"NONE");
  assert.equal(out.intent.blocks.some(block=>block.type==="TEXT"),false);
  assert.doesNotMatch(JSON.stringify(out),/CONFIDENTIAL_UNATTESTED_MODEL_ANSWER/);
  c.dispose();
 }
});


test("retrieval and presentation validate exactly one shared copy of mutable BFF response",async()=>{
 let ownReads=0,regularReads=0,requests=0;
 const good=raw();
 const hostile=new Proxy(good,{
  get(target,key,receiver){
   if(key==="evidence"){regularReads++;return {
    retrievalDecision:"CONTEXT_CONFLICT",retrievedSourceCount:0
   };}
   return Reflect.get(target,key,receiver);
  },
  getOwnPropertyDescriptor(target,key){
   if(key==="evidence"){
    ownReads++;
    // If two stages fetched independently the second would get an
    // incompatible verdict and could change the reason shown in the UI.
    return {configurable:true,enumerable:true,writable:true,
      value:ownReads===1?{
        retrievalDecision:"READY",retrievedSourceCount:1
      }:{
        retrievalDecision:"CONTEXT_CONFLICT",retrievedSourceCount:0
      }};
   }
   return Reflect.getOwnPropertyDescriptor(target,key);
  }
 });
 const c=run({request:async()=>{requests++;return hostile;}});
 const out=await c.askExplicitly(question);
 assert.equal(out.state,"UNAVAILABLE");
 assert.equal(out.intent.kind,"UNAVAILABLE");
 assert.equal(out.intent.executionAuthority,"NONE");
 assert.equal(out.intent.blocks.some(block=>block.type==="TEXT"),false);
 assert.equal(requests,1);
 assert.equal(regularReads,0,"untrusted property getters must never be read");
 assert.equal(ownReads,1,"retrieval and bridge must not resnapshot foreign response");
 c.dispose();
});
test("retrieval accessor and poisoned proxy reject without exposing private diagnostics",async()=>{
 const secret="PRIVATE_PLATFORM_RESPONSE_TOKEN";
 let getters=0;
 for(const factory of [
  ()=>Object.defineProperty(raw(),"evidence",{enumerable:true,
    get(){getters++;throw Error(secret);}}),
  ()=>Object.defineProperty(raw(),"responseMode",{enumerable:true,
    get(){getters++;throw Error(secret);}}),
  ()=>new Proxy(raw(),{getOwnPropertyDescriptor(){throw Error(secret);}}),
  ()=>raw({evidence:Object.defineProperty({retrievedSourceCount:1},
    "retrievalDecision",{enumerable:true,
      get(){getters++;throw Error(secret);}})}),
 ]){
  const c=run({request:async()=>factory()});
  await assert.rejects(()=>c.askExplicitly(question),e=>
    e instanceof LiveConsultationBoundaryError &&
    e.code==="invalid_consultative_retrieval" &&
    !e.message.includes(secret));
  c.dispose();
 }
 assert.equal(getters,0);
});


test("malformed MIME declarations never pass the JSON response gate",async()=>{
 for(const contentType of [
  "text/plain; comment=application/json",
  "application/jsonp","application/json-extra",
  "application/json, text/html","text/html",
 ]){
  const t=new SameOriginPlatformConsultativeTransport(
   {getAccessToken:async()=>token},
   async()=>new Response(JSON.stringify(raw()),{
    status:200,headers:{"content-type":contentType},
   }));
  const c=run(t);
  await rejects(()=>c.askExplicitly(question),"private_platform_unavailable");
  c.dispose();
 }
});
test("an oversized response cannot hold UI hostage with a hung stream cancel",async()=>{
 let cancels=0;
 const stream=new ReadableStream({
  start(controller){controller.enqueue(new Uint8Array(65537));},
  cancel(){cancels++;return new Promise(()=>{});}
 });
 const t=new SameOriginPlatformConsultativeTransport(
  {getAccessToken:async()=>token},
  async()=>new Response(stream,{
   status:200,headers:{"content-type":"application/json"},
  }));
 const c=run(t);
 // The stream's cancel() is intentionally never resolved. The client must
 // settle from the byte limit, rather than wait for its cancellation ACK.
 const race=Promise.race([
  c.askExplicitly(question).then(
   ()=>{throw Error("oversized response was accepted");},
   e=>e,
  ),
  new Promise(resolve=>setTimeout(()=>resolve("UNSETTLED"),250)),
 ]);
 const outcome=await race;
 assert.notEqual(outcome,"UNSETTLED");
 assert.equal(outcome instanceof LiveConsultationBoundaryError,true);
 assert.equal(outcome.code,"private_platform_unavailable");
 assert.equal(cancels,1);
 c.dispose();
});
