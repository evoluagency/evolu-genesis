# EVOLU — Proposta de convergência visual Genesis + Intelligence (V1)

**Data:** 2026-10-12  
**Estado:** PROPOSTA DE MIGRAÇÃO, ainda não aprovada nem implementada no runtime  
**Referências verificadas:** Genesis `evoluagency/evolu-genesis@765853a183b50666c21a08d7090c6e35dc0231e0`; Intelligence `evolu2/intelligence@d31506fb6270000d631432949919faa475630787`.  
**Restrições:** não alterar a `main`, não consumir Actions da Platform, não publicar dados operacionais em GitHub Pages, não ativar custos/inferência/migrations e não alterar o lifecycle `PRE_LEARNING`.

## 1. Responsabilidades e limite de transferência

- **Genesis:** código-fonte da apresentação unificada, design system, shell, navegação, views do produto, composição de contexto visual, acessibilidade e contratos consumidos pela UI.
- **Platform:** dados empresariais e transações, membership, entitlements, CNPJ, contabilização e autoridade de execução. Nenhuma alteração de código, migração ou CI da Platform é pré-requisito para a primeira extração visual.
- **Intelligence:** métodos analíticos, evidências/proveniência, Skills, políticas, benchmark, memória, Study, ciclo de vida dos modelos, runtime, endpoints autorizados, limites de custo e governança. `PRE_LEARNING` proíbe aprendizado/treinamento/captura operacional automáticos e escrita implícita na Platform.

Mover **views e apresentação** não é mover tabelas, Auth, credenciais, callbacks internos, políticas RLS, memória ou o engine de IA. A interface Genesis, seja internamente publicada em app privada ou em seu código reutilizado por um host autorizado, usa uma camada de comunicação autenticada e autorizada server-side.

**Atenção à decisão já aprovada:** `evolu2/intelligence/docs/EVOLU_Intelligence_Product_Boundary_Decision_v1_1.md` atribui explicitamente o **Intelligence Lab UI** ao repositório Intelligence. Portanto, o Lab **não deve ser removido ou transferido de propriedade automaticamente**. A presente proposta adota inicialmente Lab interno na Intelligence, com visual coerente com Genesis. Se o proprietário desejar também o código da view Lab em Genesis, é necessária atualização explícita e versionada dessa decisão e dos contratos de responsabilidade nos dois repositórios.

## 2. Inventário das experiências existentes (não recriar do zero)

| Experiência existente | Origem | Destino proposto | Tratamento inicial |
|---|---|---|---|
| Central de Assessoria | Genesis: `preview/tenant-advisory-workspace/` | Genesis / Assessoria Intelligence | Preservar navegação do shell; substituir gradualmente estado sintético por um provider autorizado |
| Consultoria/chat e histórico V1 | Intelligence: `apps/intelligence/` | Genesis / Consultoria | Extrair composição de mensagens e seleção de empresa; manter runtime no backend Intelligence |
| Gate B | Intelligence: `apps/gate-b/` | Ferramenta interna de validação | Não transformar o teste de autenticação em tela normal do produto |
| Estudo e revisão | Intelligence: `apps/study-review/` | Área interna governada | Não expor a usuários de assessoria/Company sem autorização do reviewer |
| Intelligence Lab (Chat, Treinar, + Material, Histórico) | Intelligence: `apps/lab/` | Lab privado, visual compatível | Manter owner Intelligence conforme decisão V1.1; transferência sujeita a novo ADR |
| CNPJ Assistant | Intelligence: produto conceitual + Genesis `IntelligenceProvider` | Genesis / CompanyAccess com CNPJ autorizado | Extrair por módulo, não conceder visibilidade da carteira ao usuário de uma Company |
| Platform Analytics | Inteligência transversal sobre módulos | Genesis dentro das atividades Fiscal/Contábil/Financeiro | Sem novo dashboard paralelo; consumir capabilities próprias |

As quatro superfícies conceituais canônicas da Intelligence permanecem: **ASSESSORIA INTELLIGENCE, CNPJ ASSISTANT, PLATFORM ANALYTICS, INTELLIGENCE LAB**.

## 3. Fluxo objetivo

```text
Usuário autorizado (TenantAccess ou CompanyAccess)
    |
    v
GENESIS — shell, atividade, seleção de Company/CNPJ e visão
    |
    v
BFF privada, mesma origem da UX autenticada
    | verifica sessão/principal e contexto/capabilities
    +---> INTELLIGENCE — análise consultiva, fontes, confiança e resposta
    |         |
    |         +---> contexto operacional exclusivamente autorizado
    |                 por USER_JWT_RLS / fachada versionada Platform
    |
    +---> PLATFORM — decisão/aprovação/ação explícita (FUTURO, não habilitado)
```

