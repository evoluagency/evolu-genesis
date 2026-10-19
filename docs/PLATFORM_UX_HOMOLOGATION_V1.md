# Platform UX Homologation v1

**Status:** STATIC_AND_BEHAVIORAL_CLOSURE_COMPLETE — BROWSER_HOMOLOGATION_PENDING  
**Baseline:** `main@021c485df80db8bfc0c082cd5424997a0352c1d0`  
**Scope:** Platform UX V1 with synthetic providers  
**Out of scope:** UX-7 real adapters / production backend integration

## 1. Closure statement

UX-0 through UX-6 are implemented on the current Platform UX baseline.

This document does **not** declare final visual homologation. The canonical UX specification explicitly requires real browser interaction for layout, zoom, language, table accessibility and cross-page Shell checks. Static/source validation cannot substitute those tests.

The remaining work before a final UX freeze is therefore a browser homologation pass, not a redesign or another feature migration.

## 2. Implemented migration slices

| Slice | State | Evidence |
|---|---|---|
| UX-0 — UX Contracts | complete | domain dictionary, contract catalog and typed contracts on `main` |
| UX-1 — Providers | complete | PlatformProvider, IntelligenceProvider and mock implementations |
| UX-2 — Fiscal Document Detail | complete | NF-e 70031 consumes providers; Recommendation → Decision → ApprovalRecord → ActionResult separation enforced |
| UX-3 — Company Workspace | complete | Tenant → Company → 1..N CnpjEntity and accounting-period context are provider-driven |
| UX-4 — Reconciliation | complete | Evidence → Finding → missingContext; operational PendingItem only through explicit Platform action |
| UX-5 — Pending Items + Approvals | complete | scope-aware first-class queues in Office; ApprovalRecord remains separate from execution |
| UX-6 — Audit + History | complete | Platform AuditHistory + Intelligence AnalysisHistory; existing NF-e timeline reads provider history |
| UX-7 — Real adapters | intentionally deferred | integration phase, not a requirement for synthetic UX closure |

## 3. Canonical regression matrix

Status vocabulary:

- **BEHAVIOR_VERIFIED** — code path was executed against mock providers/controllers and the invariant was observed.
- **SOURCE_VERIFIED** — implementation and route/state logic were inspected and satisfy the stated invariant.
- **BROWSER_PENDING** — source contains the required support, but the specification requires real browser interaction/visual evidence before final approval.

| Test | Expected result | Status | Evidence / observation |
|---|---|---|---|
| T-01 | Office → pending item/document in ≤3 clicks | SOURCE_VERIFIED | route matrix J-01/J-02 validates at 2/3 clicks; contextual URLs are generated without undefined segments |
| T-02 | Company Home → Finance → movement in ≤3 clicks | SOURCE_VERIFIED | J-03 validates at 3 clicks with CNPJ/period preserved |
| T-03 | only authorized Company financial role can answer | SOURCE_VERIFIED | read-only Company mode omits answer actions; normal Company financial role retains reply action |
| T-04 | read-only Finance has no entry/import/send controls | SOURCE_VERIFIED | viewer route is explicit; send route is rejected; preview removes mutation controls for viewer |
| T-05 | switching Matriz/Filial changes scoped records | BEHAVIOR_VERIFIED | CompanyWorkspaceController/MockPlatformProvider enforce authorized CNPJ scope and preserve period |
| T-06 | Aug/Sep data do not bleed across periods | SOURCE_VERIFIED | finance fixtures are keyed by Company/CNPJ/period; Sep-only synthetic import is explicitly blocked in Aug |
| T-07 | evidence/source remains distinct from tax conclusion | SOURCE_VERIFIED | Fiscal/Accounting and Finance wording/state logic explicitly separates evidence review from tax conclusion |
| T-08 | received Company response remains pending until review | SOURCE_VERIFIED | `open → answered → resolved` are distinct states; explicit professional resolve action is required |
| T-09 | evidence review requires sufficient rationale | SOURCE_VERIFIED | review rationale has minimum 12-character validation before review can be recorded |
| T-10 | Advisory context can be released only after review and open items resolved | SOURCE_VERIFIED | `canShare() = role === accounting && flow().state === ready`; `ready` requires all records reviewed and no unresolved requests |
| T-11 | editing after package v1 makes prior version stale | SOURCE_VERIFIED | submitted packet stores fingerprint; changed source data returns state `changed` and displays stale/resubmit state |
| T-12 | resending creates v2 and requires revalidation | SOURCE_VERIFIED | handoff increments `version`, stores new fingerprint, resets movement/document review flags and `released:false` |
| T-13 | sidebar toggle changes width without overlap | BROWSER_PENDING | shared Shell contains collapsed-state layout logic; actual visual overlap must be tested |
| T-14 | short viewport / 200% zoom remains usable | BROWSER_PENDING | responsive/overflow rules exist; actual 200% zoom and short-height behavior must be observed |
| T-15 | English long text is preserved | BROWSER_PENDING | PT/EN dictionaries exist across primary workspaces; clipping/wrapping requires browser observation |
| T-16 | long tables remain fully accessible | BROWSER_PENDING | pagination/scroll containers exist; row accessibility under actual viewport/zoom must be observed |
| T-17 | five primary pages keep coherent Shell/access boundaries | BROWSER_PENDING | route contracts and shared Shell are present; cross-page visual/interaction consistency requires browser run |
| T-18 | Intelligence suggestion never executes autonomously | BEHAVIOR_VERIFIED | NF-e flow requires explicit Decision → ApprovalRecord → separate ActionCommand; unauthorized/fake approval execution is blocked |

