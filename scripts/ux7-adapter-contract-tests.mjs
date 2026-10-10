import assert from "node:assert/strict";
import { PlatformAdapter } from "../preview/runtime/providers/platform/PlatformAdapter.js";
import { IntelligenceAdapter } from "../preview/runtime/providers/intelligence/IntelligenceAdapter.js";
import { MockPlatformProvider } from "../preview/runtime/providers/platform/MockPlatformProvider.js";
import { MockIntelligenceProvider } from "../preview/runtime/providers/intelligence/MockIntelligenceProvider.js";
import { OfficeWorkQueueController } from "../preview/runtime/features/pending-items/OfficeWorkQueueController.js";
import { Nfe70031Controller } from "../preview/runtime/features/fiscal-documents/Nfe70031Controller.js";
import { HistoryController } from "../preview/runtime/features/history/HistoryController.js";
import {
  mockTenant, mockCompany, mockCnpj, mockDocument, mockPeriod, purposePendingItem,
  createNfe70031ScenarioState
} from "../preview/runtime/mocks/scenarios/nfe-70031.js";

const sharedScenarioState = createNfe70031ScenarioState();
const platformMock = new MockPlatformProvider(sharedScenarioState);
const intelligenceMock = new MockIntelligenceProvider(sharedScenarioState);
const calls = [];
const gateway = {
  async invoke(invocation) {
    calls.push(invocation);
    const provider = invocation.service === "platform" ? platformMock : intelligenceMock;
    const method = provider[invocation.operation];
    assert.equal(typeof method, "function", "unknown_gateway_operation");
    const result = await method.call(provider, invocation.payload);
    // UX-7 gateway acknowledgement differs from the mock's void return.
    if (invocation.operation === "recordAnalysisObservation") return { accepted: true };
    return result;
  }
};
const platform = new PlatformAdapter(gateway);
const intelligence = new IntelligenceAdapter(gateway);
const scope = {
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  periodId: mockPeriod.periodId
};

const portfolio = await platform.getPortfolioContext({ tenantId: scope.tenantId });
assert.equal(portfolio.tenantId, scope.tenantId);
const workspace = await platform.getCompanyWorkspaceContext({
  tenantId: scope.tenantId, companyId: scope.companyId,
  cnpjId: scope.cnpjId, accountingPeriodId: scope.periodId
});
assert.equal(workspace.selectedCnpjId, scope.cnpjId);
const queue = await platform.getPendingItems(scope);
assert.ok(queue.items.every(item => item.scope.cnpjId === scope.cnpjId));
const approvals = await platform.getApprovals(scope);
assert.ok(approvals.approvals.length > 0);
assert.ok(approvals.approvals.every(item => item.scope.accountingPeriodId === scope.periodId));

const controller = new OfficeWorkQueueController(platform, {
  tenantId: scope.tenantId, actor: "reviewer-ux7"
});
const before = await controller.load({
  companyId: scope.companyId, cnpjId: scope.cnpjId, periodId: scope.periodId
});
const existing = before.approvals.approvals.find(item => item.status === "awaiting_approval");
assert.ok(existing);
const approved = await controller.decideApproval(existing.approvalId, "approve");
assert.equal(approved.approvalId, existing.approvalId);
assert.equal(approved.status, "approved");
assert.equal(calls.filter(call => call.operation === "requestActionExecution").length, 0);
await assert.rejects(
  () => controller.decideApproval(existing.approvalId, "approve"),
  /approval_already_decided/
);

const documentController = new Nfe70031Controller(platform, intelligence, {
  tenantId: scope.tenantId,
  companyId: scope.companyId,
  cnpjId: scope.cnpjId,
  documentId: mockDocument.documentId,
  accountingPeriodId: scope.periodId,
  pendingItemId: purposePendingItem.pendingItemId,
  actor: "reviewer-ux7"
});
const document = await documentController.load();
assert.equal(document.context.document.documentId, mockDocument.documentId);
assert.equal(document.analysis.status, "insufficient_context");
assert.ok(calls.some(call => call.operation === "recordAnalysisObservation" && call.service === "platform"));

const history = await new HistoryController(platform, intelligence, {
  tenantId: scope.tenantId
}).load({
  companyId: scope.companyId, cnpjId: scope.cnpjId, periodId: scope.periodId,
  subject: { type: "FiscalDocument", id: mockDocument.documentId }
});
assert.ok(history.audit.events.length > 0);
assert.ok(history.analyses.entries.length > 0);

