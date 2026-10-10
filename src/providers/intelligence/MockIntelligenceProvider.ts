import type {
  AnalysisHistoryContext,
  AnalysisHistoryEntry,
  DocumentAnalysisRequest,
  DocumentAnalysisResult,
  ExplainAnalysisRequest,
  ExplainAnalysisResult,
  ReconciliationAnalysisRequest,
  ReconciliationAnalysisResult
} from "../../contracts/index.js";
import {
  createNfe70031ScenarioState,
  historicalEvidence,
  initialDocumentAnalysisResult,
  mockCompany,
  mockCnpj,
  mockDocument,
  mockPeriod,
  mockTenant,
  reconciliationAnalysisResult,
  reconciliationCase
} from "../../mocks/scenarios/nfe-70031.js";
import type {
  Nfe70031EconomicPurpose,
  Nfe70031ScenarioState
} from "../../mocks/scenarios/nfe-70031.js";
import type { Analysis } from "../../domain/index.js";
import type { IntelligenceProvider } from "./IntelligenceProvider.js";

export class MockIntelligenceProvider implements IntelligenceProvider {
  private analysisHistory: AnalysisHistoryEntry[] = [];

  constructor(
    private readonly scenarioState: Nfe70031ScenarioState = createNfe70031ScenarioState()
  ) {
    this.seedAnalysisHistory();
  }

