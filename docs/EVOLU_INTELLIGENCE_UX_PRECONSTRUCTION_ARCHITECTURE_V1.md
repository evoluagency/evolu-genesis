# EVOLU Intelligence — Arquitetura de UX e Identidade Visual | Pré-construção V1

**Identificador:** EVOLU-INT-UX-ARCH-01  
**Data de referência:** 2026-10-12  
**Estado:** ARQUITETURA PRÉ-CONSTRUÇÃO — DIREÇÃO VISUAL ESTABELECIDA PELO RESPONSÁVEL; IMPLEMENTAÇÃO E HOMOLOGAÇÃO PENDENTES  
**Repositório da UX:** `evoluagency/evolu-genesis`  
**Motor Intelligence:** `evolu2/intelligence`  
**Autoridade operacional:** `evoluagency/Platform`  
**Escopo:** nove composições visuais do mockup, layer contextual vivo, design system, marca, eventos, protocolo da interface, segurança e gates de aceitação.  
**Natureza:** especificação de produto e arquitetura; não confere autorização de publicação, execução operacional ou aprendizagem automática.

## 0. Decisões mandatórias — NÃO NEGOCIÁVEIS

1. **O layout de referência é exatamente o mockup de nove telas aprovado.** Devem ser preservados a composição, hierarquia visual, organização de painéis, cards, abas, tabelas, gráficos, navegação, densidade, alinhamentos e posições funcionais, incluindo o acionador flutuante inferior direito. Implementação responsiva e acessível adapta dimensões à janela, **não redesenha o produto**. Qualquer mudança estrutural em relação à referência exige aprovação explícita.
2. **As cores pertencem à identidade visual já existente da EVOLU Platform.** Intelligence não terá tema cromático paralelo. Deve herdar os mesmos design tokens efetivos de Platform nos modos **Light** e **Dark**, incluindo superfícies, textos, bordas, foco, estados e sombras. A tonalidade violeta/azul vista no mockup é uma aproximação artística e **não** autoriza uma nova paleta.
3. **A logomarca Intelligence NÃO POSSUI FUNDO.** O arquivo original fornecido é um desenho com transparência alfa; não há quadro, quadrado, círculo, cartela, placa, moldura, fundo preto, fundo branco, preenchimento decorativo ou caixa colorida *integrados à marca*. Sempre exibir **apenas o símbolo**, preservando o canal alfa original. Isso vale para cabeçalhos, sidebar, estados do agente, cards e especialmente botão flutuante. O alvo clicável pode ocupar uma área invisível adequada para acessibilidade, mas seu `background` deve ser `transparent`; não criar elemento gráfico atrás do símbolo. Apenas o indicador de foco acessível, quando acionado por teclado, pode contornar a área interativa, sem alterar a arte.
4. **Genesis é toda a UX.** Platform executa e valida dados/ações; Intelligence observa contexto autorizado, investiga, explica e sugere. A experiência diária da Intelligence é uma **camada viva contextual sobre as páginas**, não um conjunto de páginas estáticas que substituem o produto Platform.
5. O conteúdo da conversa, as perguntas subsequentes e as propostas de interação podem ser decididos dinamicamente pelo motor Intelligence. Genesis **não** possui roteiro rígido de perguntas; apresenta apenas **componentes tipados e autorizados** dentro de um protocolo versionado. Nunca renderizar código/HTML arbitrário do motor.
6. Nenhuma observação comportamental concede autorização, gera treinamento, coleta digitação indiscriminada ou executa decisões. Lifecycle Intelligence continua `PRE_LEARNING`; consentimento, privacidade, custo e privilégios continuam obrigatórios.
7. **O mockup não é evidência de funcionalidades conectadas ou resultados financeiros reais.** Indicadores, percentuais, estimativas, textos legais e nomes de empresas contidos na arte são ilustrações; nunca publicar como dados reais, aconselhamento ou fonte verificada.

## 1. Controle das referências visuais

**Referência visual-mestre:** `painel_de_interfaces_evolu_intelligence.png`, imagem aprovada nesta conversa, **1491 × 1055 px**, SHA-256:
`934d1484622adb590fa3e1c30d78e630bfd11d4446dee389b724465f9208091b`.