A distribuição do build pode continuar usando a infraestrutura existente; **a implementação visual em Genesis não implica publicar app autenticada no GitHub Pages**. O site público preserva apenas informação sintética. Se a Genesis hospedar uma app privada por conta própria, devem existir hosting/BFF e autenticação apropriados; uma página estática pública não realiza autorização de servidor.

## 4. Contratos que não podem ser confundidos

- A interface `IntelligenceProvider` existente em Genesis tem quatro operações canônicas: `requestDocumentAnalysis`, `requestReconciliationAnalysis`, `explainAnalysis`, `getAnalysisHistory`. Isso **não equivale** ao chat `POST /api/intelligence` da Intelligence.
- A Intelligence V1 já utiliza `POST /api/intelligence` com `input`, `history` e seleção opcional de empresa, além de `GET /api/intelligence-context`. O navegador atual implementa `POST /api/auth` e usa `sessionStorage` para token e `localStorage` para histórico.
- **Migração recomendada:** introduzir um contrato independente e versionado de **consultoria** (`ConsultationRequest/Result`, `CompanySelection`, `EvidenceRef`, `Capability`, `PersistenceStatus`) em Genesis, com gateway injetado e autorização no BFF. Não alterar os quatro métodos da interface canônica para imitar o chat; versionar eventual extensão.
- Não copiar para Genesis a tela antiga de login, tokens guardados no browser, URLs de projeto Supabase, chaves publishable hardcoded, lógica de persistência ou chamadas cross-origin. Reusar identidade e sessão autorizadas do host; impedir mistura de sessões entre Tenants/CNPJs e limpar estado no logout/mudança de escopo.
- O endpoint de inferência deve permanecer na Intelligence; invocação de LLM exige runtime/capability e custo explicitamente disponíveis. Nenhum fallback pago implícito.
- Consultas, recomendações e feedback **não** criam `Learning Events`, aprovação operacional ou mutações automáticas.

## 5. Sequência de implementação em branches isoladas

### Etapa G-I-01 — Preparar a extração de UI na Genesis (sem produção)

1. Congelar inventário de views e contratos atuais; padronizar rotas de Assessoria/Consultoria, Company Assistant, Analytics e Lab privado.
2. Criar módulos de apresentação em `src/features/intelligence/`, reutilizando shell e componentes de Genesis. **Não** copiar integralmente scripts globais da Intelligence.
3. Introduzir interface consultiva tipada com transporte injetado, estados `unauthorized`, `unavailable`, `loading`, `ready`, `insufficient_evidence` e `error`, de modo que dados ou capacidades ausentes não sejam inventados.
4. Primeiro fluxo: abrir **Assessoria Intelligence** com CNPJ selecionado → formular uma consulta → apresentar resposta, evidências, qualidade e limitações, **sem** botões de execução operacional.
5. Validar inicialmente layout/contrato com fixtures sintéticas, mantendo a interface pública existente isolada.

### Etapa I-G-02 — Estabilizar o contrato da Intelligence

1. Inventariar as respostas reais dos endpoints `/api/intelligence`, `/api/intelligence-context` e do Lab; definir uma fachada interna versionada e mínima para a Genesis (sem duplicação de autenticação).
2. Usar os workflows existentes da Intelligence para lint, testes de contrato, autorização negativa, ciclo `PRE_LEARNING` e custo. Não alterar infra compartilhada nem iniciar inference por CI.
3. Confirmar que BFF / host privado verifica JWT real, ownership de empresa/CNPJ, limite de payload, resposta e timeout; sem vazar tokens em logs ou URLs.

### Etapa G-I-03 — Integração privada controlada

1. Consumo sob a sessão existente da experiência autenticada, sem trocar credenciais entre aplicações no navegador.
2. Verificar compatibilidade de origem, deploy protection, usuário, Tenant, Company e CNPJ; acesso negado é estado obrigatório da UI.
3. Fechar Gate B por E2E real com escopos autorizados. Até lá permanece `SOURCE_READY / E2E_PENDING`.
4. Persistência de chat e memória conforme a autoridade Intelligence; não adotar o `localStorage` antigo como fonte canônica de histórico do produto.
5. Testar contexto ausente, sessão expirada, custo/inferência indisponível, RLS negado e falha parcial antes de liberar funcionalidades.

### Etapa G-I-04 — Lab e demais superfícies

- Reconciliar o ownership do Lab por ADR antes de qualquer transferência de view; preservar sua autorização interna e isolamento `PERSONAL_PRIVATE`.
- Integrar revisões e estudo somente sob permissões explícitas.
- Reutilizar widgets analíticos dentro das telas Platform da Genesis, sem duplicar sua autoridade operacional.
- Somente após Gates e homologação, submeter mudanças para release controlado.

## 6. CI e franquias

