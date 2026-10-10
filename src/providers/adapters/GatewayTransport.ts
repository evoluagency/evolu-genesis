/**
 * UX-7 boundary: the transport is supplied by an authorized backend-for-frontend.
 * An adapter neither acquires credentials nor authorizes an operational action.
 */
export type GatewayService = "platform" | "intelligence";

export interface GatewayInvocation {
  service: GatewayService;
  operation: string;
  payload: unknown;
}

export interface GatewayTransport {
  invoke(invocation: Readonly<GatewayInvocation>): Promise<unknown>;
}

export interface ExpectedScope {
  tenantId: string;
  companyId?: string;
  cnpjId?: string;
  periodId?: string;
  accountingPeriodId?: string;
}

export class AdapterContractError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "AdapterContractError";
  }
}

export function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new AdapterContractError("adapter_invalid_response");
  }
  return value as Record<string, unknown>;
}

export function requireEqual(actual: unknown, expected: unknown, code: string): void {
  if (actual !== expected) throw new AdapterContractError(code);
}

export function requireString(value: unknown): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new AdapterContractError("adapter_invalid_response");
  }
}

export function requireArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new AdapterContractError("adapter_invalid_response");
  return value;
}

export function assertContext(value: unknown, scope: ExpectedScope): Record<string, unknown> {
  const result = record(value);
  requireEqual(result.schemaVersion, "1.0.0", "adapter_schema_mismatch");
  requireEqual(result.tenantId, scope.tenantId, "adapter_scope_mismatch");
  if (scope.companyId !== undefined && result.companyId !== undefined) {
    requireEqual(result.companyId, scope.companyId, "adapter_scope_mismatch");
  }
  if (scope.cnpjId !== undefined && result.cnpjId !== undefined) {
    requireEqual(result.cnpjId, scope.cnpjId, "adapter_scope_mismatch");
  }
  return result;
}

/** Record-level scope must be explicit: never infer it from the selected screen. */
export function assertOperationalScope(value: unknown, scope: ExpectedScope): void {
  const item = record(value);
  const actual = record(item.scope);
  requireEqual(actual.tenantId, scope.tenantId, "adapter_scope_mismatch");
  if (scope.companyId !== undefined) {
    requireEqual(actual.companyId, scope.companyId, "adapter_scope_mismatch");
  }
  if (scope.cnpjId !== undefined) {
    requireEqual(actual.cnpjId, scope.cnpjId, "adapter_scope_mismatch");
  }
  const requestedPeriod = scope.periodId ?? scope.accountingPeriodId;
  if (requestedPeriod !== undefined) {
    requireEqual(actual.accountingPeriodId, requestedPeriod, "adapter_scope_mismatch");
  }
}

export function assertScopedCollection(items: unknown, scope: ExpectedScope): void {
  for (const item of requireArray(items)) assertOperationalScope(item, scope);
}

/** Audit/analysis entries have flattened scope rather than an OperationalScopeRef. */
export function assertFlatScope(item: unknown, scope: ExpectedScope): void {
  const actual = record(item);
  requireEqual(actual.tenantId, scope.tenantId, "adapter_scope_mismatch");
  if (scope.companyId !== undefined) requireEqual(actual.companyId, scope.companyId, "adapter_scope_mismatch");
  if (scope.cnpjId !== undefined) requireEqual(actual.cnpjId, scope.cnpjId, "adapter_scope_mismatch");
  const requestedPeriod = scope.periodId ?? scope.accountingPeriodId;
  if (requestedPeriod !== undefined) {
    requireEqual(actual.accountingPeriodId, requestedPeriod, "adapter_scope_mismatch");
  }
}
