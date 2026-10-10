import type {
  ApprovalContext,
  CompanyContext,
  CompanyWorkspaceContext,
  DocumentAnalysisContext,
  DocumentAnalysisResult,
  FiscalDocumentsContext,
  PendingItemsContext,
  PortfolioContext,
  ReconciliationAnalysisResult,
  ReconciliationContext
} from "../../contracts/index.js";
import type {
  AccountingPeriod,
  Analysis,
  ApprovalRecord,
  CnpjEntity,
  Company,
  Decision,
  Evidence,
  FiscalDocument,
  PendingItem,
  Recommendation,
  Reconciliation,
  Tenant
} from "../../domain/index.js";

export type Nfe70031EconomicPurpose =
  | "maintenance"
  | "production"
  | "internal_use"
  | "unknown";

export interface Nfe70031ScenarioState {
  economicPurpose: Nfe70031EconomicPurpose | null;
}

export function createNfe70031ScenarioState(): Nfe70031ScenarioState {
  return { economicPurpose: null };
}

export const mockTenant: Tenant = {
  tenantId: "tenant-nexus",
  tenantSlug: "nexus",
  name: "NEXUS",
  status: "active"
};

export const mockCompany: Company = {
  companyId: "company-acme-industrial",
  tenantId: mockTenant.tenantId,
  legalName: "ACME Industrial Ltda.",
  tradeName: "ACME Industrial",
  status: "active"
};

export const mockCnpj: CnpjEntity = {
  cnpjId: "cnpj-acme-industrial-hq",
  companyId: mockCompany.companyId,
  tenantId: mockTenant.tenantId,
  cnpj: "12345678000190",
  legalName: "ACME Industrial Ltda.",
  establishmentType: "head_office",
  state: "SP",
  status: "active"
};

export const mockBranchCnpj: CnpjEntity = {
  cnpjId: "cnpj-acme-industrial-branch",
  companyId: mockCompany.companyId,
  tenantId: mockTenant.tenantId,
  cnpj: "12345678000271",
  legalName: "ACME Industrial Ltda. - Filial",
  establishmentType: "branch",
  state: "MG",
  status: "active"
};

export const mockPeriod: AccountingPeriod = {
  periodId: "period-2026-09",
  competence: "2026-09",
  status: "open",
  openedAt: "2026-09-01T00:00:00Z"
};

export const mockPreviousPeriod: AccountingPeriod = {
  periodId: "period-2026-08",
  competence: "2026-08",
  status: "closed",
  openedAt: "2026-08-01T00:00:00Z",
  closedAt: "2026-09-10T12:00:00Z"
};

export const mockAccountingPeriods: AccountingPeriod[] = [
  mockPeriod,
  mockPreviousPeriod
];

export const mockDocument: FiscalDocument = {
  documentId: "fiscal-document-70031",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  documentType: "nfe",
  documentNumber: "70031",
  issueDate: "2026-09-18",
  counterparty: {
    name: "Atlas Componentes Ltda."
  },
  items: [
    {
      itemId: "item-bearing-6305",
      documentId: "fiscal-document-70031",
      description: "Rolamento 6305",
      quantity: 1,
      unitValue: 1920,
      taxClassification: {
        ncm: "8482.10.90",
        cfop: "5102"
      }
    }
  ],
  taxSummary: {
    icms: 244.8
  },
  status: "requires_context"
};

export const historicalEvidence: Evidence[] = [
  {
    evidenceId: "evidence-bearing-history",
    type: "historical_pattern",
    label: "Histórico de classificação do Rolamento 6305",
    value: {
      maintenance: 8,
      production: 3,
      internal_use: 1
    },
    source: "synthetic_history",
    asOf: "2026-09-30",
    confidence: 1
  }
];

