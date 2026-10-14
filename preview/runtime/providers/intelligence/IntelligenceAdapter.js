import { AdapterContractError, assertContext, assertFlatScope, assertScopedCollection, record, requireArray, requireEqual, requireString } from "../adapters/GatewayTransport.js";
/**
 * Intelligence is analytical only. This adapter has no Platform write pathway.
 * Its transport must enforce the caller's authorized scope server-side.
 */
export class IntelligenceAdapter {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async invoke(operation, payload) {
        return await this.transport.invoke({ service: "intelligence", operation, payload });
    }
    async analysis(operation, payload) {
        const result = record(await this.invoke(operation, payload));
        requireEqual(result.schemaVersion, "1.0.0", "adapter_schema_mismatch");
        requireString(result.analysisId);
        if (!["queued", "analyzing", "completed", "insufficient_context", "failed"].includes(String(result.status))) {
            throw new AdapterContractError("adapter_analysis_status_invalid");
        }
        requireArray(result.findings);
        requireArray(result.evidence);
        requireArray(result.recommendations);
        // Missing operational information remains scoped Platform work, even when
        // returned by an analytical operation. Reject foreign tenant/CNPJ rows.
        assertScopedCollection(result.missingContext, payload);
        // These results do not carry root tenant scope in UX V1; the authorized
        // gateway MUST enforce tenant/CNPJ ownership before returning the result.
        return result;
    }
    requestDocumentAnalysis(request) {
        return this.analysis("requestDocumentAnalysis", request);
    }
    requestReconciliationAnalysis(request) {
        return this.analysis("requestReconciliationAnalysis", request);
    }
    async explainAnalysis(request) {
        const result = record(await this.invoke("explainAnalysis", request));
        requireEqual(result.schemaVersion, "1.0.0", "adapter_schema_mismatch");
        requireEqual(result.analysisId, request.analysisId, "adapter_subject_mismatch");
        requireString(result.explanation);
        return result;
    }
    async getAnalysisHistory(input) {
        const result = assertContext(await this.invoke("getAnalysisHistory", input), input);
        if (input.companyId !== undefined)
            requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
        if (input.cnpjId !== undefined)
            requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
        for (const entry of requireArray(result.entries)) {
            assertFlatScope(entry, input);
            if (input.subject) {
                const subject = record(record(entry).subject);
                requireEqual(subject.type, input.subject.type, "adapter_subject_mismatch");
                requireEqual(subject.id, input.subject.id, "adapter_subject_mismatch");
            }
            record(record(entry).analysis);
        }
        return result;
    }
}