**Ativo oficial de marca recebido:** `1000235536.png`, **1536 × 1536 px**, **RGBA**, com pixels transparentes; SHA-256:
`875eed4df81729d01fcaa891d42829508a3a55d532a8ad7d8a9b1e3d517ea185`.

**Nota de custódia:** hashes foram obtidos nos anexos desta conversa. Estes arquivos **não foram adicionados ao GitHub nesta etapa**; antes de implementar, versionar/referenciar os binários oficiais em repositório ou gestão de ativos, com proveniência e permissão. **Nunca** extrair a marca da imagem do mockup: aquela composição mostra falsamente o símbolo sobre uma superfície quadrada colorida. A fonte de verdade para a geometria e transparência da marca é o **PNG original RGBA**, não o mockup gerado.

**Hierarquia de referência:** (1) requisitos explícitos do responsável — identidade Platform e marca sem fundo; (2) mockup aprovado — **layout** das nove experiências; (3) design tokens compartilhados Platform/Genesis efetivamente governados; (4) contratos técnicos e UX existentes. Se o mockup conflitar com (1), corrigir a aplicação **de cores e marca**, mantendo o layout; não copiar a cartela atrás do logotipo.

## 2. Identidade visual compartilhada: tema Dark e Light

### 2.1 Fontes de código verificadas

- `evoluagency/evolu-genesis/preview/shared-ux/shell.css` define um **shell UX com tokens Dark e Light** e padrões de sidebar, cabeçalho, cards, menus, responsividade e foco acessível. Usar como referência técnica do shell visual existente; futuras views Intelligence devem consumir os tokens comuns, nunca uma folha de paleta independente.
- `evoluagency/Platform/app/globals.css` define na `main` consultada uma **paleta Light de runtime** distinta (e.g. `--bg: #f4f7f8`, `--panel: #ffffff`, `--brand: #17324d`, `--accent: #2a6f73`). **Este arquivo, isoladamente, não comprova um tema Dark de runtime**.
- Portanto existe **diferença real entre a paleta Light do runtime Platform e os tokens Light do shell UX Genesis**. Não declarar isso unificado por conveniência. Pré-construção deve registrar a reconciliação de tokens com o responsável visual da Platform **antes de congelar capturas Light/Dark de produção**.

### 2.2 Tokens já existentes no shell unificado Genesis / linguagem Platform UX

| Token compartilhado | Dark no shell atual | Light no shell atual |
| --- | --- | --- |
| `--bg` | `#0b0e15` | `#f5f7fb` |
| `--side` | `#0e141d` | `#ffffff` |
| `--card` | `#141d2a` | `#ffffff` |
| `--soft` | `#1b2534` | `#f1f4f9` |
| `--line` | `#2b3747` | `#dfe5ed` |
| `--text` | `#edf1f9` | `#1b293b` |
| `--muted` | `#a5b2c4` | `#57687d` |
| `--quiet` | `#8190a4` | `#718094` |
| `--accent` | `#a18aff` | `#7057d3` |
| `--accent-soft` | `rgba(161,138,255,.12)` | `rgba(112,87,211,.10)` |
| `--good` | `#71dbb2` | `#157f61` |
| `--warn` | `#f2c47b` | `#9e681c` |
| `--bad` | `#ec919e` | `#bc505c` |

**Natureza da tabela:** transcrição dos valores do shell compartilhado existente, **não** declaração de que são os valores finais reconciliados da Platform em produção. A implementação deverá consumir os tokens validados como canônicos pela Platform e ter uma única fonte por tema.

### 2.3 Invariantes da identidade

