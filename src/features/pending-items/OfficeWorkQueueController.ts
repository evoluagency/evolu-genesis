import type {
  ApprovalContext,
  PendingItemsContext
} from "../../contracts/index.js";
import type { ApprovalRecord } from "../../domain/index.js";
import type { PlatformProvider } from "../../providers/platform/PlatformProvider.js";

export interface OfficeWorkQueueControllerConfig {
  tenantId: string;
  actor: string;
}

export interface OfficeWorkQueueSelection {
  companyId?: string;
  cnpjId?: string;
  periodId?: string;
}

export interface OfficeWorkQueueState {
  pending: PendingItemsContext;
  approvals: ApprovalContext;
}

export class OfficeWorkQueueController {
  private state: OfficeWorkQueueState | null = null;
  private selection: OfficeWorkQueueSelection = {};

  constructor(
    private readonly platform: PlatformProvider,
    private readonly config: OfficeWorkQueueControllerConfig
  ) {}

  async load(
    selection: OfficeWorkQueueSelection = {}
  ): Promise<OfficeWorkQueueState> {
    this.selection = { ...selection };

    const [pending, approvals] = await Promise.all([
      this.platform.getPendingItems({
        tenantId: this.config.tenantId,
        ...selection
      }),
      this.platform.getApprovals({
        tenantId: this.config.tenantId,
        ...selection
      })
    ]);

    this.state = { pending, approvals };
    return this.state;
  }

  async decideApproval(
    approvalId: string,
    outcome: "approve" | "reject"
  ): Promise<ApprovalRecord> {
    const state = this.requireState();
    const approval = state.approvals.approvals.find(
      item => item.approvalId === approvalId
    );

    if (!approval) {
      throw new Error("approval_not_in_current_queue");
    }
    if (approval.status !== "awaiting_approval") {
      throw new Error("approval_already_decided");
    }

    const companyId = approval.scope.companyId;
    const cnpjId = approval.scope.cnpjId;
    if (!companyId || !cnpjId) {
      throw new Error("approval_scope_incomplete");
    }

    const result = await this.platform.recordApproval({
      approvalId: approval.approvalId,
      tenantId: approval.scope.tenantId,
      companyId,
      cnpjId,
      ...(approval.scope.accountingPeriodId
        ? { accountingPeriodId: approval.scope.accountingPeriodId }
        : {}),
      decisionId: approval.decisionId,
      subjectType: approval.subjectType,
      subjectId: approval.subjectId,
      outcome,
      actor: this.config.actor
    });

    await this.load(this.selection);
    return result;
  }

  getCurrent(): OfficeWorkQueueState {
    return this.requireState();
  }

  private requireState(): OfficeWorkQueueState {
    if (!this.state) {
      throw new Error("office_work_queue_not_loaded");
    }
    return this.state;
  }
}
