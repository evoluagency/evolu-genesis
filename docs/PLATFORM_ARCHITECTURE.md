# Platform Architecture

**Status:** Canonical architecture document  
**Owner:** EVOLU  
**Products:** Platform, Intelligence  
**Version:** 0.24  
**Purpose:** single source of truth for the functional and navigation architecture of Platform.

---

## 1. Governance rule

This file is the canonical architecture source.

Rules:

- agreed decisions are written here;
- superseded decisions are edited or removed here;
- unresolved ideas stay explicitly marked as **Open**;
- external brands never define Platform domain concepts;
- new screens, modules, routes and navigation rules must be reconciled with this file before implementation;
- architecture changes should update this document before or together with UX implementation.

---

## 2. Product hierarchy

```text
EVOLU
├── Platform
└── Intelligence
      ↓
ORGANIZAÇÃO CLIENTE DA EVOLU
(Tenant)
      ↓
BusinessModel + OperatingModel
      ↓
Modules habilitados por TenantEntitlements
      ↓
CLIENTES DO TENANT
(Company)
      ↓
1..N CnpjEntity
```

Canonical meanings:

| Term | Meaning |
|---|---|
| EVOLU | Company |
| Platform | Operational product; state and execution authority |
| Intelligence | Analysis, evidence, recommendation and explanation product |
| Tenant | Organização cliente da EVOLU |
| BusinessModel | Business model of the Tenant; e.g. Contabilidade, Assessoria |
| OperatingModel | How the Tenant organizes and executes work; e.g. Departamental, Global, Híbrido |
| TenantEntitlements | Effective product/modules/capabilities enabled for the Tenant |
| UserPermissions | What a specific user is allowed to access or operate |
| Capabilities | Operations currently available/authorized in the active context |
| Company | Cliente atendido pelo Tenant |
| CompanyOnboarding | Fluxo de cadastro e configuração inicial de uma Company dentro do Tenant |
| CompanyAccess | Superfície externa operacional e configurável da empresa cliente, incluindo gestão empresarial quando habilitada |
| CnpjEntity | One tax/legal establishment associated with a Company |
| AccountingPeriod | Operational accounting/tax period |

Structural invariant:

```text
Tenant
└── Company
    └── 1..N CnpjEntity
```

`tenantId`, `companyId`, `cnpjId` and `cnpj` are never interchangeable.

---

## 3. Platform composition

Platform is composed of **Core + configurable Professional Modules**.

The module catalog is product architecture. Which modules are effectively available to a Tenant is determined by `TenantEntitlements`, informed by the Tenant's `BusinessModel` and `OperatingModel`.

### 3.1 Core

Core capabilities are transversal and are not sold as professional departments.

- Overview
- Clients
- Global Search
- Pending Items
- Approvals
- Audit
- Notifications
- Administration
- Integrations

### 3.2 Professional modules

**Confirmed**

- Fiscal
- Accounting

**Open / candidate**

- Financial
- Payroll / HR
- Legalization / Corporate
- Future modules

A module may be independently enabled or disabled by `TenantEntitlements`.

Canonical rule:

```text
BusinessModel
→ influences recommended product composition

OperatingModel
→ influences how enabled modules and capabilities are organized/presented

TenantEntitlements
→ determines what is effectively enabled

UserPermissions
→ determines what each user may access

Capabilities
→ determines what operations are available in the current context
```

Examples of `BusinessModel`:

- Contabilidade
- Assessoria
- future models without changing the canonical Tenant model

Examples of `OperatingModel`:

- Departamental
- Global
- Híbrido

---

## 4. Business model, operating model and commercial modularity

A `Tenant` é sempre a **Organização cliente da EVOLU**. `Contabilidade` e `Assessoria` são valores de `BusinessModel`, não sinônimos de `Tenant`.

```text
Tenant
├── BusinessModel
├── OperatingModel
├── TenantEntitlements
├── UserPermissions
├── Capabilities
└── Clients
    └── Company
        └── 1..N CnpjEntity
```

### 4.1 BusinessModel

`BusinessModel` identifies how the Tenant operates commercially.

Initial values:

- Contabilidade
- Assessoria

Esses são valores de `BusinessModel`; não substituem nem renomeiam o conceito canônico `Tenant`.

### 4.2 OperatingModel

`OperatingModel` identifies how work is structurally organized.

Initial values:

- Departamental
- Global
- Híbrido

Examples:

```text
BusinessModel: Contabilidade
OperatingModel: Departamental

TenantEntitlements:
├── Fiscal       enabled
├── Accounting   enabled
├── Payroll      enabled
└── Legalization enabled
```

```text
BusinessModel: Assessoria
OperatingModel: Global

TenantEntitlements:
├── Fiscal       enabled
├── Accounting   enabled
├── Financial    enabled
└── Reconciliation capability enabled
```

The same canonical module/capability may be presented differently according to `OperatingModel`; it must not be renamed into a new domain concept merely because the UX presentation changes.

### 4.3 Effective enablement

Keep separate:

```text
feature/module exists in EVOLU
≠ recommended by BusinessModel
≠ enabled by TenantEntitlements
≠ allowed by UserPermissions
≠ currently available through Capabilities
```

Disabled modules:

- do not appear in navigation;
- do not appear in global search as available product areas;
- do not expose commands;
- are not suggested by Intelligence as available functionality.

Canonical concepts remain:

- `TenantEntitlements`
- `UserPermissions`
- `Capabilities`

---

## 4.4 Access surfaces

Platform must distinguish internal Tenant access from external Company access.

```text
Tenant
├── Internal Users
│   └── TenantAccess
│
└── Companies
    └── Company
        ├── CompanyOnboarding
        └── CompanyAccess [optional]
```

### TenantAccess

`TenantAccess` is the internal operational surface for users of the Tenant.

It is governed by:

- `TenantEntitlements`
- `UserPermissions`
- `Capabilities`

It may expose all modules and transversal capabilities authorized for that user.

### CompanyOnboarding

`CompanyOnboarding` is the canonical flow used by an authorized Tenant user to register and configure a new `Company`.

Initial scope:

- create/select the Company identity;
- associate 1..N `CnpjEntity`;
- define initial `TaxProfile` when available;
- define enabled service/module scope for that Company when Tenant policy requires it;
- configure Company-specific data sources or integration overrides when necessary;
- register responsible contacts;
- validate required context before operational work begins.

`CompanyOnboarding` does not create a new Tenant. It creates/configures a Company inside an existing Tenant.

### CompanyAccess

`CompanyAccess` is the optional external operational workspace for users belonging to a `Company`. It can support direct business activity and management alongside document exchange. It is not limited to a read-only collaboration portal.

It must remain distinct from `TenantAccess`.

Canonical rule:

```text
Tenant user
≠ Company user
```

Company users may only access explicitly exposed capabilities.

Candidate capabilities:

- record authorized business activity (sales, purchases and expenses) when enabled;
- view business performance and financial/operational summaries when enabled;
- view Company information;
- view/request documents;
- answer information requests;
- respond to PendingItems assigned to the Company;
- view selected approvals when policy allows;
- view selected reports/status;
- interact with Intelligence only within an explicitly authorized Company scope.

Company users must not inherit Tenant-wide access, portfolio access, cross-Company search, Tenant administration, or unrestricted module navigation.

### Access boundary

```text
EVOLU
↓
Tenant
├── TenantAccess
│   └── Internal Users
│
└── Company
    └── CompanyAccess [optional]
        └── Company Users
```

Authentication implementation is a Backend concern. UX defines the access surfaces, roles, boundaries and expected navigation before Backend work begins.

---

## 4.5 Tenant configuration UX (Platform)

**Status:** proposed screen contracts and experience; canonical identity/access boundaries remain frozen.

A Tenant is the **Organização cliente da EVOLU**. The administrative experience has two distinct authorities:

1. **EVOLU configuration surface:** create/configure Tenant identity, `BusinessModel`, `OperatingModel`, `TenantEntitlements` and permitted white-label options. This is not exposed to a Tenant user.
2. **TenantAccess / Administration:** manage its own users, granted modules, operational organization, integration configuration and Company portfolio, always limited by `TenantEntitlements`, `UserPermissions` and `Capabilities`.

Neither surface determines commercial price, resale rights or billing; those decisions remain deferred.

### Tenant configuration matrix

| UX section | Canonical source/contract | EVOLU administration | Tenant administrator | Company user |
|---|---|---|---|---|
| Identity and BusinessModel | Tenant / BusinessModel | set during provisioning | view / request revision | no access |
| OperatingModel | OperatingModel | define allowed model | adjust only with explicit capability | no access |
| Modules | TenantEntitlements | enable/disable in prototype | view enabled/disabled and availability reason | no access |
| Functional controls | Capabilities | configure supported scope | operate only within entitlements and own permissions | only when exposed |
| White-label | Tenant identity/presentation | select available branding options | configure allowed assets/preferences | see published brand |
| Integrations | Source Category → Provider → Connector → Format | define available connector types | connect permitted sources; no secrets in UX | no Tenant connector management |
| Users and access | UserPermissions | administer owner/provisioning access | manage authorized Tenant users | no Tenant management |
| Clients | Company, CnpjEntity | inspect only when authorized | CompanyOnboarding and Company configuration | only own CompanyAccess |
| CompanyAccess | CompanyAccess | define supported surface | explicitly enable/assign per Company | access only published subset |

### Screen intent and navigation

```text
EVOLU administration
→ Tenant configuration
   → Identity / BusinessModel / OperatingModel
   → TenantEntitlements
   → Available branding options

TenantAccess
→ Administration
   → Organization preferences
   → Enabled modules
   → Users and access
   → Integrations

TenantAccess
→ Clients
   → CompanyOnboarding / Company configuration
```

Selecting `BusinessModel` or `OperatingModel` changes the recommended layout/presentation; it must never silently alter `TenantEntitlements`, `UserPermissions` or actual authorization.

### First UX preview: TenantConfiguration

- Default synthetic context: Tenant with `BusinessModel=Contabilidade`, `OperatingModel=Departamental`.
- Controls: change the simulated `OperatingModel`, inspect module availability and preview the resulting menu.
- Simulated enabled modules: Fiscal, Contábil. Other modules appear clearly unavailable rather than pretending to be purchased or operational.
- View the Company-level access path without allowing Tenant users to grant unknown privileges.
- Responsive mobile/desktop; light and dark presentation; PT-BR as primary language.
- Explicit synthetic/demo indication; no real configuration persistence.
- Every visible enabled control must perform a meaningful simulated interaction or explain unavailability.

### UX behavior and state requirements

- `ResourceState`: idle, loading, ready, empty, error, forbidden.
- Disabled by entitlement and forbidden by permission must be distinct.
- Any unsaved simulated modification must be visible and reversible.
- Switching OperatingModel affects the navigation preview, not the underlying Company/CNPJ identities.
- Configured provider/brand names are data labels; they never become modules or canonical domain entities.
- The Interface may show available modules, but the Backend must eventually enforce authorization; hiding a menu is not a security control.

---

## 5. Client operational context

## 5.1 CompanyOnboarding flow

`CompanyOnboarding` is a guided configuration flow initiated from `Clients`.

Primary navigation:

```text
Overview
→ Clients
→ New Company
→ CompanyOnboarding
```

Target navigation budget:

- access onboarding: <= 2 clicks from Overview;
- create a minimal operational Company: one guided flow;
- avoid forcing users to navigate across multiple modules during setup.

### Onboarding stages

```text
1. Company Identity
2. CnpjEntity
3. Business / Tax Context
4. Service Scope
5. Data Sources
6. Responsible Contacts
7. Review
8. Activate
```

#### 1. Company Identity

Purpose:

- identify the client business;
- create the canonical `Company`.

Candidate fields:

- legal name;
- trade name;
- internal reference/code;
- business segment;
- responsible contact.

#### 2. CnpjEntity

