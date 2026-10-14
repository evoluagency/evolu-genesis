/**
 * Genesis v1: consume an Intelligence replay-claim result, without trusting it.
 *
 * A browser cannot authenticate the callback or inspect a shared replay store.
 * Even "signatureVerified" and "singleUseClaimAccepted" do not authorize
 * client-side disclosure, because the private host may not be connected.
 * Keep model text, nonce, store digest and credentials out of this output.
 */
import type {IntelligenceLocale} from "./PresentationIntent.js";
import type {ConsultativeReceiptScope} from "./ConsultativeVerificationReceipt.js";

export type ExpectedConsultativeReplay = Readonly<{
  attemptId:string;
  scope:ConsultativeReceiptScope;
  locale:IntelligenceLocale;
}>;
export type ConsultativeReplayNotice = Readonly<{
  state:"UNAVAILABLE";
  locale:IntelligenceLocale;
  reasonCode:"LOCALE_UNVERIFIED";
  replayStatus:"CALLBACK_CLAIMED_NOT_DISTRIBUTED_CERTIFIED";
  message:string;
  executionAuthority:"NONE";
}>;
export class ConsultativeReplayReceiptError extends Error{
  constructor(){super("INVALID_CONSULTATIVE_REPLAY_RECEIPT");this.name="ConsultativeReplayReceiptError";}
}
const deny=():never=>{throw new ConsultativeReplayReceiptError();};
const obj=(v:unknown):v is Record<string,unknown>=>
  v!==null&&typeof v==="object"&&!Array.isArray(v);
function exactKeys(x:Record<string,unknown>,names:readonly string[]):void{
  if(Object.keys(x).sort().join(",")!==[...names].sort().join(","))deny();
}
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function validScope(x:unknown):x is ConsultativeReceiptScope{
  if(!obj(x))return false;
  exactKeys(x,["tenantId","companyId","cnpjId","referenceDate"]);
  for(const k of ["tenantId","companyId","cnpjId"]){
    if(typeof x[k]!=="string"||!uuid.test(x[k] as string))return false;
  }
  if(x.companyId===x.cnpjId||
     typeof x.referenceDate!=="string"||
     !/^\d{4}-\d{2}-\d{2}$/.test(x.referenceDate))return false;
  const parsed=new Date(x.referenceDate+"T00:00:00.000Z");
  return !Number.isNaN(parsed.getTime())&&
    parsed.toISOString().slice(0,10)===x.referenceDate;
}
export function projectUnreleasedConsultativeReplay(
  raw:unknown,expected:ExpectedConsultativeReplay,
):ConsultativeReplayNotice{
  // Narrow untrusted roots independently for TypeScript strict and runtime safety.
  if(!obj(raw))deny();
  if(!obj(expected))deny();
  if(!validScope(expected.scope)||
     !uuid.test(String(expected.attemptId))||
     (expected.locale!=="pt-BR"&&expected.locale!=="en"))deny();

  exactKeys(raw,[
    "schemaVersion","attemptId","scope","locale",
    "signatureVerified","singleUseClaimAccepted",
    "distributedReplayProtectionVerified","productionReplayStoreCertified",
    "issuerAuthorizationVerified","modelLanguageVerified",
    "lifecycle","executionAuthority","display"
  ]);
  if(raw.schemaVersion!=="1.0.0"||
     raw.attemptId!==expected.attemptId||
     raw.locale!==expected.locale||
     raw.signatureVerified!==true||
     raw.singleUseClaimAccepted!==true||
     raw.distributedReplayProtectionVerified!==false||
     raw.productionReplayStoreCertified!==false||
     raw.issuerAuthorizationVerified!==false||
     raw.modelLanguageVerified!==false||
     raw.lifecycle!=="PRE_LEARNING"||
     raw.executionAuthority!=="NONE"||
     !validScope(raw.scope)||!obj(raw.display))deny();
  exactKeys(raw.display,["canShowModelAnswer","reasonCode"]);
  if(raw.display.canShowModelAnswer!==false||
     raw.display.reasonCode!=="LOCALE_UNVERIFIED")deny();
  for(const key of ["tenantId","companyId","cnpjId","referenceDate"] as const){
    if(raw.scope[key]!==expected.scope[key])deny();
  }
  return Object.freeze({
    state:"UNAVAILABLE",
    locale:expected.locale,
    reasonCode:"LOCALE_UNVERIFIED",
    replayStatus:"CALLBACK_CLAIMED_NOT_DISTRIBUTED_CERTIFIED",
    message:expected.locale==="en"?
      "The consultation cannot be displayed. Private-host replay protection and answer language remain unverified.":
      "A consulta não pode ser apresentada. A proteção contra reutilização no servidor privado e o idioma da resposta ainda não foram comprovados.",
    executionAuthority:"NONE",
  });
}
