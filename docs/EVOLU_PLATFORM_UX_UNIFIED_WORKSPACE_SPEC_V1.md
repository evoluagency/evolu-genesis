# EVOLU Platform — Especificação de UX Sistêmica e Plano de Implementação V1

**Identificador:** UX-SHELL-1 / UX-VIEW-1 / UX-ROUTES-1  
**Versão deste documento:** 1.0  
**Estado:** especificação detalhada pronta para execução incremental dos protótipos; **não equivale à homologação final da UX**  
**Referência visual:** wireframes interativos apresentados na conversa, com cinco páginas principais, menu lateral recolhível e área de atividade.  
**Referência canônica:** `PLATFORM_ARCHITECTURE.md` (base revisada: v0.22; registrar este documento na versão seguinte).  
**Ambiente da fase:** repositório técnico legado atual, com prévias HTML estáticas sob `preview/`.  
**Restrições:** sem Backend, Vercel, Supabase, APIs de terceiros, chaves, dados de clientes, GitHub Actions, jobs ou workflows.

> **Diretriz central:** a plataforma deve funcionar como um sistema de trabalho, não como um relatório comprido. No desktop, cada atividade prioriza uma área de trabalho que cabe na janela; tarefas secundárias são acessadas por navegação clara e rasa, preservando contexto e legibilidade. Não se deve tentar inserir todas as funções de um módulo em um único painel.

---

## 1. Decisão de produto e resultado esperado

### 1.1 Solicitação consolidada

Aproximar os protótipos do modelo visual exibido diretamente na conversa: um aplicativo com menu lateral recolhível, cabeçalho contextual, indicadores objetivos, uma área central organizada por atividade e navegação curta entre funções. Os cinco exemplos aprovados como **direção visual** são:

1. Painel do Escritório (TenantAccess / visão geral).
2. Início da Empresa (CompanyAccess / visão geral).
3. Financeiro (CompanyAccess / operações financeiras).
4. Fiscal e Contábil (TenantAccess / evidência, conferência e apuração em módulos próprios).
5. Assessoria (TenantAccess / análise profissional contextual).

A aprovação entusiástica do formato de wireframes indica **preferência de direção**, não aprovação irrestrita de cada campo, regra tributária, permissão, nomenclatura ou tela futura. O documento implementa essa direção sem congelar decisões ainda abertas.

### 1.2 Resultado funcional da etapa de frontend

Ao final desta migração incremental de UX, cada uma das cinco páginas deverá:

- aproveitar a janela desktop com densidade confortável, sem depender de uma rolagem vertical longa de página;
- usar a mesma linguagem visual e a mesma distribuição macro (menu → cabeçalho → contexto → área de trabalho);
- manter ações frequentes encontráveis em até três cliques significativos, preferencialmente dois, a partir da visão inicial da superfície de acesso;
- preservar selecionadores de Company, CnpjEntity e competência quando mudarem de atividade;
- separar o que pertence ao usuário externo da Company do que pertence ao profissional do Tenant;
- expor somente ações compatíveis com os direitos simulados, com indicação explícita de que **não há segurança real nas páginas públicas**;
- apresentar detalhes sem esconder dados: abas, listas paginadas, painéis de contexto, formulários dedicados ou modais, conforme a complexidade;
- não confundir movimentações financeiras, documentos fiscais, lançamentos contábeis, conciliação, apuração e aconselhamento;
- funcionar com teclado, dispositivos menores, idioma PT-BR e inglês e temas claro/escuro nos protótipos já preparados;
- preservar a demo existente e seus cenários sintéticos.

### 1.3 Não objetivos

Esta entrega **não** implementa autenticação, autorização persistente, banco de dados, storage, motor fiscal, emissão de documentos, integração bancária/ERP, sincronização entre HTML independentes, workflows automatizados, faturamento/licenciamento ou produto de ERP completo.

Também **não** cria um novo produto chamado “Painel”, “Financeiro” ou “Assessoria”. Os conceitos permanecem pertencentes à EVOLU Platform e suas superfícies TenantAccess/CompanyAccess; Intelligence continua transversal, com análise e recomendação, não execução.

---

## 2. Referências existentes e preservação de conceitos

### 2.1 Documentação que continua válida

| Fonte do projeto | Responsabilidade | Regra para esta migração |
|---|---|---|
| `docs/PLATFORM_ARCHITECTURE.md` | fonte canônica de domínio, escopo, UX e governança | prevalece nos conceitos congelados, autorização e gate final |
| `docs/EVOLU_UX_DOMAIN_DICTIONARY_V1.md` | dicionário de domínio | não renomear Tenant, Company, CnpjEntity e conceitos contábeis |
| `docs/EVOLU_UX_CONTRACT_CATALOG_V1.md` | contratos de tela, contexto, requests e providers | estender telas sem substituir contratos existentes |
| `docs/PLATFORM_CONTRACT_FIRST_UX_MIGRATION_V1.md` | migração progressiva orientada por contratos | preservar a demo pública e migrar por fatias |
| `docs/INTERFACE_STANDARD_SUMMARY.md` | terminologia da interface e separação apresentação/operação | respeitar nomenclatura profissional, EVOLU/Intelligence e decisões explícitas |
| `docs/ROUTES.md` | rotas públicas / e /demo/ | não transformar protótipos em rotas produtivas |

A matriz de navegação já define até três cliques significativos para atividades frequentes e até quatro para configuração administrativa, quando justificado. CNPJ, competência, status, tipo de documento, impostos ou fornecedor não se tornam níveis extras de menu: são seletores, filtros e metadados.

### 2.2 Código de referência na base visual legada

| Protótipo atual | Caminho | Preservar | Alterar na fase de execução |
|---|---|---|---|
| Configuração do Tenant | `preview/tenant-configuration/index.html` | distinção EVOLU / Tenant, limites de licença, marca, idiomas e temas | adotar o Shell visual e redistribuir formulário em tarefas curtas |
| Cadastro da Company | `preview/company-onboarding/index.html` | oito etapas existentes e semântica Company → 1..N CNPJ | reduzir empilhamento visual sem remover etapas obrigatórias |
| Configuração da Company | `preview/company-configuration/index.html` | serviço, CNPJ, fontes, usuários, alcance do Tenant | alinhar cabeçalho/área de trabalho ao padrão |
| Início da Company | `preview/company-access-home/index.html` | marca NEXUS, escopo de empresa, consulta x escrita, contextos | aplicar layout da página 2 e rotas de atividade |
| Financeiro | `preview/company-financial-workspace/index.html` | origem sintética, movimentações, contas, entregas versionadas, conferência | aplicar layout da página 3 sem ocultar dados |
| Jornada de revisão | `preview/ux-journey/index.html` | cinco personas e links de inspeção | converter em hub de revisão por telas, não navegação comercial |
| NF-e 70031 | `preview/fiscal-document-70031/index.html` | evidência → análise → decisão → aprovação separadas | encaixar como detalhamento de atividade Fiscal, sem perda de trilha |
| Demo operacional existente | `/demo/` | exemplo operacional já publicado | **não** reescrever nesta etapa |

