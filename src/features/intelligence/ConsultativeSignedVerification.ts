/**
 * Genesis presentation-only consumer of the source-only Intelligence
 * Ed25519 verification result (genesis-consultative-attestation-v1.mjs).
 *
 * This code DOES NOT VERIFY A SIGNATURE. A forged JSON object may have
 * signatureVerified=true; therefore this consumer is NEVER a trust grant.
 * Only the PRIVATE host can run the actual cryptographic verification
 * against its trusted key map and authenticated request context.
 *
 * Whatever the receipt claims, model text remains unavailable in V1.
 */
import type {IntelligenceLocale} from "./PresentationIntent.js";
import type {ConsultativeReceiptScope} from "./ConsultativeVerificationReceipt.js";

export type ExpectedSignedConsultation = Readonly<{
  attemptId:string;
  scope:ConsultativeReceiptScope;
  locale:IntelligenceLocale;
}>;

export type SignedConsultationNotice = Readonly<{
  state:"UNAVAILABLE";
  locale:IntelligenceLocale;
  reasonCode:"LOCALE_UNVERIFIED";
  evidenceStatus:"SIGNATURE_RESULT_REQUIRES_PRIVATE_HOST_VERIFICATION";
  executionAuthority:"NONE";
  message:string;
}>;

export class SignedConsultationBoundaryError extends Error {
  constructor(){
    super("INVALID_SIGNED_CONSULTATION_RESULT");
    this.name="SignedConsultationBoundaryError";
  }
}
function deny():never{throw new SignedConsultationBoundaryError();}
function obj(x:unknown):x is Record<string,unknown>{
  return x!==null&&typeof x==="object"&&!Array.isArray(x);
}
function fields(x:Record<string,unknown>,expected:readonly string[]):void{
  if(Object.keys(x).sort().join(",")!==[...expected].sort().join(","))deny();
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validScope(scope:unknown):scope is ConsultativeReceiptScope{
  if(!obj(scope))return false;
  fields(scope,["tenantId","companyId","cnpjId","referenceDate"]);
  return uuid.test(String(scope.tenantId))&&
    uuid.test(String(scope.companyId))&&
    uuid.test(String(scope.cnpjId))&&
    scope.companyId!==scope.cnpjId&&
    typeof scope.referenceDate==="string"&&
    /^\d{4}-\d{2}-\d{2}$/.test(scope.referenceDate)&&
    !Number.isNaN(Date.parse(scope.referenceDate+"T00:00:00.000Z"))&&
    new Date(scope.referenceDate+"T00:00:00.000Z").toISOString().slice(0,10)===scope.referenceDate;
}

/**
 * Exact-version audit projection. This does not claim signing-key possession,
 * JWT/RLS approval, source correctness, language accuracy or replay safety.
 */
export function projectUnreleasedSignedConsultation(
  raw:unknown,expected:ExpectedSignedConsultation,
):SignedConsultationNotice {
  try {
  if(!obj(raw)||!obj(expected)||!validScope(expected.scope)||
     (expected.locale!=="pt-BR"&&expected.locale!=="en")||
     typeof expected.attemptId!=="string"||!uuid.test(expected.attemptId))deny();
  fields(raw,["schemaVersion","attemptId","scope","locale","signatureVerified",
    "signatureMeaning","issuerAuthorizationVerified",
    "distributedReplayProtectionVerified","modelLanguageVerified",
    "lifecycle","executionAuthority","display"]);
  if(raw.schemaVersion!=="1.0.0"||
     raw.attemptId!==expected.attemptId||
     raw.locale!==expected.locale||
     raw.signatureVerified!==true||
     raw.signatureMeaning!=="CONFIGURED_ED25519_PUBLIC_KEY_ONLY"||
     raw.issuerAuthorizationVerified!==false||
     raw.distributedReplayProtectionVerified!==false||
     raw.modelLanguageVerified!==false||
     raw.lifecycle!=="PRE_LEARNING"||
     raw.executionAuthority!=="NONE"||
     !validScope(raw.scope)||!obj(raw.display))deny();
  fields(raw.display,["canShowModelAnswer","reasonCode"]);
  if(raw.display.canShowModelAnswer!==false||
     raw.display.reasonCode!=="LOCALE_UNVERIFIED")deny();
  for(const key of ["tenantId","companyId","cnpjId","referenceDate"] as const){
    if(raw.scope[key]!==expected.scope[key])deny();
  }
  return Object.freeze({
    state:"UNAVAILABLE",
    locale:expected.locale,
    reasonCode:"LOCALE_UNVERIFIED",
    evidenceStatus:"SIGNATURE_RESULT_REQUIRES_PRIVATE_HOST_VERIFICATION",
    executionAuthority:"NONE",
    message:expected.locale==="en"?
      "The signed source cannot be presented until the private host independently verifies authorization, evidence and language.":
      "A fonte assinada não pode ser apresentada antes da verificação independente de autorização, evidências e idioma pelo servidor privado.",
  });
  } catch {
    // Do not expose hostile getter/proxy exceptions or untrusted diagnostics.
    throw new SignedConsultationBoundaryError();
  }
}
