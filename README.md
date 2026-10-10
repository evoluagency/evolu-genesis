# Platform UX

**Presentation:** https://evoluagency.github.io/evolu-genesis/  
**Operational synthetic scenario:** https://evoluagency.github.io/evolu-genesis/demo/

This repository contains the public and contract-first UX surface of **Platform**, one of the two EVOLU products.

EVOLU is the company and brand:

```text
EVOLU
├── Platform
└── Intelligence
```

- **Platform** owns UX, operational state, recorded decisions, approvals, execution and audit.
- **Intelligence** owns analyses, findings, evidence synthesis, recommendations and explanations.
- **UX Contracts** define the stable language between the products.
- **Mocks** are temporary development implementations of providers.

The repository name and GitHub Pages path still contain `evolu-genesis` as legacy technical metadata. That string is not a product, domain concept or architectural layer.

## What the experience shows

The synthetic operational environment demonstrates a fictitious accounting and advisory firm working with synthetic companies and transactions. It includes examples of:

- tax documents and accounting entries;
- reconciliation between different source categories;
- missing information that prevents a conclusion;
- historical classifications used as evidence rather than automatic truth;
- requests for clarification;
- recommendations kept separate from decisions and execution;
- formal approval before a controlled action;
- evidence, responsibility and immutable audit trail;
- company, CNPJ and accounting-period scope.

## Product principle

The operational chain is:

```text
Analysis
↓
Finding + Evidence
↓
Recommendation
↓
Decision
↓
ApprovalRecord [when required]
↓
ActionCommand
↓
ActionResult
↓
AuditEvent
```

A Recommendation never carries write authority. Platform executes only an explicitly authorized ActionCommand.

## Integration architecture

```text
Platform UX
    │
    ▼
UX Contracts
    │
    ├──────────────┐
    ▼              ▼
PlatformProvider   IntelligenceProvider
    │              │
    ▼              ▼
Platform       Intelligence
```

During UX development, the providers are implemented by:

```text
MockPlatformProvider
MockIntelligenceProvider
```

Mocks are not products, domain entities or permanent architectural layers.

## Data sources and integrations

The synthetic experience presents source categories such as:

- tax documents;
- bookkeeping;
- financial data;
- ERP data;
- spreadsheets;
- company-supplied information.

Names such as SIEG, Domínio, ERPs or banks may appear only as examples of systems that can occupy those roles. Vendor-specific concepts must remain behind adapters and must not enter the core UX domain.

## Production boundary

The public/synthetic surfaces do not contain customer data, production credentials or direct access to production systems.

Real integrations belong behind Platform adapters. The UX must not connect directly to Supabase, SIEG, ONVIO, TOTVS, banks or other infrastructure providers.

Canonical ecosystem architecture and release traceability are maintained in the Platform repository.

## Brand and interface standard

Public labels use established accounting and tax terminology. Internal engineering names may be more technical, but infrastructure and mock terminology must not leak into the user-facing domain.

All companies, documents, values and analyses in the synthetic scenario are fictitious or simulated. Nothing in the demonstration constitutes accounting, tax or legal advice.

---

**The model can change. The intelligence should remain.**
