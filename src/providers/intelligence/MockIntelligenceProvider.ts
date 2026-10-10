import type {
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
  mockDocument
} from "../../mocks/scenarios/nfe-70031.js";
import type {
  Nfe70031EconomicPurpose,
  Nfe70031ScenarioState
} from "../../mocks/scenarios/nfe-70031.js";
import type { IntelligenceProvider } from "./IntelligenceProvider.js";

export class MockIntelligenceProvider implements IntelligenceProvider {
  constructor(
    private readonly scenarioState: Nfe70031ScenarioState = createNfe70031ScenarioState()
  ) {}

  async requestDocumentAnalysis(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult> {
    if (request.documentId !== mockDocument.documentId) {
      throw new Error("mock_document_not_found");
    }

    const purpose = this.scenarioState.economicPurpose;
    if (!purpose || purpose === "unknown") {
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
  }

  async requestReconciliationAnalysis(
    _request: ReconciliationAnalysisRequest
  ): Promise<ReconciliationAnalysisResult> {
    return {
      schemaVersion: "1.0.0",
      status: "completed",
      findings: [],
      evidence: [],
      recommendations: [],
      missingContext: []
    };
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
