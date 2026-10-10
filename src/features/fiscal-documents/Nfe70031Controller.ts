import type {
  ActionExecutionRequest,
  DocumentAnalysisContext,
  DocumentAnalysisResult
} from "../../contracts/index.js";
import type {
  ActionResult,
  ApprovalRecord,
  Decision,
  Recommendation
} from "../../domain/index.js";
import type { IntelligenceProvider } from "../../providers/intelligence/IntelligenceProvider.js";
import type { PlatformProvider } from "../../providers/platform/PlatformProvider.js";

export type Nfe70031Purpose =
  | "maintenance"
  | "production"
  | "internal_use"
  | "unknown";

export interface Nfe70031ControllerConfig {
  tenantId: string;
  companyId: string;
  cnpjId: string;
  documentId: string;
  pendingItemId: string;
  actor: string;
}

export interface Nfe70031LoadedState {
  context: DocumentAnalysisContext;
  analysis: DocumentAnalysisResult;
}

export class Nfe70031Controller {
  private analysis: DocumentAnalysisResult | null = null;
  private recommendation: Recommendation | null = null;
  private decision: Decision | null = null;
  private approval: ApprovalRecord | null = null;
  private purpose: Nfe70031Purpose | null = null;

  constructor(
    private readonly platform: PlatformProvider,
    private readonly intelligence: IntelligenceProvider,
    private readonly config: Nfe70031ControllerConfig
  ) {}

  async load(): Promise<Nfe70031LoadedState> {
    const context = await this.platform.getDocumentAnalysisContext({
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      documentId: this.config.documentId
    });

    const analysis = await this.intelligence.requestDocumentAnalysis({
      schemaVersion: "1.0.0",
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      documentId: this.config.documentId,
      purpose: "economic_purpose_review",
      requestedBy: this.config.actor
    });

    this.analysis = analysis;
    this.recommendation = analysis.recommendations[0] ?? null;

    return { context, analysis };
  }

  async recordPurpose(purpose: Nfe70031Purpose): Promise<DocumentAnalysisResult> {
    await this.platform.recordPendingInformation({
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      pendingItemId: this.config.pendingItemId,
      value: purpose,
      recordedBy: this.config.actor
    });

    this.purpose = purpose;
    this.decision = null;
    this.approval = null;

    const analysis = await this.intelligence.requestDocumentAnalysis({
      schemaVersion: "1.0.0",
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      documentId: this.config.documentId,
      purpose: "economic_purpose_review",
      requestedBy: this.config.actor
    });

    this.analysis = analysis;
    this.recommendation = analysis.recommendations[0] ?? null;
    return analysis;
  }

  async recordRecommendationDecision(
    value: "accept" | "reject"
  ): Promise<Decision> {
    if (!this.analysis || !this.recommendation) {
      throw new Error("recommendation_not_available");
    }

    const decision = await this.platform.recordDecision({
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      analysisId: this.analysis.analysisId,
      recommendationId: this.recommendation.recommendationId,
      decision: value,
      decidedBy: this.config.actor
    });

    this.decision = decision;
    this.approval = null;
    return decision;
  }

  async recordApproval(outcome: "approve" | "reject"): Promise<ApprovalRecord> {
    if (!this.decision || !this.recommendation) {
      throw new Error("decision_not_available");
    }

    const approval = await this.platform.recordApproval({
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      decisionId: this.decision.decisionId,
      subjectType: "Recommendation",
      subjectId: this.recommendation.recommendationId,
      outcome,
      actor: this.config.actor
    });

    this.approval = approval;
    return approval;
  }

  async executeApprovedAction(): Promise<ActionResult> {
    if (!this.approval || this.approval.status !== "approved") {
      throw new Error("approval_not_granted");
    }
    if (!this.purpose || this.purpose === "unknown") {
      throw new Error("economic_purpose_not_resolved");
    }

    const request: ActionExecutionRequest = {
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      authorization: {
        kind: "approval_record",
        approvalId: this.approval.approvalId
      },
      actionType: "record_economic_purpose",
      subjectId: this.config.documentId,
      payload: {
        economicPurpose: this.purpose
      },
      requestedBy: this.config.actor
    };

    return this.platform.requestActionExecution(request);
  }
}