Purpose:

- associate one or more tax/legal establishments.

Canonical rule:

```text
Company
└── 1..N CnpjEntity
```

The onboarding flow must support adding the first CNPJ and later adding additional `CnpjEntity` records without creating a new Company.

#### 3. Business / Tax Context

Purpose:

- create the initial business context required by enabled modules.

Candidate inputs:

- tax regime;
- state/municipal registration when relevant;
- activity context;
- initial `TaxProfile`;
- reference/effective date.

Unknown information must be allowed when the workflow can continue safely; missing information should become explicit `PendingItem` or `missingContext`, not fabricated data.

#### 4. Service Scope

Purpose:

- define which Tenant-enabled modules/capabilities apply to the Company.

Canonical distinction:

```text
TenantEntitlements
= what the Tenant has contracted

Company service scope
= what the Tenant chooses to deliver to this Company
```

The Company service scope cannot enable a module that is disabled in `TenantEntitlements`.

**Status:** the exact canonical contract name for Company-level service scope is still open and must not be invented until approved.

#### 5. Data Sources

Purpose:

- select inherited Tenant integrations;
- configure Company-specific overrides when required.

```text
TenantIntegration
↓ inherited by default
CompanyIntegrationOverride
↓ only when necessary
```

Providers remain provenance/configuration details and do not define domain navigation.

#### 6. Responsible Contacts

Purpose:

- identify contacts who may receive information requests, PendingItems or future `CompanyAccess`.

This does not automatically create CompanyAccess credentials.

#### 7. Review

The user reviews:

- Company identity;
- CNPJ structure;
- tax/business context;
- service scope;
- data sources;
- contacts;
- missing information.

#### 8. Activate

Activation creates the operational Company context.

Activation must not silently infer missing tax/business facts.

After activation:

```text
CompanyOnboarding
→ CompanyWorkspace
```

---

## 5.2 CompanyAccess architecture

`CompanyAccess` is a separate UX surface from `TenantAccess`.

Primary purpose:

- expose only the actions/information the Tenant intentionally makes available to users of one Company.

### Entry surface

```text
CompanyAccess Entry
→ authentication
→ CompanyAccessHome
```

Authentication mechanics remain Backend scope; UX defines the experience and authorization expectations.

### Initial navigation proposal

CompanyAccess must prioritize the **Company's Financial area** in the first visual release. The Company may keep its existing point-of-sale, commercial system, invoicing software or ERP. A sales system is **not required** to be built into Platform and direct sales entry is **not a prerequisite** for financial/accounting collaboration.

```text
CompanyAccess [Tenant-branded]
├── Home / Financial Overview
├── Financeiro
│   ├── Movimentações e extratos
│   ├── Contas a pagar e receber [when enabled]
│   ├── Despesas e custos
│   ├── Entradas / recebimentos
│   ├── Documentos e comprovantes
│   └── Importação / integrações
├── Requests / Pending Items
├── Company Information
├── Reports / Status [when exposed]
├── Approvals [when exposed]
└── Sales / Invoice issuance / POS / Inventory [future optional extensions]
```

Company-facing Financeiro is a **V1 UX priority** but does not imply a complete financial ERP or a separately licensed production Financial module. Sales, fiscal document issuance, POS and Inventory remain optional future capabilities; prototypes must not display them as V1 deliverables by default. Financial incoming sales/receipts information may originate from an external ERP, fiscal documents, bank source or authorized manual entry, with provenance and accounting differences preserved.

### CompanyAccessHome

The home surface should prioritize authorized financial data and actionable items, adjusted to enabled capabilities.

Candidate blocks:

- financial summary: receipts, payments, expenses, pending items and the reference period;
- shortcuts to imports, uploads and authorized financial entry;
- requests awaiting response;
- documents requested or received;
- approvals awaiting the Company;
- service/processing status;
- recent communications or relevant events.

### Requests

Maps external-user work to canonical `PendingItem` records when applicable.

Examples:

- provide missing information;
- upload/request a document;
- confirm economic purpose;
- respond to a clarification;
- validate company-provided information.

### Documents

External users may:

- view documents intentionally exposed by the Tenant;
- provide requested documents;
- follow document-request status.

They do not automatically receive access to all `FiscalDocument` or accounting records.

### Company Information

Allows the Company user to:

- view selected Company/CNPJ information;
- propose or submit updates when allowed;
- provide missing context.

A Company user submission is not automatically trusted as an executed domain change. It may create a request, evidence item, pending review or approval according to workflow.

### Approvals

Optional capability.

Only explicitly exposed approval subjects may appear.

`CompanyAccess` must never expose Tenant-level approvals unrelated to that Company.

### Reports / Status

Optional capability.

This surface may present:

- service progress;
- selected reports;
- closing status;
- selected fiscal/accounting outputs.

The exact report catalog remains module/entitlement dependent.

### White-label presentation

The default CompanyAccess brand is **the Tenant's own brand**, not EVOLU. Tenant name and visual identity appear in the Company-facing experience; no mandatory EVOLU logo, "powered by EVOLU", footer or vendor identification should be shown. EVOLU remains identifiable to the Tenant as its software licensor where contract/administration requires it. The Company-facing experience can appear to be the Tenant's own system.

Custom domains and optional Company-level branding are technical UX options still to be validated; their availability is not presumed.

### External-user isolation

Canonical access boundary:

```text
CompanyUser
→ exactly one authorized Company scope by default
→ authorized CnpjEntity scope
→ explicitly exposed capabilities
```

No implicit access to:

- Tenant portfolio;
- other Companies;
- Tenant administration;
- global integrations;
- global audit;
- unrestricted Intelligence;
- modules not exposed to the Company.

**Status:** navigation structure is proposed; capability exposure remains configurable and requires further validation.

---



The persistent operational context is:

```text
Tenant
↓
Company
↓
CnpjEntity
↓
AccountingPeriod
```

These must not become unnecessary navigation levels.

Preferred UX:

```text
[Company ▾] [CNPJ ▾] [Competência ▾]
```

They act primarily as persistent context selectors.

---

## 5.3 Company configuration UX (Platform)

**Status:** proposed UX configuration flow; not a new product nor a replacement for `CompanyOnboarding`.

`CompanyOnboarding` creates/configures the Company for initial operation. `CompanyConfiguration` (screen concept only) allows authorized Tenant users to review/edit its configuration later.

### Company configuration matrix

| Section | Purpose | Source/constraint | CompanyAccess exposure |
|---|---|---|---|
| Identity | Company legal/trade names, industry and responsible contacts | Company / CompanyContext | only authorized information |
| CNPJs | show and manage 1..N fiscal establishments | CnpjEntity; no CompanyId/CnpjId interchangeability | only authorized CNPJs |
| Tax context | effective tax regime and relevant characteristics | TaxProfile with dates and provenance | selected read/request information |
| Service scope | enable Company workflows from a subset of Tenant-authorized modules | bounded by TenantEntitlements | published services only |
| Sources | inherit Tenant integrations or use specific approved Company override | Source Category → Provider → Connector | document submission where allowed; not connector secrets |
| External access | invite/revoke Company users, restrict visible pages | CompanyAccess, UserPermissions, Capabilities | only explicitly allowed actions |
| Pendências | surface unresolved data needed to proceed | PendingItem | assigned/exposed items only |
| History | review changes and approvals | AuditEvent / ApprovalRecord | restricted items, not Tenant-wide audit |

### Company-level scope is not a second entitlement system

```text
TenantEntitlements
→ maximum modules/capabilities available
→ authorized Company service scope [canonical contract name still Open]
→ UserPermissions
→ active Capabilities
→ visible CompanyAccess
```

The screen must not invent a new paid plan, confer privileges by changing a toggle, or grant access to other Companies. `CompanyAccess` is optional and cannot be created merely by recording a contact.

### Journey and click budget

```text
TenantAccess / Clients
→ Company
→ Company configuration
   ├── Identity & CNPJs
   ├── Service scope
   ├── Data sources
   └── CompanyAccess
```

From the Tenant Overview, opening Company configuration should require no more than 3 meaningful interactions through a normal path, with direct access from Client search and CompanyWorkspace. Changing tabs does not create deeper navigation hierarchy.

### UX validation cases

1. Tenant with only Fiscal and Contábil cannot expose Financial, Payroll or Legalization to a Company.
2. A Company with two CNPJs remains one Company and can change selected CNPJ without leaving its workspace.
3. Company A user never sees Company B data, portfolio search or Tenant administration.
4. A pending CompanyAccess invitation does not imply an active authorized session.
5. Company user submits missing economic purpose: it becomes information/evidence for review, not a silently executed tax classification.
6. Changing the Company industry alters suggested context, not the Tenant BusinessModel or all other Companies.
7. Integrations can be displayed by generic source category with concrete provider shown as provenance/configuration.
8. No Company configurations are stored or sent to a production system during synthetic UX previews.

### Prototype order

- UX-CFG-1: TenantConfiguration (EVOLU/Tenant authority distinction, modules and OperatingModel preview).
- UX-CFG-2: CompanyOnboarding (guided configuration).
- UX-CFG-3: CompanyConfiguration (CNPJ, scope, sources and CompanyAccess).
- UX-CFG-4: CompanyAccessHome (external user perspective).
- UX-CFG-5: CompanyFinancialWorkspace (finance input, source status, handoff to accounting/advisory), after CompanyAccessHome user review.

One page at a time: create responsive, interactive synthetic preview → test → provide preview link → user review → then start the next page. An explicit "next step" instruction allowed preparing UX-CFG-3 while UX-CFG-2 remains open for review; do **not** infer approval for UX-CFG-2 or UX-CFG-3. Likewise, the user instructed continuation to UX-CFG-4, which authorizes prototype construction but does not by itself constitute acceptance of all earlier pages. Preserve the final review gate.

UX-CFG-3 preview source:
- `https://github.com/evoluagency/evolu-genesis/blob/main/preview/company-configuration/index.html`
- Intended static Pages location: `https://evoluagency.github.io/evolu-genesis/preview/company-configuration/` (actual public deployment availability must be verified independently; repository publication does not by itself prove Pages propagation).

UX-CFG-3 simulated interactions:
- switch between two synthetic Company records, each with separate Company/CnpjEntity context;
- review/edit identity and 1..N CNPJ records; CNPJ additions remain visibly fictitious;
- configure Fiscal, Accounting and Company Financeiro within the example Tenant's enabled scope; Payroll, Sales/Invoicing and Inventory remain unavailable;
- simulate manual, file, ERP, fiscal-document-provider and bank data sources without real connectors;
- enable/disable CompanyAccess and prepare local-only user invitations and roles;
- preview the Tenant-only branded external navigation; simulate configuration review/save and reset;
- PT-BR/EN; light/dark; responsive viewport.

Acceptance risk to review: Financeiro is a Company-facing V1 UX priority and not the grant of an undeclared paid Financial module. Provider status, invitation preparation and simulated save never imply live operations.

### UX configuration acceptance register

