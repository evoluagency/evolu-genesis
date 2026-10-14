import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {projectUnreleasedSignedConsultation,SignedConsultationBoundaryError}
  from "../preview/runtime/features/intelligence/ConsultativeSignedVerification.js";

const scope={tenantId:"11111111-1111-4111-8111-111111111111",
 companyId:"22222222-2222-4222-8222-222222222222",
 cnpjId:"33333333-3333-4333-8333-333333333333",referenceDate:"2026-10-13"};
const attemptId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const expected=(patch={})=>({attemptId,scope,locale:"pt-BR",...patch});
const response=(patch={})=>({
 schemaVersion:"1.0.0",attemptId,scope,locale:"pt-BR",
 signatureVerified:true,signatureMeaning:"CONFIGURED_ED25519_PUBLIC_KEY_ONLY",
 issuerAuthorizationVerified:false,distributedReplayProtectionVerified:false,
 modelLanguageVerified:false,lifecycle:"PRE_LEARNING",executionAuthority:"NONE",
 display:{canShowModelAnswer:false,reasonCode:"LOCALE_UNVERIFIED"},...patch,
});
const project=(raw=response(),ctx=expected())=>
 projectUnreleasedSignedConsultation(raw,ctx);
const rejects=fn=>assert.throws(fn,SignedConsultationBoundaryError);

test("matching signed-result metadata never permits model display",()=>{
 const result=project();
 assert.equal(result.state,"UNAVAILABLE");
 assert.equal(result.reasonCode,"LOCALE_UNVERIFIED");
 assert.equal(result.evidenceStatus,
  "SIGNATURE_RESULT_REQUIRES_PRIVATE_HOST_VERIFICATION");
 assert.equal(result.executionAuthority,"NONE");
 assert.equal(Object.isFrozen(result),true);
 assert.equal("answer" in result,false);
});
test("cross-attempt, tenant, group, CNPJ and period metadata fail closed",()=>{
 const other="99999999-9999-4999-8999-999999999999";
 rejects(()=>project(response({attemptId:other})));
 for(const key of ["tenantId","companyId","cnpjId","referenceDate"]){
  const value=key==="referenceDate"?"2026-10-12":other;
  rejects(()=>project(response({scope:{...scope,[key]:value}})));
 }
});
test("matching English view uses authored English shell but stays unavailable",()=>{
 const data=response({locale:"en"});
 const out=project(data,expected({locale:"en"}));
 assert.equal(out.locale,"en");
 assert.match(out.message,/private host/);
 assert.equal(out.state,"UNAVAILABLE");
 rejects(()=>project(data));
});
