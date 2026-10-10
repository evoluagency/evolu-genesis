import type {
  ActionExecutionRequest,
  ApprovalContext,
  AuditHistoryContext,
  CompanyContext,
  CompanyWorkspaceContext,
  DocumentAnalysisContext,
  FiscalDocumentsContext,
  PendingItemsContext,
  PortfolioContext,
  ReconciliationContext,
  RecordAnalysisObservationRequest,
  RecordApprovalRequest,
  RecordDecisionRequest,
  RecordPendingInformationRequest,
  RecordPendingInformationResult,
  RecordPendingItemRequest,
  RecordPendingItemResult
} from "../../contracts/index.js";
import type { ActionResult, ApprovalRecord, Decision } from "../../domain/index.js";
import {
  AdapterContractError,
  assertContext,
  assertFlatScope,
  assertOperationalScope,
  assertScopedCollection,
  record,
  requireArray,
  requireEqual,
  requireString
} from "../adapters/GatewayTransport.js";
import type { ExpectedScope, GatewayTransport } from "../adapters/GatewayTransport.js";
import type { PlatformProvider } from "./PlatformProvider.js";

/**
 * Gateway-backed PlatformProvider. The injected gateway must authenticate the
 * caller and enforce tenant/company/CNPJ/period authorization server-side.
 * Client-side scope checks below are defense in depth, not authorization.
 */
export class PlatformAdapter implements PlatformProvider {
  constructor(private readonly transport: GatewayTransport) {}

  private async invoke<T>(operation: string, payload: unknown): Promise<T> {
    return await this.transport.invoke({ service: "platform", operation, payload }) as T;
  }

  private async read<T>(
    operation: string,
    payload: unknown,
    scope: ExpectedScope,
    verify?: (value: Record<string, unknown>) => void
  ): Promise<T> {
    const result = assertContext(await this.invoke<unknown>(operation, payload), scope);
    verify?.(result);
    return result as unknown as T;
  }

  getPortfolioContext(input: Parameters<PlatformProvider["getPortfolioContext"]>[0]): Promise<PortfolioContext> {
    return this.read("getPortfolioContext", input, input, result => {
      requireArray(result.companies);
    });
  }

  getCompanyWorkspaceContext(input: Parameters<PlatformProvider["getCompanyWorkspaceContext"]>[0]): Promise<CompanyWorkspaceContext> {
    return this.read("getCompanyWorkspaceContext", input, input, result => {
      requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
      if (input.cnpjId) requireEqual(result.selectedCnpjId, input.cnpjId, "adapter_scope_mismatch");
      if (input.accountingPeriodId) {
        requireEqual(record(result.activeAccountingPeriod).periodId, input.accountingPeriodId, "adapter_scope_mismatch");
      }
      requireArray(result.cnpjs);
    });
  }

  getCompanyContext(input: Parameters<PlatformProvider["getCompanyContext"]>[0]): Promise<CompanyContext> {
    return this.read("getCompanyContext", input, input, result => {
      requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
      requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
    });
  }

  getFiscalDocuments(input: Parameters<PlatformProvider["getFiscalDocuments"]>[0]): Promise<FiscalDocumentsContext> {
    return this.read("getFiscalDocuments", input, input, result => {
      requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
      requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
      if (input.periodId) requireEqual(record(result.accountingPeriod).periodId, input.periodId, "adapter_scope_mismatch");
      requireArray(result.documents);
    });
  }