## 4. Route/journey evidence

The current `preview/shared-ux/routes.js` validates eleven journeys (J-01…J-11).

Observed static results:
- every journey has a unique ID;
- every declared journey stays within three meaningful clicks;
- Company Finance preserves Matriz/Filial and competence;
- Office pending-item navigation preserves CNPJ and competence;
- a read-only Company role cannot build the Finance send route;
- Office Approvals is first-class through `tab=approvals`;
- route query parameters are treated as navigation context, never authorization.

This is route-contract evidence, not a substitute for clicking the pages in a browser.

## 5. Version/review cycle evidence

The Finance/Accounting synthetic flow implements the V1 package semantics required by T-10/T-12:

```text
Company draft
→ handoff v1
→ Accounting review
→ pending clarification, when necessary
→ explicit evidence review
→ ready
→ explicit release to Advisory

Any source-data edit after handoff
→ fingerprint mismatch
→ changed / stale
→ previous release no longer current
→ resubmit
→ v2
→ previous movement/document reviews reset
→ revalidation required
→ ready
→ release again
```

The handoff action increments the packet version and sets `released:false`. It also resets movement/document review flags. Therefore a resubmitted package cannot inherit the prior review as current.

## 6. Browser homologation still required

Final UX approval requires one interactive run covering at least:

| Gate | Required browser evidence |
|---|---|
| T-13 | toggle expanded/collapsed sidebar on primary Tenant and Company pages; confirm no overlap or hidden controls |
| T-14 | 1440×900, 1366×768, 1280×720, short-height viewport, mobile breakpoint and browser zoom 200%; confirm no silent clipping |
| T-15 | switch to English on primary pages and dialogs; confirm headings/buttons/help text wrap without collision |
| T-16 | exercise lists/tables with pagination and scroll; confirm every row/control remains reachable by keyboard and pointer |
| T-17 | navigate Office, Company Home, Finance, Fiscal/Accounting and Advisory; confirm shared Shell, active navigation, context and access-boundary copy |

Recommended evidence per run:
- page / route;
- viewport;
- role;
- Company/CNPJ/competence;
- interaction path;
- expected result;
- observed result;
- screenshot if available;
- PASS / FAIL;
- corrective commit when FAIL.

### 6.1 Local browser homologation runner

The repository provides a local-only runner for T-13…T-17:

```bash
npm run homologate:browser:selftest
npm run homologate:browser
```

