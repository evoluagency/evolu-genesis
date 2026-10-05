# EVOLU Genesis

**Presentation:** https://evoluagency.github.io/evolu-genesis/  
**Operational demo:** https://evoluagency.github.io/evolu-genesis/demo/

EVOLU Genesis is the **public demonstration layer** of the EVOLU ecosystem. It shows how **EVOLU Platform** and **EVOLU Intelligence** can support accounting and tax workflows when the information required for a decision is distributed across documents, bookkeeping, historical records and people.

Genesis is intentionally separated from production runtime. It is a deterministic product-demonstration surface, not a simplified deployment of Platform or Intelligence.

The public experience is divided into two parts:

1. a product presentation explaining the problem, workflow and architecture;
2. a separate operational demo that simulates day-to-day accounting and tax work.

## What the demonstration shows

The operational environment demonstrates a fictitious accounting and advisory firm working with synthetic companies and transactions. It includes examples of:

- tax documents and accounting entries;
- reconciliation between different source categories;
- missing information that prevents a conclusion;
- historical classifications used as reference rather than automatic truth;
- requests for clarification;
- suggestions kept separate from approved changes;
- professional approval before a simulated update;
- evidence, responsibility and audit trail;
- reuse of previously validated information in a later transaction.

## Product principle

The demonstration follows a simple professional sequence:

```text
Data sources
    ↓
Reconciliation
    ↓
Missing information
    ↓
Confirmation
    ↓
Analysis
    ↓
Professional approval
    ↓
Change / record
    ↓
History and reuse
```

In the EVOLU architecture:

- **EVOLU Platform** is the System of Record / Operational Plane;
- **EVOLU Intelligence** is the System of Intelligence / Decision Plane;
- **EVOLU Genesis** is the Public Demonstration Layer.

The operational demo may present these capabilities through one unified EVOLU interface. That presentation does not collapse their production authority boundaries.

## Data sources and integrations

The demo presents source categories rather than architectural dependencies:

- tax documents;
- bookkeeping;
- financial data;
- ERP data;
- spreadsheets;
- client information.

Names such as SIEG, Domínio, ERPs and banks may appear only as examples of systems that can occupy those roles. Their presence in the demonstration does not mean that a production connector is currently available.

## What this repository is

This repository contains a simplified, deterministic and public demonstration layer intended to communicate product behavior and workflow without exposing EVOLU production systems.

## What this repository is not

It is not:

- a production runtime;
- a second implementation of EVOLU Platform;
- a reduced production runtime of EVOLU Intelligence;
- a source of operational state;
- an integration surface for real tenant data.

It does not contain customer data, production infrastructure, internal tax rules, proprietary production Skills, production Company Context, Supabase production resources, model credentials or the production EVOLU Intelligence runtime.

All companies, documents, values and analyses displayed in Genesis are synthetic or simulated. Nothing in the demonstration constitutes accounting, tax or legal advice.

## Production boundary

Genesis must remain independent from production credentials and real data. Any future attempt to connect Genesis directly to Platform or Intelligence production requires an explicit architectural decision and security review; it must not happen as an incidental demo enhancement.

Canonical ecosystem architecture and release traceability are maintained in the Platform repository under:

- `docs/architecture/EVOLU_SYSTEM_ARCHITECTURE.md`;
- `docs/architecture/PLATFORM_INTELLIGENCE_CONTRACT.md`;
- `docs/releases/RELEASE_MANIFEST.md`.

## Brand and interface standard

Genesis uses the official EVOLU symbol and keeps established accounting and tax terminology in the user interface. Internal engineering names may be more technical, but public labels should remain familiar to professionals in the sector.

The innovation is intended to be visible in the workflow, not in invented terminology.

---

**The model can change. The intelligence should remain.**
