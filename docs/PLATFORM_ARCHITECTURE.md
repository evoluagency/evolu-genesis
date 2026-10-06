# Platform Architecture

**Status:** Canonical architecture document  
**Owner:** EVOLU  
**Products:** Platform, Intelligence  
**Version:** 0.1  
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
CONTABILIDADE
(Tenant)
      ↓
CLIENTES DA CONTABILIDADE
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
| Contabilidade | Tenant; direct EVOLU customer |
| Company | Client business served by the accounting firm |
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

Platform is composed of **Core + Professional Modules**.

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

A module may be independently enabled or disabled by tenant entitlement.

---

## 4. Commercial modularity

A tenant can contract only part of Platform.

Example:

```text
Contabilidade A
├── Fiscal       enabled
├── Accounting   enabled
├── Financial    disabled
├── Payroll      disabled
└── Legalization enabled
```

Disabled modules:

- do not appear in navigation;
- do not appear in global search as available product areas;
- do not expose commands;
- are not suggested by Intelligence as available functionality.

Keep separate:

```text
feature existence
≠ tenant entitlement
≠ user permission
```

Canonical concepts:

- `TenantEntitlements`
- `UserPermissions`
- `Capabilities`

---

## 5. Client operational context

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

Open decision: whether Reconciliation is presented globally in Core, inside each module, or both through contextual entry points.

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

- tenant entitlements;
- user permissions;
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
| CompanyWorkspace | Core | Company | Clients | Search, Pending Items | 2 |
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
- Contabilidade = Tenant.
- Client of accounting firm = Company.
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

---

## 15. Open decisions

These are not yet frozen:

1. Financial as a standalone module?
2. Payroll / HR as a standalone module?
3. Final public name: Legalization, Corporate, or another term?
4. Where Reconciliation is presented: Core, modules, or hybrid?
5. Tax Benefits as its own Fiscal submenu or inside Tax Classifications?
6. Statements as its own Accounting submenu or inside Closing?
7. Will clients of the accounting firm have their own login/surface?
8. Which modules can be sold without Intelligence?
9. White-label depth: full brand replacement or “powered by EVOLU”?
10. Minimum commercial composition of Platform.

---

## 16. Change log

### 0.1

- established EVOLU → Platform / Intelligence;
- replaced “assessoria” with **Contabilidade** as Tenant concept;
- separated Core from professional modules;
- introduced modular entitlements;
- separated source category, provider, connector and format;
- established brand/provider isolation;
- introduced the first navigation matrix;
- recorded unresolved decisions explicitly.
