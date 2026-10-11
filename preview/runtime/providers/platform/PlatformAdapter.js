import { AdapterContractError, assertContext, assertFlatScope, assertOperationalScope, assertScopedCollection, record, requireArray, requireEqual, requireString } from "../adapters/GatewayTransport.js";
/**
 * Gateway-backed PlatformProvider. The injected gateway must authenticate the
 * caller and enforce tenant/company/CNPJ/period authorization server-side.
 * Client-side scope checks below are defense in depth, not authorization.
 */
export class PlatformAdapter {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async invoke(operation, payload) {
        return await this.transport.invoke({ service: "platform", operation, payload });
    }
    async read(operation, payload, scope, verify) {
        const result = assertContext(await this.invoke(operation, payload), scope);
        verify?.(result);
        return result;
    }
    getPortfolioContext(input) {
        return this.read("getPortfolioContext", input, input, result => {
            requireArray(result.companies);
        });
    }
    getCompanyWorkspaceContext(input) {
        return this.read("getCompanyWorkspaceContext", input, input, result => {
            requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
            if (input.cnpjId)
                requireEqual(result.selectedCnpjId, input.cnpjId, "adapter_scope_mismatch");
            if (input.accountingPeriodId) {
                requireEqual(record(result.activeAccountingPeriod).periodId, input.accountingPeriodId, "adapter_scope_mismatch");
            }
            requireArray(result.cnpjs);
        });
    }
    getCompanyContext(input) {
        return this.read("getCompanyContext", input, input, result => {
            requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
            requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
        });
    }
    getFiscalDocuments(input) {
        return this.read("getFiscalDocuments", input, input, result => {
            requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
            requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
            if (input.periodId)
                requireEqual(record(result.accountingPeriod).periodId, input.periodId, "adapter_scope_mismatch");
            requireArray(result.documents);
        });
    }
    getDocumentAnalysisContext(input) {
        return this.read("getDocumentAnalysisContext", input, input, result => {
            requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
            requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
            const doc = record(result.document);
            requireEqual(doc.documentId, input.documentId, "adapter_subject_mismatch");
            requireEqual(doc.tenantId, input.tenantId, "adapter_scope_mismatch");
            requireEqual(doc.companyId, input.companyId, "adapter_scope_mismatch");
            requireEqual(doc.cnpjId, input.cnpjId, "adapter_scope_mismatch");
            assertScopedCollection(result.pendingItems, input);
        });
    }
    getPendingItems(input) {
        return this.read("getPendingItems", input, input, result => {
            if (input.companyId !== undefined)
                requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
            if (input.cnpjId !== undefined)
                requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
            assertScopedCollection(result.items, input);
        });
    }
    getReconciliationContext(input) {
        return this.read("getReconciliationContext", input, input, result => {
            requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
            requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
            requireEqual(record(result.accountingPeriod).periodId, input.periodId, "adapter_scope_mismatch");
            const reconciliation = record(result.reconciliation);
            requireEqual(reconciliation.tenantId, input.tenantId, "adapter_scope_mismatch");
            requireEqual(reconciliation.companyId, input.companyId, "adapter_scope_mismatch");
            requireEqual(reconciliation.cnpjId, input.cnpjId, "adapter_scope_mismatch");
            assertScopedCollection(result.pendingItems, input);
        });
    }
    getApprovals(input) {
        return this.read("getApprovals", input, input, result => {
            assertScopedCollection(result.approvals, input);
            const approvalIds = new Set();
            const decisionIds = new Set();
            for (const value of requireArray(result.approvals)) {
                const item = record(value);
                requireString(item.approvalId);
                requireString(item.decisionId);
                if (approvalIds.has(item.approvalId))
                    throw new AdapterContractError("adapter_duplicate_approval");
                approvalIds.add(item.approvalId);
                decisionIds.add(item.decisionId);
                if (!["awaiting_approval", "approved", "rejected"].includes(String(item.status))) {
                    throw new AdapterContractError("adapter_invalid_approval_status");
                }
            }
            const recommendationIds = new Set();
            for (const value of requireArray(result.relatedDecisions)) {
                const item = record(value);
                if (!decisionIds.has(item.decisionId))
                    throw new AdapterContractError("adapter_unrelated_decision");
                requireString(item.recommendationId);
                recommendationIds.add(item.recommendationId);
            }
            for (const value of requireArray(result.relatedRecommendations)) {
                const item = record(value);
                if (!recommendationIds.has(item.recommendationId)) {
                    throw new AdapterContractError("adapter_unrelated_recommendation");
                }
            }
        });
    }
    getAuditHistory(input) {
        return this.read("getAuditHistory", input, input, result => {
            if (input.companyId !== undefined)
                requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
            if (input.cnpjId !== undefined)
                requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
            if (input.periodId !== undefined)
                requireEqual(result.accountingPeriodId, input.periodId, "adapter_scope_mismatch");
            for (const event of requireArray(result.events)) {
                assertFlatScope(event, input);
                if (input.subject) {
                    const subject = record(record(event).subject);
                    requireEqual(subject.type, input.subject.type, "adapter_subject_mismatch");
                    requireEqual(subject.id, input.subject.id, "adapter_subject_mismatch");
                }
            }
        });
    }
    async recordAnalysisObservation(request) {
        const ack = record(await this.invoke("recordAnalysisObservation", request));
        requireEqual(ack.accepted, true, "adapter_write_not_acknowledged");
    }
    async recordPendingItem(request) {
        assertOperationalScope(request.item, request);
        const result = record(await this.invoke("recordPendingItem", request));
        const item = record(result.item);
        assertOperationalScope(item, request);
        requireEqual(item.pendingItemId, request.item.pendingItemId, "adapter_subject_mismatch");
        requireString(result.recordedAt);
        return result;
    }
    async recordPendingInformation(request) {
        const result = record(await this.invoke("recordPendingInformation", request));
        requireEqual(result.pendingItemId, request.pendingItemId, "adapter_subject_mismatch");
        requireString(result.recordedAt);
        return result;
    }
    async recordDecision(request) {
        const result = record(await this.invoke("recordDecision", request));
        requireString(result.decisionId);
        requireEqual(result.analysisId, request.analysisId, "adapter_subject_mismatch");
        requireEqual(result.recommendationId, request.recommendationId, "adapter_subject_mismatch");
        requireEqual(result.decision, request.decision, "adapter_decision_mismatch");
        return result;
    }
    async recordApproval(request) {
        const result = record(await this.invoke("recordApproval", request));
        requireString(result.approvalId);
        if (request.approvalId !== undefined) {
            requireEqual(result.approvalId, request.approvalId, "adapter_approval_identity_mismatch");
        }
        assertOperationalScope(result, request);
        requireEqual(result.decisionId, request.decisionId, "adapter_subject_mismatch");
        requireEqual(result.subjectType, request.subjectType, "adapter_subject_mismatch");
        requireEqual(result.subjectId, request.subjectId, "adapter_subject_mismatch");
        requireEqual(result.status, request.outcome === "approve" ? "approved" : "rejected", "adapter_approval_state_mismatch");
        return result;
    }
    async requestActionExecution(request) {
        const authorization = record(request.authorization);
        if (authorization.kind === "approval_record") {
            requireString(authorization.approvalId);
        }
        else if (authorization.kind === "direct_permission") {
            requireString(authorization.capability);
            requireString(authorization.actor);
            requireString(authorization.reason);
        }
        else {
            throw new AdapterContractError("adapter_authorization_required");
        }
        const result = record(await this.invoke("requestActionExecution", request));
        requireString(result.commandId);
        if (!["queued", "executing", "succeeded", "failed", "cancelled", "not_requested"].includes(String(result.status))) {
            throw new AdapterContractError("adapter_invalid_action_status");
        }
        requireArray(result.changedRecordRefs);
        return result;
    }
}
