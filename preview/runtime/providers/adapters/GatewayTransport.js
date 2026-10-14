export class AdapterContractError extends Error {
    code;
    constructor(code) {
        super(code);
        this.code = code;
        this.name = "AdapterContractError";
    }
}
export function record(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new AdapterContractError("adapter_invalid_response");
    }
    return value;
}
export function requireEqual(actual, expected, code) {
    if (actual !== expected)
        throw new AdapterContractError(code);
}
export function requireString(value) {
    if (typeof value !== "string" || value.length === 0) {
        throw new AdapterContractError("adapter_invalid_response");
    }
}
export function requireArray(value) {
    if (!Array.isArray(value))
        throw new AdapterContractError("adapter_invalid_response");
    return value;
}
export function assertContext(value, scope) {
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
export function assertOperationalScope(value, scope) {
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
export function assertScopedCollection(items, scope) {
    for (const item of requireArray(items))
        assertOperationalScope(item, scope);
}
/** Audit/analysis entries have flattened scope rather than an OperationalScopeRef. */
export function assertFlatScope(item, scope) {
    const actual = record(item);
    requireEqual(actual.tenantId, scope.tenantId, "adapter_scope_mismatch");
    if (scope.companyId !== undefined)
        requireEqual(actual.companyId, scope.companyId, "adapter_scope_mismatch");
    if (scope.cnpjId !== undefined)
        requireEqual(actual.cnpjId, scope.cnpjId, "adapter_scope_mismatch");
    const requestedPeriod = scope.periodId ?? scope.accountingPeriodId;
    if (requestedPeriod !== undefined) {
        requireEqual(actual.accountingPeriodId, requestedPeriod, "adapter_scope_mismatch");
    }
}
