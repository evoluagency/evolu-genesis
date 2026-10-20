# Platform — Contract-First Migration Plan v1

> Canonical architecture source: [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md). Architecture decisions must be updated there before or together with UX implementation.

## Current repository reality

The repository is now a hybrid contract-first Platform UX implementation.

The existing static/public surfaces remain deployable during migration, while the repository now also contains:
- package.json and TypeScript configuration
- src/domain
- src/contracts
- PlatformProvider / MockPlatformProvider
- IntelligenceProvider / MockIntelligenceProvider
- feature controllers for the migrated UX slices
- compiler-oriented preview runtime modules
- /demo/, /preview/ and /docs/

The remaining static/global-script structures are compatibility surfaces to be retired only after their corresponding contract-driven flows are complete.

The existing operational experience contains useful product semantics:
- Tenant branding (NEXUS)
- selected company (ACME Industrial)
- Fiscal Documents
- Accounting Entries
- Reconciliation
- public label “Informações da empresa”
- internal `context-ledger`
- contextual EVOLU panel
- explicit separation between suggestion and applied change

Therefore, do not rewrite the existing demo immediately.

## Migration rule

Preserve the current public demo while introducing the new contract-first structure alongside it.

legacy static demo
→ remains deployable
→ new src/domain/contracts/providers is introduced
→ features migrate one-by-one

Only remove legacy global-script structures after equivalent flows exist in the modular UX.

## Target structure

src/
  domain/
    tenant/
    company/
    fiscal/
    accounting/
    analysis/
    recommendation/
    approval/
    audit/

  contracts/
    contexts/
    requests/
    results/
    commands/
    events/
    capabilities/

  providers/
    platform/
      PlatformProvider
      MockPlatformProvider
    intelligence/
      IntelligenceProvider
      MockIntelligenceProvider

  mocks/
    scenarios/
    fixtures/

  features/
    portfolio/
    company-workspace/
    fiscal-documents/
    accounting-entries/
    reconciliation/
    pending-items/
    approvals/
    audit-history/
    evolu/

  components/
    domain/
    ui/

## Current → canonical mapping

| Current Platform concept | Canonical next concept |
|---|---|
| NEXUS tenant brand | Tenant instance |
| ACME Industrial | Company instance |
| implicit single CNPJ | explicit CnpjEntity |
| context-ledger internal page | CompanyInformation backed by CompanyContext |
| “Informações da empresa” | keep public label |
| “Informação pendente” | PendingItem |
| historical pattern | Evidence[] |
| suggestion/proposal | Recommendation |
| user confirmation | Decision or ApprovalRecord depending authority |
| “Alteração aplicada” | ActionResult + AuditEvent |
| EVOLU panel | EvoluPanel consuming IntelligenceProvider |
| guided deterministic flow | mocks/scenarios |
| static demo state | provider-backed contexts |

## First implementation slice

Migrate the existing NF-e 70031 / rolamento scenario first.

It exercises the full contract chain:

FiscalDocument
→ insufficient_context
→ PendingItem
→ Evidence
→ Recommendation
→ Decision
→ ApprovalRecord [when required]
→ ActionCommand with explicit authorization
→ ActionResult
→ AuditEvent

## Implementation order

### UX-0 Contract foundation
- add Domain Dictionary and Contract Catalog to /docs
- add initial domain/contract modules
- no visual change
- no backend connection

### UX-1 Providers
- PlatformProvider
- IntelligenceProvider
- mock implementations
- move deterministic synthetic data behind providers

### UX-2 Fiscal Document Detail
- migrate NF-e 70031
- model insufficient_context
- separate Recommendation, Decision, Approval and Execution
- pending information is recorded through PlatformProvider
- reanalysis is requested through IntelligenceProvider
- feature orchestration is isolated from presentation in Nfe70031Controller
- static preview runtime is compiler-generated from the typed source contracts

### UX-3 Company Workspace
- make Tenant → Company → CnpjEntity explicit
- use `CompanyWorkspaceContext` for company-scoped selection/navigation
- keep `CompanyContext` and specialized decision contexts CNPJ-scoped
- expose only authorized CNPJs and accounting periods through PlatformProvider
- preserve competence when switching CNPJ and preserve CNPJ when switching competence
- reject invalid canonical `cnpjId` or accounting-period deep links; legacy route aliases remain compatibility-only and never grant authorization
- keep legacy operational fixtures behind a temporary compatibility mapping until their own migration slice

### UX-4 Reconciliation
- preserve the existing reconciliation UX; do not create a parallel screen
- source values and provenance become Evidence
- differences become Finding with explicit evidenceRefs
- Intelligence may return missingContext but does not create operational work
- unresolved work becomes PendingItem only through an explicit Platform action
- reconciliation follow-up creation is idempotent and scope-validated
- the existing renderer consumes the contract-driven bridge with legacy data only as load-time fallback