| UX stage | State | Evidence / next gate |
|---|---|---|
| UX-CFG-1 TenantConfiguration | Approved by user after reviewing preview | retain approved experience; no Backend |
| UX-CFG-2 CompanyOnboarding | Interactive preview ready for user review | `preview/company-onboarding/index.html`; eight stages, synthetic activation; awaiting explicit UX review |
| UX-CFG-3 CompanyConfiguration | Interactive preview created; pending user review | `preview/company-configuration/index.html` published as a static source on `main`; synthetic configuration only, do not consider approved |
| UX-CFG-4 CompanyAccessHome | Interactive static prototype ready for user review; not approved | `preview/company-access-home/index.html` on `main`; links to mock Home / Finance / Documents / Requests / Information, no live services |
| UX-CFG-5 CompanyFinancialWorkspace | Interactive static prototype ready; user review pending | `preview/company-financial-workspace/index.html` on main; Company finance → authorized Tenant accounting/fiscal → advisory; no live API, Backend or tax calculations |
| UX-NAV-1 Journey and access review | Interactive static navigation and access-preview published; user review pending | `preview/ux-journey/index.html` on main, five synthetic roles, access boundaries and links to existing pages |
| UX-ACCESS-1 Company consultation and scoped navigation | Static previews updated; awaiting user review | Home `?mode=read`, Finance `?role=viewer`; CNPJ/competence links, blocked mock write actions; no secure authorization |
| UX-FLOW-1 Versioned Finance / Accounting / Advisory handoff | Interactive prototype ready; awaiting user review | `preview/company-financial-workspace/index.html`: submission versions, questions, evidence review, professional advisory release; synthetic only |
| UX-SHELL-1 / UX-OFFICE-1 Shared shell and Tenant office home | Source published; **awaiting visual user review** | `preview/shared-ux/` + `preview/office-workspace/`, ACME-only synthetic scope; no Backend, no real authorization |

### UX-CFG-4 CompanyAccessHome prototype

- Source: `https://github.com/evoluagency/evolu-genesis/blob/main/preview/company-access-home/index.html`.
- Intended Pages URL: `https://evoluagency.github.io/evolu-genesis/preview/company-access-home/` (public propagation must be checked; repository creation alone does not prove a live deployment).
- Tenant white-label only: the Company sees **NEXUS**, not the EVOLU vendor. The owner/recipient of the license is the Tenant; external Company user scope stays within ACME Industrial's two authorized CNPJ entities.
- A financial-first dashboard summarizes illustrative recorded inflows, outflows, difference between movements, open Company information requests, activity and source provenance. **The movement difference is not a bank balance, accounting profit or taxable revenue.**
- Interactive prototype elements: authorized CNPJ selection, month/competence selection, simplified Finance view, document list, Requests, Company information; synthetic expense entry, document record and request answer; light/dark and PT-BR/EN.
- Source entries explicitly distinguish synthetic/manual records and simulated ERP/bank data from a real connected provider; no live API, credentials, accounting entries, authorization or tax classification.
- The Finance tab is a **preview**, not the complete CompanyFinancialWorkspace; full financial input, payable/receivable, integration configuration, source reconciliation and Tenant handoff remain UX-CFG-5.
- Acceptance cases: 1) different selected CNPJ/period alters scoped records, 2) external user sees no Tenant portfolio or administration, 3) no mandatory EVOLU branding, 4) simulated record adds no tax conclusion, 5) answered requests are removed from pending counts, 6) no production persistence or API.
- User review of UX-CFG-4 remains pending; do not mark it approved automatically.

### UX-CFG-5 CompanyFinancialWorkspace interactive prototype

- Source: `https://github.com/evoluagency/evolu-genesis/blob/main/preview/company-financial-workspace/index.html`.
- Intended Pages URL: `https://evoluagency.github.io/evolu-genesis/preview/company-financial-workspace/` (web availability is not guaranteed solely by committing to main; inspect hosting separately).
- Tenant white-label presentation uses fictitious **NEXUS**, without obligatory EVOLU attribution to the Company.
- **Company Financeiro**: scoped finance dashboard with recorded inflows/outflows, open payables/receivables, ledger movements, simulated manual movements, commitments, imported sample batches and handoff to the accounting firm.
- **Source intake**: sample bank and ERP batches create financial movements with origin references; sample fiscal documents remain **separate evidence/document records**, never silently booked as cash inflows, sales or taxable revenue. Duplicate source references within Company/CNPJ/competence are skipped.
- **Tenant Contábil/Fiscal**: synthetic view of the same Company-scoped information, unresolved information requests, review status, imported fiscal evidence, provenance and pending pre-closing; user-initiated review does not mean tax treatment has been proven.
- **Tenant Assessoria**: evidence/context summary displays `insufficient_context` until professional data validation; no calculated tax credits or automatic projections are invented.
- **Interactive sample flows**: CNPJ and competence selectors, navigation per active simulated role, manual movement entry, payables/receivables registration, synthetic source batches, finance-to-accounting handoff, requests for clarification, Company responses, review marking, activity history and PT-BR/EN + light/dark display.
- **Role preview control is a DEMO-ONLY inspection function**. It is explicitly not production role switching or permission escalation: in production `CompanyAccess` and `TenantAccess` must be separate authenticated/authorized sessions.
- The prototype contains no real ERP/SIEG/bank integration, file upload, credentials, persistence, fiscal document issuance, Backend connection or executed tax classification.
- Script compilation was checked after publication; a public GitHub Pages load could not be verified in the current inspection. Runtime/visual acceptance by the user is still pending.
- UX-CFG-2, -3 and -4 also remain pending explicit acceptance; creating UX-CFG-5 on a user continuation instruction does not imply any previous approval.
- **Next boundary:** after this review, close the remaining navigation, roles/permissions and financial data-state UX gaps before the final UX gate. Backend remains prohibited until explicit user approval.

Acceptance checks for UX-CFG-2:

- Company identity, multiple CNPJ records, TaxProfile with `insufficient_context` / pending fields when unknown;
- service scope limited to enabled TenantEntitlements (Fiscal and Contábil in synthetic preview);
- data-source categories separated from providers;
- contacts never create CompanyAccess automatically;
- review before simulated activation, with explicit outstanding information;
- all writes remain in browser memory, no Backend/API; no real company creation;
- PT-BR/EN, dark/light, responsive, and clear step navigation.

This register tracks page-level UX reviews only. The final cross-UX user review gate in section 16 still applies before any Backend work.


---

## 6. Module architecture

### 6.1 Fiscal

Current proposed scope:

- Fiscal Documents
- Tax Assessment
- Tax Classifications
- Tax Benefits

Canonical entities include:

- FiscalDocument
- FiscalDocumentItem
- TaxClassification
- TaxProfile
- Evidence
- Analysis
- Recommendation

NF-e, CT-e, NFS-e, NFC-e, inbound/outbound, supplier, date, status and tax type are filters/types — not sidebar hierarchy by default.

### 6.2 Accounting

Current proposed scope:

- Accounting Entries
- Periods
- Closing
- Statements

Canonical entities include:

- AccountingEntry
- AccountingPeriod
- Reconciliation
- Evidence
- Analysis

DRE, result views, CMV and comparisons should preferably be internal views/tabs unless a future workflow justifies separate navigation.

### 6.3 Financial UX priority and candidate professional modules

**Confirmed V1 UX surface:** CompanyAccess Financeiro, its source intake and the handoff to the Tenant's Fiscal/Accounting/Advisory workflows. This is an approved **visual UX scope**, not a commitment to a full ERP or to production implementation.

**Still open:** whether Financial later becomes a standalone professional module with its own TenantEntitlements or remains a Company-facing workflow plus shared capabilities.

**Other candidate modules, not approved for V1:** Payroll / HR, Legalization / Corporate.

The financial screen must not silently enable a module that the Tenant has not contracted; a synthetic V1 prototype explicitly simulates the Company finance intake capability within the authorized Company service scope.

### 6.4 Module configuration rule

Modules are configurable according to the Tenant's business context, but the canonical domain names do not change by customer.

```text
BusinessModel + OperatingModel
→ recommended composition/presentation

TenantEntitlements
→ enabled modules/capabilities

UserPermissions
→ per-user access

Capabilities
→ available operations in active context
```

Do not create parallel names such as `DepartmentPackage`, `BusinessFeature` or `ModuleAccessModel` when the existing canonical concepts already express the requirement.

---

## 6.5 Cross-industry ecosystem strategy

**Status: strategic direction frozen; implementation scope remains open.**

Platform and Intelligence remain the two EVOLU products. The business model remains a configurable white-label offering. Product evolution must not be reduced to a single reconciliation tool or a replacement for one accounting-system provider.

The same Platform architecture must support Companies from different sectors without changing canonical identity and context contracts:

```text
EVOLU
├── Platform
└── Intelligence
       ↓
Tenant (Organização cliente da EVOLU)
       ├── BusinessModel / OperatingModel
       ├── TenantEntitlements / UserPermissions / Capabilities
       └── Company (Cliente atendido pelo Tenant)
            ├── 1..N CnpjEntity
            ├── CompanyContext / AccountingPeriod
            ├── shared enabled services
            └── sector-specific experiences [optional]
```

### Shared vs. sector-specific

**Shared:** Company identity, CNPJ, competencies, fiscal documents, accounting, information requests, approvals, evidence, audit, data sources and contextual Intelligence.

**Sector-specific (candidate, not V1 commitment):** manufacturing/production, retail/inventory, pet services/appointments, and future vertical workflows.

Sector-specific screens may use canonical Company context and compatible UX Contracts, but must not contaminate shared domain naming or cause all sectors to receive irrelevant modules.

A Company industry/operating profile influences recommended workflows; effective feature access still depends on TenantEntitlements, UserPermissions and Capabilities, including Company-level service scope when approved. A `BusinessModel` describes the Tenant, not the industry of every Company in its portfolio.

### Additional downstream experiences

A Company may later offer selected tools to its own customers/users. This is an **optional additional access surface**, not automatic reuse of `TenantAccess` or `CompanyAccess` and not a new mandatory domain hierarchy.

No downstream user automatically inherits Company, Tenant or cross-Company permissions. Identity, access boundary, contractual responsibility, data ownership and the canonical name of that user/context remain **Open** until explicitly decided.

### Ecosystem scope guardrails

- Preserve the white-label Tenant → Company relationship and contextual Intelligence.
- Keep core workflows provider-agnostic; Domínio/ONVIO/SIEG are third-party integrations or competitors, not canonical module names.
- Support industries through configuration and deliberate extensions, not a promise to implement every sector in V1.
- Share authorized context across enabled modules without duplicating Company/CnpjEntity facts.
- Do not begin Backend until the UX completion and user-review gate in section 16 is met.

---

## 6.6 Tenant distribution and Company value proposition

**Status:** white-label distribution direction frozen; resale, billing, pricing and commercial terms explicitly deferred until product and cost/market evidence are ready.

EVOLU continues to offer the two products `Platform` and `Intelligence` through a configurable white-label architecture. A `Tenant` may use them internally and make selected capabilities available to its own `Company` clients as part of the services it delivers.

This is a distribution relationship, not a new identity hierarchy or a mandatory separate product:

```text
EVOLU
├── Platform
└── Intelligence
       ↓ technology and contractual relationship
Tenant = Organização cliente da EVOLU
       ├── TenantAccess: own operation
       ├── enabled modules and capabilities
       └── Company portfolio and service delivery
              ↓ configured services and authorized access
          Company = Cliente atendido pelo Tenant
              ├── CompanyAccess (optional)
              ├── 1..N CnpjEntity
              ├── Company-specific service scope
              └── selected experiences and workflows
                    ↓ optional future extension, NOT automatic
                 Customers/users of the Company
```

### Commercial roles (not domain renames)

| Participant | Role | Potential value |
|---|---|---|
| EVOLU | supplies and maintains products; provisions Tenant configurations | recurring software revenue |
| Tenant | contracts EVOLU; operates its work; may package authorized technology with professional services | operational efficiency, service differentiation and possible additional revenue |
| Company | receives professional service and may access configured digital capabilities | better visibility, structured requests, documents and collaboration |
| Customers/users of Company | possible future audience for additional sector-specific applications | only with separately designed access and commercial terms |

`BusinessModel` continues to describe the Tenant (e.g. Contabilidade, Assessoria); the activity/industry of each `Company` may differ (industry, retail, pet services, etc.). These are not interchangeable concepts.

### Tenant product configuration and Company provisioning

The UX must support the following conceptual flow, without prescribing Backend implementation:

