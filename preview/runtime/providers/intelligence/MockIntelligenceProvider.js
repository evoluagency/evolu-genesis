import { buildDocumentAnalysisResult, createNfe70031ScenarioState, mockDocument } from "../../mocks/scenarios/nfe-70031.js";
export class MockIntelligenceProvider {
    scenarioState;
    constructor(scenarioState = createNfe70031ScenarioState()) {
        this.scenarioState = scenarioState;
    }
    async requestDocumentAnalysis(request) {
        if (request.documentId !== mockDocument.documentId) throw new Error("mock_document_not_found");
        return buildDocumentAnalysisResult(this.scenarioState.economicPurpose);
    }
    async requestReconciliationAnalysis(_request) {
        return {
            schemaVersion: "1.0.0",
            status: "completed",
            findings: [],
            evidence: [],
            recommendations: [],
            missingContext: []
        };
    }
    async explainAnalysis(request) {
        return {
            schemaVersion: "1.0.0",
            analysisId: request.analysisId,
            explanation: "O histórico é evidência de comportamento anterior. A finalidade econômica desta operação ainda precisa ser confirmada antes de existir uma recomendação."
        };
    }
}
