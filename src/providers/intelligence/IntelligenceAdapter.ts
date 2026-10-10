import type {
  AnalysisHistoryContext,
  DocumentAnalysisRequest,
  DocumentAnalysisResult,
  ExplainAnalysisRequest,
  ExplainAnalysisResult,
  ReconciliationAnalysisRequest,
  ReconciliationAnalysisResult
} from "../../contracts/index.js";
import {
  AdapterContractError,
  assertContext,
  assertFlatScope,
  record,
  requireArray,
  requireEqual,
  requireString
} from "../adapters/GatewayTransport.js";
import type { GatewayTransport } from "../adapters/GatewayTransport.js";
import type { IntelligenceProvider } from "./IntelligenceProvider.js";

/**
 * Intelligence is analytical only. This adapter has no Platform write pathway.
 * Its transport must enforce the caller's authorized scope server-side.
 */
export class IntelligenceAdapter implements IntelligenceProvider {
  constructor(private readonly transport: GatewayTransport) {}

  private async invoke<T>(operation: string, payload: unknown): Promise<T> {
    return await this.transport.invoke({ service: "intelligence", operation, payload }) as T;
  }

  private async analysis<T extends DocumentAnalysisResult | ReconciliationAnalysisResult>(
    operation: string,
    payload: DocumentAnalysisRequest | ReconciliationAnalysisRequest
  ): Promise<T> {
    const result = record(await this.invoke<unknown>(operation, payload));
    requireEqual(result.schemaVersion, "1.0.0", "adapter_schema_mismatch");
    requireString(result.analysisId);
    if (!["queued", "analyzing", "completed", "insufficient_context", "failed"].includes(String(result.status))) {
      throw new AdapterContractError("adapter_analysis_status_invalid");
    }
    requireArray(result.findings);
    requireArray(result.evidence);
    requireArray(result.recommendations);
    requireArray(result.missingContext);
    // These results do not carry root tenant scope in UX V1; the authorized
    // gateway MUST enforce tenant/CNPJ ownership before returning the result.
    return result as unknown as T;
  }

  requestDocumentAnalysis(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult> {
    return this.analysis("requestDocumentAnalysis", request);
  }

  requestReconciliationAnalysis(request: ReconciliationAnalysisRequest): Promise<ReconciliationAnalysisResult> {
    return this.analysis("requestReconciliationAnalysis", request);
  }

  async explainAnalysis(request: ExplainAnalysisRequest): Promise<ExplainAnalysisResult> {
    const result = record(await this.invoke<unknown>("explainAnalysis", request));
    requireEqual(result.schemaVersion, "1.0.0", "adapter_schema_mismatch");
    requireEqual(result.analysisId, request.analysisId, "adapter_subject_mismatch");
    requireString(result.explanation);
    return result as unknown as ExplainAnalysisResult;
  }

  async getAnalysisHistory(input: Parameters<IntelligenceProvider["getAnalysisHistory"]>[0]): Promise<AnalysisHistoryContext> {
    const result = assertContext(await this.invoke<unknown>("getAnalysisHistory", input), input);
    for (const entry of requireArray(result.entries)) {
      assertFlatScope(entry, input);
      if (input.subject) {
        const subject = record(record(entry).subject);
        requireEqual(subject.type, input.subject.type, "adapter_subject_mismatch");
        requireEqual(subject.id, input.subject.id, "adapter_subject_mismatch");
      }
      record(record(entry).analysis);
    }
    return result as unknown as AnalysisHistoryContext;
  }
}