**Estado importante:** Financeiro e Jornada já contêm testes de viewport/paginação inseridos antes do alinhamento estrutural definitivo. Essas tentativas devem ser tratadas como **experimentais e não homologadas**, refatoradas cuidadosamente sob este contrato. Não presumir que um CSS com `overflow:hidden` prova que a interface cabe corretamente.

---

## 3. Regras sistêmicas: uma janela por atividade

### 3.1 Terminologia

- **Janela:** área visível do navegador no desktop.
- **Shell:** estrutura repetida que envolve qualquer atividade da superfície autorizada.
- **Página:** localizador funcional, com título, contexto e contrato de entrada.
- **Atividade:** objetivo único do usuário, como consultar movimentações, conferir documento, solicitar esclarecimento ou revisar pré-fechamento.
- **Painel:** região dentro da página que contém informação ou ações relacionadas.
- **Detalhamento:** visualização contextual de um item sem duplicar a tela principal.
- **Profundidade:** transições de navegação até a atividade; filtros e preenchimento de campos não criam uma hierarquia de menus adicional.

### 3.2 Regra para desktop

A janela deve mostrar a **atividade principal completa em seu estado inicial**, sem barra de rolagem vertical da página, quando houver altura útil adequada. Este critério não permite cortar conteúdo ou exigir fontes microscópicas.

**Alvos de validação:**

| Viewport de referência | Comportamento pretendido |
|---|---|
| 1920 × 1080 | atividade principal inteira, com espaçamento confortável |
| 1440 × 900 | sem rolagem vertical da página na atividade inicial |
| 1366 × 768 | sem rolagem vertical da página para atividade inicial; reduzir margens secundárias, não a legibilidade |
| 1280 × 720 | verificar caso a caso; permitir rolagem localizada ou alternativa de navegação antes de cortar informações |
| 1024 × 768 | layout adaptativo/tablet, rolagem adequada se necessário |
| até 767 px | experiência móvel em coluna; rolagem vertical normal permitida |
| Zoom 200%, altura pequena ou aumento de fonte | **não bloquear a rolagem**; acessibilidade e completude prevalecem |

Os números acima são **critérios propostos de teste**, não prova de que os protótipos atuais os atendem.

### 3.3 Rolagem permitida e não permitida

**Evitar:** rolagem longa do documento principal em uma atividade simples no desktop de referência.

**Permitir intencionalmente:** rolagem de tabela com muitas linhas, histórico, lista longa, painel de detalhes ou modal com formulário comprido, sempre com região identificável, foco preservado e rolagem de teclado funcional.

**Preferir:** paginação explícita em listas de registros e divisão de atividade em abas vizinhas. **Nunca:** esconder linhas só porque ultrapassaram a altura disponível; esconder sem proporcionar paginação/rolagem; diminuir fonte abaixo de um tamanho legível para cumprir artificialmente uma meta de viewport.

### 3.4 Densidade sugerida, não rígida

- máximo de 3 cartões-resumo na linha principal de páginas de visão geral; 4 somente quando a largura comportar com legibilidade;
- dois painéis operacionais lado a lado nas páginas de trabalho, com proporção inicial 65/35 ou 60/40;
- um foco de ação principal por atividade;
- nenhuma página de visão geral deve repetir toda a informação apresentada no módulo detalhado;
- indicadores sem dados devem mostrar “—”, estado e contexto, não resultados financeiros inventados.

---

## 4. Arquitetura visual do Shell unificado

### 4.1 Mapa de regiões

~~~text
┌──────────────────────────────────────────────────────────────────────────┐
│ MENU                 │ CABEÇALHO: contexto + identificação + ações        │
│ Logo/nome do Tenant  ├───────────────────────────────────────────────────┤
│                      │ TÍTULO DA ATIVIDADE + descrição curta               │
│ Início               │ [Company/CNPJ] [Competência] [Estado da origem]     │
│ Clientes             ├───────────────────────────────────────────────────┤
│ Fiscal / Contábil    │ [Abas/ações da atividade, quando cabíveis]         │
│ Assessoria           ├───────────────────────────────────────────────────┤
│ Administração        │ [Indicadores essenciais]                           │
│                      ├───────────────────────────┬───────────────────────┤
│                      │ PAINEL PRINCIPAL          │ CONTEXTO / PENDÊNCIAS  │
│                      │ Uma atividade por vez      │ ou ações rápidas       │
│                      │                           │                       │
│                      └───────────────────────────┴───────────────────────┤
│                      │ status discreto / navegação secundária             │
└──────────────────────────────────────────────────────────────────────────┘
~~~

Esta ilustração representa a organização, **não** uma prescrição de que todas as páginas tenham sempre exatamente dois cartões ou sidebar com todos os módulos.

### 4.2 Sidebar

**Expandida:** sugestão inicial de 232–244 px, respeitando o padrão já existente na base visual atual.  
**Recolhida:** faixa de 76 px, já utilizada nos protótipos.

A área da marca/logotipo no topo da sidebar deve ser o controle clicável de expandir/recolher, sem botão visual redundante. Ícones permanecem visíveis ao recolher; nomes aparecem ao passar o cursor e por descrição acessível. A sidebar recolhida **libera largura para o conteúdo**, não cobre a página.

Interações obrigatórias:
- clique no logotipo/nome alterna expandida/recolhida no desktop;
- Enter ou Espaço fazem o mesmo quando o controle está em foco;
- indicação de hover, foco visível, `aria-expanded`, rótulo acessível atualizado;
- os ícones de navegação continuam abrindo seus destinos, não recolhendo o menu;
- no mobile, permanece o padrão de menu tipo drawer/hambúrguer com mecanismo de fechar;
- nada depende do hover para funcionar em telas sensíveis ao toque.

O estado expandido/recolhido poderá ser **memorizado apenas em memória da aplicação** durante a navegação integrada da demo; persistência entre sessões fica para decisão posterior. Não introduzir storage de navegador como requisito nesta fase.

### 4.3 Cabeçalho da janela

Altura **sugerida** de 60–68 px em desktop, não fixa quando houver necessidades de acessibilidade. Deve conter:
- trilha de localização curta e nome da página/atividade;
- seletor de Company somente no TenantAccess e **somente** entre Companies autorizadas;
- seletor de CnpjEntity e competência quando a atividade exigir;
- identificação do usuário e da superfície (escritório ou empresa);
- ações globais limitadas: pendências, busca, idioma/tema, quando autorizadas.

Não misturar seletor de Tenant com seletor de Company. **CompanyAccess não tem acesso à carteira do escritório.**

### 4.4 Workspace principal

Regiões, em ordem:
1. título + frase de objetivo (máximo duas linhas em condições normais);
2. contexto selecionado (se aplicável);
3. indicadores sintéticos relevantes;
4. navegação secundária por tarefas;
5. painel de trabalho ativo;
6. ações contextualizadas;
7. aviso de dados sintéticos discreto, sem ocupar uma faixa excessiva em todas as vistas.