// Controller-level provider swap must preserve the full approval/execution boundary.
const resolved = await documentController.recordPurpose("production");
assert.equal(resolved.status, "completed");
assert.ok(resolved.recommendations.length > 0);
const decision = await documentController.recordRecommendationDecision("accept");
assert.equal(decision.decision, "accept");
const actionCallsBeforeApproval = calls.filter(call => call.operation === "requestActionExecution").length;
const documentApproval = await documentController.recordApproval("approve");
assert.equal(documentApproval.status, "approved");
assert.equal(calls.filter(call => call.operation === "requestActionExecution").length, actionCallsBeforeApproval);
const result = await documentController.executeApprovedAction();
assert.equal(result.status, "succeeded");
assert.equal(calls.filter(call => call.operation === "requestActionExecution").length, actionCallsBeforeApproval + 1);
const after = await documentController.getAuditHistory();
assert.ok(after.events.some(event => event.eventType === "action.succeeded"));

await assert.rejects(
  () => new PlatformAdapter({
    async invoke() { return { schemaVersion: "1.0.0", tenantId: "other-tenant", items: [] }; }
  }).getPendingItems({ tenantId: scope.tenantId }),
  /adapter_scope_mismatch/
);
await assert.rejects(
  () => new PlatformAdapter({
    async invoke() {
      return {
        schemaVersion: "1.0.0",
        tenantId: scope.tenantId,
        items: [{ scope: { tenantId: scope.tenantId, companyId: "different-company" } }]
      };
    }
  }).getPendingItems({ tenantId: scope.tenantId, companyId: scope.companyId }),
  /adapter_scope_mismatch/
);
await assert.rejects(
  () => new IntelligenceAdapter({
    async invoke() { return { schemaVersion: "0.0.0", analysisId: "a", status: "completed", findings: [], evidence: [], recommendations: [], missingContext: [] }; }
  }).requestDocumentAnalysis({
    schemaVersion: "1.0.0", tenantId: scope.tenantId,
    companyId: scope.companyId, cnpjId: scope.cnpjId,
    documentId: mockDocument.documentId,
    purpose: "economic_purpose_review", requestedBy: "reviewer-ux7"
  }),
  /adapter_schema_mismatch/
);
await assert.rejects(
  () => new PlatformAdapter({
    async invoke() {
      return {
        approvalId: "new-duplicate-id", decisionId: existing.decisionId,
        subjectType: existing.subjectType, subjectId: existing.subjectId,
        status: "approved", scope: existing.scope
      };
    }
  }).recordApproval({
    approvalId: existing.approvalId,
    tenantId: scope.tenantId, companyId: scope.companyId,
    cnpjId: scope.cnpjId, accountingPeriodId: scope.periodId,
    decisionId: existing.decisionId, subjectType: existing.subjectType,
    subjectId: existing.subjectId, outcome: "approve", actor: "reviewer-ux7"
  }),
  /adapter_approval_identity_mismatch/
);
await assert.rejects(
  () => new IntelligenceAdapter({
    async invoke() {
      return {
        schemaVersion: "1.0.0", analysisId: "a", status: "insufficient_context",
        findings: [], evidence: [], recommendations: [],
        missingContext: [{ scope: { tenantId: "another-tenant", companyId: scope.companyId, cnpjId: scope.cnpjId } }]
      };
    }
  }).requestDocumentAnalysis({
    schemaVersion: "1.0.0", tenantId: scope.tenantId,
    companyId: scope.companyId, cnpjId: scope.cnpjId,
    documentId: mockDocument.documentId,
    purpose: "economic_purpose_review", requestedBy: "reviewer-ux7"
  }),
  /adapter_scope_mismatch/
);
await assert.rejects(
  () => new PlatformAdapter({
    async invoke() {
      return {
        schemaVersion: "1.0.0", tenantId: scope.tenantId,
        approvals: [], relatedDecisions: [{ decisionId: "foreign-decision", recommendationId: "r" }],
        relatedRecommendations: [], capabilities: {}
      };
    }
  }).getApprovals({ tenantId: scope.tenantId }),
  /adapter_unrelated_decision/
);
await assert.rejects(
  () => platform.requestActionExecution({
    tenantId: scope.tenantId, companyId: scope.companyId, cnpjId: scope.cnpjId,
    authorization: { kind: "untrusted" },
    actionType: "record_economic_purpose", subjectType: "FiscalDocument",
    subjectId: mockDocument.documentId, payload: {}, requestedBy: "reviewer-ux7"
  }),
  /adapter_authorization_required/
);
await assert.rejects(
  () => platform.requestActionExecution({
    tenantId: scope.tenantId, companyId: scope.companyId, cnpjId: scope.cnpjId,
    authorization: { kind: "approval_record", approvalId: "" },
    actionType: "record_economic_purpose", subjectType: "FiscalDocument",
    subjectId: mockDocument.documentId, payload: {}, requestedBy: "reviewer-ux7"
  }),
  /adapter_invalid_response/
);

console.log("UX-7 adapter contract tests: PASS");
