import type {
  ReconciliationAnalysisResult,
  ReconciliationContext,
  ReconciliationSourceSummary
} from "../../contracts/index.js";
import type {
  Evidence,
  Finding,
  PendingItem,
  Reconciliation
} from "../../domain/index.js";
import {
  mockCompany,
  mockCnpj,
  mockPeriod,
  mockTenant
} from "./nfe-70031.js";

export const reconciliationCase: Reconciliation = {
  reconciliationId: "reconciliation-acme-2026-09",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  periodId: mockPeriod.periodId,
  status: "insufficient_context"
};

export const reconciliationSources: ReconciliationSourceSummary[] = [
  {
    sourceId: "reconciliation-source-fiscal",
    kind: "fiscal_documents",
    amount: 812440.2,
    currency: "BRL",
    provenance: {
      source: "mock_document_connector",
      observedAt: "2026-09-30",
      reference: "fiscal-documents:2026-09"
    }
  },
  {
    sourceId: "reconciliation-source-accounting",
    kind: "accounting_ledger",
    amount: 817125.54,
    currency: "BRL",
    provenance: {
      source: "mock_accounting_connector",
      observedAt: "2026-09-30",
      reference: "accounting-ledger:2026-09"
    }
  },
  {
    sourceId: "reconciliation-source-management",
    kind: "management_statement",
    amount: 789980,
    currency: "BRL",
    provenance: {
      source: "mock_management_source",
      observedAt: "2026-09-30",
      reference: "management-statement:2026-09"
    }
  },
  {
    sourceId: "reconciliation-source-financial",
    kind: "financial_movements",
    amount: 805312.11,
    currency: "BRL",
    provenance: {
      source: "mock_financial_connector",
      observedAt: "2026-09-30",
      reference: "financial-movements:2026-09"
    }
  }
];

const evidenceLabels: Record<ReconciliationSourceSummary["kind"], string> = {
  fiscal_documents: "Documentos fiscais da competência",
  accounting_ledger: "Escrituração contábil da competência",
  management_statement: "Demonstrativo gerencial da competência",
  financial_movements: "Movimentação financeira da competência"
};

export const reconciliationEvidence: Evidence[] = reconciliationSources.map(source => ({
  evidenceId: `evidence-${source.sourceId}`,
  type: "reconciliation_source",
  label: evidenceLabels[source.kind],
  value: {
    kind: source.kind,
    amount: source.amount,
    currency: source.currency
  },
  source: source.provenance.source,
  ...(source.provenance.observedAt ? { asOf: source.provenance.observedAt } : {}),
  confidence: 1
}));

export const reconciliationFinding: Finding = {
  findingId: "finding-reconciliation-fiscal-accounting-difference",
  type: "fiscal_accounting_difference",
  severity: "medium",
  title: "Documentos fiscais e razão contábil divergem",
  description:
    "A diferença simulada entre documentos fiscais e razão contábil é de R$ 4.685,34. A origem precisa ser comprovada antes da conciliação.",
  evidenceRefs: [
    "evidence-reconciliation-source-fiscal",
    "evidence-reconciliation-source-accounting"
  ]
};

export const reconciliationPendingTemplate: PendingItem = {
  pendingItemId: "pending-reconciliation-fiscal-accounting-2026-09",
  type: "reconciliation",
  title: "Confirmar origem da divergência fiscal × contábil",
  description:
    "Confirmar a origem da diferença entre documentos fiscais e razão contábil na competência 09/2026.",
  status: "awaiting_information",
  subject: {
    type: "Reconciliation",
    id: reconciliationCase.reconciliationId
  }
};

export const reconciliationContext: ReconciliationContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  referenceDate: "2026-09-30",
  accountingPeriod: mockPeriod,
  reconciliation: reconciliationCase,
  sources: reconciliationSources,
  findings: [],
  evidence: [],
  pendingItems: [],
  capabilities: {
    canCreatePendingItem: { status: "allowed" },
    canCloseReconciliation: {
      status: "unavailable",
      reasonCode: "difference_origin_unresolved"
    }
  },
  provenance: [
    {
      source: "mock_platform_provider",
      reference: "scenario:reconciliation-2026-09"
    }
  ],
  dataQuality: {
    completeness: 0.8,
    issues: ["fiscal_accounting_difference_unexplained"]
  }
};

export const reconciliationAnalysisResult: ReconciliationAnalysisResult = {
  schemaVersion: "1.0.0",
  status: "insufficient_context",
  findings: [reconciliationFinding],
  evidence: reconciliationEvidence,
  recommendations: [],
  missingContext: []
};
