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

## 10. Emenda funcional obrigatória — autonomia consultiva com execução humana delegada (V1.1)

**Decisão confirmada em 2026-10-12:** a regra “Intelligence não executa” deve ser interpretada como **“Intelligence não executa operação empresarial sem autorização humana válida”**. A autorização é obrigatória, mas pode ser a instrução explícita dada pelo usuário durante a própria conversa depois de conhecer e compreender um plano suficientemente delimitado. Não há exigência universal de segundo clique para tarefas reversíveis de baixo risco; a Platform aplicará, contudo, suas políticas de confirmação extra, dupla aprovação ou revisão profissional quando necessário.

### 10.1 Separação de atos

1. **Observação local proporcional:** Genesis mapeia sinais mínimos autorizados (tempo de tarefa, erros, reedições agregadas), sem digitação bruta, captura de tela, webcam, keylogging ou inferência em cada tecla.
2. **Oferta proativa:** a Intelligence pode **oferecer** ajuda sem autorização transacional; a aceitação da ajuda autoriza somente o início da consulta, **não** qualquer escrita operacional.
3. **Investigação e plano:** durante a interação aceita, Intelligence recebe fatos e perguntas, consulta dados autorizados, identifica fundamentos e propõe um **plano versionado** contendo objetos, efeitos e riscos previstos, condições de execução e consequências.
4. **Autorização humana contextualizada:** o profissional identificado instrui expressamente a execução de **um plano específico** ou de passos claramente especificados. O aceite deve estar vinculado ao ID e à revisão do plano, empresa/CNPJ, usuário, capacidades, data e prazo de validade. A UI não pode transformar “sim, preciso de ajuda” em autorização de execução.
5. **Decisão de execução na Platform:** BFF/Platform **reverifica** sessão, autorização do usuário para cada capacidade, vínculo Tenant/Company/CNPJ, registros afetados, invariantes, aprovação adicional por classificação de risco e validade do plano, sem confiar nos dados enviados pelo browser ou na avaliação do LLM. Só a Platform executa comandos operacionais.
6. **Resultado observável:** Intelligence acompanha o retorno por evento auditado com sucesso, parcial, erro ou não executado; nunca comunica sucesso antes da confirmação da Platform. Efeitos inesperados ou ampliação de escopo exigem nova aprovação.

### 10.2 Máquina de estados de execução delegada

```text
OBSERVING -> INVITATION -> CONSULTING -> PLAN_DRAFT
                                   |              |
                                   |              v
                                   |        PLAN_PRESENTED
                                   |              |
                                   |       [instrução humana]
                                   |              v
                                   |       APPROVAL_REQUESTED
                                   |              |
                                   |       [Platform valida]
                                   |       /      |       \
                                   |   DENIED   EXPIRED  APPROVED
                                   |                      |
                                   |                      v
                                   |                 EXECUTING
                                   |                      |
                                   |           SUCCEEDED | PARTIAL | FAILED
                                   |
                                   +-> DISMISSED / WITHDRAWN / UNAVAILABLE
```

O motor pode fazer perguntas novas e construir o plano dinamicamente, mas não pode pular `PLAN_PRESENTED`, `APPROVAL_REQUESTED` ou a autorização efetiva da Platform. Mudança de ID/revisão/objeto/escopo invalida a aprovação. Nenhum reenvio automático de ação com efeitos duplicados: `idempotencyKey` e rechecagem servidor obrigatórios.

### 10.3 Planos e permissões — contrato proposto (não conectado)

`DelegationPlan.v1`: `planId`, `revision`, `tenantId`, `companyId` (grupo), `cnpjId` (estabelecimento), `affectedResourceRefs`, `steps[]` com `operation`, `expectedEffect`, `riskClass`, `reversibility`, `requiredCapabilities`, `evidenceRefs`, `expiresAt`, `approvalPolicy`.  
`HumanPlanAuthorization.v1`: `planId`, `revision`, `actorId` (verificado no servidor), `scopeBinding`, `approvedStepIds`, `statement` afirmativo explícito, `authorizedAt`, `expiresAt` e metadados de confirmação suplementar.  
`ExecutionHandoffDraft.v1`: somente um **pedido de validação** ao backend privado, nunca uma instrução de mutação executável emitida pelo frontend. O servidor busca o plano imutável registrado, verifica versão, escopo, principal, capacidades, política de risco, anti-replay e idempotência antes de admitir comando concreto.

**Importante:** uma autorização verbal/textual (“pode fazer”) sem identificação inequívoca dos registros/efeitos/versão do plano pode ser **ambígua** e deve levar a pedido de esclarecimento, não a execução. Operações como transmissão oficial, exclusão, obrigação tributária, alteração contábil de impacto material ou transferência financeira dependem de políticas adicionais da Platform.

### 10.4 UX de delegação no mesmo painel flutuante