Tabelas, filas e atividades já selecionadas devem ser o centro da tela. A interface não deve exigir que o usuário role vários cartões de status para alcançar o botão principal.

### 4.5 Painel de detalhes

Usar painel lateral ou modal **apenas quando a ação for breve e preserva o contexto**: ver origem de movimento, responder uma solicitação curta, escolher um filtro, examinar pequena evidência.

Usar página/aba de atividade dedicada quando envolver:
- conferência extensa de nota e itens;
- múltiplas decisões profissionais;
- cadastro complexo;
- comparação de fontes;
- justificativas, anexos e histórico longos.

Modais não podem ser usados para “ocultar” complexidade operacional de modo a simular uma navegação curta.

---

## 5. Design tokens e composição reutilizável

### 5.1 Identidade

- O mock de Tenant fictício mantém **NEXUS Contabilidade & Assessoria**; ACME Industrial é Company sintética.
- Superfície CompanyAccess exibe marca da **NEXUS**, sem atribuição compulsória à EVOLU.
- EVOLU permanece marca do produto/provedor e em telas de autoridade própria; não copiar automaticamente a marca EVOLU para o portal white-label da Company.
- Preservar o esquema claro/escuro, contraste e fontes atualmente aprovados como direção; não reinventar visual com outra paleta.
- A identidade de organizações futuras deve vir de configuração autorizada, não de CSS alterado por Company.

### 5.2 Sistema espacial proposto

| Token semântico | Valor inicial sugerido | Aplicação |
|---|---:|---|
| `sidebar.expanded` | 236 px (aceitar variante 232–244) | trilho lateral desktop |
| `sidebar.collapsed` | 76 px | navegação por ícones |
| `header.minHeight` | 64 px | barra superior |
| `workspace.paddingInline` | 20–28 px | conteúdo desktop |
| `workspace.paddingBlock` | 14–20 px | espaçamento vertical |
| `panel.gap` | 12–16 px | afastamento entre painéis |
| `panel.radius` | 12–14 px | cartões |
| `panel.padding` | 14–18 px | cartões operacionais |
| `panel.ratio` | 65/35, ajustável | tarefa / contexto |
| `control.minHeight` | 36–40 px (desktop); 44 px alvo de toque | botões e seletores |
| `text.body` | cerca de 13–14 px | texto corrente |
| `text.secondary` | cerca de 11–12 px | informações auxiliares |

**Importante:** esses valores são parâmetros de partida para inspeção visual, não tamanhos incondicionais. Usar unidades relativas quando isso favorecer zoom, i18n e acessibilidade.

### 5.3 Breakpoints propostos

- **Desktop amplo:** a partir de ~1280 px e altura útil suficiente — grade de tarefa + contexto.
- **Desktop compacto/tablet horizontal:** de ~900 a 1279 px — contexto pode mudar para aba ou drawer.
- **Tablet/móvel:** abaixo de ~900 px — menu em drawer e conteúdo em uma coluna; rolagem normal.
- **Altura curta ou zoom elevado:** liberar rolagem vertical em vez de usar altura bloqueada. Uma verificação apenas por `min-width` não é suficiente.

Breakpoints devem ser escolhidos pelos limites de conteúdo e validados nos casos reais, não por um dispositivo específico.

### 5.4 Regra anti-sobreposição

Nenhum componente pode ultrapassar a coluna:
- usar trilhos `minmax(0, 1fr)`, `min-width: 0`, overflow controlado em tabelas;
- cards da mesma coluna com bordas alinhadas;
- sidebar recolhida muda a largura da grade, não usa posicionamento sobre o conteúdo;
- cabeçalho, painéis e rodapé possuem regiões de altura elástica;
- proibir corte silencioso de texto, data, número e ação;
- estados vazios, tradução inglesa, mensagens de erro e campos com nomes extensos fazem parte do teste.

---

## 6. Componentes de interface a construir ou padronizar

| Componente | Props/estado conceitual | Interação | Restrições |
|---|---|---|---|
| `AppShell` | surface, brand, nav, context, role | renderiza sidebar/header/workspace | nunca concede permissão |
| `SidebarNav` | items autorizados, activeItem, collapsed | navegação + recolher pelo logotipo | CompanyAccess não exibe Tenant portfolio |
| `ContextBar` | companyId, cnpjEntityId, period, sourceStatus | seleção contextual | troca só entre escopos autorizados |
| `WorkspaceHeader` | title, subtitle, breadcrumbs, actions | contexto curto | não duplicar área de conteúdo |
| `TaskTabs` | tasks, selectedTask | troca de tarefa sem profundidade artificial | aba não realiza ação fiscal |
| `MetricCard` | label, value, provenance, status | abrir detalhamento se disponível | número sintético rotulado; sem inferir tributo |
| `TaskPanel` | state, content, actions | operação única | pode ter painel secundário |
| `ContextPanel` | context, pending, evidence | consulta contexto | não carrega informação não autorizada |
| `DataTable` | rows, columns, sort, filters, page | página, filtros, abrir registro | paginação acessível; sem linhas invisíveis |
| `DetailDrawer` | item, close, actions | detalhe curto e reversível | foco gerenciado; fechar sem perder contexto |
| `EvidenceStatus` | origin, verification, freshness | explica estágio | não confundir origem e validade fiscal |
| `PendingItemCard` | assignedTo, status, due, scope | abrir solicitação | sem validação automática de resposta |
| `ReviewDecisionPanel` | evidence, rationale, professional role | registrar revisão explícita | não equivale a apuração tributária |
| `AdvisoryPanel` | releasedContext, caveats, recommendation | leitura/análise | recomendação não executa |
| `EmptyState` | reason, nextAction | orientação sem dados | evitar métricas fabricadas |
| `Error/ForbiddenState` | kind, recovery | feedback/retorno | nunca expor informação não autorizada |
| `DemoStatus` | isSynthetic, sources | aviso discreto | protótipo não se apresenta como integração real |

No estágio atual, componentes podem ser **conceitos de função e CSS compartilhados**, sem criar um novo framework antes da decisão de arquitetura de implementação. O catálogo futuro pode migrar para componentes reutilizáveis quando o frontend integrado for escolhido.

---

## 7. Navegação — contrato dos três cliques

### 7.1 Métrica

Contar interações de navegação significativas desde a página inicial do usuário até a **atividade pronta para ser executada**, como abrir a tela onde se pode registrar uma movimentação.

Não contar: digitar dados, selecionar competência já visível, rolar dentro de uma tabela, abrir um tooltip, confirmar exclusão, autenticar-se ou concluir uma ação profissional obrigatória. Essas interações ainda precisam ser simples e avaliadas separadamente.

Alvo:
- atividade comum: preferencialmente **até 2**, máximo **3** cliques de navegação;
- configuração avançada/administração: até **4** quando necessário, conforme regra canônica;
- deep links contextuais, fila de pendências e busca podem reduzir esse percurso.

### 7.2 Exemplos de percurso a validar

