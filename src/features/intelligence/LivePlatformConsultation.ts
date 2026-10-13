/**
 * EVOLU Intelligence / Genesis authenticated-host integration V1.
 *
 * Reuses the private Platform endpoint with an EXACT same-origin URL.
 * Unlike the SYNTHETIC Genesis preview, this module can make a request only
 * when a trusted host explicitly instantiates and calls it. It is NOT wired
 * into preview pages and has no automatic observer/inference callback.
 *
 * The private Platform BFF remains the sole authorization, principal, RLS,
 * budget and Intelligence upstream gateway. This client cannot confer access.
 */
import {
  createPlatformConsultativeInvocation,
  projectPrivatePlatformConsultation,
  type ExplicitHumanConsultation,
  type PlatformConsultativeInvocation,
  type PlatformConsultativeScope,
  type SafeConsultationProjection,
} from "./PlatformConsultativeViewBridge.js";
import type { IntelligenceLocale } from "./PresentationIntent.js";

export const PLATFORM_CONSULTATIVE_ENDPOINT = "/api/ux/intelligence/consult/v1" as const;
const MAX_RESPONSE_BYTES = 65536;
const MAX_BEARER_LENGTH = 4096;
const TIMEOUT_MS = 30000;

export class LiveConsultationBoundaryError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "LiveConsultationBoundaryError";
  }
}
function fail(code: string): never { throw new LiveConsultationBoundaryError(code); }

export type AuthenticatedPageSnapshot = Readonly<{
  scope: PlatformConsultativeScope;
  locale: IntelligenceLocale;
  /**
   * Opaque host-managed session incarnation, never a JWT or credential.
   * Must rotate on login/logout/identity change; scope is also bound below.
   */
  sessionEpoch: string;
}>;
export type HostContextReader = () => AuthenticatedPageSnapshot | null;

export interface ConsultativeHostTransport {
  request(
    invocation: Readonly<PlatformConsultativeInvocation>,
    signal: AbortSignal,
    canDispatch?: () => boolean,
  ): Promise<unknown>;
}
export interface AccessTokenProvider {
  getAccessToken(signal: AbortSignal): Promise<string | null>;
}
export interface SameOriginFetch {
  (path: typeof PLATFORM_CONSULTATIVE_ENDPOINT, init: RequestInit): Promise<Response>;
}

function snapshotId(s: AuthenticatedPageSnapshot): string {
  // Never includes a bearer token, user-entered text, or model answer.
  return JSON.stringify([
    s.sessionEpoch, s.locale, s.scope.tenantId, s.scope.companyId,
    s.scope.cnpjId, s.scope.tenantSlug, s.scope.referenceDate, s.scope.pageId,
  ]);
}
function validSnapshot(s: AuthenticatedPageSnapshot | null): s is AuthenticatedPageSnapshot {
  return s !== null && typeof s.sessionEpoch === "string" &&
    s.sessionEpoch.length >= 8 && s.sessionEpoch.length <= 128 &&
    /^[a-zA-Z0-9._:-]+$/.test(s.sessionEpoch);
}
function validBearer(token: string | null): token is string {
  // Caller must be a trusted host whose auth provider already obtained
  // a session for the SAME issuer as Platform. Never store in UI state.
  return typeof token === "string" && token.length > 10 &&
    token.length <= MAX_BEARER_LENGTH && !/\s/.test(token);
}
async function boundedResponseJson(response: Response): Promise<unknown> {
  if (response.status !== 200 ||
      !(response.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    fail("private_platform_unavailable");
  }
  const len = response.headers.get("content-length");
  if (len !== null && (!/^\d+$/.test(len) || Number(len) > MAX_RESPONSE_BYTES)) {
    fail("private_platform_response_too_large");
  }
  if (!response.body) fail("private_platform_invalid_response");
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let raw = "";
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel("oversize");
        fail("private_platform_response_too_large");
      }
      raw += decoder.decode(next.value, { stream: true });
    }
    raw += decoder.decode();
  } catch (error) {
    if (error instanceof LiveConsultationBoundaryError) throw error;
    fail("private_platform_invalid_response");
  } finally {
    reader.releaseLock();
  }
  try { return JSON.parse(raw) as unknown; }
  catch { return fail("private_platform_invalid_response"); }
}