export const purposePendingItem: PendingItem = {
  pendingItemId: "pending-economic-purpose-70031",
  type: "information_request",
  scope: {
    tenantId: mockTenant.tenantId,
    companyId: mockCompany.companyId,
    cnpjId: mockCnpj.cnpjId,
    accountingPeriodId: mockPeriod.periodId
  },
  title: "Finalidade econômica pendente",
  description: "A finalidade econômica do Rolamento 6305 precisa ser confirmada antes da recomendação.",
  status: "awaiting_information",
  subject: {
    type: "FiscalDocument",
    id: mockDocument.documentId
  }
};

export const initialAnalysis: Analysis = {
  analysisId: "analysis-70031-initial",
  type: "document_analysis",
  status: "insufficient_context",
  scope: "document",
  createdAt: "2026-10-05T12:00:00Z",
  findings: [
    {
      findingId: "finding-economic-purpose-missing",
      type: "missing_economic_purpose",
      severity: "medium",
      title: "Finalidade econômica não confirmada",
      description: "O histórico é evidência, mas não determina o tratamento sem a finalidade econômica desta operação.",
      evidenceRefs: ["evidence-bearing-history"]
    }
  ],
  evidence: historicalEvidence,
  recommendations: [],
  missingContext: [purposePendingItem]
};

export const portfolioContext: PortfolioContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  companies: [
    {
      companyId: mockCompany.companyId,
      legalName: mockCompany.legalName,
      ...(mockCompany.tradeName ? { tradeName: mockCompany.tradeName } : {}),
      cnpjCount: 2,
      pendingCount: 1
    }
  ],
  metrics: {
    companies: 1,
    pendingItems: 1
  },
  pendingSummary: {
    information_request: 1
  },
  capabilities: {
    canOpenCompany: { status: "allowed" }
  },
  provenance: [
    {
      source: "mock_platform_provider",
      reference: "scenario:nfe-70031"
    }
  ]
};

export const companyContext: CompanyContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  referenceDate: "2026-10-05",
  capabilities: {
    canOpenCompanyInformation: { status: "allowed" }
  },
  provenance: [
    {
      source: "mock_platform_provider",
      reference: "scenario:nfe-70031"
    }
  ],
  dataQuality: {
    completeness: 0.85,
    issues: ["economic_purpose_missing"]
  }
};

export const companyWorkspaceContext: CompanyWorkspaceContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  selectedCnpjId: mockCnpj.cnpjId,
  cnpjs: [
    {
      cnpjId: mockCnpj.cnpjId,
      cnpj: mockCnpj.cnpj,
      legalName: mockCnpj.legalName,
      ...(mockCnpj.establishmentType
        ? { establishmentType: mockCnpj.establishmentType }
        : {}),
      ...(mockCnpj.state ? { state: mockCnpj.state } : {})
    },
    {
      cnpjId: mockBranchCnpj.cnpjId,
      cnpj: mockBranchCnpj.cnpj,
      legalName: mockBranchCnpj.legalName,
      ...(mockBranchCnpj.establishmentType
        ? { establishmentType: mockBranchCnpj.establishmentType }
        : {}),
      ...(mockBranchCnpj.state ? { state: mockBranchCnpj.state } : {})
    }
  ],
  company: mockCompany,
  activeAccountingPeriod: mockPeriod,
  availableAccountingPeriods: mockAccountingPeriods,
  pendingSummary: {
    information_request: 1
  },
  capabilities: {
    canSelectCnpj: { status: "allowed" },
    canSelectPeriod: { status: "allowed" }
  },
  provenance: [
    {
      source: "mock_platform_provider",
      reference: "scenario:nfe-70031"
    }
  ],
  dataQuality: {
    completeness: 0.85,
    issues: ["economic_purpose_missing"]
  }
};