| Superfície | Tarefa | Caminho proposto | Cliques |
|---|---|---|---:|
| TenantAccess | abrir carteira | Início → Empresas | 1 |
| TenantAccess | abrir configuração de Company | Início → Empresas → Company → Configuração | 3 |
| TenantAccess | conferir pendência fiscal | Início → Pendências → Item | 2 |
| TenantAccess | consultar NF-e | Início → Fiscal → Documentos → Documento | 3 |
| TenantAccess | iniciar pré-fechamento | Início → Contábil → Pré-fechamento | 2 |
| TenantAccess | ver contexto para assessoria | Início → Assessoria → Contextos | 2 |
| CompanyAccess | registrar movimento | Início → Financeiro → Registrar movimentação | 2 |
| CompanyAccess | ver contas a pagar | Início → Financeiro → Contas | 2 |
| CompanyAccess | responder solicitação | Início → Solicitações → Solicitação | 2 |
| CompanyAccess | consultar documento | Início → Documentos → Documento | 2 |

A contagem acima é **proposta de navegação**, não benchmark medido sobre os protótipos atuais.

### 7.3 Navegação não é estrutura hierárquica infinita

Um menu com Financeiro → Contas → A pagar → Empresa → Filial → Setembro é incorreto. Financeiro é área; Contas é tarefa; A pagar é filtro/aba; Company, CNPJ e competência pertencem ao contexto.

A navegação principal mostra até as áreas autorizadas. A navegação secundária mostra tarefas dentro da área. Um registro detalhado pode abrir painel ou página específica. Uma nova hierarquia não deve surgir para cada dimensão de filtragem.

### 7.4 Troca de contexto

Mudar Company/CNPJ/competência:
- atualiza os dados ativos;
- preserva a tarefa quando ela faz sentido para o novo contexto;
- invalida seleção de registro que não pertença ao novo escopo;
- mantém explícitos filtros que continuam válidos;
- mostra estado vazio/pedidos de acesso quando o escopo não contém dados;
- nunca apresenta dados de uma Company anterior enquanto a nova é carregada;
- pede confirmação antes de abandonar mudanças não salvas.

---

## 8. Blueprint A — Painel do Escritório (TenantAccess)

### 8.1 Objetivo

Responder: **o que exige atenção da equipe hoje e a qual cliente/competência pertence?**

### 8.2 Composição no viewport

Topo: marca Tenant, busca/empresa/competência quando aplicável, usuário e contexto de autorização.

Conteúdo inicial:
1. título “Painel do escritório” + objetivo em uma frase;
2. três cartões informativos: carteira atendida, pendências da equipe, competências em andamento;
3. painel **Fila de trabalho** (prioritário, ~65%) com até 5 itens visíveis e paginação;
4. painel **Carteira de empresas** ou **Atalhos operacionais** (~35%);
5. rodapé discreto com data/estado de origem quando pertinente.

Não colocar gráficos decorativos, fiscalizações completas, DRE detalhada, todos os impostos e a carteira inteira acima da dobra.

### 8.3 Fila de trabalho

Cada linha deve prever:
- Company e CNPJ autorizados;
- competência;
- área (Fiscal, Contábil, Financeiro, Assessoria);
- tipo da pendência;
- estado (recebida, aguardando resposta, conferência, vencimento);
- responsabilidade;
- ação “Abrir”.

Abrir item leva diretamente à atividade correta preservando contexto, sem exigir navegar manualmente pela carteira.

### 8.4 Estados

Loading, pronto, sem pendências, origem desatualizada, falha simulada e acesso negado. Não inventar números de empresas ou percentuais de conclusão nos protótipos.

### 8.5 Aceite específico

No desktop de referência, o usuário identifica a fila e abre uma pendência com **até dois cliques**. Usuários externos de Company não podem ver essa tela ou a lista global de clientes.

---

## 9. Blueprint B — Início da Empresa (CompanyAccess)

### 9.1 Objetivo

Responder: **qual é a situação que posso consultar e o que preciso fazer para minha contabilidade?**

### 9.2 Composição

- Cabeçalho com marca NEXUS, Company ACME Industrial, CNPJ autorizado e competência.
- Três indicadores de resumo: movimentações, documentos e solicitações.
- Painel esquerdo (~60–65%): atalho para o Financeiro e resumo estritamente contextual.
- Painel direito (~35–40%): solicitações, comprovantes faltantes e próxima ação.
- Ações rápidas relevantes e sem redundância; link para o módulo completo.

### 9.3 Separação de papéis

**Financeiro da Company:** pode registrar movimento, apresentar documento e responder solicitação na simulação.  
**Consulta da Company:** visualiza registros e solicitações atribuídas sem campos de escrita.  
**Contabilidade do Tenant:** não entra nessa sessão externa para fazer revisão profissional; usa sua própria superfície.

### 9.4 Contexto persistido

Ao entrar no Financeiro a partir do Início, manter Company/CNPJ/competência e perfil conceitual. A volta preserva a mesma seleção. Esse comportamento já existe parcialmente com parâmetros sintéticos, mas não é autorização real.

### 9.5 Aceite

Acesso a Financeiro ou solicitação em até 2 cliques. Nenhuma carteira do Tenant; nunca ocultar origem de documento; valores financeiros não apresentados como lucro, saldo bancário ou receita tributável.

---

## 10. Blueprint C — Financeiro (CompanyAccess)

### 10.1 Objetivo

Executar **uma operação financeira por vez** sem rolar múltiplos blocos de status.

### 10.2 Subnavegação sugerida

`Visão geral | Movimentações | Contas | Fontes | Envio à contabilidade`

A escolha de aba/tarefa não deve apagar CNPJ ou competência. Cada atividade apresenta um painel de dados e, quando necessário, um painel de apoio.

### 10.3 Visão geral

- três cartões: entradas, saídas e a pagar/receber (ambos identificados separadamente em detalhe);
- tabela compacta de movimentos recentes, com estado de origem e ação de detalhes;
- painel de tarefas: registrar, importar, acompanhar envio;
- sem relatório financeiro completo no primeiro viewport.

### 10.4 Movimentações

- tabela com data, histórico, valor, direção (entrada/saída), origem, referência e estado de conferência;
- 5–8 linhas conforme altura disponível; paginação explícita e pesquisa/filtro;
- detalhamento em painel com evidências, classificação **não inferida**, e histórico;
- formulário de registro em contexto próprio; validações e status de salvamento sintéticos.

### 10.5 Contas a pagar e a receber

- subtarefas “A pagar” / “A receber” como abas, não níveis extras no menu;
- descrição, entidade relacionada, valor, vencimento, estado de liquidação e referência;
- compromissos cadastrados não são tratados automaticamente como custos dedutíveis, receitas realizadas ou documentos fiscais.

### 10.6 Fontes e importações

- cartões curtos de Manual, Arquivos, ERP, Banco e Documentos Fiscais (em categorias distintas);
- indicação explícita de origem, disponibilidade, período suportado e se é mock;
- importação sintética conserva deduplicação por referência e não converte documento fiscal em entrada de caixa;
- nunca usar amostra de setembro para representar agosto.