### UX-5 Pending Items and Approvals
- reuse the Office workspace as the first-class work-queue surface; do not create a duplicate dashboard
- keep Pending Items and Approvals as separate contracts and activities
- every PendingItem and ApprovalRecord carries explicit operational scope
- filter queues by authorized tenant/company/CNPJ/accounting period
- formal approval updates the existing ApprovalRecord from awaiting_approval to approved/rejected
- ApprovalRecord never executes the authorized action; ActionCommand remains a separate step
- no generic Task domain

### UX-6 Audit and history
- preserve the existing NF-e audit timeline; do not create a parallel history page
- keep AnalysisHistoryContext and AuditHistoryContext as separate projections with separate authorities
- Intelligence owns analytical history; Platform owns the immutable operational audit log
- AuditEvent is an append-only Platform fact and never an execution authority
- query audit history by tenant/company/CNPJ/accounting period and stable subject reference
- record observed Intelligence analysis with finding/evidence/recommendation references
- record pending information, Decision, ApprovalRecord and ActionResult transitions
- use stable subject-based correlationId and explicit causationId where a prior record/authorization caused the event
- preserve end-to-end source/evidence/analysis/recommendation/decision/approval/action lineage
- the existing NF-e timeline renders AuditHistoryContext instead of maintaining a second local audit state
- HistoryController may aggregate the two projections for future reuse but must not merge their authorities

### UX-7 Replace mocks (candidate adapter boundary)
- PlatformAdapter and IntelligenceAdapter implement the unchanged provider interfaces
- a server-owned transport is injected; no production endpoint or credentials are assumed
- do not rewrite feature controllers or screen props
- the adapter boundary is implemented in an isolated branch; production transport and endpoint wiring remain blocked by documented authorization/runtime gates
- see [UX7_ADAPTER_BOUNDARY_V1.md](./UX7_ADAPTER_BOUNDARY_V1.md) for verification and release controls

## Conceptual lint

Reject:
- infrastructure-prefixed domain names
- Platform* entities
- Mock* outside mock/provider boundary
- companyId/cnpjId interchangeability
- generic pending status
- Recommendation carrying execution authority
- provider-specific fields in component props

## Acceptance test

Migration succeeds if:

MockPlatformProvider → PlatformAdapter
and
MockIntelligenceProvider → IntelligenceAdapter

can be swapped without modifying:
- screen names
- component props
- domain entity names
- user-visible workflow
- state-machine semantics


## Primeira fatia compartilhada: identidade do estabelecimento — 20/10/2026

O bloco de identificação da aba Informações de Company foi extraído para `src/features/company/CnpjIdentityView.ts`, sob o contrato existente `CnpjEntitySummary`. A prévia continua usando seu provider sintético explícito; hosts privados devem fornecer exclusivamente DTOs autorizados e conferir escopo/permissões antes da renderização. O componente não importa provider, mock, transporte, comandos ou credenciais.

`preview/shared-ux/company-identity.css` reutiliza os tokens de Company/Shell com seletores restritos à fatia e herda tema/marca do host. A prévia consome a mesma implementação pelo runtime versionado. Identidade exibe razão social, CNPJ e UF, sem inventar competência, perfil fiscal ou capacidade operacional.

Testes dirigidos: 14/14 de apresentação/runtime e 10/10 regressões de foco Company; TypeScript estrito da fatia e sintaxe do app aprovados. As verificações DOM locais não são browser, zoom 200%, revisão humana, autenticação privada ou E2E. HR-01…HR-06, homologação integrada e aceites de release continuam pendentes. Nenhuma rota/página removida, redirect, deploy ou alteração de flags.


## Segunda fatia: contexto empresarial do estabelecimento — 20/10/2026

O mesmo `CnpjIdentityView` recebe opcionalmente a identidade empresarial já contratada em `Company`, mantendo a assinatura anterior e os tokens. O nome de apresentação foi extraído do cabeçalho Company para `companyIdentityName`; não há segundo renderer. Company permanece identificado como empresa; o host privado Platform identifica seu DTO correspondente como grupo empresarial, valida tenant/grupo/CNPJ e projeta somente os campos disponíveis na origem. Nenhum status de negócio, competência, permissão ou vínculo é inferido pela Genesis.

A leitura de competência continua dependente de catálogo contábil e de `getCompanyWorkspaceContext` conectado; referência da consulta não é competência. O escopo novo é somente identificação do contexto empresarial, sem seleção ou comandos. Foram executados 24/24 testes do componente alterado (incluindo compatibilidade da primeira fatia), TypeScript estrito e sintaxe do app; não equivalem a browser privado, RLS/JWT ou aceite visual humano. As evidências anteriores, rotas, regras operacionais e bloqueios da V1 permanecem preservados.