export const fiscalDocumentsContext: FiscalDocumentsContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  accountingPeriod: mockPeriod,
  documents: [
    {
      documentId: mockDocument.documentId,
      documentType: mockDocument.documentType,
      documentNumber: mockDocument.documentNumber,
      issueDate: mockDocument.issueDate,
      counterpartyName: mockDocument.counterparty.name,
      status: mockDocument.status
    }
  ],
  filters: {},
  summary: {
    documentCount: 1,
    pendingCount: 1
  },
  capabilities: {
    canFilterDocuments: { status: "allowed" },
    canOpenDocument: { status: "allowed" }
  },
  provenance: [
    {
      source: "mock_platform_provider",
      reference: "scenario:nfe-70031"
    }
  ]
};

export const documentAnalysisContext: DocumentAnalysisContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  referenceDate: "2026-10-05",
  document: mockDocument,
  analysis: initialAnalysis,
  pendingItems: [purposePendingItem],
  historicalEvidence,
  capabilities: {
    canRequestAnalysis: { status: "allowed" },
    canRequestInformation: { status: "allowed" },
    canRecordDecision: {
      status: "unavailable",
      reasonCode: "analysis_insufficient_context"
    },
    canRequestApproval: {
      status: "unavailable",
      reasonCode: "no_decision_recorded"
    },
    canExecuteApprovedAction: {
      status: "unavailable",
      reasonCode: "no_action_authorization"
    }
  },
  provenance: [
    {
      source: "mock_platform_provider",
      reference: "scenario:nfe-70031"
    }
  ],
  dataQuality: {
    completeness: 0.85,
    issues: ["economic_purpose_missing"]
  }
};

export const officePendingItems: PendingItem[] = [
  {
    pendingItemId: "pending-office-unidentified-receipt",
    type: "information_request",
    scope: {
      tenantId: mockTenant.tenantId,
      companyId: mockCompany.companyId,
      cnpjId: mockCnpj.cnpjId,
      accountingPeriodId: mockPeriod.periodId
    },
    title: "Qual a finalidade do recebimento não identificado?",
    description:
      "A contabilidade precisa contextualizar um crédito bancário que não equivale automaticamente a receita tributável.",
    status: "awaiting_information",
    subject: {
      type: "FinancialMovement",
      id: "movement-unidentified-receipt-2026-09"
    }
  },
  {
    pendingItemId: "pending-office-material-proof",
    type: "document_issue",
    scope: {
      tenantId: mockTenant.tenantId,
      companyId: mockCompany.companyId,
      cnpjId: mockCnpj.cnpjId,
      accountingPeriodId: mockPeriod.periodId
    },
    title: "Comprovante da aquisição de materiais",
    description:
      "Documento de compra é evidência e deve ser conferido antes de qualquer classificação fiscal.",
    status: "awaiting_information",
    subject: {
      type: "FiscalDocument",
      id: "fiscal-document-material-purchase"
    }
  }
];

export const pendingItemsContext: PendingItemsContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  items: [purposePendingItem, ...officePendingItems]
};

export const seededApprovalRecommendation: Recommendation = {
  recommendationId: "recommendation-approval-70018",
  analysisId: "analysis-approval-70018",
  type: "record_economic_purpose",
  title: "Registrar finalidade econômica como componente de produção",
  rationale:
    "A finalidade desta operação foi confirmada e a alteração controlada aguarda autorização formal antes de qualquer execução.",
  evidenceRefs: [],
  confidence: 0.92,
  requiresApproval: true,
  proposedChange: {
    economicPurpose: "production"
  }
};

export const seededApprovalDecision: Decision = {
  decisionId: "decision-approval-70018",
  recommendationId: seededApprovalRecommendation.recommendationId,
  analysisId: seededApprovalRecommendation.analysisId,
  decision: "accept",
  rationale: "Recomendação aceita para submissão ao fluxo formal de aprovação.",
  decidedBy: "professional-reviewer-demo",
  decidedAt: "2026-10-10T12:00:00Z"
};