### 10.7 Envio à contabilidade

- identificar versão enviada (v1/v2), CNPJ, período, data/estado e número de registros;
- pendências/solicitações como cartões próprios;
- ação “Enviar/Reenviar” apenas para perfil autorizado;
- quando os registros mudam, expor “alterações pendentes de reenvio” e impedir considerar a versão antiga atual;
- exibir que conferência documental e liberação à Assessoria são decisões profissionais separadas.

### 10.8 Regra visual para tela única

O Financeiro precisa oferecer atividade **por abas de tarefa**. Se uma atividade tiver dois painéis e informações demais, usar paginação da tabela/detalhes; **não** criar “Quadro 1/2/3” como substituto permanente de uma hierarquia de tarefas compreensível. A paginação experimental atual deve ser adaptada a esse desenho.

### 10.9 Aceite

Registrar movimento: Início → Financeiro → Registrar. Ver contas: Início → Financeiro → Contas. Responder esclarecimento: Início → Solicitações → Item. A tela inicial do Financeiro exibe a área de trabalho sem rolagem da página a 1440×900, sem ocultar linhas permanentemente.

---

## 11. Blueprint D — Fiscal e Contábil (TenantAccess)

### 11.1 Objetivo

Transformar dados recebidos em **evidência rastreável para validação profissional**. Fiscal e Contábil continuam módulos distintos quando a configuração e o direito do Tenant assim determinarem; a visualização agrupada é apenas uma porta operacional de trabalho.

### 11.2 Composição

- Cabeçalho Tenant com Company/CNPJ/competência selecionados.
- Abas: **Recebidos | Pendências | Conferência | Pré-fechamento**.
- Painel principal: lista de objetos recebidos (movimentos, documentos, respostas) e origem.
- Painel secundário: dados/contexto da evidência, justificativas de revisão, estado, próximas ações.
- Lista paginada de evidências; detalhes extensos de documento entram em atividade dedicada.

### 11.3 Operação e autoridade

- profissional autorizado recebe submissão versionada;
- solicita contexto faltante; resposta da Company chega como “respondida”, não “validada”;
- revisa cada evidência com nota/fundamentação; registros relevantes apontam fonte e competência;
- só após o conjunto completo pode liberar **contexto** para Assessoria;
- a liberação não é aprovação fiscal, registro contábil nem apuração tributária;
- cálculos ou recomendações permanecem bloqueados quando não há dados suficientes.

### 11.4 Integração com caso documental já existente

O protótipo NF-e 70031 deve continuar diferenciando **análise, recomendação, decisão, aprovação e execução**. Seu detalhe fica acessível pela lista/documento, não como um submódulo obrigatório inteiro no menu principal.

### 11.5 Aceite

Conferir uma pendência recebida em no máximo três cliques desde o Painel do Escritório. Nunca mostrar crédito de ICMS/PIS/COFINS ou conclusão de IRPJ/CSLL derivada apenas de pagamentos, extrato bancário ou de um campo de documento isolado.

---

## 12. Blueprint E — Assessoria (TenantAccess)

### 12.1 Objetivo

Exibir **contextos disponíveis para análise**, seus limites e próximos passos, sem confundir recomendação com execução.

### 12.2 Composição

- três indicadores sintéticos: contextos recebidos, análises em curso, recomendações pendentes de avaliação;
- painel principal: contexto da Company, fonte, competência, questões em aberto e evidência revisada;
- painel secundário: Intelligence, hipóteses, alternativas, racional e limitações;
- status inequívoco de “Contexto não liberado”, “Disponível para análise”, “Insuficiente” ou “Aguardando validação”.

### 12.3 Regra Intelligence

Intelligence pode ler contexto permitido, sinalizar insuficiência, explicar hipóteses e sugerir prioridades. Não tem capacidade autônoma para alterar documento, lançamento, classificação, cálculo, aprovação ou fechamento. A interface não apresenta sugestão como resultado executado.

### 12.4 Aceite

O profissional chega a “Contextos” em até dois cliques, entende a origem e o limite dos dados sem abrir outra página e consegue inspecionar a evidência. Nenhum valor fiscal é dado como definitivo sem apuração profissional.

---

## 13. Telas auxiliares — encaixe no mesmo sistema

As páginas principais não eliminam as demais. Apenas definem sua entrada e o seu Shell.

| Tela auxiliar | Origem | Padrão de trabalho |
|---|---|---|
| Empresas / Carteira | Painel do Escritório | tabela filtrável + painel lateral de status |
| CompanyWorkspace | carteira ou pendência | título/contexto + tarefas da Company |
| CompanyOnboarding | Empresas → Novo | assistente por etapas; uma etapa no foco |
| CompanyConfiguration | CompanyWorkspace → Configuração | abas Identidade/CNPJs/Serviços/Fontes/Acesso |
| TenantConfiguration | Administração → Organização | tarefas administrativas com uma seção de formulário por vista |
| Documentos | CompanyAccess ou Fiscal | lista e detalhe com evidências |
| Solicitações | CompanyAccess / TenantAccess | fila paginada + resposta contextual |
| Pendências | Início / área | listas priorizadas + abertura profunda contextual |
| Aprovações | TenantAccess | itens com decisão explícita, autorização e trilha |
| Conciliação | Fiscal/Contábil, conforme OperatingModel | fontes lado a lado, diferenças e evidência |
| Histórico/Auditoria | detalhes autorizados | linha do tempo por objeto + metadados de ator/ação |

Nenhuma tela auxiliar deve herdar automaticamente a capacidade de editar/decidir só porque o usuário consegue acessá-la.

---

## 14. Contratos funcionais entre telas

### 14.1 Contexto de navegação (conceitual)

~~~typescript
type Surface = "tenant" | "company";

interface WorkspaceContext {
  surface: Surface;
  tenantId: string;             // resolvido por autorização, nunca por marca visual
  companyId?: string;           // TenantAccess pode selecionar entre autorizadas
  cnpjEntityId?: string;        // distinta de companyId e número de CNPJ
  accountingPeriod?: string;    // AAAA-MM
  module?: string;
  activity?: string;
  selectedRecordId?: string;
  filters?: Record<string, string>;
  originRoute?: string;
}
~~~

**Nota:** contrato de frontend para ser validado. Não criar os dados tipados em `src/` sem aprovar a estratégia de migração; o catálogo existente permanece fonte de domínio.

### 14.2 Contexto de tela (conceitual)

~~~typescript
interface ScreenContract {
  id: string;
  accessSurface: "tenant" | "company" | "evolu-admin";
  primaryEntity: string;
  supportedScopes: string[];
  requiredCapabilities: string[];
  initialActivity: string;
  availableActivities: string[];
  permittedActions: string[];
  loadingStates: string[];
  emptyStates: string[];
  errorStates: string[];
  contextDependencies: string[];
  maxNavigationClicks: number;
  dataOwner: "Platform" | "Intelligence" | "mixed";
}
~~~