  async requestDocumentAnalysis(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult> {
    if (request.documentId !== mockDocument.documentId) {
      throw new Error("mock_document_not_found");
    }

    const purpose = this.scenarioState.economicPurpose;
    if (!purpose || purpose === "unknown") {
      this.recordAnalysisHistory({
        tenantId: request.tenantId,
        companyId: request.companyId,
        cnpjId: request.cnpjId,
        subject: {
          type: "FiscalDocument",
          id: request.documentId
        },
        result: initialDocumentAnalysisResult,
        type: "document_analysis",
        scope: "document"
      });
      return initialDocumentAnalysisResult;
    }

    const copy: Record<
      Exclude<Nfe70031EconomicPurpose, "unknown">,
      { title: string; rationale: string; confidence: number }
    > = {
      maintenance: {
        title: "Registrar finalidade como manutenção de máquina existente",
        rationale:
          "A informação fornecida é compatível com o padrão histórico predominante. A recomendação descreve o contexto validado; não executa alteração por conta própria.",
        confidence: 0.9
      },
      production: {
        title: "Registrar finalidade como produção de nova máquina",
        rationale:
          "A empresa informou uso produtivo nesta operação. O histórico contém casos semelhantes, mas permanece apenas como evidência complementar.",
        confidence: 0.7
      },
      internal_use: {
        title: "Registrar finalidade como uso interno / consumo",
        rationale:
          "A empresa confirmou uso interno. O registro deve refletir esta operação específica, independentemente da frequência histórica anterior.",
        confidence: 0.7
      }
    };

    const recommendation = copy[purpose];
    const analysisId = `analysis-70031-${purpose}`;

    const result: DocumentAnalysisResult = {
      schemaVersion: "1.0.0",
      analysisId,
      status: "completed",
      findings: [
        {
          findingId: `finding-economic-purpose-${purpose}`,
          type: "economic_purpose_confirmed",
          severity: "info",
          title: "Finalidade econômica confirmada",
          description: recommendation.rationale,
          evidenceRefs: ["evidence-bearing-history"]
        }
      ],
      evidence: historicalEvidence,
      recommendations: [
        {
          recommendationId: `recommendation-70031-${purpose}`,
          analysisId,
          type: "record_economic_purpose",
          title: recommendation.title,
          rationale: recommendation.rationale,
          evidenceRefs: ["evidence-bearing-history"],
          confidence: recommendation.confidence,
          requiresApproval: true,
          proposedChange: {
            economicPurpose: purpose
          }
        }
      ],
      missingContext: []
    };

    this.recordAnalysisHistory({
      tenantId: request.tenantId,
      companyId: request.companyId,
      cnpjId: request.cnpjId,
      subject: {
        type: "FiscalDocument",
        id: request.documentId
      },
      result,
      type: "document_analysis",
      scope: "document"
    });

    return result;
  }

  async requestReconciliationAnalysis(
    request: ReconciliationAnalysisRequest
  ): Promise<ReconciliationAnalysisResult> {
    this.recordAnalysisHistory({
      tenantId: request.tenantId,
      companyId: request.companyId,
      cnpjId: request.cnpjId,
      subject: {
        type: "Reconciliation",
        id: request.reconciliationId
      },
      result: reconciliationAnalysisResult,
      type: "reconciliation_analysis",
      scope: "cnpj"
    });
    return reconciliationAnalysisResult;
  }

  async getAnalysisHistory(input: {
    tenantId: string;
    companyId?: string;
    cnpjId?: string;
    subject?: {
      type: string;
      id: string;
    };
  }): Promise<AnalysisHistoryContext> {
    const entries = this.analysisHistory
      .filter(entry => {
        if (entry.tenantId !== input.tenantId) return false;
        if (input.companyId && entry.companyId !== input.companyId) return false;
        if (input.cnpjId && entry.cnpjId !== input.cnpjId) return false;
        if (
          input.subject &&
          (entry.subject.type !== input.subject.type ||
            entry.subject.id !== input.subject.id)
        ) {
          return false;
        }
        return true;
      })
      .map(entry => ({
        ...entry,
        subject: { ...entry.subject },
        analysis: {
          ...entry.analysis,
          findings: entry.analysis.findings.map(item => ({
            ...item,
            evidenceRefs: [...item.evidenceRefs]
          })),
          evidence: entry.analysis.evidence.map(item => ({ ...item })),
          recommendations: entry.analysis.recommendations.map(item => ({
            ...item,
            evidenceRefs: [...item.evidenceRefs],
            ...(item.proposedChange
              ? { proposedChange: { ...item.proposedChange } }
              : {})
          })),
          missingContext: entry.analysis.missingContext.map(item => ({
            ...item,
            scope: { ...item.scope },
            subject: { ...item.subject }
          }))
        }
      }))
      .sort((a, b) => b.analysis.createdAt.localeCompare(a.analysis.createdAt));

    return {
      schemaVersion: "1.0.0",
      tenantId: input.tenantId,
      ...(input.companyId ? { companyId: input.companyId } : {}),
      ...(input.cnpjId ? { cnpjId: input.cnpjId } : {}),
      entries
    };
  }

  private seedAnalysisHistory(): void {
    this.recordAnalysisHistory({
      tenantId: mockTenant.tenantId,
      companyId: mockCompany.companyId,
      cnpjId: mockCnpj.cnpjId,
      subject: {
        type: "FiscalDocument",
        id: mockDocument.documentId
      },
      result: initialDocumentAnalysisResult,
      type: "document_analysis",
      scope: "document",
      createdAt: "2026-10-05T12:00:00Z"
    });

    this.recordAnalysisHistory({
      tenantId: mockTenant.tenantId,
      companyId: mockCompany.companyId,
      cnpjId: mockCnpj.cnpjId,
      subject: {
        type: "Reconciliation",
        id: reconciliationCase.reconciliationId
      },
      result: reconciliationAnalysisResult,
      type: "reconciliation_analysis",
      scope: "cnpj",
      createdAt: "2026-10-05T12:05:00Z"
    });
  }

  private recordAnalysisHistory(input: {
    tenantId: string;
    companyId: string;
    cnpjId?: string;
    subject: {
      type: string;
      id: string;
    };
    result: DocumentAnalysisResult | ReconciliationAnalysisResult;
    type: string;
    scope: Analysis["scope"];
    createdAt?: string;
  }): void {
    const analysisId = input.result.analysisId;

    const existing = this.analysisHistory.find(
      entry =>
        entry.analysis.analysisId === analysisId &&
        entry.subject.type === input.subject.type &&
        entry.subject.id === input.subject.id
    );
    if (existing) return;

    const createdAt = input.createdAt ?? new Date().toISOString();
    const analysis: Analysis = {
      analysisId,
      type: input.type,
      status: input.result.status,
      scope: input.scope,
      createdAt,
      ...(input.result.status === "completed"
        ? { completedAt: createdAt }
        : {}),
      findings: input.result.findings,
      evidence: input.result.evidence,
      recommendations: input.result.recommendations,
      missingContext: input.result.missingContext
    };

    this.analysisHistory.push({
      analysis,
      tenantId: input.tenantId,
      companyId: input.companyId,
      ...(input.cnpjId ? { cnpjId: input.cnpjId } : {}),
      subject: input.subject
    });
  }

  async explainAnalysis(request: ExplainAnalysisRequest): Promise<ExplainAnalysisResult> {
    return {
      schemaVersion: "1.0.0",
      analysisId: request.analysisId,
      explanation:
        "O histórico é evidência de comportamento anterior. A finalidade econômica desta operação ainda precisa ser confirmada antes de existir uma recomendação."
    };
  }
}
