# EVOLU Genesis — Front-end / UX

**Official website:** https://evolu.ink/  
**Public interactive demo:** https://evolu.ink/demo/  
**GitHub Pages technical fallback:** https://evoluagency.github.io/evolu-genesis/

## EVOLU — technology startup positioning

**EVOLU is a bootstrapped, pre-commercial technology startup initiative** developing a professional, extensible enterprise platform for accounting, tax, financial and business operations and intelligence. Its product vision is broader than the present demonstration; phased validation does **not** limit the intended product scope. Current investment prioritizes existing tools and no additional planned infrastructure expenditure. Commercial launch and potential outside investment are later decisions, grounded in verified operating results.

The long-term ambition is to compete in enterprise software and business intelligence markets. Thomson Reuters, SAP and TOTVS are strategic market references, **not claims of current feature parity, affiliation or endorsement**.

Pilot validation is intended to use real businesses' authorized operational data, **only in separate, private and controlled environments** after applicable legal, contractual, security and privacy requirements are met (including Brazilian LGPD and relevant ANPD guidance). No compliance certification or production readiness is claimed merely by this statement.

## Architectural role

This repository owns **the front-end, user experience and UX contracts** for the EVOLU ecosystem: the public product presentation, synthetic interactive demonstration and future authenticated interfaces. Genesis is a repository/interface layer, **not a third standalone commercial product**.

EVOLU is the company and brand:

```text
EVOLU
├── Platform (operational back-end / system of record)
├── Intelligence (analysis and decision intelligence)
└── Genesis (front-end / UX for the ecosystem)
```

- **Genesis** owns UX, visual interfaces, navigation and user interactions.
- **Platform** owns authorized operational state, APIs, business rules, decisions, approvals, execution and audit.
- **Intelligence** owns analyses, findings, evidence synthesis, recommendations and explanations.
- **UX Contracts** define the stable language between the components.
- **Mocks** are temporary development implementations of providers.

The repository slug `evolu-genesis` remains technical metadata; it is not an additional business product.

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
Genesis Front-end
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

A future authenticated Genesis interface may serve controlled operational pilots, but must use a separate environment and authorized back-end interfaces, with tenant segregation, access controls, traceability, legally appropriate processing, data retention rules and incident-response procedures. **Do not place real business data in the public synthetic demo.**

Canonical ecosystem architecture and release traceability are maintained in the Platform repository.

## Brand and interface standard

Public labels use established accounting and tax terminology. Internal engineering names may be more technical, but infrastructure and mock terminology must not leak into the user-facing domain.

All companies, documents, values and analyses in the synthetic scenario are fictitious or simulated. Nothing in the demonstration constitutes accounting, tax or legal advice.

---

**The model can change. The intelligence should remain.**
