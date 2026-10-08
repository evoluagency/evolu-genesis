# Platform Architecture

**Status:** Canonical architecture document  
**Owner:** EVOLU  
**Products:** Platform, Intelligence  
**Version:** 0.9  
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
| CompanyAccess | Superfície de acesso externo autorizada para usuários vinculados a uma Company |
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

`CompanyAccess` is the optional external surface for users belonging to a `Company`.

It must remain distinct from `TenantAccess`.

Canonical rule:

```text
Tenant user
≠ Company user
```

Company users may only access explicitly exposed capabilities.

Candidate capabilities:

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

```text
CompanyAccess
├── Home
├── Requests
├── Documents
├── Company Information
├── Approvals [when exposed]
└── Reports / Status [when exposed]
```

### CompanyAccessHome

The home surface should prioritize actionable items rather than internal accounting complexity.

Candidate blocks:

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

### 6.3 Candidate modules

Not frozen:

- Financial
- Payroll / HR
- Legalization / Corporate

Their existence as architectural slots does not mean V1 implementation is approved.

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
- whether EVOLU bills the Tenant or the Company;
- paid plans, per-module/per-Company/per-user/usage charging;
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
| CompanyAccess — Home | show only services, requests, documents, statuses and actions explicitly exposed |
| CompanyAccess — Requests / Documents | support asynchronous information exchange without exposing other Companies |
| Intelligence | respect TenantEntitlements, Company service scope, UserPermissions and Capabilities |
| Optional downstream experiences | require separate UX, contracts and permission boundary before inclusion |

### Scope and risk controls

- Platform and Intelligence remain the only named EVOLU products in this architecture.
- No new technical entity is created merely to describe resale/distribution.
- `TenantAccess` and `CompanyAccess` remain distinct; neither implies a Company customer's access.
- White-label branding is configurable; levels of brand visibility and right to sublicense remain open.
- Customer ownership, consent/data governance, support responsibility and multi-region professional requirements remain open contractual/operational decisions. Billing/pricing/resale are deferred by the commercial decision gate above.
- Do not treat planned partner resale or additional Company capabilities as delivered features.
- Preserve the UX completion review gate before any Backend implementation.

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
- Company Home
- Company Requests / Pending Items
- Company Documents
- Company Information
- Company Approvals [when exposed]
- Company Reports / Status [when exposed]

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
| CompanyPortfolio | Core | Company | Overview | Search | 1 |
| CompanyOnboarding | Core | Company | Clients | Overview | 2 |
| CompanyWorkspace | Core | Company | Clients | Search, Pending Items | 2 |
| CompanyAccessHome | CompanyAccess | Company | Company Login | direct link | 1 |
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
- The product architecture must support modular commercial packaging.
- The white-label Platform/Intelligence ecosystem supports Company contexts across different industries through shared contracts and optional sector-specific capabilities; no industry-specific module is automatically part of V1.
- A Tenant may distribute configured CompanyAccess and enabled services to its Company clients as part of its service offering; this does not automatically authorize sublicensing or define billing terms.
- Digital delivery may support Companies beyond the Tenant's local market, subject to operational capacity and applicable professional requirements.

---

## 15. Open decisions

**Active — UX / product architecture:**

These items can be resolved while designing UX. Commercial pricing or resale terms must not be inferred:

1. Financial as a standalone module?
2. Payroll / HR as a standalone module?
3. Final public name: Legalization, Corporate, or another term?
4. Validate the proposed Reconciliation presentation rule by OperatingModel (Departamental=contextual, Global=global, Híbrido=both)?
5. Tax Benefits as its own Fiscal submenu or inside Tax Classifications?
6. Statements as its own Accounting submenu or inside Closing?
7. Define the first-release scope of CompanyAccess (which capabilities are exposed to Company users)?
8. Which modules can operate without Intelligence, independently of commercial packaging?
9. What white-label branding variants must UX technically support (without deciding commercial tiers)?
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
20. What is the CompanyAccess branding policy (Tenant brand, Company brand or an approved combination)?
21. Which remote customer onboarding, communication and professional/jurisdictional compliance conditions must be evidenced in UX?
22. What support, data-governance and operational boundaries apply if a Company later serves its own customers through additional tools?

---

**Deferred — commercial research after functional product and measured operating costs:**

- Whether Tenant resale/sublicensing is permitted and under which contractual terms.
- Who pays EVOLU; whether the Tenant passes through or marks up access for a Company.
- Pricing methodology, commercial bundles, margins and market positioning.
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