```text
EVOLU configures Tenant
→ BusinessModel + OperatingModel
→ TenantEntitlements
→ white-label identity and enabled integrations
→ Tenant configures offered services
→ CompanyOnboarding
→ select Company-level service scope (subset of Tenant entitlements)
→ authorize CompanyAccess and related users only if offered
→ Company receives a coherent set of digital workflows
```

`TenantEntitlements` determines what is contracted and enabled for the Tenant. Company-level service scope cannot grant a module/capability that the Tenant does not have. `UserPermissions` and `Capabilities` continue to control individual access/actions. The canonical **contract name** for Company-level service scope remains open.

The Tenant may offer different compositions to Companies from different sectors without creating copies of Platform or duplicating the canonical Company/CnpjEntity data model.

### Commercialization decision gate — deferred

Commercialization mechanics are **out of scope for the current UX design cycle**. Platform and Intelligence remain a configurable white-label ecosystem with `TenantAccess`, `CompanyOnboarding` and optional `CompanyAccess`; these experiences do not require a pricing, resale or billing policy to be designed.

**Do not decide or implement at this stage:**

- prices, markup, revenue-sharing or commissions;
- whether the Tenant charges its Company clients separately for access;
- paid plans, limits, per-module/per-Company/per-user/usage charging;
- sublicensing, resale permissions, revenue guarantees or commercial packaging.

**Reopen commercial decisions only after:**

1. the planned UX is completed and explicitly reviewed/approved by the user;
2. the product has a functional version with validated workflows (Backend only after the UX gate);
3. operating costs are quantified by meaningful drivers such as Tenant, Company, documents, storage, processing, Intelligence calls and support;
4. relevant market offerings, positioning and willingness to pay have been assessed.

Do not let deferred commercial questions block `TenantEntitlements`, `UserPermissions`, `Capabilities`, modules, scopes or access surfaces: these are product/UX constructs, not billing promises.

### Remote customer acquisition and service delivery

Digital expansion beyond the Tenant's immediate geographic market is an **opportunity**, not a guaranteed competitive advantage.

To support an effective remote model, the UX should account for:

- remote Company onboarding and invitation;
- requests for documents and missing economic context;
- PendingItems, document exchange, statuses and notifications;
- asynchronous clarifications, decisions and approvals;
- operational progress visibility for the Tenant and Company;
- coherent mobile and desktop experiences;
- authorizations, data protection and applicable professional/jurisdictional requirements.

The Tenant remains accountable for the professional services it provides; the Platform interface must not imply that EVOLU automatically becomes the Company's accounting service provider.

### UX implications to map before Backend

| Surface | Required UX decision |
|---|---|
| EVOLU administrative configuration | configure Tenant, branding, modules and entitlements |
| TenantAccess — Administration | view enabled modules and configure offered services per Company |
| TenantAccess — CompanyOnboarding | provision Company, CNPJ, service scope, responsible contacts, sources and optional CompanyAccess |
| TenantAccess — CompanyWorkspace | see contracted/available services, requests, operational progress and client access status |
| CompanyAccess — Home | show Tenant-branded business dashboard, enabled sales/purchases/expenses and pending collaboration |
| CompanyAccess — Business Operations | simulate permitted sales, purchases, expenses and Tenant-side consumption of data, without Backend |
| CompanyAccess — Financial Overview | display available Company financial context and permitted indicators |
| CompanyAccess — Requests / Documents | support asynchronous information exchange without exposing other Companies |
| Intelligence | respect TenantEntitlements, Company service scope, UserPermissions and Capabilities |
| Optional downstream experiences | require separate UX, contracts and permission boundary before inclusion |

### Scope and risk controls

- Platform and Intelligence remain the only named EVOLU products in this architecture.
- No new technical entity is created merely to describe resale/distribution.
- `TenantAccess` and `CompanyAccess` remain distinct; neither implies a Company customer's access.
- CompanyAccess defaults to the Tenant's brand with no mandatory EVOLU attribution; custom domains, Company brand variants and extra sublicensing rights remain open.
- Customer ownership, consent/data governance, support responsibility and multi-region professional requirements remain open contractual/operational decisions. Billing/pricing/resale are deferred by the commercial decision gate above.
- Do not treat planned partner resale or additional Company capabilities as delivered features.
- Preserve the UX completion review gate before any Backend implementation.

---

## 6.7 White-label licensing, Company operations and the three repositories

**Status:** user-confirmed licensing topology, proposed Company operation UX; detailed module scope and pricing remain open.

```text
EVOLU [licenses Platform + Intelligence technology]
└── Tenant [Contabilidade / Assessoria = EVOLU licensee]
    ├── TenantAccess [staff, portfolio, fiscal/accounting/advisory work]
    ├── Company A [1..N CnpjEntity]
    │   └── CompanyAccess [Tenant-branded, enabled business tools]
    ├── Company B [1..N CnpjEntity]
    │   └── CompanyAccess [Tenant-branded, enabled business tools]
    └── ... scalable Company/CNPJ portfolio
```

The Tenant contracts the EVOLU license and may accommodate one, several or many CNPJs across its Company portfolio. Company users do not become Tenants by accessing the service. This expresses product scalability, **not** unlimited contractual CNPJ quantities or any specific billing formula.

**Company operating modes:**

1. **Financial collaboration (first UX priority):** the Company's financial team submits/imports receipts, payments, expenses, supporting documents and period information; the Tenant's accounting/tax/advisory team consumes these authorized records. The Company does not need to use the Platform for sales or invoice issuance.
2. **Integrated operation:** the Company keeps its existing ERP, sales/invoicing software, fiscal-document provider and/or financial system, connected or imported through supported source mechanisms. The financial workspace remains the collaboration point.
3. **Extended business workspace (optional expansion):** the Company may later enable own sales capture, POS, invoice issuance, inventory or other business capabilities if separately designed, authorized and viable.

These are optional capability compositions within CompanyAccess, not new mandatory product names or new identity tiers.

**UX contract priorities:**

| Company-facing area | Proposed actions | Important boundary |
|---|---|---|
| Home | show financial position, period, missing information, and pending actions | show completeness/source and avoid implying tax result |
| Financial intake | manual entry, file upload, connected-system import | each item retains source, competence and deduplication/review status |
| Receipts and payments | inspect inflows/outflows, due dates and settlements | cash movement is not automatically fiscal revenue/expense |
| Accounts payable/receivable | optional V1 financial management view | reporting scope may be partial, not invoice issuance |
| Expenses and costs | enter/import expenditures and attach supporting evidence | no automatic deduction or tax-credit entitlement |
| Documents | send/review invoices, receipts, statements and proof of payment | scoped by Company/CnpjEntity, permissions and provenance |
| Tenant accounting handoff | view provided financial records, reconcile with fiscal/accounting data | professional classification and validation remain with Tenant |
| Advisory handoff | access reconciled projections/opportunities and relevant underlying context | recommendation never authorizes execution |
| Sales / NF issuance / POS / Inventory | future optional extension, not default first release | requires additional contracts and technical/legal feasibility |
| Intelligence | contextual explanation and recommendations | no autonomous execution permission |

Genesis is the **front-end visual UX prototype**, with synthetic interactions and no production write access. Platform is the **separate future operational Backend**; Intelligence is the **separate analysis/recommendation service**. They must eventually share contracts, but none should be interconnected with real data/credentials before the final UX review and explicit user approval.

**UX acceptance:** one Tenant may visualize many Companies/CNPJs; CompanyAccess uses only Tenant branding by default; finance users may simulate manual/file/integration intake and authorized Tenant staff may inspect the same information in Fiscal/Accounting/Advisory context; direct sales and invoice issuance stay outside the V1 default; source and accounting/fiscal differences remain visible; no Backend connection before review.

---

## 6.8 Company Financeiro → Fiscal/Contábil → Assessoria (V1 UX)

**Status:** user-approved V1 UX boundary: reach the Company's finance department; do not require its sales team, POS, invoicing or complete ERP replacement.

### Role and data flow

```text
Company user — Financeiro (CompanyAccess, Tenant white-label)
  ├── Manual financial information
  ├── File uploads / spreadsheets / statements
  └── External sources (ERP, fiscal document providers such as SIEG, banks)
                 ↓ authorized financial context, provenance and PendingItems
Tenant professional — Fiscal / Contábil (TenantAccess)
  ├── Financial × Fiscal / Accounting Reconciliation
  ├── review, classify and resolve differences
  └── pre-closing / statements / controlled approvals
                 ↓ validated/reconciled context, decisions and issues
Tenant professional — Assessoria (TenantAccess, role permission)
  ├── analysis, projected taxes, scenarios and advisory work
  └── recommendations supported by evidence
                 ↕
Intelligence — contextual at each authorized surface;
               can analyze/recommend; cannot approve/execute itself
```

Fiscal and accounting may be departments or authorized work areas of the same Tenant. They are not additional Tenants. Advisory is an operational role/workflow and may have a dedicated view, not necessarily a new production module.

### Three input modes (UX)

1. **Manual:** finance staff adds authorized financial information and supporting evidence. Entry is not tax invoice issuance and is not an accounting journal entry until validated.
2. **Files:** staff uploads statements, financial spreadsheets, fiscal documents and supporting records. UX simulates matching, imported items, duplicates, rejected lines and incomplete fields.
3. **Connected provider (synthetic):** finance uses existing ERP/sales/invoicing software, fiscal document sources or banks. UX shows the source's state, last simulated synchronization, provenance and missing permissions, without calling real APIs.

Each flow must preserve `tenantId → companyId → cnpjId → accountingPeriod`, origin/provenance, document references and review status, avoiding duplicate representation of the same business operation across sources.

### Important semantic distinctions

- Financial receipt **is not automatically** fiscal revenue; bank inflow can include loans, owner contributions, transfers, reversals or other non-sale transactions.
- Payment **is not automatically** an allowable tax expense or credit.
- A sale in the source system **is not automatically** an issued or valid fiscal document in Platform.
- An imported document, declared amount, recognized accounting entry and reconciled figure are distinct stages; disagreement is represented as a Finding/PendingItem.
- Figures must show source, competence, completeness, estimated vs. confirmed status and missing context. The UI must not promise real-time or accurate tax projections without sufficient integrated data.
- Authorizations are role-based: Company Financeiro can provide/correct information; authorized Tenant Fiscal/Contábil staff performs review and accounting/tax processing; advisory staff uses allowed context. Intelligence proposes rather than executes.

### First Financeiro screen contract (prototype)

`CompanyFinancialWorkspace`:

- scope: current Company + authorized CnpjEntity + AccountingPeriod;
- primary reads: financial summary, source statuses, recent movements, expenses, missing documents, PendingItems, reconciliation handoff status;
- actions: register a movement/expense [simulated], import file [synthetic], inspect connected provider [synthetic], attach supporting document [synthetic], answer request, open financial detail;
- states: loading / ready / empty / error / forbidden / partially_available / awaiting_information (UX distinctions; not new generalized domain states);
- navigation goal: Home → Financeiro in one meaningful interaction; source/entry in <= 2 more;
- no Backend requests, real external provider calls or secrets.

The authorized Tenant-side `TenantFinancialReview` is a contextual CompanyWorkspace view that shows the same synthetic records, reconciliation state, required classification and handoff to Fiscal/Accounting/Advisory. It is not a second source of truth.

### Explicitly deferred UX extensions

- native POS or full sales management;
- fiscal-document issuance;
- inventory and logistics workflows;
- marketplace integrations;
- native payment/banking initiation;
- a complete replacement for every enterprise ERP.

These may be added only after value, complexity, operating model and permissions are separately assessed; they must not block completion of the Financeiro → Contábil → Assessoria UX.

---

## 7. Reconciliation

**Reconciliation is a canonical business capability. External brands must not define reconciliation types.**

Incorrect:

```text
SIEG × Domínio
```

Correct:

```text
Fiscal × Accounting
```

with provenance:

```text
Fiscal source
provider: SIEG

Accounting source
provider: accounting system X
```

