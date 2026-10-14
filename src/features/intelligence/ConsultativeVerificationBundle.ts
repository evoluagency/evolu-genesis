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
/** A response claiming success must still be shown as unavailable in V1. */
export function projectUnreleasedConsultativeBundle(
 raw:unknown,expected:ExpectedConsultativeBundle,
):ConsultativeBundleNotice{
 try{
  if(!obj(raw))deny();
  if(!obj(expected))deny();
  // Structural cast occurs only after the foreign top-level record check.
  const parsed=raw as Record<string,unknown>;
  exactKeys(parsed,["schemaVersion","kind","attemptId",
   "signedVerificationResult","replayClaimResult","lifecycle",
   "executionAuthority","display"]);
  if(parsed.schemaVersion!=="1.0.0"||
     parsed.kind!=="CONSULTATIVE_VERIFICATION_BUNDLE_V1"||
     parsed.attemptId!==expected.attemptId||
     parsed.lifecycle!=="PRE_LEARNING"||
     parsed.executionAuthority!=="NONE"||!obj(parsed.display))deny();
  const display=parsed.display as Record<string,unknown>;
  exactKeys(display,["canShowModelAnswer","reasonCode"]);
  if(display.canShowModelAnswer!==false||
     display.reasonCode!=="LOCALE_UNVERIFIED")deny();
  // Both existing consumers perform exact-shape checks, validate group/CNPJ,
  // tenant, date, attempt and locale against SAME host-supplied expectation.
  const signed=projectUnreleasedSignedConsultation(
   parsed.signedVerificationResult,expected);
  const replay=projectUnreleasedConsultativeReplay(
   parsed.replayClaimResult,expected);
  if(signed.state!=="UNAVAILABLE"||replay.state!=="UNAVAILABLE"||
     signed.locale!==replay.locale||
     signed.reasonCode!=="LOCALE_UNVERIFIED"||
     replay.reasonCode!=="LOCALE_UNVERIFIED")deny();
  return Object.freeze({
   state:"UNAVAILABLE",
   locale:expected.locale,
   reasonCode:"LOCALE_UNVERIFIED",
   verificationStatus:"LOCAL_PRESENTATION_ONLY_NOT_HOST_ATTESTED",
   message:expected.locale==="en"?
    "The consultation remains unavailable until the private host verifies its signing authority, shared replay protection, evidence and language.":
    "A consulta permanece indisponível até que o servidor privado verifique a autoridade da assinatura, a proteção compartilhada contra reutilização, as evidências e o idioma.",
   executionAuthority:"NONE",
  });
 }catch{throw new ConsultativeBundleProjectionError();}
}
