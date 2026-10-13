/**
 * Read-only user-facing error projection for the authenticated Genesis host.
 * No network, no token, no model calls. Never render upstream error.message.
 */
import type { IntelligenceLocale } from "./PresentationIntent.js";

export type ConsultativeNoticeKind =
  | "SESSION_REQUIRED" | "SCOPE_DENIED" | "INPUT_INVALID"
  | "CANCELLED" | "IN_PROGRESS" | "SERVICE_UNAVAILABLE";

export type ConsultativeHostNotice = Readonly<{
  kind: ConsultativeNoticeKind;
  locale: IntelligenceLocale;
  title: string;
  detail: string;
  nextAction: "SIGN_IN" | "REVIEW_SELECTION" | "EDIT_QUESTION" | "RETRY" | "NONE";
  retryable: boolean;
}>;

type LocaleCopy = Readonly<{ title: string; detail: string }>;
const copies: Readonly<Record<ConsultativeNoticeKind,
  Readonly<Record<IntelligenceLocale, LocaleCopy>>>> = {
  SESSION_REQUIRED: {
    "pt-BR": {title: "Sessão necessária", detail: "Entre novamente no ambiente privado para consultar."},
    en: {title: "Session required", detail: "Sign in again to the private workspace before consulting."},
  },
  SCOPE_DENIED: {
    "pt-BR": {title: "Acesso não autorizado", detail: "Verifique a assessoria, o grupo e o CNPJ selecionados."},
    en: {title: "Access not authorized", detail: "Check the selected organization, group and company registration."},
  },
  INPUT_INVALID: {
    "pt-BR": {title: "Consulta inválida", detail: "Revise a pergunta e os dados de referência antes de enviar."},
    en: {title: "Invalid consultation", detail: "Review the question and reference context before sending."},
  },
  CANCELLED: {
    "pt-BR": {title: "Consulta cancelada", detail: "O contexto, idioma ou sessão mudou; nenhuma resposta anterior será apresentada."},
    en: {title: "Consultation cancelled", detail: "The context, language or session changed; the prior answer will not be shown."},
  },
  IN_PROGRESS: {
    "pt-BR": {title: "Consulta em andamento", detail: "Conclua ou cancele a consulta atual antes de iniciar outra."},
    en: {title: "Consultation in progress", detail: "Complete or cancel the current consultation before starting another."},
  },
  SERVICE_UNAVAILABLE: {
    "pt-BR": {title: "Consulta indisponível", detail: "Não foi possível validar a resposta. Nenhum resultado foi apresentado."},
    en: {title: "Consultation unavailable", detail: "The response could not be validated. No result was presented."},
  },
};

const sessionCodes = new Set(["AUTH_REQUIRED", "session_unavailable",
  "authenticated_context_required"]);
const deniedCodes = new Set(["SCOPE_NOT_AUTHORIZED", "scope_mismatch",
  "INGESTION_MODULE_NOT_AUTHORIZED"]);
const invalidCodes = new Set(["INVALID_CONSULTATIVE_REQUEST", "INVALID_SCOPE",
  "INVALID_REQUEST", "invalid_human_consultation", "platform_request_limit"]);
const cancelledCodes = new Set(["consultation_cancelled", "consultation_context_changed",
  "REQUEST_ABORTED", "coordinator_disposed"]);
const busyCodes = new Set(["consultation_in_flight"]);

/**
 * Maps only explicit error.code, never raw messages, stack traces or JSON bodies.
 * This is a presentation projection, not permission or retry authorization.
 */
export function describeConsultativeFailure(
  error: unknown, locale: IntelligenceLocale,
): ConsultativeHostNotice {
  if (locale !== "pt-BR" && locale !== "en") {
    throw new TypeError("invalid_consultative_locale");
  }
  const value = error !== null && typeof error === "object" && !Array.isArray(error)
    ? (error as Record<string, unknown>).code : undefined;
  const code = typeof value === "string" && value.length <= 80 ? value : "";
  const kind: ConsultativeNoticeKind =
    sessionCodes.has(code) ? "SESSION_REQUIRED" :
    deniedCodes.has(code) ? "SCOPE_DENIED" :
    invalidCodes.has(code) ? "INPUT_INVALID" :
    cancelledCodes.has(code) ? "CANCELLED" :
    busyCodes.has(code) ? "IN_PROGRESS" :
    "SERVICE_UNAVAILABLE";
  const nextAction: ConsultativeHostNotice["nextAction"] =
    kind === "SESSION_REQUIRED" ? "SIGN_IN" :
    kind === "SCOPE_DENIED" ? "REVIEW_SELECTION" :
    kind === "INPUT_INVALID" ? "EDIT_QUESTION" :
    kind === "SERVICE_UNAVAILABLE" ? "RETRY" : "NONE";
  const detail = copies[kind][locale];
  return Object.freeze({
    kind, locale, title: detail.title, detail: detail.detail,
    nextAction, retryable: nextAction === "RETRY",
  });
}