Candidate reconciliation types:

| Type | Comparison |
|---|---|
| Fiscal × Accounting | fiscal documents × accounting records |
| Financial × Accounting | financial movements × accounting records |
| Document × Payment | document × settlement |
| Document × Accounting Entry | document × accounting record |
| Source × Source | equivalent data from two sources |
| Payroll × Accounting | payroll × accounting records |

Open decision: validate the proposed Reconciliation presentation rule by `OperatingModel` defined in section 10.1.

---

## 8. Source & Integration Taxonomy

Canonical hierarchy:

```text
Source Category
↓
Provider
↓
Connector
↓
Format / Protocol
```

Meanings:

| Layer | Meaning |
|---|---|
| Source Category | what kind of business information it is |
| Provider | external company/product that supplies it |
| Connector | technical mechanism used to retrieve/send it |
| Format / Protocol | XML, CSV, API, Open Finance, etc. |

### Canonical source categories

- Fiscal Documents
- Accounting System
- Enterprise Management System
- Financial Data
- Payroll and Charges
- Government Sources
- Imported Files
- Management Sources
- Company-provided Information

### Examples

```text
Fiscal Documents
└── Provider: SIEG
    └── Connector: SIEG API Adapter
        └── Format: XML
```

```text
Accounting System
└── Provider: Domínio
    └── Connector: provider adapter
        └── Artifact: Ledger
```

External brands may appear as provenance or integration configuration, never as domain architecture.

Allowed:

- Source: SIEG
- Connected provider: X
- Accounting system: Y

Not allowed:

- SIEG menu
- Domínio page
- SiegDocument
- DominioAccountingPage
- SIEG Reconciliation

---

## 9. Provider and infrastructure isolation

Providers are replaceable.

Examples:

- SIEG
- Domínio
- ONVIO
- banks
- ERPs
- other future providers

Infrastructure is also replaceable and does not belong to UX/domain naming.

Examples:

- Supabase
- Vercel
- GitHub

Canonical rule:

```text
External provider / infrastructure
→ Adapter boundary
→ UX Contracts
→ Platform UX
```

---

## 10. Intelligence

Intelligence is not a sidebar module.

It operates transversally over the authorized current context.

```text
                 Intelligence
                      │
       ┌──────────────┼──────────────┐
       │              │              │
     Fiscal       Accounting      Future modules
       │              │              │
       └──────────────┼──────────────┘
                      ↓
                   Company
```

Intelligence respects:

- BusinessModel context;
- OperatingModel context;
- TenantEntitlements;
- UserPermissions;
- Capabilities;
- module scope;
- Company/CNPJ/period context;
- available evidence.

Canonical workflow:

```text
Context
→ Analysis
→ Finding + Evidence
→ Recommendation
→ Decision
→ ApprovalRecord [when required]
→ ActionCommand
→ ActionResult
→ AuditEvent
```

Recommendation never grants execution authority.

---

## 10.1 Navigation composition by BusinessModel and OperatingModel

Navigation is not globally fixed. The visible information architecture is composed from canonical modules and capabilities.

Canonical composition order:

```text
BusinessModel
→ OperatingModel
→ TenantEntitlements
→ UserPermissions
→ Capabilities
→ Navigation
```

Semantics:

- `BusinessModel` influences the recommended product composition for the Tenant.
- `OperatingModel` influences how enabled modules and transversal capabilities are presented.
- `TenantEntitlements` determines which modules/capabilities are enabled.
- `UserPermissions` determines what a user may access.
- `Capabilities` determines what operations are currently available in the active context.
- Navigation renders the resulting authorized structure; navigation does not define the domain.

### Departamental OperatingModel

Typical presentation:

```text
Overview
Clients

Fiscal
├── Fiscal Documents
├── Tax Assessment
├── Tax Classifications
└── contextual Reconciliation

Accounting
├── Accounting Entries
├── Periods
├── Closing
└── contextual Reconciliation

Transversal
├── Pending Items
├── Approvals
├── Audit
└── Global Search
```

A transversal capability may be accessible from a department without becoming part of that module's canonical domain.

### Global OperatingModel

Typical presentation:

```text
Overview
Clients

Work Areas
├── Fiscal
├── Accounting
├── Financial
└── other enabled modules

Global Operations
├── Reconciliation
├── Pending Items
├── Approvals
├── Audit
└── Global Search
```

This model favors cross-domain work rather than departmental ownership.

### Híbrido OperatingModel

Typical presentation:

```text
Overview
Clients

Modules
├── Fiscal
├── Accounting
└── other enabled modules

Global Operations
├── Reconciliation
├── Pending Items
├── Approvals
└── Audit
```

The same canonical object may be reached both globally and contextually.

### Reconciliation placement rule — proposed

`Reconciliation` remains one canonical capability/entity model.

Its **presentation** may vary by `OperatingModel`:

| OperatingModel | Primary presentation | Contextual access |
|---|---|---|
| Departamental | inside relevant module workflow | yes |
| Global | global operation area | yes |
| Híbrido | global + module contextual access | yes |

This is a presentation rule, not a domain fork. A single `Reconciliation` record must never be duplicated merely because it is reachable through multiple navigation paths.

**Status:** Proposed; requires explicit validation before moving to Frozen decisions.

---

## 11. Navigation principles

Platform navigation is a graph, not a rigid tree.

A screen may be reached through:

- sidebar;
- Overview;
- Global Search;
- Pending Items;
- Approvals;
- Intelligence;
- Audit;
- contextual links;
- deep links.

### Three-click budget

Frequent operational goals:

- preferred: <= 2 meaningful clicks;
- maximum: <= 3 meaningful clicks.

Administrative configuration:

- <= 4 meaningful clicks is acceptable.

Do not turn these into menu levels by default:

- CNPJ;
- competence/period;
- supplier;
- NF-e/CT-e type;
- inbound/outbound;
- status;
- state;
- date;
- tax;
- provider;
- format.

Use context selectors, filters, tabs or metadata instead.

---


## 11.1 UX-NAV-1 — Navigation and access-boundary review

**Status:** interactive review prototype created; individual and final UX approvals remain open.

Source: https://github.com/evoluagency/evolu-genesis/blob/main/preview/ux-journey/index.html

Intended Pages route: https://evoluagency.github.io/evolu-genesis/preview/ux-journey/ — availability requires independent verification. This page is a **review-only navigation wrapper**, not production authentication or a new product.

### Scope and page mapping

| Role for UX inspection | Permitted navigation in preview | Scope |
|---|---|---|
| Company Financeiro | CompanyAccessHome; CompanyFinancialWorkspace with role=company | own Company and authorized CNPJ only |
| Company consultation/read-only (proposed) | CompanyAccessHome | own Company; edits excluded in actual authorization |
| Tenant Contábil/Fiscal | CompanyFinancialWorkspace with role=accounting; FiscalDocument example | assigned Companies, CNPJs and competencies |
| Tenant Assessoria | CompanyFinancialWorkspace with role=advisory | authorized analytical contexts |
| Tenant administrator | CompanyConfiguration; CompanyOnboarding; TenantConfiguration preview | bounded by Tenant entitlements, no EVOLU-only powers |

### Proposed capability matrix for visual review

| Capability | Company Financeiro | Company read-only | Tenant Contábil/Fiscal | Tenant Assessoria | Tenant admin |
|---|---|---|---|---|---|
| View financial data | own Company | own Company | assigned portfolio | authorized context | permitted Tenant context |
| Create financial movements | own Company | no | no by default | no | no by default |
| Provide documents / information | yes | read-only unless granted | request/review | request/review | as authorized |
| Review fiscal/accounting evidence | no unrestricted professional records | no | yes, assigned | yes, authorized | separate permission required |
| Analyze tax opportunities | no | no | professional scope | professional scope | separate permission required |
| Manage Company identities/services/users | no | no | no by default | no | yes, within entitlements |
| View other Companies | never | never | only assigned | only assigned | as specifically authorized |
| Execute Intelligence recommendation autonomously | no | no | no | no | no |

**Status:** this matrix expresses intended UX and is not live authorization. Final roles, approval rights and admin-to-professional permission inheritance require explicit review.

### Static preview security and navigation contract

- Role selector on UX-NAV-1 and the role query parameter in Financeiro are **demonstration controls**, not login, permission checking or privilege elevation.
- Static pages are publicly addressable via direct URL. A disabled navigation link does not secure their contents. Real backend authorization and tenant isolation will be required after the UX approval gate.
- Company-facing application navigation shows the fictitious Tenant brand NEXUS, without mandatory vendor branding.
- CompanyAccess and TenantAccess are different access surfaces; switching perspectives in the UX review page does not merge them in the future product.
- The linked standalone preview pages do not share simulated state. Navigation works, but edits entered in one HTML page are not reflected in another.
- CompanyAccessHome now links to the detailed Company Financeiro preview, and Financeiro supports role=company, role=accounting or role=advisory query parameter **only** for synthetic review.
- No Backend, secrets, real provider API requests, real customer information or GitHub Actions were introduced.

### UX review test cases

1. Company Financeiro sees its own Company, not Tenant portfolio or administration.
2. Company read-only has no finance-write option in the navigation review, but read-only enforcement inside the existing CompanyAccessHome is **not yet implemented**.
3. Authorized Tenant Fiscal/Accounting staff may inspect accounting reconciliation and the synthetic fiscal case.
4. Tenant Assessoria may inspect contextual financial evidence but cannot approve or execute automated tax treatments.
5. Tenant administrators configure permitted Company scopes without inheriting EVOLU-only provisioning authority.
6. CNPJ/period selection remains scoped per surface, and no data synchronization between independently hosted preview pages is claimed.
7. UX-CFG-2, UX-CFG-3, UX-CFG-4, UX-CFG-5 and UX-NAV-1 remain pending user acceptance.

### Open gaps before UX sign-off

- Final route contracts for CompanyAccess and TenantAccess, not equal to demo URLs.
- Read-only and write permissions implemented consistently across page-level mock interactions.
- Tenant professional assignment to specific Companies and CNPJ entities.
- End-to-end module routing and context preservation in a unified front end.
- Review of handoff and history contracts: what Finance sends; what Fiscal/Accounting accepts; what Assessoria may read.
- User review of outstanding screens and final UX gate before Backend.

---


## 11.2 UX-ACCESS-1 — Company consultation and CNPJ/period navigation context

**Status:** implemented in static Genesis previews; **user review pending**. This is an interaction specification and simulated UI restriction, **not authentication, authorization, encryption or secure tenancy**.

### Prototype scenarios

| Scenario | Entry route | Expected visible experience |
|---|---|---|
| Company Financeiro (entry allowed) | CompanyAccessHome default | Financial indicators, expense/document entry and authorized requests |
| Company consultation (read only) | CompanyAccessHome query `?mode=read` | Financial information, documents, requests; no submit/edit/reply controls |
| Company Financeiro full workspace | CompanyFinancialWorkspace `?role=company` | Financial movements, commitments, synthetic intake and accounting handoff |
| Company consultation full workspace | CompanyFinancialWorkspace `?role=viewer` | Same authorized financial context, without buttons to enter/import/submit/reply/approve or role inspection switch |
| Tenant Contábil/Fiscal | CompanyFinancialWorkspace `?role=accounting` | Separate demo role for reconciliation and professional review |
| Tenant Assessoria | CompanyFinancialWorkspace `?role=advisory` | Separate demo role for analysis and evidence |

The UX-NAV-1 inspection page now opens **both** CompanyAccessHome and CompanyFinancialWorkspace in read-only mode for the Company consultation persona, and keeps the Company Financeiro persona writable in the *synthetic UI*.

### Navigation context contract