Os repositórios Genesis e Intelligence possuem workflows GitHub Actions e histórico de execuções bem-sucedidas; isso **não comprova saldo atual** de minutos. As franquias e o bloqueio são verificáveis por **conta proprietária / billing**, não pelo simples número de repositórios. O workflow Genesis atual é `UX-7 adapter contracts` (TypeScript + providers). Seu gatilho `pull_request` pode validar esta branch pública sem minutos privados. A Intelligence possui `v1-internal-beta-validation` e outras trilhas de teste.

Manter jobs curtos, `paths` seletivos, cache quando cabível, execução sob demanda para gates caros e sem deploy de produção automático; o limite de uso/ orçamento deve ser controlado antes de disparar novas execuções. A Platform esgotou seus 3.000 minutos disponíveis nesta conta; **não** tentar reexecutar seus seis workflows para apoiar esta migração.

## 7. Critérios de aceite e decisões abertas

- [ ] UX de Assessoria usa a navegação Genesis, sem login duplicado ou vazamento de token.
- [ ] Contrato consultivo versionado, testes positivos e negativos aprovados.
- [ ] TenantAccess e CompanyAccess permanecem separados; CNPJ não autorizado retorna acesso negado.
- [ ] Intelligence continua como autoridade da análise, memória, fontes, modelos e governança.
- [ ] Resposta identifica proveniência, informações ausentes e disponibilidade efetiva, sem certeza ou execução implícita.
- [ ] Nenhum dado de cliente é publicado em GitHub Pages ou embutido em fixtures.
- [ ] Gate B E2E, privacidade, custo e release evidenciados antes da promoção.
- [ ] **Decisão pendente:** eventual transferência do código da interface Lab para Genesis requer um ADR que substitua explicitamente a decisão V1.1 sobre owner do Lab.

**Regra de release:** este documento propõe a migração, **não** marca a integração como entregue nem altera a decisão aprovada de ownership do Lab.

## 8. Source implementation checkpoint — 12/10/2026

**Stage: synthetic Genesis presentation + isolated consultation adapter, not connected.**
These artifacts were added to this draft branch after the original proposal:

- `preview/intelligence-consultation/index.html`, `consultation.css`, `consultation.js`: a Genesis shell-based consultation view inspired by the existing `apps/intelligence` conversation UX. It includes an in-page thread list, input, synthetic Company selection and response placeholders. **Zero fetch, storage, auth, inference or operational writes.** The existing `preview/tenant-advisory-workspace` now navigates to the preview.
- `src/contracts/consultation.ts` and `src/providers/intelligence/ConsultativeIntelligenceAdapter.ts`: independent, browser-inert boundary to the *existing* Intelligence V1 consultative response. A private host must inject an authenticated transport; this contract does not create such a host or make live requests.
- `scripts/consultation-contract-tests.mjs`, `npm run test:consultation`: positive/negative tests for shape, tenant/CNPJ echo, lifecycle, benchmark, response minimization and invalid inputs. The existing Genesis UX-7 Actions workflow includes the command; commits use `[skip ci]` due the exhausted/uncertain `evoluagency` account allowance.
- Companion Intelligence [PR #22](https://github.com/evolu2/intelligence/pull/22) documents the V1 wire and adds source regression coverage for the authorization and cost boundary. Intelligence runtime and database are unchanged.

**Critical legacy identity mismatch, now explicit in the adapter:**

`Genesis companyId = Platform group ID`, while `Intelligence V1 company_selection.company_id = CNPJ ID`. The correct conversion is `Genesis cnpjId → Intelligence company_id`. The response echoes tenant + CNPJ but **not** the group ID. This is why the adapter reports `verifiedScope = TENANT_CNPJ_ONLY` rather than claiming complete Company authorization. The eventual private BFF must validate the actual `cnpjId → companyId` relationship with the authoritative Platform scope and return a versioned canonical response before any real integrated UX claims full authorization.

**Unfinished:** native Node/TypeScript workflow and browser checks, BFF same-origin user session, endpoint wiring, actual user JWT/RLS negative tests, private hosting, Gate B. The Intelligence Lab ownership decision v1.1 is unchanged. No live user/company data is exposed by the synthetic preview. Do **not** merge or publish it as a private authenticated product before these gates.


### Ajuste da estratégia de CI — conta e visibilidade

Verificação atual em GitHub REST: `evoluagency/evolu-genesis` é **public** e `evolu2/intelligence` é **private**. De acordo com a documentação GitHub Actions billing, GitHub-hosted **standard runners in public repositories** are free; private included minutes are charged to the repository owner. Assim, é admissível acionar o workflow UX-7 do Genesis neste PR público, sem consumir os 3.000 minutos dos repositórios privados da `evoluagency`. O CI da Intelligence privada permanece sob a franquia da conta separada `evolu2`, ainda não verificada. Fonte: https://docs.github.com/en/billing/concepts/product-billing/github-actions
