/**
 * Read-only Genesis consumer of Intelligence's private-host verification
 * receipt V1. Source contract:
 * intelligence/src/genesis-consultative-evidence-locale-v1.mjs
 *
 * This receipt is a consistency record, not a user JWT, an RLS authorization,
 * a professional source review, or a proven language of a model answer.
 * The v1 contract ALWAYS forbids showing model-generated advice.
 */
import type {IntelligenceLocale} from "./PresentationIntent.js";

export type ConsultativeReceiptScope = Readonly<{
  tenantId:string;
  companyId:string; // Genesis GROUP, not Intelligence legacy company_id
  cnpjId:string;
  referenceDate:string;
}>;

export type ConsultativeReceiptState = Readonly<{
  state:"UNAVAILABLE";
  locale:IntelligenceLocale;
  evidenceState:"NO_RETRIEVED_SOURCE"|"METADATA_MATCHED_NOT_LEGAL_REVIEWED";
  reasonCode:"LOCALE_UNVERIFIED";
  message:string;
  executionAuthority:"NONE";
}>;

export class ConsultativeReceiptError extends Error {
  constructor(public readonly code="INVALID_CONSULTATIVE_RECEIPT"){
    super(code);
    this.name="ConsultativeReceiptError";
  }
}
function fail():never{throw new ConsultativeReceiptError();}
function obj(x:unknown):x is Record<string,unknown>{
  return x!==null && typeof x==="object" && !Array.isArray(x);
}
function keys(x:Record<string,unknown>,names:string[]):void{
  if(Object.keys(x).sort().join(",")!==names.sort().join(","))fail();
}
function scope(x:unknown,expected:ConsultativeReceiptScope):void{
  if(!obj(x)||!obj(expected))fail();
  keys(x,["tenantId","companyId","cnpjId","referenceDate"]);
  if(!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(expected.tenantId)||
     !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(expected.companyId)||
     !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(expected.cnpjId)||
     expected.companyId===expected.cnpjId||
     !/^\d{4}-\d{2}-\d{2}$/.test(expected.referenceDate))fail();
  for(const id of ["tenantId","companyId","cnpjId","referenceDate"] as const){
    if(x[id]!==expected[id])fail();
  }
}

/** Fail closed; no content from the model or from source records is returned. */
export function projectConsultativeVerificationReceipt(
  raw:unknown,
  expectedScope:ConsultativeReceiptScope,
  expectedLocale:IntelligenceLocale,
):ConsultativeReceiptState{
  if(expectedLocale!=="pt-BR"&&expectedLocale!=="en")fail();
  if(!obj(raw))fail();
  keys(raw,["schemaVersion","scope","evidence","locale","display",
    "lifecycle","executionAuthority"]);
  if(raw.schemaVersion!=="1.0.0"||raw.lifecycle!=="PRE_LEARNING"||
     raw.executionAuthority!=="NONE")fail();
  scope(raw.scope,expectedScope);

  if(!obj(raw.evidence)||!obj(raw.locale)||!obj(raw.display))fail();
  keys(raw.evidence,["status","sourceCount","snapshotFingerprintSha256",
    "legalValidityVerified"]);
  keys(raw.locale,["requested","status","modelLanguageVerified"]);
  keys(raw.display,["canShowModelAnswer","reasonCode"]);

  const e=raw.evidence,l=raw.locale,d=raw.display;
  if(l.requested!==expectedLocale||
     l.status!=="MODEL_LANGUAGE_NOT_INDEPENDENTLY_VERIFIED"||
     l.modelLanguageVerified!==false||
     e.legalValidityVerified!==false||
     d.canShowModelAnswer!==false||
     d.reasonCode!=="LOCALE_UNVERIFIED"||
     typeof e.snapshotFingerprintSha256!=="string"||
     !/^[a-f0-9]{64}$/.test(e.snapshotFingerprintSha256)||
     typeof e.sourceCount!=="number"||!Number.isSafeInteger(e.sourceCount)||
     e.sourceCount<0||e.sourceCount>100||
     (e.status==="NO_RETRIEVED_SOURCE"&&e.sourceCount!==0)||
     (e.status==="SERVER_SNAPSHOT_METADATA_MATCH_NOT_LEGAL_VERIFICATION"&&
      e.sourceCount===0)||
     !["NO_RETRIEVED_SOURCE",
       "SERVER_SNAPSHOT_METADATA_MATCH_NOT_LEGAL_VERIFICATION"].includes(String(e.status))
  )fail();

  return Object.freeze({
    state:"UNAVAILABLE",
    locale:expectedLocale,
    evidenceState:e.status==="NO_RETRIEVED_SOURCE"?
      "NO_RETRIEVED_SOURCE":"METADATA_MATCHED_NOT_LEGAL_REVIEWED",
    reasonCode:"LOCALE_UNVERIFIED",
    message:expectedLocale==="en"?
      "The analysis language was not verified by the server. No result has been presented.":
      "O idioma da análise não foi verificado pelo servidor. Nenhum resultado foi apresentado.",
    executionAuthority:"NONE",
  });
}