Estes campos devem ser mapeados à matriz do catálogo de contratos existente, **não** utilizados para duplicar entidades de domínio.

### 14.3 Estado e proveniência

Todo item relevante precisa ter, quando disponível:
- referência estável;
- Company/CnpjEntity/competência;
- tipo real de objeto (movimento, compromisso, documento, resposta, evidência, análise);
- origem (`manual/file/ERP/bank/fiscal` sem confundir Source Category, Provider e Connector);
- status da origem e data da última atualização;
- status de conferência e profissional responsável;
- justificativa de conferência e evento de histórico;
- versão do pacote quando enviado;
- indicação de informação pendente ou insuficiente.

### 14.4 Paginação e persistência

No frontend de demonstração, paginação é local e reversível. Trocar aba não deve descartar o contexto de Company/CNPJ/período. Trocar de superfície de acesso exige sessão própria no produto real.

Persistência de movimentos, anexos, papéis, usuários e decisões exige Backend aprovado e contratos específicos. Na fase estática, nada deve fingir que existe sincronização entre arquivos HTML independentes.

### 14.5 Acessibilidade e estados de erro

Padrão mínimo:
- navegação pelo teclado, foco visível e sequência lógica;
- labels associados a cada filtro;
- sem operação exclusivamente por cor ou hover;
- cabeçalho e controles acessíveis com zoom 200%;
- modais com foco inicial, Escape e devolução de foco;
- atualização de estado anunciada de forma discreta;
- textos longos e inglês não cortados;
- sem “tabela vazia” quando o verdadeiro estado for “não autorizado”, “não recebido” ou “erro”.

---

## 15. Limites de permissão, visibilidade e white-label

### 15.1 Regras invariantes

~~~text
EVOLU (licenciante)
→ TenantEntitlements (limite do contrato de licença)
→ Serviços habilitados para a Company
→ UserPermissions e Capabilities
→ Ações e informações visíveis na superfície correta
~~~

- **TenantAccess:** carteira somente nas Companies/CNPJs atribuídas, módulos apenas autorizados, funções profissionais condicionadas a capacidades.
- **CompanyAccess:** dados e funcionalidades da sua Company, dentro dos CNPJs autorizados; nenhuma carteira do Tenant, administração do escritório ou mudança de papel profissional.
- **EVOLU administração:** não pode ser confundida com administração de Tenant; configuração de licenças não aparece no portal do cliente externo.
- Persona fictícia “consulta” não ganha ação de escrita por deep link.
- Perfil e escopo em query string de protótipo **não são segurança**; Backend futuro deve validar cada requisição e lista pelo servidor.

### 15.2 Padrão de nomes

Textos públicos preferem terminologia conhecida: “Financeiro”, “Movimentações”, “Contas a pagar”, “Documentos fiscais”, “Conferência”, “Informações da empresa”, “Solicitações”, “Pendências”, “Aprovação”, “Assessoria”.

Nomes internos do contrato (Tenant, Company, CnpjEntity, Recommendation etc.) não precisam ocupar títulos de UI externa.

---

## 16. Implementação na Platform UX — plano exato por etapas

### 16.1 Princípios de execução

A implementação **não começa ao salvar este documento**. A decisão de produto e a especificação podem ser revisadas antes da primeira alteração visual.

Não reescrever as páginas de uma vez. Não criar uma aplicação nova apagando a demo. Não abrir backend de Vercel/Supabase nem operações de produção. Preservar versão anterior para comparação.

**Ordem obrigatória para cada etapa:**
1. identificar conteúdo e comportamento atuais;
2. fazer alteração mínima no protótipo estático;
3. testar layout, permissões e contexto;
4. comparar com a especificação;
5. apresentar para revisão do usuário;
6. marcar aceita ou pendente; só então avançar quando a revisão daquela área exigir.

### 16.2 Estrutura técnica progressiva sugerida

~~~text
preview/
  shared-ux/
    tokens.css              # futuro, se aprovado
    shell.css               # futuro, se aprovado
    components.css          # futuro, se aprovado
    shell.js                # futuro, sem API
    navigation.js           # futuro, sem URL como autorização
  ux-journey/
    index.html              # hub de revisão de UX
  company-access-home/
    index.html
  company-financial-workspace/
    index.html
  company-configuration/
    index.html
  company-onboarding/
    index.html
  tenant-configuration/
    index.html
  fiscal-document-70031/
    index.html
~~~

A criação de arquivos compartilhados é uma **sugestão para evitar duplicação CSS/JS entre seis HTML estáticos**, não uma exigência de tecnologia específica. Verificar impactos de cache, caminhos relativos e compatibilidade de GitHub Pages antes de extrair.

### 16.3 Sequência detalhada de entregas

| Ordem | ID | Mudança | Arquivo alvo inicial | Condição de aceite |
|---:|---|---|---|---|
| 0 | `UX-SHELL-0` | congelar referência visual e listar CSS experimental ainda não aprovado | documentação + inventário | nenhuma regra anterior perdida |
| 1 | `UX-SHELL-1` | unificar Shell/Sidebar/Header/ContextBar | `preview/ux-journey/` | sidebar, espaço e hierarquia iguais em 5 vistas |
| 2 | `UX-OFFICE-1` | converter Painel do Escritório em atividade de uma janela | página de revisão dedicada ou demo isolada | fila prioritária visível e acessível |
| 3 | `UX-COMPANY-1` | aplicar padrão ao Início da Company | `preview/company-access-home/` | resumo + solicitações sem longa rolagem |
| 4 | `UX-FINANCE-1` | separar Financeiro em tarefas reais e ajustar tabelas | `preview/company-financial-workspace/` | sem cartões ocultos; paginação completa |
| 5 | `UX-FISCAL-1` | criar entrada coerente para Fiscal/Contábil e manter caso NF-e | revisão TenantAccess + NF-e existente | evidência/decisão profissional separadas |
| 6 | `UX-ADVISORY-1` | criar entrada de Assessoria consistente | revisão TenantAccess | só contexto liberado aparece como disponível |
| 7 | `UX-AUX-1` | alinhar configuração, onboarding, solicitações, documentos e detalhes | prévias já existentes | mesmo Shell e sem campos perdidos |
| 8 | `UX-ROUTES-1` | testar matriz dos três cliques e continuidade de contexto | hub de revisão | percursos principais aprovados |
| 9 | `UX-REVIEW-1` | homologação visual/funcional transversal | todos os protótipos | aprovação explícita ou lista de pendências |
| 10 | **Gate** | parar antes do Backend | arquitetura canônica | novo consentimento explícito do usuário |

A ordem das cinco páginas respeita a preferência: **começar pelo Painel do Escritório e seguir etapa por etapa**. O Financeiro não deve servir de base obrigatória para “encaixar” as outras quatro telas.

### 16.4 Orientação de diff por arquivo