- Mostrar a **síntese revisável do plano** antes da execução: alvo, ações, dados alterados, fontes, efeitos, risco, reversibilidade e o que **não** será realizado.
- Aceitar comando escrito ou escolha explícita; registrar a intenção junto ao estado do plano sem tratar texto livre como prova suficiente de privilégio.
- Mostrar estados “aguardando autorização”, “validação pela Platform”, “em andamento”, “concluído”, “parcial”, “negado” e “falhou”, com IDs e horário de auditoria quando disponíveis.
- O usuário pode cancelar um plano ainda não iniciado ou interromper antes de passos subsequentes quando tecnicamente viável. “Ajuda aceita”, “plano aprovado” e “operação concluída” são eventos distintos.
- Manter o **mesmo layout do mockup de nove composições**, os tokens canônicos Light/Dark da Platform e a **logomarca sem fundo**. A aprovação contextual é um estado do painel vivo; não se cria um novo sistema visual.

### 10.5 Entregas iniciais desta revisão

- Criar modelo tipado e funções de validação **fail-closed** na Genesis para plano, autorização explícita e proposta de handoff, com testes negativos e anti-confusão de `companyId` vs `cnpjId`.
- Iniciar acionador flutuante e painel contextual usando tokens existentes; primeiro fluxo somente **sintético** de detecção de sinal, oferta de ajuda, apresentação de plano e autorização de **simulação sem persistência ou escrita**.
- A camada Genesis **não** fará chamadas operacionais nesse início, nem simulará no retorno do assistente que uma alteração fiscal ocorreu.
- Concluir depois uma BFF privada e a máquina de estados de execução realmente protegida por autorizações, auditoria e policies da Platform, em uma futura revisão independente.

### 10.6 Aceitação suplementar

| Gate | Condição de aceitação |
| --- | --- |
| DELEGATE-01 | Aceitar ajuda **não** autoriza execução ou cria pedido operacional |
| DELEGATE-02 | O mesmo plano e revisão devem ser apresentados antes de qualquer aprovação |
| DELEGATE-03 | A aprovação deve delimitar usuário, empresa, CNPJ, capacidades, registros e passos |
| DELEGATE-04 | Mudança de plano, escopo, validade ou revisão é rejeitada |
| DELEGATE-05 | Ações reguladas/alto impacto exigem política de autorização adicional no servidor |
| DELEGATE-06 | BFF/Platform são autoridade de autorização, não a UI ou LLM |
| DELEGATE-07 | Execução parcial/falha não vira “sucesso” na mensagem da Intelligence |
| DELEGATE-08 | Sem integração real, a prévia permanece explicitamente sintética, sem dados ou efeitos reais |

## 11. Protocolo executável de apresentação dinâmica — fonte V1 (2026-10-13)

**Implementação em revisão, NÃO conectada:** `src/features/intelligence/PresentationIntent.ts`, `preview/shared-ux/intelligence-intent-ui.js` e `scripts/intelligence-presentation-tests.mjs`.

**Separação estrutural:** o serviço Intelligence pode propor conteúdo e escolher a modalidade de interação, mas a Genesis conserva um catálogo fechado de componentes e validação estrita. Não há páginas estáticas novas para cada decisão do motor. O contrato versionado aceita `SILENT`, `INVITE`, `ASK`, `EXPLAIN`, `COMPARE_SCENARIOS`, `PRESENT_EVIDENCE`, `PLAN_PRESENTED`, `UNAVAILABLE`; os blocos permitidos são `TEXT`, `QUESTION`, `EVIDENCE`, `SCENARIO`, `NOTICE`, `PLAN`. Perguntas e opções são livres **dentro de estruturas tipadas**, não uma lista fixa no front-end.

### 11.1 Limites de segurança do contrato

- `schemaVersion=1.1.0` + `locale` (`pt-BR`/`en`) vinculado ao shell + `interactionId` + `expiresAt` limitado a 15 minutos, com seleção exata de `tenantId`, `companyId` (grupo), `cnpjId` e `pageId`; qualquer mismatch implica rejeição.
- `executionAuthority=NONE` e `lifecycleEffect=NONE` são exigidos, inclusive para apresentações de planos: um bloco `PLAN` **não** vale como autorização humana, comando, aprovação fiscal ou token.
- Blocos desconhecidos e campos não previstos são recusados, e o resultado validado é projetado para DTOs reconhecidos; fonte, cenários e planos não podem carregar callbacks, HTML arbitrário, scripts ou URLs executáveis.
- `EXPLAIN`, `COMPARE_SCENARIOS` e `PRESENT_EVIDENCE` exigem **referência de evidência ou aviso explícito de insuficiência**, sem criar certeza fiscal fictícia.
- O renderizador usa DOM e `textContent`, e callbacks de `QUESTION.options` são executados somente por clique humano, para registrar a resposta na interface. Esse callback **não** aciona Platform.
- A avaliação acima é **camada de apresentação**, não autorização de backend. O host privado deverá validar **novamente** os payloads e permissões; apenas o motor autenticado poderá fornecer intents reais depois de Gate B e RLS E2E.

### 11.2 Prévia implementada para UX, sem inferência