- O layout das nove composições permanece **o mesmo em Light e Dark**, com mudança somente de tokens cromáticos, sombras, ilustrações de dados e ajustes inevitáveis de contraste.
- Não criar um modo `Intelligence Dark`, `AI Purple`, `Intelligence Neon`, gradiente novo, glow diferente ou paleta isolada.
- Estados de risco/sucesso/atenção usam `--bad`, `--good`, `--warn` (ou seus equivalentes canônicos após reconciliação), nunca decoração que faça um risco parecer aprovado.
- Texto, input, borda, ícone, hover, desabilitado, foco visível, gráfico, modal e tooltip devem passar pela mesma matriz de cores e contraste do host.
- Preservar a família tipográfica, padrões de espaçamento, altura do cabeçalho, largura/recolhimento da sidebar, raio de borda e profundidade dos cards da Platform/Genesis. Nenhum sistema visual concorrente.
- Em `CompanyAccess` white-label, preservar a identidade Tenant autorizada no shell; a apresentação da Intelligence não pode substituir ou vazar a marca de outro Tenant. A posição/uso da marca Intelligence precisa respeitar as decisões de branding e entitlement existentes, **sem atribuir permissões por branding**.

## 3. Especificação obrigatória do logo — arte transparente

**Arquivo correto:** ativo de marca original com canal alfa (não uma captura de tela, não imagem com fundo removido heurísticamente e não logomarca redesenhada).  
**Regra de CSS do acionador:** imagem `object-fit: contain`; contêiner clicável `background: transparent; border: 0; box-shadow: none` em repouso; sem pseudo-elemento `::before`/`::after` de placa/fundo; preservar proporções sem distorção, recorte ou filtro cromático que altere o degradê intrínseco.  
**Diferenciação necessária:** a superfície **do painel aberto** usa a cor do tema Platform; isso não cria fundo da marca. O próprio símbolo deve continuar transparente sobre qualquer superfície.  
**Foco/teclado:** rótulo acessível “Abrir EVOLU Intelligence”, acionamento Enter/Espaço e `focus-visible` conforme acessibilidade do shell, sem moldura permanente.  
**Dark/Light:** usar a **mesma arte com alfa**; não criar versão opaca ou recortar retângulo preto do anexo.  
**Qualidade de ativo:** testar pixels com `alpha=0` nos cantos, contornos sem halos/fundo achatado e transparência preservada na conversão de arquivos.

**Proibições explícitas:** logo branca sobre quadrado roxo; logo sobre cartela azul; bolinha atrás da marca; tiles do mockup gerado; JPG da marca; export com fundo preto/branco; recorte que perca o canal alfa.

## 4. Nove composições do mockup — layout congelado

O quadro 3 × 3 retrata nove **experiências e estados de workspace**. Preservar a composição de cada quadro. Estas composições **não** tornam a Intelligence uma nona coleção de páginas obrigatórias no menu da Platform: em operação cotidiana, a entrada principal é o **botão flutuante contextual**; painéis ampliados/workspaces especiais podem usar o layout completo do mockup quando autorizados. O Lab tem acesso independente restrito.

| Nº | Composição visual (título fiel) | Estrutura e comportamento a preservar | Governança |
| --- | --- | --- | --- |
| 1 | **Página Inicial da Intelligence** | Shell Platform; boas-vindas/contexto, indicadores em linha, três insights centrais, faixa de ações rápidas; ícone flutuante. | Visão do assistente quando aberta/expandida; números somente de fonte autorizada. |
| 2 | **Assistente Contextual** | Página operacional ao fundo; drawer à direita com título, mensagem proativa, CTA aceitar/dispensar, sugestões contextuais e campo conversacional. | **Entrada principal no fluxo de trabalho**; pergunta gerada pelo motor, não roteiro fixo; silêncio quando apropriado. |
| 3 | **Estratégia Tributária** | Cabeçalho com contexto da empresa, abas; comparação horizontal de três cenários com indicadores, riscos, conclusão e ação de detalhar. | Hipóteses e cálculo devem indicar legislação/data/premissas, não promover um regime sem elegibilidade comprovada. |
| 4 | **Análise de Documentos** | Card do documento, abas de resumo/dados/riscos/perguntas, linhas de ocorrências com gravidade e navegação para evidência. | Acesso somente a documentos autorizados; classificação de risco não substitui revisão humana. |
| 5 | **Alertas e Oportunidades** | Lista filtrável por categoria/tempo, itens com sinal, explicação, timestamp relativo e CTA para explorar. | Sinais mínimos, não vigilância irrestrita; evitar spam/proatividade intrusiva. |
| 6 | **Evidências e Fontes** | Conclusão destacada + status/qualidade de evidência, abas por fonte, referências ordenadas e CTA “Ver fonte”. | Só exibir referência jurídica verificada, íntegra, vigente e contextualizada; métrica de confiança só se calibrada. |
| 7 | **Histórico e Memória** | Cabeçalho e abas de consultas/casos/temas/anotações; busca, filtros e linha do tempo de interações. | `PERSONAL_PRIVATE` por padrão; isolamento por usuário/escopo e política de retenção. |
| 8 | **Analytics e Insights** | KPIs superiores, gráfico temporal, gráfico de composição, três cards-resumo inferiores; filtros de período e área. | Métricas operacionais com origem definida, jamais dados fictícios apresentados como reais. |
| 9 | **Lab e Governança** | Shell interno com abas (visão geral, experimentos, configuração, permissões, privacidade, auditoria); painéis de experimentos, configurações, acessos e eventos. | **RESTRITO** e `PRE_LEARNING`; o Lab UI permanece sob ownership Intelligence conforme decisão aprovada v1.1, até ADR explícito que mude isso. |

