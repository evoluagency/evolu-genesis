import type {
  AnalysisHistoryContext,
  AuditHistoryContext
} from "../../contracts/index.js";
import type { IntelligenceProvider } from "../../providers/intelligence/IntelligenceProvider.js";
import type { PlatformProvider } from "../../providers/platform/PlatformProvider.js";

export interface HistoryControllerConfig {
  tenantId: string;
}

export interface HistorySelection {
  companyId?: string;
  cnpjId?: string;
  periodId?: string;
  subject?: {
    type: string;
    id: string;
  };
}

export interface HistoryState {
  audit: AuditHistoryContext;
  analyses: AnalysisHistoryContext;
}

export class HistoryController {
  private state: HistoryState | null = null;

  constructor(
    private readonly platform: PlatformProvider,
    private readonly intelligence: IntelligenceProvider,
    private readonly config: HistoryControllerConfig
  ) {}

  async load(selection: HistorySelection = {}): Promise<HistoryState> {
    const [audit, analyses] = await Promise.all([
      this.platform.getAuditHistory({
        tenantId: this.config.tenantId,
        ...selection
      }),
      this.intelligence.getAnalysisHistory({
        tenantId: this.config.tenantId,
        ...(selection.companyId ? { companyId: selection.companyId } : {}),
        ...(selection.cnpjId ? { cnpjId: selection.cnpjId } : {})
      })
    ]);

    this.state = { audit, analyses };
    return this.state;
  }

  getCurrent(): HistoryState {
    if (!this.state) {
      throw new Error("history_not_loaded");
    }
    return this.state;
  }
}