Nas páginas sintéticas Fiscal e Assessoria, um seletor de demonstração permite escolher o **formato** de uma resposta hipotética. Um gerador local de fixtures exemplifica perguntas abertas e com opções, comparação de cenários, evidências e plano para revisão, todos explicitamente sintéticos. O conteúdo do seletor **não** representa classificação fiscal, raciocínio real ou julgamento da Intelligence. O backend futuro substituirá o gerador local de fixtures, não o componente visual.

A camada flutuante mantém marca original com transparência alfa e herda cores Light/Dark do shell Platform/Genesis. Observação de alterações de seleção permanece desligada até opt-in; não há capture de valores, telemetria persistente, keylogging, captura de tela, inferência por evento, rede, secrets ou escrita operacional.

### 11.3 Próximos gates

1. Executar TypeScript e a nova suíte `npm run test:intelligence-presentation` no Actions público da Genesis; guardar SHA/resultado.
2. Homologar visualmente os blocos no navegador em Light e Dark, zoom, móvel, teclado e leitura de tela; conservar a geometria do mockup e a marca sem fundo.
3. No PR independente da Intelligence, consolidar o contrato de produção dos intents com fonte, proveniência e limites de inferência.
4. Implementar BFF privada com autenticação e seleção canônica tenant/grupo/CNPJ/atividade; validar RLS e Gate B com usuários reais autorizados, sem tornar a prévia pública um produto autenticado.
5. Somente depois estabelecer orquestração de plano imutável, autorização humana e execução controlada pela Platform.

**Estado:** comunicação visual tipada e fixtures, ainda **sem integração E2E**. Os nove layouts aprovados continuam sendo referência, mas estes componentes não constituem conclusão das nove telas.

## 12. Localização PT-BR/EN vinculada ao botão único da Platform (2026-10-13)

**Requisito mandatário confirmado:** a Intelligence usa **exclusivamente o controle PT/EN já disponível na Platform/Genesis**, exatamente como os temas Light/Dark. **Nenhum botão adicional** dentro da Intelligence. Ao clicar no seletor existente, a interface flutuante acompanha **imediatamente** o evento `ux:locale` do shell e o valor canônico `document.documentElement.lang`, sem reload da página.

### 12.1 Contrato de responsabilidade

- **Platform/Genesis shell:** única autoridade da seleção de idioma `pt-BR` ↔ `en`; o evento `ux:locale` transporta o idioma do shell. O tema usa `ux:theme` e os mesmos tokens Light/Dark, de maneira independente.
- **Genesis / Intelligence UI:** rótulos, notificações proativas, acesso pelo botão transparente, drawer, formulários, modos, avisos, estados de autorização e instruções fixas são traduzidos via `preview/shared-ux/intelligence-i18n.js`. A tradução acontece mesmo com o painel aberto. Os exemplos sintéticos de `QUESTION`, `SCENARIO`, `EVIDENCE` e `PLAN` são renderizados novamente no idioma atual. Nenhum texto de origem tributária real é inventado ou traduzido por heurística no browser.
- **Intelligence runtime futuro:** idioma faz parte do contexto consultivo autorizado, deve guiar a geração da resposta e seus blocos; conteúdo jurídico, documento, citação e resposta livre não podem ser falsamente rotulados como tradução equivalente. Mensagens já produzidas por um motor exigirão nova resposta/variante de idioma pelo serviço caso devam ser traduzidas. **Entrada digitada pelo usuário permanece exatamente como fornecida.**
- **Protocolo de apresentação:** `PresentationIntent` passa à versão **`1.1.0`**, com `locale: "pt-BR" | "en"` obrigatório e validação da escolha esperada pela UI; mismatch rejeita o payload (`locale_mismatch`). O renderer também recusa intents de outro idioma. Mudança de idioma invalida apresentações antigas não localizadas; o host autenticado deverá buscar nova variante sob escopo/permissão vigentes, sem aproveitar respostas antigas sem verificação.
- **Fallback:** se i18n não carregar ou um identificador de mensagem não existir, a interface falha de forma explícita e controlada; não mistura idiomas nem assume que o idioma será traduzido automaticamente pelo navegador.
- **Privacidade:** o botão de idioma não habilita observação, não inicia inferência, não modifica permissões e não constitui autorização de execução.

### 12.2 Aceitação

| ID | Critério | Resultado esperado |
| --- | --- | --- |
| L10N-01 | Alternar PT/EN no seletor **existente da Platform** | Botão Intelligence, drawer aberto, texto de convite, planos sintéticos e avisos acompanham sem reload |
| L10N-02 | Alternar EN/PT com painel aberto e histórico sintético | Mensagens de sistema com keys e exemplos atualizados; texto livre do usuário preservado |
| L10N-03 | Trocar tema antes ou depois do idioma | Light/Dark e PT/EN independentes; nenhuma nova paleta ou controle duplicado |
| L10N-04 | Receber intent de locale divergente | Rejeitar em `PresentationIntent.v1.1.0` e renderer; não apresentar conteúdo sem localização correspondente |
| L10N-05 | Conteúdo jurídico real, fontes e mensagens antigas | Somente backend autorizado poderá fornecer variante equivalente; nunca tradução mecânica improvisada |
| L10N-06 | Gatilho ou aprovação humana enquanto idioma muda | Mesmo limite de consentimento, escopo e efeito `NONE` independentemente da língua |