### 4.1 Regras para todas as nove composições

- Preservar a linguagem de sidebar/cabeçalho/cards/abas/listas/filtros, a sequência de conteúdo, e as proporções visuais do mockup como **baseline de avaliação visual**.
- O ícone Intelligence fica na posição **inferior direita**, sem fundo, com área de interação acessível; no estado 2 o drawer se ancora na direita sem bloquear criticamente a tarefa.
- A dimensão adaptativa evita ocultar dados: em telas menores, as mesmas regiões se empilham ou passam a scroll controlado; zoom 200%, teclado e leitura de tela devem continuar funcionais.
- Os textos de rótulos dos nove quadros identificam **estados e contextos**, não uma obrigação de criar nove URLs públicas. O design de navegação do mockup será reproduzido nas views especializadas autorizadas; a arquitetura canônica existente declara expressamente: **“Intelligence is not a sidebar module”** (`Genesis/docs/PLATFORM_ARCHITECTURE.md §10`). Logo, não acrescentar a Intelligence como departamento operacional isolado só porque a arte mostra um item visual “Intelligence”.
- **Não alterar a geometria ou estilo por iniciativa de engenharia**. Divergências do layout-mestre exigem registro `VISUAL_DEVIATION`, justificativa (acessibilidade, segurança, responsividade) e aprovação.

## 5. Camada viva: comportamento e separação de responsabilidades

### 5.1 Modelo funcional

```text
Genesis — shell da atividade, desenho, componentes, sessão e contexto exibido
  |
  +-- Eventos de UX mínimos (tentativas, validação, tempo na atividade)
  |      [opt-in / observabilidade proporcional; sem capturar digitação bruta]
  v
Sensor local de sinais e controle de frequência (sem inferência por tecla)
  |
  v
BFF privada — autenticação, contexto, tenant/group/CNPJ, permissões, deduplicação
  |                            |
  |                            +--> Platform: fatos, escopo, RLS, autoridade operacional
  v
Intelligence — hipóteses, diálogo, Skills, evidências, decisão de intervenção
  |
  v
Protocolo tipado de UI (versão, intenção, evidências, limites, componentes)
  |
  v
Genesis — convite discreto, drawer, formulário dinâmico, cenários, fontes
  |
  +--> Aceitar/dispensar/seguir investigando; ação operacional só na Platform
```

**Ownership:** Genesis controla *como mostrar*; Intelligence controla *o que perguntar e por quê*; Platform controla *o que é factual e quem pode acessar/alterar*. O motor não escolhe HTML executável, novas permissões ou efeitos de escrita.

### 5.2 Estados do acionador e do painel

`DORMANT` (marca visível, sem interrupção) → `CANDIDATE_SIGNAL` → `INVITATION` (curta e dispensável) → `ACCEPTED` → `INVESTIGATING` → `EXPLAINING/COMPARING` → `RECOMMENDATION_READY` → `CLOSED`.  
Fluxos alternativos: `DISMISSED`, `COOLDOWN`, `UNAVAILABLE`, `FORBIDDEN`, `INSUFFICIENT_EVIDENCE`. Não reabrir automaticamente após dispensa durante cooldown.