**`preview/ux-journey/index.html`**
- deve ser **ambiente de revisão**, não uma tela produtiva;
- apresentar navegação de cinco páginas conceituais, critérios de tela única, persona selecionada e checklist;
- substituir navegação por blocos longos por acesso direto às cinco atividades e suas validações;
- não usar rolagem escondida sem paginação;
- linkar protótipos existentes sem afirmar que compartilham estado.

**`preview/company-access-home/index.html`**
- reaproveitar dados fictícios e papéis existentes;
- reorganizar na composição da página B;
- manter link com escopo à página Financeiro;
- preservar CompanyAccess read-only sem botões de escrita e no máximo três indicadores de entrada na visão inicial;
- manter documentos e solicitações como tarefas próprias.

**`preview/company-financial-workspace/index.html`**
- substituir a tentativa de esconder cartões por uma **navegação de tarefas explícitas**;
- manter versão do envio, pedidos, respostas e revisão por evidência;
- trabalhar em uma atividade por viewport, com tabelas paginadas;
- não quebrar fonte/doc fiscal separado;
- garantir que o painel de conferência Tenant não seja apresentado como permissão real do usuário Company;
- sempre mostrar como chegar à próxima ação.

**`preview/company-configuration/index.html`**
- distribuição Identidade/CNPJs, Serviços, Fontes, Acesso;
- formulário de uma tarefa visível por vez, com salvamento simulado e indicador de não persistência;
- TenantEntitlements continuam impondo limite de escopo.

**`preview/company-onboarding/index.html`**
- preservar as oito etapas existentes;
- trocar empilhamento por etapa ativa + progresso + resumo conciso;
- não eliminar validações só para reduzir rolagem;
- formulário alto passa a exigir rolagem interna acessível ou etapa adicional, se necessário.

**`preview/tenant-configuration/index.html`**
- separar autoridade EVOLU e autoridade Tenant com aviso e controles coerentes;
- tarefas de configuração curtas;
- não alterar regras comerciais/licença em nome da estética.

**`preview/fiscal-document-70031/index.html`**
- acessar pelo contexto Fiscal/documento;
- preservar semântica de análise, recomendação, decisão, aprovação e execução;
- detalhe pode ocupar uma atividade inteira quando necessário.

**`/demo/` e landing pública**
- somente leitura/verificação de compatibilidade durante esta etapa;
- não trocar a apresentação comercial pela interface operacional;
- qualquer migração futura seguirá plano de contratos previamente existente.

---

## 17. Tratamento do experimento recente de viewport

As regras recentes que fixam `height:100dvh` e `overflow:hidden` e os paginadores “quadro anterior/próximo” em Financeiro/Jornada **não são a decisão estrutural definitiva**.

**Na execução:**
1. capturar os fluxos anteriores e atuais como referência (sem depender de screenshot para construir regras);
2. localizar todas as regras CSS responsáveis por impedir rolagem da página, inclusive por breakpoint;
3. mapear cada conteúdo que ficou invisível ao trocar de quadro ou resize;
4. preservar informações e eventos existentes;
5. migrar o conteúdo para a aba/tarefa correta;
6. usar paginação principalmente em listas/tabelas, não em blocos de contexto desconexos;
7. habilitar rolagem de fallback em viewport curto ou zoom;
8. repetir os cenários de submissão/versionamento/conferência da v0.22.

Não remover scripts, elementos ou estados que tenham outro propósito. Evitar sobreposição de CSS no final do arquivo como solução permanente quando a mesma responsabilidade existir em regras anteriores; consolidar estilos.

---

## 18. Critérios mensuráveis de aceite

### 18.1 Layout desktop

- [ ] A 1440×900, a atividade inicial das cinco páginas cabe na janela sem rolagem vertical do documento.
- [ ] A 1366×768, o essencial permanece acessível, sem corte de botões, rótulos ou conteúdo.
- [ ] A 1280×720, qualquer conteúdo excedente tem fallback acessível (aba, paginação, rolagem local).
- [ ] Sidebar expandida/recolhida altera a área útil sem sobrepor as tarefas.
- [ ] Cards da mesma coluna têm bordas alinhadas e não ultrapassam seus trilhos.
- [ ] Mudança de idioma e tema não provoca corte nem deslocamento crítico.
- [ ] Nenhuma linha de tabela desaparece sem um caminho de paginação ou navegação.

### 18.2 Navegação

- [ ] Pelo menos os dez percursos do capítulo 7 cumprem o orçamento aprovado de cliques.
- [ ] Escolher Company/CNPJ/competência não obriga “descer” por menus adicionais.
- [ ] Ao trocar de atividade, o contexto autorizado permanece.
- [ ] Deep links para registro/solicitação preservam contexto e estado de acesso.
- [ ] Voltar à tela anterior preserva o filtro sempre que coerente.
- [ ] Mudança de contexto invalida registro da Company anterior e nunca mistura dados.

### 18.3 Papéis e segurança conceitual

- [ ] Portal da Company não revela carteira do escritório.
- [ ] Read-only não oferece nem executa ações de escrita na demo.
- [ ] Profissional contábil não ganha direitos do Tenant administrador implicitamente.
- [ ] Nenhuma mudança de URL é tratada como permissão efetiva.
- [ ] Acesso proibido e sem dados são apresentados como estados distintos.
- [ ] Marca do Tenant continua visível para Company sem branding obrigatório EVOLU.

### 18.4 Integridade financeira e fiscal

- [ ] Extrato bancário não é chamado automaticamente de faturamento.
- [ ] Compromisso financeiro não é registrado como despesa fiscal dedutível.
- [ ] Documento fiscal importado não cria entrada/saída de caixa automaticamente.
- [ ] Resposta da Company não é considerada validada até revisão humana.
- [ ] Revisão profissional exige evidência e justificativa.
- [ ] Nova versão invalida contexto antigo enviado à Assessoria.
- [ ] A Intelligence não aprova imposto nem aplica mudanças sozinha.

### 18.5 Acessibilidade, fallback e teste

- [ ] Tab/Shift+Tab percorrem a página sem bloqueios.
- [ ] Logo da sidebar recolhe/expande por teclado e mouse.
- [ ] Labels dos botões recolhidos permanecem legíveis para tecnologia assistiva.
- [ ] Em viewport móvel e zoom 200%, a página pode rolar sem ocultar conteúdo.
- [ ] Modais e drawers não prendem foco incorretamente.
- [ ] Todas as opções de paginação exibem as linhas corretas.
- [ ] Não há chamada de rede, armazenamento de dados reais ou execução em serviços externos.
- [ ] Demo antiga e documentação canônica continuam íntegras.
- [ ] Há revisão visual real do usuário, separada de teste de sintaxe.

---

## 19. Matriz de testes de regressão e evidências

