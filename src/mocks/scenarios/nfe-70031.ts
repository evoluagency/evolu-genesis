import type {
  ApprovalContext,
  CompanyContext,
  CompanyWorkspaceContext,
  DocumentAnalysisContext,
  DocumentAnalysisResult,
  FiscalDocumentsContext,
  PendingItemsContext,
  PortfolioContext
} from "../../contracts/index.js";
import type {
  AccountingPeriod,
  Analysis,
  CnpjEntity,
  Company,
  Evidence,
  FiscalDocument,
  PendingItem,
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
      cnpjCount: 1,
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
      establishmentType: mockCnpj.establishmentType,
      state: mockCnpj.state
    },
    {
      cnpjId: mockBranchCnpj.cnpjId,
      cnpj: mockBranchCnpj.cnpj,
      legalName: mockBranchCnpj.legalName,
      establishmentType: mockBranchCnpj.establishmentType,
      state: mockBranchCnpj.state
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

export const pendingItemsContext: PendingItemsContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  companyId: mockCompany.companyId,
  cnpjId: mockCnpj.cnpjId,
  items: [purposePendingItem]
};

export const approvalContext: ApprovalContext = {
  schemaVersion: "1.0.0",
  tenantId: mockTenant.tenantId,
  approvals: [],
  relatedDecisions: [],
  relatedRecommendations: [],
  capabilities: {
    canApprove: { status: "unavailable", reasonCode: "no_approval_pending" },
    canReject: { status: "unavailable", reasonCode: "no_approval_pending" }
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