O convite inicial usa texto econômico e não acusa erro sem verificação. Um NCM alterado repetidas vezes é **sinal comportamental**, não prova de classificação inválida. Uma possível incompatibilidade fiscal exige avaliação fundamentada da **mercadoria, notas legais/classificatórias, legislação vigente e material técnico**, não inferência por CNAE da empresa.

### 5.3 Protocolo de interação proposto (NÃO é API publicada)

Entrada `IntelligenceContextEnvelope v0.1`:
- `interactionId`, `pageId`, `moduleId`, `activityId`, `locale`, `theme`, `timestamp`;
- `scope`: `tenantId`, `companyId` (grupo), `cnpjId` (estabelecimento), competência e objeto, quando autorizados;
- `capabilities` verificadas no servidor;
- `signals`: tipos/eventos agregados, contagens e janelas — **sem capturar valores dos campos ou texto digitado**, salvo envio explícito na consulta;
- `evidenceRefs` e `sourceVersions` autorizadas; `consentState`, `privacyScope`.

Saída `IntelligencePresentationIntent v0.1`:
- `intentId`, `schemaVersion`, `kind`: `SILENT`, `INVITE`, `ASK`, `EXPLAIN`, `COMPARE_SCENARIOS`, `PRESENT_EVIDENCE`, `RECOMMEND`, `UNAVAILABLE`;
- `priority`, `confidenceOrUncertainty`, `reasonCode`, `validUntil`, `cooldownHint`;
- `blocks[]` exclusivamente de um catálogo seguro: `Text`, `QuestionOpen`, `ChoiceSet`, `ReferenceCard`, `ScenarioComparison`, `Warning`, `ActionLink`;
- `provenance`, `missingFacts`, `legalEffectiveDate`, `scopeBinding`;
- `allowedUserActions` restringidas pela BFF; **nenhum bloco inclui SQL, script, HTML arbitrário ou comando operacional**.

Esses nomes são **proposta pré-construção**, não refletem contratos existentes da API. Ao implementar, criar schemas JSON/TypeScript versionados e validar entradas e saídas em runtime antes de renderizar.

### 5.4 Conteúdo conversacional gerado dinamicamente

Perguntas-padrão podem servir como **fallback ou entrada rápida**, mas o motor deve poder fazer perguntas abertas, pedir detalhes técnicos, comparar opções, solicitar documentos autorizados e reformular sua investigação. A UI fornece campos e componentes genéricos; não codifica na Genesis uma árvore obrigatória de perguntas sobre cada tributo ou documento.

### 5.5 Política de intervenções

- Sinal local isolado ≠ autorização para inferência, notificação persistente ou diagnóstico de usuário.
- Frequência, threshold, cooldown, opt-out, quiet mode e limites de custo controlados e auditáveis.
- Não monitorar continuamente teclado, clipboard, janela, tela, conteúdo privado ou produtividade individual. Detectar somente sinais estritamente úteis à assistência, com aviso transparente e base apropriada de tratamento.
- Quando a tarefa exigir análise de dados, solicitar o mínimo necessário de forma autenticada e específica ao contexto.
- Nenhum polling contínuo, cron, treino automático, ingestão indiscriminada ou chamadas ao LLM por mudança de foco; a inferência permanece on-demand com budget guard.

## 6. Escopos, confidencialidade, confiabilidade e auditoria

- `Tenant` ≠ `Company` ≠ `CnpjEntity`. Na Intelligence V1 legada `company_selection.company_id` identifica o **registro CNPJ**, diferente do `companyId` canônico da Genesis (grupo). Não conflitar: mapear `cnpjId → company_selection.company_id` e confirmar **CNPJ→grupo** no servidor. O eco do backend legado não comprova a associação ao grupo.
- Usar autenticação real com `auth.getUser`, user JWT, RLS, validação de entitlements/capabilities e BFF privada; sem tokens no site público, sem service role no browser.
- As respostas tributárias devem distinguir `FACT`, `HYPOTHESIS`, `LEGAL_SOURCE`, `MISSING_EVIDENCE`, `RECOMMENDATION`, trazer data de vigência, jurisdição e informação faltante. Alegações de “92% de confiança” só quando houver metodologia aferida; nunca confiar nos números inventados do mockup.
- Recomendar não é decidir, aprovar ou executar. Qualquer transição para ação da Platform requer comando tipado, confirmação humana, autorização e trilha de auditoria independentes.
- Lab, Study, memória privada e revisão de conteúdos permanecem internos e governados; `PRE_LEARNING` não permite promoção global/training automático.

