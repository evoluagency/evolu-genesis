# EVOLU Genesis

**Live demo:** https://evoluagency.github.io/evolu-genesis/

EVOLU Genesis is a public-facing interactive demonstration of the relationship between **EVOLU Platform** and **EVOLU Intelligence**.

The experience simulates a white-label accounting and advisory firm operating multiple CNPJs through EVOLU Platform, while EVOLU Intelligence uses company context to interpret a fiscal scenario, detect missing context and produce a reviewable recommendation.

## What this repository is

This repository contains a simplified demonstration layer. It is designed to communicate product architecture and interaction patterns without exposing EVOLU production systems.

## What this repository is not

It does not contain customer data, production infrastructure, internal domain rules, proprietary skills, production CompanyContext, Supabase resources, LLM credentials or the EVOLU Intelligence runtime.

All companies, documents, values, confidence scores and analyses displayed in the demo are synthetic or simulated. Nothing in the demo constitutes accounting, tax or legal advice.

## Demo structure

- EVOLU Lab / Genesis landing experience
- NEXUS Contabilidade & Assessoria — fictitious white-label tenant
- synthetic portfolio with companies under different tax regimes
- Company Context view
- contextual fiscal analysis
- missing-context resolution
- simulated re-evaluation, evidence and human validation
- architecture view explaining Platform → Company Context → Intelligence

## Public architecture

```text
Accounting / advisory firm
        ↓
EVOLU Platform
        ↓
Company Context
        ↓
EVOLU Intelligence
        ↓
Reviewable output
```

The model can change. The intelligence should remain.