**Status de implementação:** sincronização PT/EN em duas superfícies sintéticas Fiscal e Assessoria; catálogo de strings e fixture por locale. A homologação visual/manual em navegador e o runtime privado bilíngue ainda dependem de gates próprios. A regra visual de identidade **Platform Light/Dark** e a marca **sempre sem fundo** permanecem integralmente válidas.

## 13. Gate Chromium de interface contextual Light/Dark + PT/EN (2026-10-13)

**Implementação em revisão:** `scripts/intelligence-browser-homologation.mjs` integra o workflow público `.github/workflows/ux7-adapter-contract.yml`, executado após os testes de contratos, com screenshots e relatório arquivados por sete dias. Utiliza Chrome/Chromium headless real e protocolo CDP com Node 22, sem SDKs externos ou inferência paga.

**Resultado verificado:** GitHub Actions [run 38385902177](https://github.com/evoluagency/evolu-genesis/actions/runs/38385902177) no commit `2b1a6713ec3630872c3f64f23b78be339f5ce81e`, com job de contratos **PASS** e job `Intelligence Chromium UX acceptance` **PASS** (`INTELLIGENCE_BROWSER_GATE=PASS`). Evidência [artifact 11806100818](https://github.com/evoluagency/evolu-genesis/actions/runs/38385902177/artifacts/11806100818).

### 13.1 Condições exercitadas em browser

- Superfícies sintéticas `preview/tenant-fiscal-workspace/` e `preview/tenant-advisory-workspace/`;
- Dois viewports (desktop 1366 × 768 e mobile 390 × 844);
- Botão flutuante real com imagem carregada e CSS de fundo transparente;
- Controles de idioma e tema **somente os existentes no shell Platform**, sem duplicação;
- Painel aberto, simulação de pergunta e preservação do texto digitado;
- Tema Dark/PT-BR → Light/EN (mesmo painel aberto) → PT-BR, com fixture dinâmica relocalizada;
- Tokens de superfície alterando de fato a cor computada do painel na mudança de tema;
- Geometria do painel dentro do viewport, sem overflow horizontal documentado;
- Controle de observação explicitamente desativado por padrão, opt-in seguido de opt-out;
- Capturas por página/viewport/tema/idioma, relatório JSON e resumo Markdown;
- Nenhuma exceção JavaScript capturada durante as interações.

### 13.2 Limites do resultado

**PASS no Chromium não é homologação humana final** de identidade visual da Platform ou fidelidade às nove composições. O teste atual usa apenas **duas** superfícies sintéticas e alterna uma combinação de tema/idioma por sessão; não demonstra conteúdo jurídico real, BFF privada, RLS autenticada, migração do Lab, todos os módulos ou execução operacional. Os screenshots precisam de revisão humana contra o layout-mestre, especialmente em Light e responsivo; reconciliação de tokens do runtime Platform continua obrigatória. Nenhum merge, deploy ou mudança na `main` decorre deste gate.

**Próximo marco de construção:** obter validação visual das composições, fechar a fonte canônica Light/Dark com a Platform e implementar a fronteira de transporte autenticado entre a Genesis, a Intelligence e a Platform de forma independente, com contrato de versão, locale, contexto, proveniência, rate/cost guard e teste negativo de Tenant/Company/CNPJ. Não disponibilizar endpoint de execução ou inferência contínua nesta etapa.

## 14. Evolução do sensor: mapeamento semântico da atividade (2026-10-13)

**Alteração de produto:** o gatilho provisório baseado em três mudanças genéricas de `<select>` foi substituído por **eventos semânticos explícitos e minimizados da atividade**, com consentimento. A mudança de empresa, CNPJ ou competência por si só **não** é um sinal de dificuldade. Isso evita interromper pessoas que apenas navegam pela Platform.

O shell Genesis expõe exclusivamente o identificador de página para a camada observadora: `data-intelligence-page-id="fiscal.workspace"` ou `"advisory.workspace"` nas duas superfícies sintéticas atuais. A camada flutuante recebe `CustomEvent("evolu:activity-signal", {detail:{kind,pageId}})`, com categorias permitidas `REPEATED_ATTEMPT`, `VALIDATION_FAILURE`, `WORKFLOW_REVISIT`. Eventos com campos extras, valores digitados, dados pessoais, outro `pageId` ou categorias desconhecidas são **recusados** pela camada de observação. Não há interceptação global de cliques, teclado, conteúdo do campo ou captura de tela.

Para convite à assistência, a lógica local demanda **três sinais da mesma categoria em janela de dois minutos**, opt-in ativo naquela página, painel fechado, nenhuma oferta já ativa e cooldown expirado; oferecer ajuda não muda nada no backend. O estado é temporário na memória local e é descartado no opt-out. O motor de inferência não é invocado para detectar cada sinal.

**Importante:** essa é a interface de eventos do sensor, não a validação fiscal. Apenas módulos autorizados e instrumentados por código de produto confiável deverão emitir sinais; o fato de um browser produzir um evento não comprova inconsistência, erro de NCM ou autoridade para ação. O runtime privado futuro não deverá confiar nesses sinais como prova fiscal ou como permissão. Não ativar coleta persistente, medição de produtividade individual ou telemetria corporativa sem revisão de privacidade, finalidade e base legal.

**Verificações:** teste estático de sinais e isolamento; gate real Chromium para recusar sinal com dado indevido e `pageId` incompatível, aceitar três sinais semânticos válidos e respeitar dispensa. Permanecem as obrigações de aprovação visual, contrato de escopo e autenticação, governança e separação entre recomendação e execução humana autorizada.

**Gate efetivamente concluído:** [GitHub Actions run #38386918908](https://github.com/evoluagency/evolu-genesis/actions/runs/38386918908), commit `4f4308332004cfd62f2a8a26dec06bc28b41d5ad`. `TypeScript and gateway contract tests` PASS; 10/10 consulta, **15/15 delegação+sensor** e 23/23 apresentação/i18n. `Intelligence Chromium UX acceptance` PASS (`INTELLIGENCE_BROWSER_GATE=PASS`) nas quatro combinações de página e viewport, incluindo rejeição de sinais com campos extras ou página errada, convite após três sinais válidos e bloqueio de novo convite imediatamente após dispensa. [Screenshots + JSON/Markdown no artifact #11807216332](https://github.com/evoluagency/evolu-genesis/actions/runs/38386918908/artifacts/11807216332). As primeiras tentativas de ampliar o browser gate falharam por asserções/harness e foram corrigidas; somente este HEAD aprovado representa o resultado desta etapa.

## 15. Reaproveitamento do BFF Platform UX7B e ponte consultiva de apresentação (2026-10-13)

**Nova constatação de código, não hipótese:** o PR privado da Platform #112, branch \`chore/ux7b-reconciled-readonly-review\`, já contém \`app/api/ux/intelligence/consult/v1/route.ts\`, com rota \`POST /api/ux/intelligence/consult/v1\`. Não criar endpoint paralelo para o mesmo propósito. Esse endpoint, ainda em DRAFT, depende de \`EVOLU_INTELLIGENCE_READ_ENABLED=true\` **e** \`EVOLU_INTELLIGENCE_CONSULT_ENABLED=true\`, origem de autenticação compartilhada fixada, sessão \`auth.getUser\`, RPC \`get_my_tenant_cnpj_summary\` que comprova Tenant/Group/CNPJ do usuário, origin upstream Intelligence fixada, orçamento de inferência do motor, limites de corpo/tempo e resposta consultiva sem ações operacionais. A presença do código **não** comprova conectividade produtiva, permissões E2E ou disponibilidade. **Não ativar as flags sem revisão explícita.**

### 15.1 O que foi implementado na Genesis

- \`src/features/intelligence/PlatformConsultativeViewBridge.ts\`: **módulo puro, sem transport/fetch**, não monta headers, não lê JWT, não acessa rede, não executa comandos nem invoca o modelo.
- \`createPlatformConsultativeInvocation\` exige intenção **humana explícita** para consulta (a observação proativa não é autorização para consumir inferência), seleção \`tenantId\`, \`companyId\` (grupo), \`cnpjId\` (estabelecimento), \`tenantSlug\`, \`referenceDate\`, \`pageId\`, locale e pergunta válida. Constrói o envelope **exato** que o BFF existente recebe: \`{service:"intelligence",operation:"requestConsultativeAnswerSource",tenantSlug,payload:{tenantId,companyId,cnpjId,referenceDate,question}}\`. Respeita teto de **2048 bytes UTF-8**, inclusive caracteres multibyte, antes de qualquer envio futuro.
- \`projectPrivatePlatformConsultation\` recebe uma projeção **presumidamente originada de uma BFF autenticada** e valida por defesa em profundidade versão/schema, fonte, \`PRE_LEARNING\`, Tenant, Group, CNPJ, data, custo, \`responseMode\`, proveniência, e capabilities \`canApprove/canExecute/canLearn\` **indisponíveis**. Essa validação **não substitui** JWT/RLS/origem no servidor.
- O BFF Platform existente retorna \`schemaVersion: "1.0.0"\` sem atestar o idioma real do texto gerado. Portanto, o bridge **NÃO EXIBE** a resposta como localizada nem em PT-BR nem em EN; cria um \`UNAVAILABLE\` tipado e traduzido somente na moldura da UI, sem copiar o texto tributário. Resultado bloqueado, custo negado ou \`SAFE_FALLBACK\` também impede exibição.
- Para futura evolução da BFF privada, foi definido um protocolo de resposta \`1.1.0\` que exigirá \`answerLocale\` e \`localeVerified: true\`, **atestados pelo servidor após efetivamente verificar a resposta do motor**, jamais copiados cegamente da seleção de idioma do navegador. Apenas nesse cenário o bridge pode apresentar o texto como \`EXPLAIN\`, acompanhado do aviso obrigatório de revisão profissional e da ausência de autoridade executiva.
- O contrato \`PresentationIntent v1.1.0\` continua controlando \`executionAuthority:"NONE"\` e \`lifecycleEffect:"NONE"\`; nada autoriza execução, alteração fiscal, treino automático ou uso de texto não revisado como prova normativa.

### 15.2 Etapas ainda não realizadas

1. A BFF privada da Platform deve estabelecer o **método de atestação de idioma real** e vincular a escolha ao motor autenticado, sem declarar compatibilidade PT/EN que a Intelligence V1 não garante.
2. O host autenticado deve implementar transporte, sessão, cookies/tokens, CORS/origem quando pertinente, limites, consentimento para pergunta e respostas. **Não embutir esse transporte na prévia pública da Genesis.**
3. Executar E2E real com autenticação/escopo e testagem de isolamento Tenant/Group/CNPJ no ambiente autorizado e financeiramente controlado; o CI atual é local/mock.
4. Verificar legislação e fontes em qualquer conselho tributário antes de autorizá-lo como evidência; um \`answer\` sem fontes verificadas não é decisão fiscal.
5. Executar gates de desempenho, uso de custo e rollback antes de considerar ativar inferência; merge e deploy dependem de autorização.

### 15.3 Testes

A suíte \`scripts/platform-consultative-bridge-tests.mjs\` está conectada ao Actions público Genesis como \`npm run test:platform-consultation\`. Ela cobre autorização humana de consulta, envelope exato, UUID e grupo↔CNPJ distintos, escopo e data, tamanho UTF-8, adversarial de capabilities, custo e bloqueios, limitação do BFF \`1.0.0\`, locale divergente, futura resposta \`1.1.0\` com comprovação real do servidor e proibição de acesso direto à rede na Genesis. **Validação concluída no CI público:** [run #38388000863](https://github.com/evoluagency/evolu-genesis/actions/runs/38388000863) no commit `b084688c9bba0b6fd35f9b477224374df2e397d7`: TypeScript estrito, adaptadores, 10/10 consultas, 15/15 delegação/sensor, 23/23 apresentação/i18n e **15/15 bridge Platform** — todos aprovados. O job de Chromium também passou (`INTELLIGENCE_BROWSER_GATE=PASS`), com [evidência artifact #11806339107](https://github.com/evoluagency/evolu-genesis/actions/runs/38388000863/artifacts/11806339107). Essas provas são de contrato mockado e de prévias sintéticas, **não** prova de conexão real nem autorização de release.

**Regra de produto preservada:** a Intelligence continua fora do conteúdo de cada página, sobreposta como botão e painel flutuante; cores Light/Dark, idioma PT/EN e marca sem fundo seguem exclusivamente a identidade da Platform.

## 16. Coordenador de consulta autenticada — integração host-ready, sem ativação (2026-10-13)

**Entrega no PR Genesis #26:**
- \`src/features/intelligence/LivePlatformConsultation.ts\` exporta \`SameOriginPlatformConsultativeTransport\`, \`LiveConsultationCoordinator\` e tipos explícitos.
- \`src/index.ts\` publica a API tipada de apresentação, ponte para BFF e coordenador de sessão.
- \`scripts/live-platform-consultation-tests.mjs\` valida transporte em memória com \`fetch\` **injetado/mocado**; nenhum teste chama serviço real.

### 16.1 Transporte do host, sem segundo backend

Apenas o **shell autenticado** da Platform pode instanciar \`SameOriginPlatformConsultativeTransport\`, fornecendo um \`AccessTokenProvider.getAccessToken(signal)\` da sessão ativa e uma função \`SameOriginFetch\` autorizada. O destino é uma constante **relativa same-origin** \`/api/ux/intelligence/consult/v1\`; nenhuma URL externa, endpoint da Intelligence, proxy configurável pelo usuário, segredo embutido, cookie lido manualmente, \`localStorage\`, \`sessionStorage\` ou chamada automática no clique do FAB.

A requisição é estritamente \`POST\`, \`credentials:"same-origin"\`, \`mode:"same-origin"\`, \`redirect:"error"\`, \`cache:"no-store"\`, \`referrerPolicy:"no-referrer"\`, \`Authorization: Bearer <token-do-host>\` e corpo do protocolo UX7B **exatamente v1.0**, sem anexar locale até que a BFF suporte a nova versão. Token somente em trânsito e nunca devolvido ao renderer, history, log ou DTO. Erro HTTP, content-type desconhecido, JSON inválido, resposta acima de **65536 bytes** ou falta de sessão retornam falha local segura, nunca corpo privilegiado.

### 16.2 Contexto de sessão e isolamento contra respostas tardias

O host fornece \`AuthenticatedPageSnapshot\` com:
- seleção canônica \`tenantId\`, \`companyId\` (grupo), \`cnpjId\` (estabelecimento), \`tenantSlug\`, \`referenceDate\`, \`pageId\`;
- locale efetivo \`pt-BR\` ou \`en\`, controlado pelo botão da Platform;
- \`sessionEpoch\` opaco e não secreto, **rotativo em login/logout/troca de principal**.

O host deve chamar \`coordinator.invalidate()\` imediatamente ao navegar ou trocar Tenant, grupo, CNPJ, competência, idioma ou sessão. A camada de coordenação compara a seleção e o epoch **antes de despachar, antes e depois de adquirir o token, e antes de devolver o resultado**. Um resultado obsoleto é descartado mesmo se a função de transporte ignorar \`AbortSignal\`. Uma consulta em andamento impede nova consulta concorrente no mesmo coordenador para evitar cobrança duplicada. A consulta dispõe de deadline de 30 segundos e não executa retries implícitos.

A chamada \`askExplicitly(pergunta)\` representa **uma submissão iniciada pelo profissional**; nenhuma observação, aceite de oferta, troca de idioma ou abertura de FAB invoca esse método. O host deve assegurar que somente a interação humana concreta acione a chamada. O frontend **não pode provar sozinho** que um evento foi humano; a Platform revalida JWT, RLS, escopo, políticas e orçamento antes da inferência. Um token válido por si só não substitui consentimento, permissões ou regras server-side.

### 16.3 Resposta real ainda bloqueada para exibição jurídica

A BFF Platform PR #112 ainda publica \`schemaVersion="1.0.0"\` sem idioma de resposta atestado. O coordenador entrega esse payload ao \`projectPrivatePlatformConsultation()\`, que gera \`UNAVAILABLE\`, ainda que o transporte tenha retornado \`200\`. **Não** se mascara a ausência de idioma, não se traduz legislação no navegador e não se apresenta simulação como resultado real.

Um contrato futuro BFF \`1.1.0\` só permitirá conteúdo visível após autenticação e confirmação independente de \`answerLocale\` + \`localeVerified=true\` ancorada no resultado da Intelligence. Mesmo nessa evolução, a resposta é \`ADVISORY_ONLY\`, a ação operacional permanece sujeita a outra autorização humana e o sistema continua \`PRE_LEARNING\`.

### 16.4 Evidências e gates

Os testes incluem destino/headers fixos, corpo sem campos extras, requisição só mediante \`askExplicitly\`, ausência de rede por padrão, JWT ausente, HTTP 403/503, JSON inválido, limite de 64 KiB, consulta duplicada, troca de Tenant/group/CNPJ/page/locale/data/sessionEpoch, invalidação explícita, reuso após cancelamento, mudanças durante **obtenção assíncrona do JWT antes da chamada** e rejeição de respostas tardias. \`scripts/live-platform-consultation-tests.mjs\` integrado ao Actions público.

**Ainda pendente:** wiring no shell autenticado de produção, readiness da rota Platform sob flags desativadas, resposta bilíngue verdadeiramente atestada, RLS E2E com usuários autorizados, validação fiscal/proveniência, aprovação visual completa das nove composições e aprovação de merge/deploy. Nenhum endpoint adicional, migration, segredo ou chamada de inferência foi criado por este marco.

**Evidência do gate:** [GitHub Actions #38468186995](https://github.com/evoluagency/evolu-genesis/actions/runs/38468186995), commit `2469d978de7c87473db1c9b84dec3bdfa7fe9adb`, ambos jobs PASS. TypeScript e adapters PASS; **10/10 consulta, 15/15 delegação/sensor, 23/23 apresentação/i18n, 15/15 bridge BFF e 13/13 coordenador/transporte**. Chromium Light/Dark/PT/EN PASS, com [artifact #11850335627](https://github.com/evoluagency/evolu-genesis/actions/runs/38468186995/artifacts/11850335627). Os testes do transporte usam respostas injetadas; não provaram autorização JWT/RLS E2E nem ativaram a inferência.


## 17. Host privado flutuante da Platform — piloto de adoção, não segunda UX (2026-10-13)

**Integração em revisão no PR Platform #112:** a rota privada de CNPJ passou a hospedar um acionador flutuante e um painel consultivo **independentes da seleção de aba**, substituindo a renderização dos cartões Intelligence antes incluídos na página de visão geral. A página CNPJ continua sendo operacional e pertence à Platform; a Intelligence não vira nova página ou módulo lateral. O host apresenta somente o contexto autorizado e oferece consulta explícita quando o backend permitir.

O arquivo `Platform/app/portal/[slug]/carteira/[cnpj]/ux-intelligence-consult-card.tsx` foi reaproveitado como **host experimental**, e não como implementação canônica definitiva. A marca reduzida e transparente da Genesis foi copiada para `Platform/public/assets/intelligence/mark-transparent.svg`. O host herda as variáveis visuais da Platform e reconhece o idioma via `html.lang`/`ux:locale`, sem criar outro seletor.

**Aviso de precedência:** o **renderer dinâmico da Genesis** e as **nove composições do mockup** prevalecem. O JSX de hospedagem na Platform é uma camada piloto limitada a uma rota e não substitui a entrega de um pacote Genesis compartilhado/versionado. A revisão para produção deverá remover a duplicação visual e usar exatamente os componentes, protocolos e tokens homologados da Genesis/Platform. O estado completo Light/Dark e PT/EN no runtime privado da Platform ainda requer homologação, não pode ser inferido dos exemplos sintéticos da Genesis.

**BFF/idioma:** respostas da versão 1.0.0 sem idioma atestado continuam ocultas como análise tributária, apesar de HTTP 200, para evitar falsa tradução. Somente uma versão futura com resposta realmente validada poderá ser apresentada. O gateway aceita cancelamento originado no host e protege mudanças entre abas, empresa/CNPJ, data e idioma; execução operacional continua ausente. As flags de inferência permanecem desativadas.

**Evidência da alteração:** teste de fonte/TS transpile adicionado em `Platform/scripts/ux7b-intelligence-floating-host.test.cjs` ao comando `npm run test:ux7b`. Revisão estática de 13 invariantes da branch confirmada, mas **CI privado, typecheck do conjunto, prova de RLS e browser E2E não foram executados nesta etapa**. Não declarar o piloto homologado ou disponível em produção.

**Fase seguinte:** publicar/consumir a mesma biblioteca de UX Genesis no host autenticado da Platform, demonstrar isolamento de usuário/Tenant/group/CNPJ e efetuar homologação visual completa antes de merge/deploy; manter sem novas páginas e sem inferência disparada pelo scanner.

## 18. Fonte única dos blocos Intelligence no host privado (2026-10-13)

A Platform PR #112 passou a montar respostas consultivas mediante o componente host `GenesisIntelligenceIntentView`, usando cópias byte a byte da fonte oficial Genesis: `src/features/intelligence/PresentationIntent.ts`, `preview/shared-ux/intelligence-i18n.js` e `preview/shared-ux/intelligence-intent-ui.js`. Verificou-se igualdade dos três Git blobs entre Genesis e Platform. O renderer só recebe intents validados, específicos de tenant/grupo/CNPJ/página, idioma e validade; efeitos operacionais e de aprendizado permanecem `NONE`.

Este é um snapshot temporário para integração do host privado, **não** uma licença para Platform manter uma UX paralela. O host React se limita a sessão, formulário e área de montagem; Genesis continua proprietária do design, da estrutura de blocos e da evolução dinâmica. A Platform adaptou apenas os tokens de cor, utilizando a própria identidade em vez de uma paleta Intelligence. A origem dos três snapshots está documentada e pinada no teste `scripts/ux7b-genesis-intelligence-parity.test.cjs` da Platform. A etapa seguinte requer pacote compartilhado versionado em vez de cópias manuais.

Limitações: o shell privado da Platform consultado fixa `html.lang=pt-BR` na raiz e oferece tokens Light globais; ainda não foi comprovada integração real do seletor Light/Dark ou de um botão PT/EN nesse portal. Nenhum controle novo será criado na Intelligence. A versão atual da BFF continua sem idioma atestado; as respostas consultivas permanecem inacessíveis para apresentação jurídica apesar da infraestrutura pronta. Faltam execução de testes privados, typecheck, autenticação/RLS ponta a ponta, homologação visual das nove composições e aprovação para merge/deploy.

## 19. Validação consultiva única entre Genesis e Platform (2026-10-13)

O host flutuante de CNPJ, no PR privado Platform #112, substituiu o classificador local `safeResult` pelo módulo oficial Genesis `PlatformConsultativeViewBridge.ts`, copiado integralmente com Git blob `4582f870e19045e1053180f953fa71d310f66020`. A Platform agora usa `createPlatformConsultativeInvocation` para construir uma solicitação permitida pela BFF UX7B e `projectPrivatePlatformConsultation` para gerar `IntelligenceViewIntent`. A apresentação continua com `PresentationIntent.ts` e `intelligence-intent-ui.js`, ambos da Genesis.

A fronteira valida exclusivamente como defesa complementar: isolamento Tenant/group/CNPJ, origem/proveniência de resultados, `PRE_LEARNING`, evidência, custo, autorização consultiva, status das capacidades e atestação do idioma. A Platform continua responsável pelo JWT/RLS real, validação da sessão, limites financeiros e qualquer execução operacional. A BFF atual `1.0.0` não comprova o idioma real, portanto somente apresenta avisos de `UNAVAILABLE`, não texto tributário pretensamente traduzido.

**Quatro fontes Genesis idênticas por Git blob** são agora fixadas no teste privado `scripts/ux7b-genesis-intelligence-parity.test.cjs`. Isso elimina duplicação de critérios no host piloto, mas não substitui o compartilhamento definitivo por pacote versionado e não conclui a UI global de nove composições.

**Estado:** fonte revisada, blobs comparados, novos testes privados alinhados, porém **sem CI privado ou browser real de Platform executados nesta etapa**. Os três PRs continuam DRAFT, nenhuma `main` ou produção foi alterada, inferência real e execução não foram habilitadas.