| ID | Cenário de teste | Resultado necessário |
|---|---|---|
| T-01 | Início do escritório → Pendências → documento | no máximo 3 cliques; CNPJ/competência preservados |
| T-02 | Início da empresa → Financeiro → movimento | tela/atividade correta em até 3 cliques |
| T-03 | Início da empresa → solicitações → resposta | apenas papel financeiro autorizado pode responder |
| T-04 | perfil de consulta → Financeiro | sem controle de entrada, importação ou envio |
| T-05 | alternar Matriz/Filial | registros pertencem ao CNPJ selecionado |
| T-06 | alternar agosto/setembro | amostra de setembro não é atribuída a agosto |
| T-07 | entrar em Contábil/Fiscal | evidência e origem separadas de conclusão tributária |
| T-08 | resposta recebida da Company | continua pendente até validação explícita |
| T-09 | registrar motivo de conferência | exige razão/evidência suficiente |
| T-10 | liberar contexto à Assessoria | só após conferências e pendências resolvidas |
| T-11 | editar dados após enviar pacote v1 | antiga versão fica defasada |
| T-12 | reenviar v2 | revalidação exigida |
| T-13 | alternar menu lateral | conteúdo ganha/perde largura, sem overlap |
| T-14 | altura curta, zoom 200% | conteúdo disponível sem corte silencioso |
| T-15 | idioma inglês | textos mais longos preservados |
| T-16 | longas tabelas | todas as linhas acessíveis por página/rolagem |
| T-17 | navegar entre cinco páginas | Shell coerente; limites de acesso explícitos |
| T-18 | clicar em sugestão da Intelligence | nenhuma execução autônoma |

**Evidência de teste sugerida por item:** dispositivo/viewport, papel, contexto, caminho clicado, resultado observado, status (passa/falha/pendente) e alteração corretiva. Teste de sintaxe não substitui execução de interação no navegador.

---

## 20. Riscos, dependências e critérios de reversão

### 20.1 Riscos principais

1. **Layout “sem rolagem” por corte de conteúdo.** Mitigar com tarefas dedicadas, paginação e fallback de altura/zoom.
2. **Duplicidade de CSS e JS em vários HTML.** Mitigar com extração incremental de componentes compartilhados ou regras consolidadas.
3. **Navegação curta artificial.** Mitigar medindo tarefas reais, sem esconder passos de validação.
4. **Confundir Company e Tenant.** Mitigar com Shells distintos por superfície, papéis e contextos.
5. **Falsa sincronização de protótipos.** Mitigar com aviso explícito e testes de escopo; não afirmar que um envio num HTML alterou outro HTML.
6. **Perder o fluxo contábil/fiscal existente.** Mitigar com checklist de regressão T-07 a T-12.
7. **Mudar demasiadas telas de uma vez.** Mitigar com fatias que possam ser revertidas isoladamente.
8. **Interpretar UX aprovado como aprovação de Backend.** Mitigar com gate expresso no capítulo 21.
9. **Expansão para ERP total.** Manter Financeiro V1; módulos de PDV, estoque, emissão fiscal e indústria continuam futuros/opcionais.
10. **Perda de franquia GitHub.** Não usar Actions, jobs, workflows ou dependências de CI para documentação/preview; alterações manuais simples no repositório.

### 20.2 Pontos ainda em aberto

Estes tópicos dependem de validação posterior e **não devem bloquear a criação do documento**, mas podem afetar a implantação de componentes:
- forma definitiva de agrupamento/posição de Fiscal e Contábil conforme OperatingModel;
- cargos/permissões finos do Tenant e Company;
- variantes técnicas white-label além do padrão Tenant;
- disposição definitiva de Conciliação;
- escopo de CompanyAccess para outras atividades setoriais;
- tecnologia de frontend/arquivos compartilhados a adotar na etapa de consolidação;
- preferência entre painéis de detalhe, rotas completas ou abas para casos extensos;
- quais indicadores exatos da visão geral virão de dados válidos e verificados.

### 20.3 Estratégia de reversão

Antes de cada corte de frontend, guardar commit base da página e critério visual. Se a nova composição perder ações, ocultar dados ou romper um percurso, voltar apenas aquela fatia à versão anterior, não reverter a arquitetura canônica nem outros protótipos aceitos.

Não fundir/implantar uma refatoração que:
- desative o acesso a uma evidência existente;
- esconda comandos obrigatórios de revisão;
- apresente papel de Company como autorizado a administrar Tenant;
- passe a exibir documentos fiscais como receita financeira;
- bloqueie o usuário com rolagem impossível.

---

## 21. Governança, aprovação e ordem de execução

### 21.1 Quatro estados distintos

1. **Especificado:** documento pronto e validado logicamente.
2. **Implementado em protótipo:** código alterado em HTML estático da base visual legada.
3. **Revisado visualmente/funcionalmente:** usuário navegou e aceitou determinada tela.
4. **Aprovado para Backend:** decisão expressa e posterior à revisão final de UX.

O estado 1 **não implica** 2, 3 ou 4. A preferência expressa pelos wireframes é diretriz visual e não aprovação de todas as regras.

### 21.2 Critérios de saída desta especificação

- [ ] Documento vinculado à arquitetura canônica com status correto.
- [ ] Ordem de implantação por telas clara e reversível.
- [ ] Shell, cinco blueprints, contratos e matriz de testes definidos.
- [ ] Critério de viewport especificado sem violar acessibilidade.
- [ ] Orçamento de três cliques mensurável.
- [ ] Fronteiras TenantAccess/CompanyAccess preservadas.
- [ ] Proibição de Backend/Actions reafirmada.
- [ ] Usuário pode revisar o documento sem precisar percorrer conversas anteriores.

### 21.3 Próxima ação autorizável

Quando o usuário indicar que a **estrutura descrita neste documento** deve ser implementada nos protótipos, iniciar pela etapa `UX-SHELL-1` e pelo **Painel do Escritório**. Apresentar a primeira página de forma concreta, revisar o alinhamento e então migrar Início da Empresa, Financeiro, Fiscal/Contábil e Assessoria, uma por vez. Não iniciar o Backend nem assumir aprovação tácita dos módulos profissionais.

**Gate final imutável:** terminar a UX → revisar as telas e rotas → registrar pendências resolvidas ou adiadas → solicitar aprovação expressa → somente então considerar planejamento/implementação de Backend.

---

## 22. Resumo executivo para execução por engenharia

A modificação **não é um redesenho do produto inteiro**: é a consolidação sistêmica da interface existente em um Shell comum, com cinco páginas de referência e atividades curtas. A maior parte das interações de Financeiro/Conferência pode ser preservada, desde que dados, estados e autoridade não sejam confundidos.

**Primeira fatia:** Shell e Painel do Escritório.  
**Segunda:** Início da Empresa.  
**Terceira:** Financeiro por tarefas (substituir paginação experimental de cartões por composição funcional).  
**Quarta:** Fiscal/Contábil, usando evidências/documentos existentes.  
**Quinta:** Assessoria, somente após contexto autorizado e revisado.  
**Sexta:** telas auxiliares, click-budget, acessibilidade, responsividade e homologação final.

Este documento é a **referência de implementação**, subordinada aos conceitos congelados da arquitetura canônica. Nenhum código de execução foi incluído nesta entrega documental e nenhuma permissão de produção foi concedida.
