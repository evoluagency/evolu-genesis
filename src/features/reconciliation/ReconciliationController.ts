import type {
  ReconciliationAnalysisResult,
  ReconciliationContext
} from "../../contracts/index.js";
import type { PendingItem } from "../../domain/index.js";
import type { IntelligenceProvider } from "../../providers/intelligence/IntelligenceProvider.js";
import type { PlatformProvider } from "../../providers/platform/PlatformProvider.js";

export interface ReconciliationControllerConfig {
  tenantId: string;
  companyId: string;
  cnpjId: string;
  periodId: string;
  actor: string;
}

export interface ReconciliationLoadedState {
  context: ReconciliationContext;
  analysis: ReconciliationAnalysisResult;
}

export class ReconciliationController {
  private context: ReconciliationContext | null = null;
  private analysis: ReconciliationAnalysisResult | null = null;

  constructor(
    private readonly platform: PlatformProvider,
    private readonly intelligence: IntelligenceProvider,
    private readonly config: ReconciliationControllerConfig
  ) {}

  async load(): Promise<ReconciliationLoadedState> {
    const context = await this.platform.getReconciliationContext({
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      periodId: this.config.periodId
    });

    const analysis = await this.intelligence.requestReconciliationAnalysis({
      schemaVersion: "1.0.0",
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      periodId: this.config.periodId,
      requestedBy: this.config.actor
    });

    this.context = context;
    this.analysis = analysis;
    return { context, analysis };
  }

  async createFollowup(): Promise<PendingItem> {
    const context = this.getCurrentContext();
    const analysis = this.requireAnalysis();
    const finding = analysis.findings.find(
      item => item.type === "fiscal_accounting_difference"
    );

    if (!finding) {
      throw new Error("reconciliation_followup_not_required");
    }

    const capability = context.capabilities.canCreatePendingItem;
    if (!capability || capability.status === "forbidden") {
      throw new Error("canCreatePendingItem_forbidden");
    }
    if (capability.status === "unavailable") {
      throw new Error(
        `canCreatePendingItem_unavailable${capability.reasonCode ? `:${capability.reasonCode}` : ""}`
      );
    }

    const item = await this.platform.createReconciliationPendingItem({
      schemaVersion: "1.0.0",
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      reconciliationId: context.reconciliation.reconciliationId,
      findingId: finding.findingId,
      requestedBy: this.config.actor
    });

    this.context = await this.platform.getReconciliationContext({
      tenantId: this.config.tenantId,
      companyId: this.config.companyId,
      cnpjId: this.config.cnpjId,
      periodId: this.config.periodId
    });

    return item;
  }

  getCurrentContext(): ReconciliationContext {
    if (!this.context) {
      throw new Error("reconciliation_context_not_loaded");
    }
    return this.context;
  }

  getCurrentAnalysis(): ReconciliationAnalysisResult {
    return this.requireAnalysis();
  }

  private requireAnalysis(): ReconciliationAnalysisResult {
    if (!this.analysis) {
      throw new Error("reconciliation_analysis_not_loaded");
    }
    return this.analysis;
  }
}
