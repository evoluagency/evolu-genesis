export const mockTenant = {
    tenantId: "tenant-nexus",
    tenantSlug: "nexus",
    name: "NEXUS",
    status: "active"
};
export const mockCompany = {
    companyId: "company-acme-industrial",
    tenantId: mockTenant.tenantId,
    legalName: "ACME Industrial Ltda.",
    tradeName: "ACME Industrial",
    status: "active"
};
export const mockCnpj = {
    cnpjId: "cnpj-acme-industrial-hq",
    companyId: mockCompany.companyId,
    tenantId: mockTenant.tenantId,
    cnpj: "00000000000191",
    legalName: "ACME Industrial Ltda.",
    state: "SP",
    status: "active"
};
export const mockPeriod = {
    periodId: "period-2026-09",
    competence: "2026-09",
    status: "open",
    openedAt: "2026-09-01T00:00:00Z"
};
export const mockDocument = {
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
export const historicalEvidence = [
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
export const purposePendingItem = {
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
export const initialAnalysis = {
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
export const portfolioContext = {
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
export const companyContext = {
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
export const companyWorkspaceContext = {
    schemaVersion: "1.0.0",
    tenantId: mockTenant.tenantId,
    companyId: mockCompany.companyId,
    selectedCnpjId: mockCnpj.cnpjId,
    cnpjs: [
        {
            cnpjId: mockCnpj.cnpjId,
            cnpj: mockCnpj.cnpj,
            legalName: mockCnpj.legalName
        }
    ],
    company: mockCompany,
    activeAccountingPeriod: mockPeriod,
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
export const fiscalDocumentsContext = {
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
export const documentAnalysisContext = {
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
export const pendingItemsContext = {
    schemaVersion: "1.0.0",
    tenantId: mockTenant.tenantId,
    companyId: mockCompany.companyId,
    cnpjId: mockCnpj.cnpjId,
    items: [purposePendingItem]
};
export const approvalContext = {
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
export const initialDocumentAnalysisResult = {
    schemaVersion: "1.0.0",
    analysisId: initialAnalysis.analysisId,
    status: initialAnalysis.status,
    findings: initialAnalysis.findings,
    evidence: initialAnalysis.evidence,
    recommendations: [],
    missingContext: initialAnalysis.missingContext
};
export function createNfe70031ScenarioState() {
    return { economicPurpose: null };
}
export const economicPurposeLabels = {
    maintenance: "Manutenção de máquina existente",
    production: "Produção de nova máquina",
    internal_use: "Uso interno / consumo"
};
export function buildDocumentAnalysisResult(purpose) {
    if (!purpose || purpose === "unknown") {
        return {
            ...initialDocumentAnalysisResult,
            missingContext: [
                {
                    ...purposePendingItem,
                    description: purpose === "unknown"
                        ? "A empresa informou que ainda não sabe a finalidade econômica desta operação."
                        : purposePendingItem.description
                }
            ]
        };
    }
    const definitions = {
        maintenance: {
            title: "Registrar finalidade como manutenção de máquina existente",
            rationale: "A informação fornecida é compatível com o padrão histórico predominante. O histórico permanece evidência complementar e não substitui o contexto desta operação.",
            confidence: 0.9
        },
        production: {
            title: "Registrar finalidade como produção de nova máquina",
            rationale: "A empresa informou uso produtivo nesta operação. O histórico contém casos semelhantes, mas permanece apenas como evidência complementar.",
            confidence: 0.72
        },
        internal_use: {
            title: "Registrar finalidade como uso interno / consumo",
            rationale: "A empresa confirmou uso interno. O registro deve refletir esta operação específica, independentemente da frequência histórica anterior.",
            confidence: 0.72
        }
    };
    const definition = definitions[purpose];
    const analysisId = `analysis-70031-${purpose}`;
    return {
        schemaVersion: "1.0.0",
        analysisId,
        status: "completed",
        findings: [
            {
                findingId: `finding-economic-purpose-${purpose}`,
                type: "economic_purpose_confirmed",
                severity: "info",
                title: "Finalidade econômica confirmada",
                description: economicPurposeLabels[purpose],
                evidenceRefs: ["evidence-bearing-history"]
            }
        ],
        evidence: historicalEvidence,
        recommendations: [
            {
                recommendationId: `recommendation-70031-${purpose}`,
                analysisId,
                type: "record_economic_purpose",
                title: definition.title,
                rationale: definition.rationale,
                evidenceRefs: ["evidence-bearing-history"],
                confidence: definition.confidence,
                requiresApproval: true,
                proposedChange: {
                    economicPurpose: purpose,
                    economicPurposeLabel: economicPurposeLabels[purpose]
                }
            }
        ],
        missingContext: []
    };
}