## 7. Arquitetura de componentes para implementar na Genesis

```text
GenesisShell (tokens Light/Dark da Platform)
 ├── PlatformActivityView (páginas e campos operacionais)
 ├── IntelligenceFloatingTrigger
 │    └── original-logo-RGBA [SEM FUNDO]
 ├── IntelligenceContextSensor (sinais mínimos locais)
 ├── IntelligenceInterventionController (limites/cooldown/consentimento)
 ├── IntelligenceDrawer (mockup quadro 2)
 │    ├── ContextHeader
 │    ├── DynamicConversationRenderer
 │    ├── EvidenceList / LegalReferences
 │    ├── OpenQuestion / ChoiceSet
 │    └── ScenarioComparison / NextSteps
 └── IntelligenceWorkspaceViews (composições 1, 3–9 sob permissões)
      └── Intelligence Lab privado [owner Intelligence, até ADR]

PrivateHost/BFF
 ├── Auth + Tenant/Group/CNPJ scope + Entitlements
 ├── Context Projection + Data Minimization
 ├── Rate/Cost/Consent Controls
 └── Intelligence API/Skill boundary

IntelligenceCore (motor, modelos, políticas, proveniência, memória, Lab)
PlatformCore (dados e operações autorizadas)
```

O protótipo atual `preview/intelligence-consultation/` e o adaptador `ConsultativeIntelligenceAdapter` no PR Genesis #26 permanecem **artefatos de exploração e contrato**, não a UX final do botão flutuante. O workflow Genesis validou anteriormente TypeScript e dez testes do contrato consultivo; **nenhuma dessas verificações homologa a presente arquitetura visual**.

## 8. Plano de construção em gates verificáveis

**Gate A — Congelamento de design (antes de codificar UI nova):**
- Versionar os dois ativos originais (mockup-mestre e logo RGBA) com hashes; obter aprovação das referências.
- Resolver explicitamente discrepância `Platform/app/globals.css` vs `Genesis/preview/shared-ux/shell.css`: definir fonte canônica Light/Dark e matriz de equivalência de tokens. **Não criar terceira paleta.**
- Aprovar as nove composições como referência exata e o padrão da marca **sem fundo**.

**Gate B — Shell e componentes visuais:**
- Montar botão global transparente; drawer com estado aberto/fechado; renderizador tipado; view 1 e views 3–8 reproduzidas conforme mockup em ambos os temas; view 9 apenas na superfície privada.
- Tests visuais de geometria, alinhamento e responsividade contra referência; contrastes, teclado e acessibilidade. O mockup escuro serve como baseline de **layout**, não como paleta literal.
- Nenhuma conexão a dados reais no site Genesis público.

**Gate C — Percepção/diálogo sem backend operacional:**
- Eventos locais mínimos; regrinhas de sinal e cooldown; convites controlados; mensagens dinâmicas simuladas usando schemas; testar silent/dismiss/no-repeat/opt-out.
- Não pré-determinar as perguntas no frontend; fixtures simulam payloads variáveis do motor.

**Gate D — Backend consultivo real:**
- BFF privada, sessão autorizada, scope binding Tenant/Company/CNPJ, fonte legal/proveniência, custo e limites; ligação read-only com Intelligence e Platform.
- Evidenciar `PRE_LEARNING`, API versionada, resposta fail-closed e falhas de autorização; Gate B Intelligence autenticado real ainda exige homologação.

**Gate E — Produto e release:**
- Revisão de todas as nove composições Light e Dark; contraste e transparência da marca; tratamento de risco, fonte e dados ausentes; proteção de informações pessoais; gestão de orçamento de inferência.
- Aprovação humana de arquitetura, segurança e produto; só então mudanças em `main`, preview privado ou release produtivo.

