# Platform Architecture

**Status:** Canonical architecture document  
**Owner:** EVOLU  
**Products:** Platform, Intelligence  
**Version:** 0.16  
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
