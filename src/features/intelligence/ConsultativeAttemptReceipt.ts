/**
 * Genesis: consume a PRIVATE host attempt receipt from Intelligence V1.
 *
 * This is a PRESENTATION boundary only. A local attempt UUID is not a
 * signature or proof that Intelligence echoed the correct request. The
 * existing Platform BFF has not been upgraded to serve this receipt.
 * The model answer always remains unavailable in this V1 projection.
 */
import type {IntelligenceLocale} from "./PresentationIntent.js";
import {
  projectConsultativeVerificationReceipt,
  type ConsultativeReceiptScope,
} from "./ConsultativeVerificationReceipt.js";

export type ExpectedConsultativeAttempt = Readonly<{
  attemptId:string; // trusted host-provided UUID, NOT question/model content
  startedAt:string; // trusted host-provided ISO UTC timestamp
  scope:ConsultativeReceiptScope;
  locale:IntelligenceLocale;
}>;

export type ConsultativeAttemptView = Readonly<{
  state:"UNAVAILABLE";
  locale:IntelligenceLocale;
  reasonCode:"LOCALE_UNVERIFIED";
  correlation:"LOCAL_ONLY_NOT_UPSTREAM_ATTESTED";
  message:string;
  executionAuthority:"NONE";
}>;

export class ConsultativeAttemptReceiptError extends Error {
  constructor(){
    super("INVALID_CONSULTATIVE_ATTEMPT_RECEIPT");
    this.name="ConsultativeAttemptReceiptError";
  }
}
function deny():never{throw new ConsultativeAttemptReceiptError();}
function obj(v:unknown):v is Record<string,unknown>{
  return v!==null&&typeof v==="object"&&!Array.isArray(v);
}
function exactKeys(v:Record<string,unknown>,keys:string[]):void{
  if(Object.keys(v).sort().join(",")!==[...keys].sort().join(","))deny();
}
function timestamp(v:unknown):number{
  if(typeof v!=="string"||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v))deny();
  const d=Date.parse(v);
  if(!Number.isFinite(d)||new Date(d).toISOString()!==v)deny();
  return d;
}

/**
 * Reject stale, cross-attempt, cross-locale, foreign scope, or forged
 * authorization fields. Caller must provide trusted expectedAttempt from
 * current private-host context, NOT from server data or user input.
 */
export function projectConsultativeAttemptReceipt(
  raw:unknown,expected:ExpectedConsultativeAttempt,now=Date.now(),
):ConsultativeAttemptView{
  if(!obj(raw)||!obj(expected)||!Number.isFinite(now))deny();
  exactKeys(raw,["schemaVersion","attemptId","startedAt","completedAt","scope",
    "evidenceReceipt","correlationStatus","upstreamAttemptAttested",
    "display","lifecycle","executionAuthority"]);
  if(raw.schemaVersion!=="1.0.0"||raw.lifecycle!=="PRE_LEARNING"||
     raw.executionAuthority!=="NONE"||
     raw.correlationStatus!=="LOCAL_SINGLE_USE_NOT_UPSTREAM_ATTESTED"||
     raw.upstreamAttemptAttested!==false||
     typeof raw.attemptId!=="string"||
     !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(raw.attemptId)||
     raw.attemptId!==expected.attemptId||raw.startedAt!==expected.startedAt||
     !obj(raw.display))deny();
  exactKeys(raw.display,["canShowModelAnswer","reasonCode"]);
  if(raw.display.canShowModelAnswer!==false||
     raw.display.reasonCode!=="LOCALE_UNVERIFIED")deny();
  const started=timestamp(raw.startedAt),finished=timestamp(raw.completedAt);
  if(finished<started||finished-started>60_000||
     finished>now||now-finished>60_000)deny();

  // This performs strict nested scope, source and locale checks.
  let projected;
  try {
    projected=projectConsultativeVerificationReceipt(
      raw.evidenceReceipt,expected.scope,expected.locale);
  }catch{deny();}
  if(!obj(raw.scope)||!obj(raw.evidenceReceipt))deny();
  exactKeys(raw.scope,["tenantId","companyId","cnpjId","referenceDate"]);
  for(const key of ["tenantId","companyId","cnpjId","referenceDate"] as const){
    if(raw.scope[key]!==expected.scope[key])deny();
  }
  if(projected.state!=="UNAVAILABLE"||
     projected.reasonCode!=="LOCALE_UNVERIFIED")deny();
  return Object.freeze({
    state:"UNAVAILABLE",locale:expected.locale,reasonCode:"LOCALE_UNVERIFIED",
    correlation:"LOCAL_ONLY_NOT_UPSTREAM_ATTESTED",
    message:projected.message,
    executionAuthority:"NONE",
  });
}