Properties:
- uses Node.js plus an installed Chromium/Chrome through the DevTools Protocol;
- introduces no npm dependency;
- creates no GitHub Actions workflow and consumes no CI minutes;
- creates no deployment;
- writes screenshots, `report.json`, `SUMMARY.md` and `HUMAN_REVIEW.md` under `.local/ux-homologation/`, which is gitignored;
- supports `CHROME_BIN` when the browser executable is not discoverable;
- returns `ENVIRONMENT_BLOCKED` instead of a false product failure when a managed browser policy blocks local HTTP;
- never converts automated layout checks into final visual approval. Successful automated checks remain `REVIEW_REQUIRED` until a human browser review signs off the evidence;
- the 720×450 layout pass is only a CSS-layout equivalent of 1440×900 at 200% zoom. An actual browser 200% zoom observation remains mandatory for T-14.

Runner self-test evidence in the engineering environment:
- runner self-test: PASS;
- runtime exceptions in self-test: 0;
- real local-page run in this environment: blocked by managed Chromium policy;
- result: no T-13…T-17 gate was marked FAIL or PASS from that blocked run.

Therefore the final browser homologation must be executed on an unrestricted local Chrome/Chromium installation before the UX V1 freeze.

## 6.2 Seis revisões humanas remanescentes — 19/10/2026

**Estado: REVIEW_REQUIRED nos seis casos; nenhuma aprovação humana registrada.** Fonte preservada: [relatório CP34](./releases/v1-completa/evidence/checkpoint-34-2026-10-17/genesis-ux-browser/report.json) no SHA **9866b657380465d421b0d4f7fdb6a21c98eecaf1**, gerado em 2026-10-17T23:35:46.008Z. Seus **44 PASS / 6 REVIEW são verificações automatizadas**, não seis jornadas V1 E2E ou aceite humano dos demais gates. São exatamente cinco linhas T14/zoom200-equivalent e a linha T16/company (zero regiões de tabela/lista detectadas, 19 controles, zero falhas de foco programático).

Não alterar o relatório, screenshots ou HUMAN_REVIEW.md históricos para registrar uma execução futura. Os IDs UX T14/T16 abaixo são rótulos visuais Genesis, distintos de T01–T18 da matriz V1.

**Preparação comum:** checkout local no SHA acima, dados/providers sintéticos existentes, Chrome/Chromium já instalado e sem sessão de cliente real. Servir o checkout apenas em loopback, por exemplo `python -m http.server 8765 --bind 127.0.0.1 --directory .`, e abrir as rotas abaixo em http://127.0.0.1:8765. Não usar host operacional, criar infraestrutura ou repetir a suíte completa. Se a política do navegador impedir HTTP local, registrar BLOCKED, não FAIL ou PASS do produto.

**HR-01…HR-05:** iniciar em janela desktop de referência 1440×900 e zoom 100%; usar o controle de zoom real do navegador para **200%**, comprovado pelo indicador/menu do próprio navegador. Não aceitar viewport 720×450, escala de screenshot, CSS zoom ou emulação como substitutos. Repetir a verificação com sidebar aberta/fechada, PT-BR/EN e tema disponível, alcançando os controles e o final do conteúdo. Para estas interfaces de tabelas, rolagem interna utilizável é permitida; nenhuma informação ou ação pode ficar inacessível.

