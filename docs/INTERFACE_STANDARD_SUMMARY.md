# Platform interface standard

This repository follows five public-interface rules:

1. **Use established accounting and tax terminology.** Do not replace familiar professional terms with proprietary names without a clear reason.
2. **Keep presentation separate from operation.** `/` explains the product; operational and preview surfaces demonstrate the workflow.
3. **EVOLU is the company and brand. Platform and Intelligence are the two product names.** The operational interface belongs to Platform; contextual analysis and recommendation belong to Intelligence.
4. **Recommendations are not changes.** Decision, approval, execution and traceability remain explicit and separate.
5. **Infrastructure does not enter the core domain.** Vendor, database and mock names stay behind providers/adapters.

Public labels favor terms such as:

- Informações da empresa
- Informação pendente
- Histórico
- Evidências
- Conciliação
- Recomendação
- Aprovação
- Trilha de auditoria

Internal implementation may use technical contract names such as CompanyContext, Decision, ApprovalRecord, ActionCommand and AuditEvent.

The synthetic experience contains only fictitious data and preconfigured analyses. It does not constitute accounting, tax or legal advice.