- Source parameters are **whitelisted**: `period` in `2026-08` or `2026-09`; CompanyAccessHome `cnpj=a|b`; CompanyFinancialWorkspace `cnpj=m|f` in synthetic fixtures.
- Matriz maps `a → m`, and Filial maps `b → f`, while moving from CompanyAccessHome to Financeiro; the reverse mapping applies to the return link.
- Query-driven links preserve the **selected CNPJ and period** plus the read-only persona when moving between those two Company-facing pages.
- The two HTML pages still have **independent in-memory synthetic datasets**. The same CNPJ and period are carried as navigation context, **not shared write state, transaction reconciliation or real integration**.
- CompanyAccess in both personas stays scoped to ACME Industrial. UX-NAV-1 no longer permits selecting Órbita in this test fixture because no linked dataset for it exists, preventing false continuity in the preview.
- URL parameters are deliberately inspectable/editable in this public demo. Altering them can change visible mock mode. **Never** interpret them as claims of secure permission enforcement.
- The production route and authorization contracts must derive Company, CNPJ, role and Company services from authenticated identity plus server-side grants, never from URL values alone.

### Visible states and controls

- In **read-only Home**, expense/document submission and request-reply buttons are not rendered, and attempts to call protected mock write handlers are blocked.
- In **read-only Financeiro**, movement entry, commitments, import, handoff, clarifications and role selector changes are unavailable; the selected Company/CNPJ/period and display-only navigation remain accessible.
- Visible read-only notices distinguish the demo persona from write-enabled Financeiro.
- Fiscal evidence stays distinct from banking/financial records; there is no automatic tax classification or autonomous action.
- Default Company and Tenant role mock scenarios remain functional; existing desktop brand-toggle behavior is unaffected.

### Acceptance and next review gap

1. From UX-NAV-1 choose Consulta da empresa: open Home and Financeiro and verify no write actions.
2. Change period and Matriz/Filial within Home; open detailed Financeiro and verify the same scope is selected.
3. Return from Financeiro to Home and verify preservation of persona, CNPJ and competence.
4. Return to UX-NAV-1, choose Financeiro da empresa, and verify that synthetic write actions are available again.
5. Check that Tenant Accounting and Advisory previews remain separately labeled as inspection-only role changes, not external Company permissions.
6. Future Backend must implement real authorization and shared handoff state **only after final UX approval**.

**Open:** Browser interaction and viewport validation, real permission enforcement, Company/period persistence across full application routes, Tenant assignment to actual Companies, user acceptance.

---


## 11.3 UX-FLOW-1 — Versioned Financeiro → Contábil/Fiscal → Assessoria handoff

**Status:** interactive synthetic workflow implemented in Genesis CompanyFinancialWorkspace, **pending user acceptance**. It is a client-side UX state machine and does not persist to other pages, issue a fiscal document, execute accounting entries, or integrate with any actual provider.

### Workflow states and transitions

| State | Trigger / condition | Visible effect and allowed next action |
|---|---|---|
| Financial draft | no submitted package in current Company/CNPJ/competence | Company may enter simulated source data and send for review |
| Submission recorded | Company sends the current version | version incremented (v1, v2...); snapshot/fingerprint of current financial movements, commitments and independent fiscal evidence recorded |
| Awaiting clarification | any open information request remains | Company may answer request; professional validation stays pending |
| Answer received | Company responds; accountant has not resolved it | Accountant can inspect/resolve the explanation; answer is not automatically approved |
| Professional review | submitted version matches current records, and source/evidence is not fully checked | Accountant reviews **each** financial movement and fiscal document with a minimum-length evidence/rationale note |
| Reviewed, not released | all recorded financial movements and separately held fiscal evidence checked; all requests resolved | **only** Tenant Contábil/Fiscal can explicitly share context with advisory |
| Context released for advisory | authorized accountant selects share, and prior checks are complete | Advisory context becomes available for human interpretation, **not** a tax conclusion or execution approval |
| Change requires resubmission | record, commitment or fiscal evidence changes after last submission | contextual inspection flags previous submission as out of date; advisory access to reviewed-context details is suspended until the Company sends a new version |
| New submission | Company resubmits modified scope | creates next version and resets per-record professional review; source IDs and requests remain attached to the selected context |

**Important scope distinctions:**
- This preview holds one synthetic Company (ACME) and two synthetic CNPJ entities with competence selectors. Fingerprint and stage are scoped to the chosen CNPJ/competence.
- Money inflow/outflow, accounts payable/receivable, fiscal documents, professional evidence review and fiscal tax classification are **different concepts**, not interchangeable.
- Reviewing a record or a fiscal document establishes only that a human has recorded a **source/evidence review note** in this demonstration. It is **not** bookkeeping, reconciliation of every source, a deduction, a tax credit, filing or proof that every fiscal figure agrees.
- Sharing with Advisory only releases this marked-reviewed **context** for subsequent human advisory analysis; Intelligence may support understanding but cannot independently change decisions, approve treatments or execute.
- The UI uses a synthetic role-selector solely to demonstrate distinct views. No cross-role impersonation, authorization or backend persistence has been implemented.
- A user can modify the URL in a public preview. All production constraints must be enforced by authenticated server-side Company/CNPJ/competence/role assignments after UX review.
- The built-in sample import datasets correspond to **September 2026 only** and cannot be used as August data. Manual entry in the August fixture remains demonstrative.

### Interaction acceptance scenarios

1. Select Financeiro da empresa, Matriz, 09/2026 and go to Envio à contabilidade.
2. Submit version v1, then choose Contábil/Fiscal from the synthetic inspection selector.
3. Request a clarification; return to Financeiro to answer. Check that the result is **answered but not resolved**.
4. Switch to Contábil/Fiscal; resolve that answer explicitly, review **each** movement/document with a written rationale (at least 12 characters).
5. Verify "Disponibilizar contexto à assessoria" remains disabled until the set is complete and all pending questions resolved.
6. Release context with the professional action; switch to Assessoria and confirm it is accessible for analysis while tax approval remains unasserted.
7. Return to Financeiro and create another transaction or import a new scoped source item; confirm the old version is flagged out of date and Advisory details are no longer represented as released.
8. Resubmit version v2 and verify the prior per-record checks were reset.
9. Switch to Filial or August and confirm it has an independent state. Try importing a September-only sample during August: it must be rejected.
10. Try Company consultation/read-only preview: there must be no write, upload, request-response or submission action.
11. Reload the page: all stage history resets as expected for an **ephemeral static prototype**.
12. Validate desktop menu collapsing, mobile layout and PT-BR/EN separately during visual user review.

### Future production contracts — deferred

- FinanceSubmission: version, CompanyId, CnpjEntityId, AccountingPeriod, source manifest, financial/fiscal separation, actor, timestamp and immutable audit reference.
- InformationRequest and InformationResponse: origin, recipient, scoped item, explanation, evidence, state, decision record and professional review history.
- EvidenceReview: reviewer identity, scoped movement/document, evidence/provenance, explicit rationale, reviewed timestamp and limitations.
- AdvisoryRelease: authorized reviewer decision linking a reviewed submission version to an advisory context; revocable/superseded when sources change.
- True matching, uniqueness, deduplication, idempotent ingestion, fiscal classification and source freshness rules must be designed and tested with real integration and legal context **after final UX approval**.

These names describe contracts to be considered, not production domain entities already deployed.

---

## 11.4 UX-SHELL-1 — Unified workspace and five-page layout specification

**Status:** detailed design and implementation specification created; **awaiting explicit user review and implementation authorization**. The five wireframes discussed in the conversation establish **visual direction**, not blanket acceptance of every workflow, entitlement or tax decision.

Canonical implementation document:

- [EVOLU Platform — Especificação de UX Sistêmica e Plano de Implementação V1](./EVOLU_PLATFORM_UX_UNIFIED_WORKSPACE_SPEC_V1.md)

Coverage:
- a unified sidebar + header + Company/CNPJ/competence context + one task-focused workspace per authorized surface;
- five blueprint entry pages: Tenant office home, Company home, Company Financeiro, Tenant Fiscal/Accounting, Tenant Advisory;
- native desktop sidebar collapse via the brand/header area with no overlapping overlay;
- no long top-level page scrolling for a standard desktop task at supported viewports, with explicit fallbacks for smaller screens, keyboard access, larger text, zoom and long data tables;
- activity/task tabs and explicitly paginated tables rather than silently hiding overflow cards;
- operational navigation within three meaningful clicks where possible (two preferred), with the existing administration exception (four) preserved;
- reusable component contracts, navigation context, roles, permitted actions, states, source provenance and review/evidence boundaries;
- change-by-change migration guide for existing static Genesis files plus measurable acceptance tests;
- explicit handling of **unapproved experimental screen paging** in the existing Financeiro and UX Journey previews: do not treat viewport CSS/hidden overflow as an approved UX contract.

This document complements and **does not override** the frozen Platform domain dictionary, contract catalog or this architecture's Backend approval gate. It is *not* an instruction to deploy Backend, enable external services, create GitHub Actions, or update production products. No preview source files were changed as part of this documentation-only phase.

### User review boundaries

1. Confirm shared desktop Shell and the first **Tenant Office Home** reference page.
2. Review CompanyAccess Home, Company Financeiro, Fiscal/Accounting and Advisory incrementally.
3. Validate click budget, context switching, tab behavior, pagination, permissions and desktop/mobile responsive fallbacks.
4. Approve final UX expressly after reviewing remaining UX-CFG-2 through UX-CFG-5, UX-NAV-1, UX-ACCESS-1, UX-FLOW-1 and the new layout plan.
5. Only after the complete gate consider Backend planning and implementation.

---

## 11.5 UX-SHELL-1 / UX-OFFICE-1 — Shared Shell and Office dashboard preview

**Status:** implemented as static frontend in `main`, **visual and functional user acceptance pending**. This delivery executes only the first incremental UX slice from [Unified Workspace Specification](./EVOLU_PLATFORM_UX_UNIFIED_WORKSPACE_SPEC_V1.md).

New source files:

- `preview/shared-ux/shell.css`: common visual tokens, responsive sidebar, topbar, context area, KPI cards, task panels, mobile fallback and scrollable data regions.
- `preview/shared-ux/shell.js`: logo-triggered sidebar toggle (no second visible button), keyboard/label support, mobile drawer, theme/locale presentation switch.
- `preview/office-workspace/index.html`: **TenantAccess Office dashboard** with synthetic ACME-only portfolio, Matriz/Filial and 08/2026–09/2026 competence selectors, scoped pending items, company context and concise links to existing professional previews.
- `preview/ux-journey/index.html`: new Office dashboard entry available **only** to the three internal Tenant inspection roles (accounting, advisory and admin), not Company personas.

Intended review URL: `https://evoluagency.github.io/evolu-genesis/preview/office-workspace/` (the hosted preview could not be independently rendered/verified from the available environment).

Behavior/constraints:
- menu expands/collapses by clicking the Tenant brand; expanded width 236 px and collapsed width 76 px;
- the Office desktop page is composed as one task-focused workspace with three metrics, three internal tasks (Overview/Queues/Companies), a main work queue and a narrower context/quick-action panel;
- focus and keyboard navigation remain available; mobile permits conventional scrolling and a closable drawer; short desktop windows use accessible scrolling rather than hiding content;
- ACME is the **only synthetic Company** present in this Office preview; September Matriz has exactly two request examples copied conceptually from the Financial preview, while Filial/August has no synthetic requests;
- company selection, CNPJ/period and role are **demonstration display state**, not authorization; no live Tenant portfolio or CompanyAccess data is exposed;
- the Office preview is **independent in-memory mock data**, and links to Financeiro/Fiscal/Assessoria do not synchronize transactions or permissions;
- existing CompanyAccess and Financeiro previews remain unchanged; the new shared shell is **only consumed by the new Office page** so far, avoiding unreviewed wide-scale regressions;
- no Backend, Supabase, Vercel, providers, GitHub Actions, jobs or workflows added.