/**
 * May be constructed only inside the authenticated Platform host. A real
 * fetch function is dependency-injected; the synthetic preview imports none.
 */
export class SameOriginPlatformConsultativeTransport implements ConsultativeHostTransport {
  constructor(
    private readonly tokenProvider: AccessTokenProvider,
    private readonly requestFetch: SameOriginFetch,
  ) {}

  async request(invocation: Readonly<PlatformConsultativeInvocation>, signal: AbortSignal,
    canDispatch?: () => boolean): Promise<unknown> {
    if (signal.aborted || (canDispatch && !canDispatch())) fail("consultation_cancelled");
    // Revalidate the invocation as a *request shape*; authorization is still
    // controlled solely by the Platform server under the actual JWT.
    if (invocation.service !== "intelligence" ||
        invocation.operation !== "requestConsultativeAnswerSource") {
      fail("invalid_consultative_operation");
    }
    let token: string | null;
    try { token = await this.tokenProvider.getAccessToken(signal); }
    catch { return fail("session_unavailable"); }
    if (signal.aborted || (canDispatch && !canDispatch())) fail("consultation_cancelled");
    if (!validBearer(token)) fail("session_unavailable");

    const body = JSON.stringify(invocation);
    if (new TextEncoder().encode(body).byteLength > 2048) fail("consultation_body_too_large");

    let response: Response;
    try {
      response = await this.requestFetch(PLATFORM_CONSULTATIVE_ENDPOINT, {
        method: "POST",
        mode: "same-origin",
        credentials: "same-origin",
        redirect: "error",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body,
        signal,
      });
    } catch {
      if (signal.aborted) fail("consultation_cancelled");
      return fail("private_platform_unavailable");
    }
    if (signal.aborted) fail("consultation_cancelled");
    return boundedResponseJson(response);
  }
}

/**
 * Explicit human question only. Does not subscribe to browser events or
 * observations, and cannot execute writes. A scope/locale/session switch
 * cancels in-flight work and refuses its eventual response even if abort is
 * ignored by a transport. Host MUST call invalidate() when it changes view.
 */
export class LiveConsultationCoordinator {
  private active: AbortController | null = null;
  private generation = 0;
  private disposed = false;

  constructor(
    private readonly current: HostContextReader,
    private readonly transport: ConsultativeHostTransport,
  ) {}

  invalidate(): void {
    this.generation += 1;
    this.active?.abort();
    this.active = null;
  }
  dispose(): void {
    this.disposed = true;
    this.invalidate();
  }

  async askExplicitly(question: string): Promise<SafeConsultationProjection> {
    if (this.disposed) fail("coordinator_disposed");
    if (this.active !== null) fail("consultation_in_flight");
    const started = this.current();
    if (!validSnapshot(started)) fail("authenticated_context_required");
    // Only an explicit caller may use this method, e.g. form submission.
    // Observational events and accepting help MUST NOT invoke this pathway.
    const human: ExplicitHumanConsultation = {
      scope: { ...started.scope },
      locale: started.locale,
      question,
      humanInitiated: true,
    };
    const invocation = createPlatformConsultativeInvocation(human);
    const expectedId = snapshotId(started);
    const controller = new AbortController();
    this.active = controller;
    const generation = this.generation;
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    function stale(now: AuthenticatedPageSnapshot | null): boolean {
      return !validSnapshot(now) || snapshotId(now) !== expectedId;
    }
    try {
      if (stale(this.current())) fail("consultation_context_changed");
      let response: unknown;
      try { response = await this.transport.request(invocation, controller.signal,
        () => !this.disposed && !controller.signal.aborted &&
          generation === this.generation && !stale(this.current())); }
      catch {
        if (controller.signal.aborted) fail("consultation_cancelled");
        fail("private_platform_unavailable");
      }
      if (generation !== this.generation || controller.signal.aborted ||
          this.disposed || stale(this.current())) fail("consultation_context_changed");
      const projection = projectPrivatePlatformConsultation(response, human);
      if (generation !== this.generation || controller.signal.aborted ||
          this.disposed || stale(this.current())) fail("consultation_context_changed");
      return projection;
    } finally {
      clearTimeout(timeout);
      if (this.active === controller) this.active = null;
    }
  }
}