  getDocumentAnalysisContext(input: Parameters<PlatformProvider["getDocumentAnalysisContext"]>[0]): Promise<DocumentAnalysisContext> {
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

  getPendingItems(input: Parameters<PlatformProvider["getPendingItems"]>[0]): Promise<PendingItemsContext> {
    return this.read("getPendingItems", input, input, result => {
      if (input.companyId !== undefined) requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
      if (input.cnpjId !== undefined) requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
      assertScopedCollection(result.items, input);
    });
  }

  getReconciliationContext(input: Parameters<PlatformProvider["getReconciliationContext"]>[0]): Promise<ReconciliationContext> {
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

  getApprovals(input: Parameters<PlatformProvider["getApprovals"]>[0]): Promise<ApprovalContext> {
    return this.read("getApprovals", input, input, result => {
      assertScopedCollection(result.approvals, input);
      const approvalIds = new Set<string>();
      const decisionIds = new Set<string>();
      for (const value of requireArray(result.approvals)) {
        const item = record(value);
        requireString(item.approvalId);
        requireString(item.decisionId);
        if (approvalIds.has(item.approvalId as string)) throw new AdapterContractError("adapter_duplicate_approval");
        approvalIds.add(item.approvalId as string);
        decisionIds.add(item.decisionId as string);
        if (!["awaiting_approval", "approved", "rejected"].includes(String(item.status))) {
          throw new AdapterContractError("adapter_invalid_approval_status");
        }
      }
      const recommendationIds = new Set<string>();
      for (const value of requireArray(result.relatedDecisions)) {
        const item = record(value);
        if (!decisionIds.has(item.decisionId as string)) throw new AdapterContractError("adapter_unrelated_decision");
        requireString(item.recommendationId);
        recommendationIds.add(item.recommendationId as string);
      }
      for (const value of requireArray(result.relatedRecommendations)) {
        const item = record(value);
        if (!recommendationIds.has(item.recommendationId as string)) {
          throw new AdapterContractError("adapter_unrelated_recommendation");
        }
      }
    });
  }

  getAuditHistory(input: Parameters<PlatformProvider["getAuditHistory"]>[0]): Promise<AuditHistoryContext> {
    return this.read("getAuditHistory", input, input, result => {
      if (input.companyId !== undefined) requireEqual(result.companyId, input.companyId, "adapter_scope_mismatch");
      if (input.cnpjId !== undefined) requireEqual(result.cnpjId, input.cnpjId, "adapter_scope_mismatch");
      if (input.periodId !== undefined) requireEqual(result.accountingPeriodId, input.periodId, "adapter_scope_mismatch");
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

  async recordAnalysisObservation(request: RecordAnalysisObservationRequest): Promise<void> {
    const ack = record(await this.invoke<unknown>("recordAnalysisObservation", request));
    requireEqual(ack.accepted, true, "adapter_write_not_acknowledged");
  }

  async recordPendingItem(request: RecordPendingItemRequest): Promise<RecordPendingItemResult> {
    assertOperationalScope(request.item, request);
    const result = record(await this.invoke<unknown>("recordPendingItem", request));
    const item = record(result.item);
    assertOperationalScope(item, request);
    requireEqual(item.pendingItemId, request.item.pendingItemId, "adapter_subject_mismatch");
    requireString(result.recordedAt);
    return result as unknown as RecordPendingItemResult;
  }

  async recordPendingInformation(request: RecordPendingInformationRequest): Promise<RecordPendingInformationResult> {
    const result = record(await this.invoke<unknown>("recordPendingInformation", request));
    requireEqual(result.pendingItemId, request.pendingItemId, "adapter_subject_mismatch");
    requireString(result.recordedAt);
    return result as unknown as RecordPendingInformationResult;
  }

  async recordDecision(request: RecordDecisionRequest): Promise<Decision> {
    const result = record(await this.invoke<unknown>("recordDecision", request));
    requireString(result.decisionId);
    requireEqual(result.analysisId, request.analysisId, "adapter_subject_mismatch");
    requireEqual(result.recommendationId, request.recommendationId, "adapter_subject_mismatch");
    requireEqual(result.decision, request.decision, "adapter_decision_mismatch");
    return result as unknown as Decision;
  }

  async recordApproval(request: RecordApprovalRequest): Promise<ApprovalRecord> {
    const result = record(await this.invoke<unknown>("recordApproval", request));
    requireString(result.approvalId);
    if (request.approvalId !== undefined) {
      requireEqual(result.approvalId, request.approvalId, "adapter_approval_identity_mismatch");
    }
    assertOperationalScope(result, request);
    requireEqual(result.decisionId, request.decisionId, "adapter_subject_mismatch");
    requireEqual(result.subjectType, request.subjectType, "adapter_subject_mismatch");
    requireEqual(result.subjectId, request.subjectId, "adapter_subject_mismatch");
    requireEqual(result.status, request.outcome === "approve" ? "approved" : "rejected", "adapter_approval_state_mismatch");
    return result as unknown as ApprovalRecord;
  }

  async requestActionExecution(request: ActionExecutionRequest): Promise<ActionResult> {
    const authorization = record(request.authorization);
    if (authorization.kind === "approval_record") {
      requireString(authorization.approvalId);
    } else if (authorization.kind === "direct_permission") {
      requireString(authorization.capability);
      requireString(authorization.actor);
      requireString(authorization.reason);
    } else {
      throw new AdapterContractError("adapter_authorization_required");
    }
    const result = record(await this.invoke<unknown>("requestActionExecution", request));
    requireString(result.commandId);
    if (!["queued", "executing", "succeeded", "failed", "cancelled", "not_requested"].includes(String(result.status))) {
      throw new AdapterContractError("adapter_invalid_action_status");
    }
    requireArray(result.changedRecordRefs);
    return result as unknown as ActionResult;
  }
}
