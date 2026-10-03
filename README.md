# EVOLU Genesis

**Presentation:** https://evoluagency.github.io/evolu-genesis/  
**Operational demo:** https://evoluagency.github.io/evolu-genesis/demo/

EVOLU Genesis is a public demonstration of how **EVOLU Platform** and **EVOLU Intelligence** can support accounting and tax workflows when the information required for a decision is distributed across documents, bookkeeping, historical records and people.

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

EVOLU Intelligence is the formal name of the analysis capability in EVOLU Platform. In the operational interface, the user interacts simply with **EVOLU**, using the official EVOLU symbol as the access point.

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

This repository contains a simplified and deterministic demonstration layer. It is intended to communicate product behavior and workflow without exposing EVOLU production systems.

## What this repository is not

It does not contain customer data, production infrastructure, internal tax rules, proprietary skills, production company context, Supabase resources, model credentials or the production EVOLU Intelligence runtime.

All companies, documents, values and analyses displayed in Genesis are synthetic or simulated. Nothing in the demonstration constitutes accounting, tax or legal advice.

## Brand and interface standard

Genesis uses the official EVOLU symbol and keeps established accounting and tax terminology in the user interface. Internal engineering names may be more technical, but public labels should remain familiar to professionals in the sector.

The innovation is intended to be visible in the workflow, not in invented terminology.

---

**The model can change. The intelligence should remain.**