Validation completed: remote file re-read, JavaScript syntax checks, static review of routes/scope and mock-DOM logic checks covering Matriz 09/2026 → Filial → Agosto → return to Matriz/September; all these checks passed. **Not yet completed:** pixel/browser render at 1920×1080, 1440×900, 1366×768, 1280×720, zoom 200%, manual keyboard/mobile acceptance, user review. Do not claim the desktop no-scroll criterion has passed without a real viewport test.

**Next permitted slice after this page is reviewed:** UX-COMPANY-1 CompanyAccessHome. Do not treat this milestone as blanket approval to rewrite Financeiro or begin Backend.

---

## 12. Navigation skeleton

### Core

- Overview
- Clients
- Company Onboarding
- Pending Items
- Approvals
- Audit
- Global Search
- Administration
- Integrations

### Fiscal

- Fiscal Overview
- Fiscal Documents
- Fiscal Document Detail
- Tax Assessment
- Tax Assessment Detail
- Tax Classifications
- Tax Classification Detail
- Tax Benefits
- Tax Benefit Detail

### Accounting

- Accounting Overview
- Accounting Entries
- Accounting Entry Detail
- Accounting Periods
- Accounting Closing
- Statements

### Company context

- Company Workspace
- Company Information
- CNPJ Entities
- CNPJ Entity Detail
- Tax Profile
- Company Data Sources

### Company external access

- Company Login / Access Entry
- Company Home / Financial Overview
- Company Financeiro
- Financial Movements / Statements
- Expenses / Costs
- Accounts Payable / Receivable [when enabled]
- Financial Intake / Imports / Source Status
- Company Requests / Pending Items
- Company Documents
- Company Information
- Company Approvals [when exposed]
- Company Reports / Status [when exposed]

Sales / POS / invoice issuance / inventory are future optional extensions, not first-release defaults.

---

## 13. Navigation Matrix — initial draft

Every operational screen must eventually declare:

- scope;
- primary entity;
- primary entry point;
- alternative entry points;
- maximum clicks from Overview;
- reads;
- user intents;
- domain requests;
- ActionCommands;
- states;
- capabilities;
- integration owner.

Initial matrix:

| Screen | Area | Primary entity | Primary entry | Alternative entries | Max clicks |
|---|---|---|---|---|---:|
| TenantConfiguration | EVOLU administration / TenantAccess | Tenant | Administration | Organization overview | 2 |
| CompanyConfiguration | TenantAccess | Company | CompanyWorkspace | Clients, Search | 3 |
| CompanyPortfolio | Core | Company | Overview | Search | 1 |
| CompanyOnboarding | Core | Company | Clients | Overview | 2 |
| CompanyWorkspace | Core | Company | Clients | Search, Pending Items | 2 |
| CompanyAccessHome | CompanyAccess | Company | Company Login | direct link | 1 |
| CompanyFinancialWorkspace | CompanyAccess | Company / CnpjEntity / AccountingPeriod | CompanyAccessHome | notification, quick access | 2 |
| CompanyFinancialIntake | CompanyAccess | financial input / source reference | CompanyFinancialWorkspace | Documents, request | 3 |
| CompanyFinancialMovements | CompanyAccess | financial movements (UX projection) | CompanyFinancialWorkspace | Documents, search | 3 |
| TenantFinancialReview | TenantAccess / CompanyWorkspace | Company / CnpjEntity / AccountingPeriod | CompanyWorkspace | Reconciliation, pending items | 3 |
| CompanyAccessRequests | CompanyAccess | PendingItem | CompanyAccessHome | direct notification | 2 |
| CompanyAccessDocuments | CompanyAccess | exposed documents | CompanyAccessHome | Request, notification | 2 |
| CompanyAccessInformation | CompanyAccess | Company | CompanyAccessHome | Request | 2 |
| FiscalDocuments | Fiscal | FiscalDocument | Fiscal | Search, CompanyWorkspace | 2 |
| FiscalDocumentDetail | Fiscal | FiscalDocument | FiscalDocuments | Search, Pending Items, Reconciliation, Intelligence, Audit | 3 |
| TaxAssessment | Fiscal | AccountingPeriod | Fiscal | CompanyWorkspace | 2 |
| AccountingEntries | Accounting | AccountingEntry | Accounting | Search, CompanyWorkspace | 2 |
| AccountingClosing | Accounting | AccountingPeriod | Accounting | Overview, Pending Items | 2 |
| PendingItems | Core | PendingItem | Overview | any contextual screen | 1 |
| Approvals | Core | ApprovalRecord | Overview | Recommendation, Pending Items | 1 |
| AuditHistory | Core | AuditEvent | Core | any audited entity | 2 |
| Reconciliation | **Open placement** | Reconciliation | **Open** | Fiscal, Accounting, Pending Items, Overview | 2 |

This table is a working draft. Rows become frozen only after explicit agreement.

---

## 14. Frozen decisions

- EVOLU = company.
- Platform = product.
- Intelligence = product.
- Tenant = Organização cliente da EVOLU.
- Contabilidade and Assessoria are BusinessModel values; neither replaces the canonical Tenant concept.
- OperatingModel defines how the Tenant organizes work (initially Departamental, Global or Híbrido).
- Modules are configurable according to BusinessModel/OperatingModel, but effective enablement is determined by TenantEntitlements.
- UserPermissions define per-user access.
- Capabilities define currently available/authorized operations.
- Company = Cliente atendido pelo Tenant.
- CompanyOnboarding = cadastro e configuração inicial de uma Company dentro do Tenant.
- CompanyAccess = superfície externa opcional e separada para usuários vinculados a uma Company.
- TenantAccess != CompanyAccess.
- CNPJ = CnpjEntity.
- Core is not a professional module.
- Intelligence is not a professional module.
- Provider is not a source category.
- Connector is not a provider.
- Format is not a provider.
- External brand never defines Platform domain concepts.
- `companyId != cnpjId != cnpj`.
- Recommendation is not execution.
- Platform owns operational state and execution.
- Intelligence owns analysis and recommendation.
- EVOLU licenses its white-label Platform/Intelligence solution to the Tenant (Contabilidade or Assessoria).
- The Tenant may serve multiple Companies and a portfolio of many CNPJs inside its licensed environment; the exact quantitative/license terms are deferred.
- The Company-facing V1 business area is Financeiro, supporting manual entry/file intake/integration previews and financial-to-accounting/advisory handoff.
- Commercial sales capture, POS, stock and tax-invoice issuance are not mandatory in the first UX version.
- The Company may continue using its existing ERP or sales/invoice system; an external data source is not required if it can provide information manually.
- CompanyAccess can be a directly usable Company business workspace, not merely a collaboration portal.
- The default Company-facing brand is the Tenant's, with no mandatory EVOLU vendor attribution.
- The product architecture must support modular commercial packaging.
- The white-label Platform/Intelligence ecosystem supports Company contexts across different industries through shared contracts and optional sector-specific capabilities; no industry-specific module is automatically part of V1.
- A Tenant may distribute configured CompanyAccess and enabled services to its Company clients as part of its service offering; this does not automatically authorize sublicensing or define billing terms.
- Digital delivery may support Companies beyond the Tenant's local market, subject to operational capacity and applicable professional requirements.

---

## 15. Open decisions

**Active — UX / product architecture:**

These items can be resolved while designing UX. Commercial pricing or resale terms must not be inferred:

1. Should Financial become a standalone professional module, beyond the confirmed Company-facing Financeiro V1 UX?
2. Payroll / HR as a standalone module?
3. Final public name: Legalization, Corporate, or another term?
4. Validate the proposed Reconciliation presentation rule by OperatingModel (Departamental=contextual, Global=global, Híbrido=both)?
5. Tax Benefits as its own Fiscal submenu or inside Tax Classifications?
6. Statements as its own Accounting submenu or inside Closing?
7. Define the first-release scope of CompanyAccess (which capabilities are exposed to Company users)?
8. Which modules can operate without Intelligence, independently of commercial packaging?
9. Which technical white-label variants beyond default Tenant-only branding (e.g. custom domains) should the UX prototype support?
10. What minimal functional Platform composition is needed for a coherent UX?
11. Which BusinessModel values beyond Contabilidade and Assessoria should be represented in V1 UX?
12. What default UX module/capability composition should EVOLU recommend for each BusinessModel/OperatingModel combination?
13. What canonical contract name should represent Company-level service scope beneath TenantEntitlements?
14. Which CompanyAccess capabilities are enabled by default, if any?
15. Can one CompanyUser belong to more than one Company, or should multi-Company access require an explicit future model?
16. Which industry-specific Company workflows should be piloted first without expanding mandatory V1 scope?
17. Will the Company be able to offer tools to its own customers/users? If so, what distinct identity/access boundary and commercial responsibility apply?
18. Which Company industry/operating attributes are needed for UX configuration without inventing parallel identities?
19. Which Company-facing services are included by default versus selectively enabled by the Tenant?
20. Default is Tenant-branded CompanyAccess with no mandatory EVOLU attribution; should Company-specific branding be supported optionally?
21. Which remote customer onboarding, communication and professional/jurisdictional compliance conditions must be evidenced in UX?
22. What support, data-governance and operational boundaries apply if a Company later serves its own customers through additional tools?
23. What are the minimum Company-facing Financeiro UX contracts for receipts/payments, expenses, financial sources and period context?
24. Which of the Financeiro V1 capabilities (manual entry, upload, simulated integration, payable/receivable) must be prototype-complete before the UX gate?
25. Which sales/invoicing/POS/inventory capabilities should remain deferred optional extensions after Financeiro and its Tenant handoff are reviewed?

---

**Deferred — commercial research after functional product and measured operating costs:**

- Whether Tenant resale/sublicensing beyond providing configured services to its own Companies is permitted and under which contractual terms.
- Whether the Tenant separately charges or marks up CompanyAccess for a Company.
- Pricing methodology, quantitative CNPJ limits, commercial bundles, margins and market positioning.
- Support/cost-sharing arrangements associated with resale.

These items do **not** block UX approval or product development.

---

## 16. UX completion gate before Backend

Backend implementation must not begin merely because individual screens are ready.

Before Backend work starts, the UX architecture must reach an explicit review gate.

Required sequence:

```text
UX architecture completed
→ navigation and screen contracts reviewed
→ access surfaces reviewed
→ module/capability behavior reviewed
→ open UX decisions resolved or consciously deferred
→ USER REVIEW REQUIRED
→ explicit approval to proceed
→ Backend planning/implementation
```

Canonical rule:

**When all planned UX stages are complete, stop before Backend work and notify the user that the UX is ready for final analysis. Backend work only proceeds after explicit user approval.**

This gate applies to:

- Platform navigation;
- module composition;
- CompanyOnboarding;
- TenantAccess;
- CompanyAccess;
- screen flows;
- navigation budget;
- Intelligence placement;
- PendingItems / Approvals / Audit;
- Reconciliation presentation;
- provider/integration UX boundaries.

---

## 17. Change log

### 0.24 — First unified workspace implementation

- published a reusable static Shell style/interaction layer and the first TenantAccess Office dashboard in Genesis `main`, with no replacement of existing pages;
- connected Office preview to the UX Journey only for Tenant roles, preserving Company/Tenant separation;
- added synthetic Company/CNPJ/period selectors, scoped pending queue and quick links to existing professional demonstrations;
- validated JavaScript syntax, repository references and synthetic scope transitions; real browser viewport checks and user acceptance remain pending;
- no external integration, actions/workflows or Backend work.

### 0.23 — Unified workspace UX implementation specification