### 8.1 Matriz mínima de aceitação

| ID | Verificação | Resultado exigido |
| --- | --- | --- |
| VIS-01 | Comparação estrutural contra os nove quadros do mockup | Hierarquia e layout equivalentes; desvios somente aprovados |
| VIS-02 | Alternar Platform Light ↔ Dark na mesma tela | Mesmo layout, mesmas famílias de tokens Platform, contraste adequado |
| BRAND-01 | PNG/SVG oficial em fundo claro e escuro | Canal alfa preservado, zero cartela/fundo/moldura no símbolo |
| BRAND-02 | Botão flutuante em repouso e com foco de teclado | Só símbolo visível em repouso; hit target acessível; foco visível |
| FLOW-01 | Sinal de NCM editado repetidas vezes | Convite não acusatório, sem diagnóstico fiscal prematuro |
| FLOW-02 | Usuário dispensa ajuda | Cooldown/quiet mode respeitados, sem reabertura abusiva |
| FLOW-03 | Pergunta inédita do motor | Campo/renderização dinâmica aceita texto e controles tipados autorizados |
| SCOPE-01 | Troca de Tenant/Company/CNPJ | Limpeza/isolamento de sessão e contexto; nenhum dado cruzado |
| SOURCE-01 | Recomendação tributária com informação incompleta | Limitação explícita; sem fundamento inventado |
| RUNTIME-01 | Infra, IA ou orçamento indisponível | Degradação segura, sem custo imprevisto nem recomendação falsa |
| GOV-01 | Lab/Study e memória | Acesso restrito, `PRE_LEARNING`, sem promoção/treinamento automático |
| RELEASE-01 | Gate E concluído | Testes, evidências e aprovação expressa antes da produção |

## 9. Decisões registradas e pendências

### CONGELADO por esta instrução do responsável
- Mockup 3×3 como referência exata de **layout**.
- Cores/estilo = EVOLU Platform **em Light e Dark**; não há identidade cromática independente da Intelligence.
- Logo Intelligence = desenho original com **fundo 100% transparente**; proibição de cartela, fundo preto/branco, círculo ou quadrado atrás do símbolo.
- Intelligence = camada estratégica viva e contextual integrada à Genesis, com motor e regras operacionais separados.

### ABERTO (não presumir resolvido)
- Fonte única final dos tokens Platform Light/Dark, dada a divergência entre shell Genesis e runtime Platform consultados.
- Custódia/versionamento de mockup e arquivo original da marca no GitHub.
- Especificação executável de schemas de interação dinâmica e contrato BFF.
- Gate B autenticado, limites de observabilidade/consentimento e orçamento de inferência.
- Ownership do **Lab UI** segue a decisão `evolu2/intelligence/docs/EVOLU_Intelligence_Product_Boundary_Decision_v1_1.md`; migração de propriedade requer ADR novo.
- Validação de telas Light (o mockup visual enviado mostra apenas Dark) e da experiência responsiva.

### Arquivos do projeto relacionados
- `Genesis/docs/PLATFORM_ARCHITECTURE.md` §10 — Intelligence transversal, não módulo da sidebar.
- `Genesis/docs/GENESIS_INTELLIGENCE_UI_CONVERGENCE_PROPOSAL_V1.md` — proposta anterior de migração: **subordinada ao presente documento** em caso de conflito de layout, posição, cores e comportamento vivo.
- `Genesis/preview/shared-ux/shell.css` — tokens Light/Dark atuais da linguagem UX.
- `Platform/app/globals.css` — tokens Light do runtime atual; reconciliação pendente.
- `Intelligence/docs/EVOLU_Intelligence_Product_Boundary_Decision_v1_1.md` — separação de produto e ownership do Lab.

**Regra de execução:** nenhum desenvolvedor deve iniciar nova identidade visual, mudar o layout aprovado ou aplicar fundo à marca por conta própria. A implementação deve passar nos gates documentados sem confundir arte ilustrativa com dados jurídicos, operacionais ou de segurança verificados.
