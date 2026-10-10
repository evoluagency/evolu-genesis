import type {
  DocumentAnalysisRequest,
  DocumentAnalysisResult,
  ExplainAnalysisRequest,
  ExplainAnalysisResult,
  ReconciliationAnalysisRequest,
  ReconciliationAnalysisResult
} from "../../contracts/index.js";
import {
  buildDocumentAnalysisResult,
  createNfe70031ScenarioState,
  mockDocument,
  type Nfe70031ScenarioState
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

    return buildDocumentAnalysisResult(this.scenarioState.economicPurpose);
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