- authored a detailed, standalone Portuguese UX specification (`docs/EVOLU_PLATFORM_UX_UNIFIED_WORKSPACE_SPEC_V1.md`) for five primary product pages with a shared system-style desktop Shell;
- documented the task-per-viewport design, limits of no-page-scroll behavior, accessible fallback, sidebar interaction, three-click navigation budget, data/provenance boundaries and 18 regression scenarios;
- mapped target changes to existing Genesis source paths with incremental validation, explicitly avoiding another premature implementation before the visual structure is accepted;
- noted that existing experimental view paging in Financeiro and UX Journey is not automatically homologated;
- preserved the canonical Company/Tenant/EVOLU identity and permissions, the existing contract catalog and the explicit final Backend approval gate;
- made **documentation-only** changes on the architecture branch; no GitHub Actions, Backend, providers or preview source edits.

### 0.22 — Professional handoff and evidence review UX

- evolved the CompanyFinancialWorkspace from a single "sent/reviewed" switch into a scoped, versioned Financeiro → Contábil/Fiscal → Assessoria workflow.
- distinguished requests open, answered and resolved; only a professional inspection actor may close a reviewed response.
- introduced per-record and per-fiscal-document review with an explicit written evidence/rationale, then a separate accountant-initiated context release to Advisory.
- marked changes after the last submission as requiring resubmission; review flags reset for a new version and Advisory details are not presented as current.
- preserved fiscal-document separation, no invented tax results and no automatic approval; added explicit role-specific walkthrough guidance.
- restricted built-in synthetic import fixtures to September to prevent showing September evidence under a different accounting period.
- functional tests covered 11 core workflow state transitions; syntax of updated static scripts passed. Public hosted browser/visual acceptance remains unverified.
- all UX screens still require final user approval before Backend or production integrations.

### 0.21 — Role-scoped Company UX and navigation continuity

- completed UX-ACCESS-1: Company viewer read-only mock directly on Home and Financeiro, with write controls removed and handlers guarded;
- preserved selected synthetic CNPJ and accounting period on links between the two Company pages, including return navigation and viewer mode;
- connected UX-NAV-1 Company consultation routes to the read-only previews, and removed inactive non-ACME Company selection from the inspection-only fixture;
- distinguished read-only UI state from real authentication and permission checking; URL query parameters do not grant secure access;
- did not implement shared cross-page data storage, Backend, Actions, live connectors or tax classification;
- JavaScript syntax and static checks for role/context cases passed; public GitHub Pages visual interaction could not be verified by the available inspection tool.

### 0.20 — Brand-header desktop menu toggle

- replaced the separate visible sidebar collapse button with a click target on the existing Tenant/brand header in all six primary static Genesis previews;
- clicking brand/logo toggles between expanded sidebar and the 76 px icon navigation rail on desktop, freeing actual grid content width with no overlay;
- pointer hover and focus-visible cues indicate interaction, while dynamic Portuguese/English labels and native tooltips describe "Recolher/Expandir menu";
- keyboard Enter and Space activate the same interaction; on mobile the existing menu/hamburger model is retained, and activating brand while the drawer is open closes it;
- sidebar item navigation continues to navigate; no automatic collapse when selecting an actual navigation item;
- no new buttons or menus, no backend, no real data persistence, no workflows, no fiscal or accounting behavior changes; demo state resets per page;
- static JavaScript and source structure checks passed; live browser/device acceptance remains pending.

### 0.19 — Collapsible desktop navigation rail

- added a reversible desktop-only sidebar collapse control to the six primary static Genesis UX previews: TenantConfiguration, CompanyOnboarding, CompanyConfiguration, CompanyAccessHome, CompanyFinancialWorkspace and UX-NAV-1;
- expanded sidebars keep existing widths (232–244 px); compact rail is 76 px with icon navigation, allowing the CSS grid content column to use remaining space rather than creating an overlay;
- kept sidebar expanded by default; each static page's toggle is local in-memory visual state and is not synchronized across previews or a signed-in preference;
- icons retain per-item native hover tooltips and accessible labels, while the toggle exposes aria-expanded and descriptive labels; mobile navigation remains unchanged;
- modified layout and presentation only; no new modules, operational behavior, backend calls, workflows or external integrations;
- six static previews passed syntax/structural checks after write; real browser device visual review remains pending.

### 0.18 — UX visual alignment correction

- corrected mismatched header-versus-content grid widths in UX-NAV-1, CompanyConfiguration and CompanyAccessHome; header controls now follow the same responsive columns as their associated lower cards;
- constrained nested grid stacks to one shrinkable minmax(0,1fr) track and card widths to their parent, preventing variable-width/overflow artifacts in those screens and CompanyFinancialWorkspace;
- changed no interface content, branding, workflows, access definitions, JS logic, integration behavior or Backend;
- static CSS/HTML checks passed; live GitHub Pages visual rendering and viewport testing remain unverified and subject to user review.

### 0.17

- published UX-NAV-1 interactive navigation review page, connecting existing Genesis UX previews;
- mapped five synthetic access perspectives and their scoped capabilities, without real authentication;
- linked CompanyAccessHome to the full Financeiro preview, and enabled role-specific Financeiro inspection deep links;
- documented public static preview access, lack of cross-page state synchronization and remaining UX permission gaps;
- preserved per-screen approvals and the mandatory final user approval gate before Backend.

### 0.16

- added UX-CFG-5 CompanyFinancialWorkspace as an interactive synthetic static prototype on Genesis main;
- demonstrated scoped Company finance, file/provider-source simulations, commitments, accounting handoff and advisory inspection without opening Tenant access to Company users;
- kept imported fiscal document evidence distinct from financial cash movements and avoided automatic tax consequences;
- tested embedded JavaScript syntax and documented pending visual/public hosting verification;
- preserved previous UX review statuses and the explicit final UX gate before Backend.

### 0.15

- published a synthetic, interactive Tenant-branded CompanyAccessHome on the Genesis demo repository main branch;
- introduced Company-only Home, Finance preview, Requests, Documents, Company Information and source provenance while preserving authorized Company/CNPJ/competence context;
- simulated manual expense entry, document registration and request replies in ephemeral browser memory with no real integrations or tax effects;
- explicitly kept UX-CFG-4 open for user review and deferred the full CompanyFinancialWorkspace to UX-CFG-5;
- retained the final explicit user review gate before Backend.

### 0.14

- created UX-CFG-3 CompanyConfiguration interactive static prototype: Company identity, CNPJ, enabled Fiscal/Accounting/Company Financeiro, synthetic sources, CompanyAccess and review;
- maintained Tenant-only branding for Company users and explicit Financeiro-first scope, while sales/invoicing/stock stay out of V1;
- recorded that UX-CFG-2 CompanyOnboarding remains pending review; UX-CFG-3 is also pending, not approved;
- preserved the final UX completion and user-review gate before any Backend.

### 0.13

- confirmed Company Financeiro as the first Company-facing operational UX, with sales/POS/invoice issuance/inventory deferred as optional extensions;
- identified three finance intake routes: manual, file import and simulated external integrations (ERP, fiscal-document and banking providers);
- defined Financeiro → Fiscal/Accounting → Assessoria as a role-scoped cross-surface experience, with Intelligence transversal;
- added financial-source quality, provenance, reconciliation, classification and approval safeguards;
- added UX-CFG-5 CompanyFinancialWorkspace to the prototype review register, preserving all earlier UX review and Backend gates.

### 0.12

- clarified that EVOLU licenses the white-label technology to the Tenant, which can serve many Companies/CNPJs within its licensed environment;
- made Tenant-only branding the default CompanyAccess presentation with no mandatory EVOLU attribution;
- expanded CompanyAccess from collaboration to optionally enabled direct business workflows and financial context;
- preserved separate Genesis (UX), Platform (future Backend) and Intelligence (future decision support) boundaries;
- maintained the per-page UX review flow and mandatory final approval before Backend.

### 0.11

- registered user approval of UX-CFG-1 TenantConfiguration;
- implemented UX-CFG-2 CompanyOnboarding as a synthetic, interactive guided experience pending user review;
- added an acceptance register with per-page status and checks;
- preserved the final UX review before Backend and the deferred commercialization gate.

### 0.10

- specified Tenant configuration authority boundaries for EVOLU administrators and Tenant users;
- added detailed Tenant configuration UX matrix (identity, OperatingModel, modules, integrations, users, Company access);
- modeled CompanyConfiguration as a screen after CompanyOnboarding, using existing canonical identity/context contracts;
- established inherited TenantEntitlements → constrained Company service scope → UserPermissions → Capabilities;
- defined four UX configuration previews to validate one page at a time before Backend;
- kept commercial pricing/resale deferred and the final user approval gate intact.

### 0.9

- deferred resale, billing, pricing, margins and commercial packaging until the product is functional and operating costs and market price references are measured;
- preserved white-label, Tenant entitlements, module configuration and Company access as active UX requirements;
- separated active UX decisions from deferred commercial decisions;
- preserved explicit user review before starting Backend.

### 0.8

- recorded Tenant as both operational consumer and potential distribution channel for configured Company services;
- clarified that CompanyAccess can support a white-label service offering without introducing new core identities;
- documented commercial packaging options as hypotheses, not approved billing/sublicensing rules;
- mapped UX requirements for remote Company acquisition and asynchronous service delivery;
- preserved cross-industry Company context, access separation and the user review gate before Backend;
- added open decisions for channel contracts, billing, branding, compliance and downstream support.

### 0.7

- preserved the white-label ecosystem business model for Platform and Intelligence;
- recorded a cross-industry architecture: shared Company context plus optional sector-specific experiences;
- differentiated Tenant BusinessModel from the industry of each Company;
- captured optional downstream tools for customers/users of a Company without prematurely freezing a new domain entity;
- added scope guardrails so multi-industry potential does not imply implementing every vertical in V1.

### 0.6

- detailed the canonical `CompanyOnboarding` flow;
- defined onboarding stages from Company identity through activation;
- separated TenantEntitlements from Company-level service scope;
- defined inheritance from TenantIntegration with optional CompanyIntegrationOverride;
- detailed the proposed `CompanyAccess` navigation and isolation boundaries;
- added CompanyAccess screens to the Navigation Matrix;
- preserved authentication mechanics as Backend scope while defining UX access boundaries.

### 0.5

- added `CompanyOnboarding` as the canonical Company registration/configuration flow;
- added `TenantAccess` and `CompanyAccess` as distinct access surfaces;
- established that Tenant users and Company users are separate access populations;
- added Company external-access pages to the navigation skeleton;
- recorded the UX completion gate: user review is mandatory before Backend work begins.

### 0.4

- added navigation composition order: BusinessModel → OperatingModel → TenantEntitlements → UserPermissions → Capabilities → Navigation;
- documented navigation behavior for Departamental, Global and Híbrido OperatingModels;
- proposed Reconciliation as one canonical capability with presentation varying by OperatingModel;
- preserved a single Reconciliation object across all entry points.

### 0.3

- standardized the canonical definition as `Tenant = Organização cliente da EVOLU`;
- standardized `Company = Cliente atendido pelo Tenant`;
- removed conflicting wording that treated Contabilidade as synonymous with Tenant;
- preserved Contabilidade and Assessoria exclusively as `BusinessModel` values.

### 0.2

- standardized `Tenant` as **Organização cliente da EVOLU**;
- introduced canonical `BusinessModel` and `OperatingModel`;
- defined Contabilidade and Assessoria as initial `BusinessModel` values;
- defined Departamental, Global and Híbrido as initial `OperatingModel` values;
- established that modules are configurable according to the Tenant business context;
- preserved `TenantEntitlements`, `UserPermissions` and `Capabilities` as the canonical enablement/access language;
- prohibited parallel synonyms when existing canonical contracts already express the concept;
- updated Reconciliation as an open presentation decision that may vary by `OperatingModel`.

### 0.1

- established EVOLU → Platform / Intelligence;
- legacy decision superseded: Contabilidade is not synonymous with Tenant; it is a `BusinessModel` value.
- separated Core from professional modules;
- introduced modular entitlements;
- separated source category, provider, connector and format;
- established brand/provider isolation;
- introduced the first navigation matrix;
- recorded unresolved decisions explicitly.
