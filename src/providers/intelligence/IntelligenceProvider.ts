import type {
  AnalysisHistoryContext,
  DocumentAnalysisRequest,
  DocumentAnalysisResult,
  ExplainAnalysisRequest,
  ExplainAnalysisResult,
  ReconciliationAnalysisRequest,
  ReconciliationAnalysisResult
} from "../../contracts/index.js";

export interface IntelligenceProvider {
  requestDocumentAnalysis(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult>;
  requestReconciliationAnalysis(request: ReconciliationAnalysisRequest): Promise<ReconciliationAnalysisResult>;
  explainAnalysis(request: ExplainAnalysisRequest): Promise<ExplainAnalysisResult>;
  getAnalysisHistory(input: {
    tenantId: string;
    companyId?: string;
    cnpjId?: string;
  }): Promise<AnalysisHistoryContext>;
}