| Caso / linha original | Rota sintética | Ação e critério específico de aprovação | Estado |
| --- | --- | --- | --- |
| HR-01 — UX T14 / office | `/preview/office-workspace/?tab=queue&cnpj=m&period=2026-09` | Abrir a fila; expandir/recolher a sidebar; alcançar primeiro e último item e seus controles sem sobreposição ou corte. | REVIEW_REQUIRED |
| HR-02 — UX T14 / company | `/preview/company-access-home/?cnpj=a&period=2026-09` | Conferir seletores de CNPJ/competência, atalhos e cartões; abrir/cancelar um diálogo sintético; manter rótulos, ações e contexto acessíveis. | REVIEW_REQUIRED |
| HR-03 — UX T14 / finance | `/preview/company-financial-workspace/?role=company&cnpj=m&period=2026-09&activity=moves` | Percorrer movimentos e rolagem horizontal/vertical disponível; alcançar a última linha e ações; conservar CNPJ/competência e limites do papel. | REVIEW_REQUIRED |
| HR-04 — UX T14 / fiscal | `/preview/tenant-fiscal-workspace/?tab=received&cnpj=m&period=2026-09` | Percorrer documentos recebidos, filtros e detalhe; alcançar informação e controles sem corte, colisão ou perda de contexto. | REVIEW_REQUIRED |
| HR-05 — UX T14 / advisory | `/preview/tenant-advisory-workspace/?tab=contexts&cnpj=m&period=2026-09` | Percorrer contextos, evidências e diálogo disponíveis; preservar texto/ações e a distinção entre evidência, revisão e conclusão não liberada. | REVIEW_REQUIRED |
| HR-06 — UX T16 / company | `/preview/company-access-home/?cnpj=a&period=2026-09` | Usar somente Tab/Shift+Tab, Enter/Espaço, setas e Escape: percorrer todos os controles visíveis, abrir/fechar diálogos e verificar retorno de foco, indicador visível e ausência de armadilha. | REVIEW_REQUIRED |

**Critério adicional HR-06:** o foco programático do relatório não comprova navegação real por teclado. Observar a sequência efetiva de Tab/Shift+Tab e todos os controles, inclusive em zoom 200%. Se a página inicial realmente não oferecer tabela/lista, registrar essa condição e percorrer o conteúdo/fluxo disponível; a ausência de uma região no seletor do runner, isoladamente, não aprova nem reprova acessibilidade. Se houver tabela, lista longa ou paginação no fluxo, comprovar primeira/última linha e todas as ações por teclado e ponteiro.

**Evidência exigida por caso:** SHA efetivamente revisado, data/hora, nome do revisor, browser/versão, viewport/zoom real, rota, papel/CNPJ/competência sintéticos, PT-BR/EN/tema, passos, esperado/obtido e PASS/FAIL/BLOCKED. HR-01…HR-05 exigem captura do indicador 200% e do conteúdo/ação final; HR-06 exige sequência ou vídeo curto de foco/rolagem/fechamento de diálogo. Sanitizar qualquer captura. Corte de texto indispensável, ação inacessível, armadilha de foco ou troca indevida de contexto impede PASS. Uma falha requer correção delimitada e nova prova apenas do caso afetado; este roteiro não autoriza release ou atesta JWT/RLS.

## 7. Nomenclature gate

The current baseline passed a repository-wide text scan of the UX source/document set for the retired naming.

Allowed:
- technical repository slug `evolu-genesis` until repository rename.

Not allowed in product/domain/docs/UI language:
- retired product name;
- `EVOLU Platform` as the product name;
- `EVOLU Intelligence` as the product name.

Canonical:
- EVOLU = company/brand;
- Platform = operational product;
- Intelligence = intelligence product;
- UX Contracts = shared language;
- mocks = temporary implementations.

## 8. Engineering caveat

UX-6 passed behavioral runtime regression and static request/contract consistency checks. A fresh independent `tsc` run for the final reconciled UX-6 head was **not** executed in the review environment because the repository could not be materialized there due to network resolution limits. This document does not misrepresent that check as completed.

The local browser-homologation runner itself passed its synthetic self-test. The managed Chromium available in the review environment blocks local HTTP and file navigation by organization policy; the runner correctly reports `ENVIRONMENT_BLOCKED` rather than classifying the Platform as failed. Consequently, this environment still cannot supply the final human browser evidence for T-13…T-17.

These are engineering verification constraints; they do not change the browser-homologation boundary above.

## 9. Freeze decision

Current state:

```text
UX implementation          COMPLETE through UX-6
Contract-first migration   COMPLETE through UX-6
Nomenclature freeze        COMPLETE
Static/behavioral QA       COMPLETE for T-01…T-12 and T-18
Browser homologation       PENDING for T-13…T-17
Real adapters              UX-7 / separate integration phase
```

Final UX V1 freeze may be declared after T-13…T-17 receive browser evidence with no unresolved blocking defect.

No new UX feature or redesign should be introduced merely to complete this gate. Any failure should be corrected as the smallest possible defect against the current approved architecture.