export const seededApprovalRecord: ApprovalRecord = {
  approvalId: "approval-70018",
  decisionId: seededApprovalDecision.decisionId,
  scope: {
    tenantId: mockTenant.tenantId,
    companyId: mockCompany.companyId,
    cnpjId: mockCnpj.cnpjId,
    accountingPeriodId: mockPeriod.periodId
  },
  subjectType: "FiscalDocument",
  subjectId: "fiscal-document-70018",
  status: "awaiting_approval"
};

export const approvalContext: ApprovalContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  approvals: [seededApprovalRecord],
  relatedDecisions: [seededApprovalDecision],
  relatedRecommendations: [seededApprovalRecommendation],
  capabilities: {
    canApprove: { status: "allowed" },
    canReject: { status: "allowed" }
  }
};

export const initialDocumentAnalysisResult: DocumentAnalysisResult = {
  schemaVersion: "1.0.0",
  analysisId: initialAnalysis.analysisId,
  status: initialAnalysis.status,
  findings: initialAnalysis.findings,
  evidence: initialAnalysis.evidence,
  recommendations: [],
  missingContext: initialAnalysis.missingContext
};


export const reconciliationCase: Reconciliation = {
  reconciliationId: "reconciliation-acme-2026-09",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  periodId: mockPeriod.periodId,
  status: "insufficient_context"
};

export const reconciliationEvidence: Evidence[] = [
  {
    evidenceId: "evidence-reconciliation-fiscal",
    type: "reconciliation_source",
    label: "Documentos fiscais importados",
    value: {
      dimension: "fiscal",
      provider: "SIEG / XML",
      amount: 812440.2
    },
    source: "fiscal_documents",
    asOf: "2026-09-30",
    confidence: 1
  },
  {
    evidenceId: "evidence-reconciliation-accounting",
    type: "reconciliation_source",
    label: "Escrituração contábil",
    value: {
      dimension: "accounting",
      provider: "Domínio / Razão",
      amount: 817125.54
    },
    source: "accounting_ledger",
    asOf: "2026-09-30",
    confidence: 1
  },
  {
    evidenceId: "evidence-reconciliation-management",
    type: "reconciliation_source",
    label: "Visão gerencial agregada",
    value: {
      dimension: "management",
      provider: "Demonstrativo interno",
      amount: 789980
    },
    source: "management_statement",
    asOf: "2026-09-30",
    confidence: 1
  },
  {
    evidenceId: "evidence-reconciliation-financial",
    type: "reconciliation_source",
    label: "Movimentação financeira conciliável",
    value: {
      dimension: "financial",
      provider: "Banco",
      amount: 805312.11
    },
    source: "financial_movement",
    asOf: "2026-09-30",
    confidence: 1
  }
];

export const reconciliationFinding = {
  findingId: "finding-reconciliation-fiscal-accounting-difference",
  type: "fiscal_accounting_difference",
  severity: "medium" as const,
  title: "Documentos fiscais e razão contábil divergem",
  description:
    "A diferença simulada entre documentos fiscais e razão contábil é de R$ 4.685,34. A origem precisa ser comprovada antes da conciliação.",
  evidenceRefs: [
    "evidence-reconciliation-fiscal",
    "evidence-reconciliation-accounting"
  ]
};

export const reconciliationPendingCandidate: PendingItem = {
  pendingItemId: "pending-reconciliation-fiscal-accounting-2026-09",
  type: "reconciliation",
  scope: {
    tenantId: mockTenant.tenantId,
    companyId: mockCompany.companyId,
    cnpjId: mockCnpj.cnpjId,
    accountingPeriodId: mockPeriod.periodId
  },
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
  sources: reconciliationEvidence.map(item => ({
    source: item.source,
    ...(item.asOf ? { observedAt: item.asOf } : {}),
    reference: item.evidenceId
  })),
  findings: [reconciliationFinding],
  evidence: reconciliationEvidence,
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
  analysisId: "analysis-reconciliation-acme-2026-09",
  status: "insufficient_context",
  findings: [reconciliationFinding],
  evidence: reconciliationEvidence,
  recommendations: [],
  missingContext: [reconciliationPendingCandidate]
};
