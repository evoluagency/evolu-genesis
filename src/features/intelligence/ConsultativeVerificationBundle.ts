/**
 * Genesis: presentation-only combined Intelligence signed + replay projection.
 *
 * This validates shape and cross-receipt consistency, NOT a cryptographic
 * signature, JWT/RLS, real backend atomicity, or source/language correctness.
 * The private host must generate and verify any true backend evidence.
 * Unreleased V1 never permits model text or automatic retry/inference.
 */
import type {IntelligenceLocale} from "./PresentationIntent.js";
import type {ConsultativeReceiptScope} from "./ConsultativeVerificationReceipt.js";
import {projectUnreleasedSignedConsultation}
  from "./ConsultativeSignedVerification.js";
import {projectUnreleasedConsultativeReplay}
  from "./ConsultativeReplayReceipt.js";

export type ExpectedConsultativeBundle=Readonly<{
 attemptId:string;
 scope:ConsultativeReceiptScope;
 locale:IntelligenceLocale;
}>;
export type ConsultativeBundleNotice=Readonly<{
 state:"UNAVAILABLE";
 locale:IntelligenceLocale;
 reasonCode:"LOCALE_UNVERIFIED";
 verificationStatus:"LOCAL_PRESENTATION_ONLY_NOT_HOST_ATTESTED";
 message:string;
 executionAuthority:"NONE";
}>;
export class ConsultativeBundleProjectionError extends Error{
  readonly code = "INVALID_CONSULTATIVE_VERIFICATION_BUNDLE";
 constructor(){
  super("INVALID_CONSULTATIVE_VERIFICATION_BUNDLE");
  this.name="ConsultativeBundleProjectionError";
 }
}
const deny=():never=>{throw new ConsultativeBundleProjectionError();};
const obj=(v:unknown):v is Record<string,unknown>=>
 v!==null&&typeof v==="object"&&!Array.isArray(v);
function exactKeys(v:Record<string,unknown>,keys:readonly string[]):void{
 if(Object.keys(v).sort().join(",")!==[...keys].sort().join(","))deny();
}
// Freeze one host-derived selection before either receipt is interpreted.
// Presentation consistency only: this does NOT authenticate tenant or issuer.
function plainRecord(input:unknown,keys:readonly string[]):Readonly<Record<string,unknown>>{
 if(!obj(input))throw new ConsultativeBundleProjectionError();
 const target=input as Record<string,unknown>;
 const proto=Object.getPrototypeOf(target);
 if(proto!==Object.prototype&&proto!==null)deny();
 const present=Reflect.ownKeys(target);
 if(present.length!==keys.length||
    present.some(k=>typeof k!=="string"||!keys.includes(k)))deny();
 const out:Record<string,unknown>={};
 for(const key of keys){
  const descriptor=Object.getOwnPropertyDescriptor(target,key);
  if(!descriptor||!descriptor.enumerable||!("value" in descriptor))
   throw new ConsultativeBundleProjectionError();
  out[key]=descriptor.value;
 }
 return Object.freeze(out);
}
function snapshotExpectedBundle(raw:unknown):ExpectedConsultativeBundle{
 const fields=plainRecord(raw,["attemptId","scope","locale"]);
 const scope=plainRecord(fields.scope,[
  "tenantId","companyId","cnpjId","referenceDate",
 ]);
 if(typeof fields.attemptId!=="string")
  throw new ConsultativeBundleProjectionError();
 if(fields.locale!=="pt-BR"&&fields.locale!=="en")
  throw new ConsultativeBundleProjectionError();
 for(const k of ["tenantId","companyId","cnpjId","referenceDate"]){
  if(typeof scope[k]!=="string")deny();
 }
 return Object.freeze({
  attemptId:fields.attemptId,
  scope:scope as unknown as ConsultativeReceiptScope,
  locale:fields.locale as IntelligenceLocale,
 });
}

/** A response claiming success must still be shown as unavailable in V1. */
export function projectUnreleasedConsultativeBundle(
 raw:unknown,expected:ExpectedConsultativeBundle,
):ConsultativeBundleNotice{
 try{
  if(!obj(raw))deny();
  const frozenExpected=snapshotExpectedBundle(expected);
  // Structural cast occurs only after the foreign top-level record check.
  const parsed=raw as Record<string,unknown>;
  exactKeys(parsed,["schemaVersion","kind","attemptId",
   "signedVerificationResult","replayClaimResult","lifecycle",
   "executionAuthority","display"]);
  if(parsed.schemaVersion!=="1.0.0"||
     parsed.kind!=="CONSULTATIVE_VERIFICATION_BUNDLE_V1"||
     parsed.attemptId!==frozenExpected.attemptId||
     parsed.lifecycle!=="PRE_LEARNING"||
     parsed.executionAuthority!=="NONE"||!obj(parsed.display))deny();
  const display=parsed.display as Record<string,unknown>;
  exactKeys(display,["canShowModelAnswer","reasonCode"]);
  if(display.canShowModelAnswer!==false||
     display.reasonCode!=="LOCALE_UNVERIFIED")deny();
  // Both existing consumers perform exact-shape checks, validate group/CNPJ,
  // tenant, date, attempt and locale against SAME host-supplied expectation.
  const signed=projectUnreleasedSignedConsultation(
   parsed.signedVerificationResult,frozenExpected);
  const replay=projectUnreleasedConsultativeReplay(
   parsed.replayClaimResult,frozenExpected);
  if(signed.state!=="UNAVAILABLE"||replay.state!=="UNAVAILABLE"||
     signed.locale!==replay.locale||
     signed.reasonCode!=="LOCALE_UNVERIFIED"||
     replay.reasonCode!=="LOCALE_UNVERIFIED")deny();
  return Object.freeze({
   state:"UNAVAILABLE",
   locale:frozenExpected.locale,
   reasonCode:"LOCALE_UNVERIFIED",
   verificationStatus:"LOCAL_PRESENTATION_ONLY_NOT_HOST_ATTESTED",
   message:frozenExpected.locale==="en"?
    "The consultation remains unavailable until the private host verifies its signing authority, shared replay protection, evidence and language.":
    "A consulta permanece indisponível até que o servidor privado verifique a autoridade da assinatura, a proteção compartilhada contra reutilização, as evidências e o idioma.",
   executionAuthority:"NONE",
  });
 }catch{throw new ConsultativeBundleProjectionError();}
}
