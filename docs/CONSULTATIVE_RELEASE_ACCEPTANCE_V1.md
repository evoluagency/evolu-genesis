# EVOLU — Aceite da primeira release consultiva Genesis + Intelligence V1

**Natureza:** matriz de decisão pré-release, não certificado operacional.  
**Contrato compartilhado:** `docs/CONSULTATIVE_RELEASE_ACCEPTANCE_V1.json` (bytes idênticos nos PRs Intelligence #22 e Genesis #26).  
**Ciclo:** `PRE_LEARNING`; nenhuma autorização de merge, deploy, inferência paga, exibição de resposta de modelo, escrita operacional ou aprendizagem autônoma.

## Regra de interpretação

O CI das duas branches executa testes sintéticos/de contrato e comprova apenas a integridade da matriz **SOURCE_ONLY**. Um CI verde não significa que o produto está homologado. O manifesto `decision=BLOCKED`, permissões `false` e os nove gates `E2E_PENDING` são resultados **esperados** nesta fase. Mudá-los para aprovado, sem um novo protocolo com evidências verificáveis e aceite humano, faz o gate atual **falhar**.

O SHA Git blob do mesmo manifesto é fixado em ambos os testes. Os dois repositórios devem atualizar manifesto e testes juntos; qualquer divergência bloqueia uma CI. Um hash de fixture prova igualdade de bytes entre snapshots aprovados em código, **não** prova autenticidade, origem de dados ou autorização de release.

## Trilha de conclusão com critérios verificáveis

| Ordem | Gate | Responsável | Evidência necessária |
|---|---|---|---|
| 1 | Consulta **integrada** com JWT/RLS | Platform + Genesis + Intelligence | Reexecutar o novo fluxo Genesis → BFF → Intelligence com JWT de usuário, escopo canônico, negações 401/403 e cross-tenant, sem efeito operacional |
| 2 | BFF privada com escopo canônico | Platform + Genesis + Intelligence | Mapeamento legado `company_selection.company_id = CNPJ ID`; comprovação independente da pertença ao **grupo**; limites de payload e entitlements |
| 3 | Emissor autenticado Ed25519 | Host privado + Intelligence | Gestão/rotação/revogação de chaves, nonce ligado à sessão e resultado da mesma tentativa, assinaturas inválidas negadas |
| 4 | Replay distribuído e durável | Host privado + Intelligence | Banco de homologação isolado, concorrência entre processos, falha/reinício, TTL, partição, ACK perdido e nenhum retry implícito |
| 5 | Proveniência e conteúdo | Intelligence + revisão de domínio | Identidade, integridade, vigência e aplicabilidade de fontes; revisão jurídica/tributária e tratamento de insuficiência |
| 6 | Idioma independente | Intelligence + revisão de domínio | Idioma PT/EN da resposta comprovado fora do próprio modelo e preservação do sentido técnico/legal |
| 7 | UX no host real | Genesis + Platform | Nove composições do mockup, tokens oficiais, marca transparente, PT/EN, Light/Dark, navegação, teclado, leitura de tela e responsividade |
| 8 | Custo, privacidade e auditoria | Intelligence + Genesis + Host | Inferência somente explícita, budget guard, logs minimizados, retenção, observabilidade e ausência de efeitos operacionais implícitos |
| 9 | Go/no-go com rollback | Autoridade de release | Revisão independente, SHAs/deploys rastreáveis, recuperação, rollback ensaiado e aprovação expressa |

## Responsabilidades e limites

- **Genesis:** composição visual e apresentação tipada; verificação em browser é defesa local, não autorização de banco ou origem do modelo.
- **Intelligence:** consultas governadas, fontes, modelo/custo, contratos de assinatura e replay. A suíte atual de replay usa mocks e **não certifica durabilidade real**.
- **Platform/host privado:** única autoridade de identidade e dados operacionais, vínculo real Grupo↔CNPJ, autorização JWT/RLS e transporte autenticado. O PR Platform #112 é uma dependência em revisão, **não** uma autorização para modificá-lo nesta etapa.
- **Release:** `PRE_LEARNING`, nenhum treinamento automático nem delegação operacional. O Lab continua sob responsabilidade da Intelligence.

## Critério de 100%

O primeiro lançamento consultivo somente poderá ser proposto depois de **todas** as nove provas externas, regressões source-only verdes, rastreabilidade de SHAs, aprovação de UX/segurança/domínio e decisão formal de release. Será necessário estabelecer um **novo protocolo de homologação confiável** para avaliar essas provas; editar um JSON ou fazer CI verde não desbloqueia o produto.

**Restrição vigente:** até 1º de novembro de 2026 não alterar Platform nem seu CI. Nenhum PR desta etapa deve ser mesclado, implantado ou conectado a credenciais, banco real ou inferência paga.


## Reconciliação do Gate B histórico (2026-10-14)

O registro versionado `evolu2/intelligence/config/platform-read-runtime.multiplus-validation.v1.json` relata **Platform Read Gate B = CLOSED**, `real_user_e2e.status=PASSED`, execução em **22/09/2026** pelo servidor da aplicação (`EVOLU_APPLICATION_SERVER`) usando `SUPABASE_AUTH_GET_USER` e `USER_JWT_RLS`. A Edge Function isolada não foi a via que fechou esse gate (`closure_path_used=false`). A documentação `docs/EVOLU_Intelligence_Platform_Read_Gate_B_v1.md`, com referência em 21/09/2026, ainda descreve o estado anterior `E2E_PENDING`; trata-se de desatualização histórica, e não prova de que o fluxo foi revertido.

**Limite da verificação atual:** esse status é evidência registrada no repositório. Nesta rodada não foram realizadas requisições autenticadas novas nem confirmação independente da implantação atual. O fechamento prévio do Gate B comprova a **leitura de contexto da Platform pela Intelligence no ambiente e cenário indicados**, não a consulta integrada da Genesis nem a BFF UX7B atual.

Por isso a matriz renomeia o primeiro gate externo para `INTEGRATED_CONSULTATION_JWT_RLS_E2E`, que permanece `E2E_PENDING`. Nenhum campo `priorGateB` pode autorizar deploy, merge, resposta do modelo, inferência paga ou escrita. A próxima prova deve exercer o fluxo integrado com identidade e escopo reais e matriz de negações no host privado, somente após liberação da Platform.


## Emenda 2026-10-14 — cancelamento local de transporte

O `LiveConsultationCoordinator` encerra a **espera da interface** quando sua tentativa é invalidada ou descartada, inclusive se um adaptador injetado ignorar `AbortSignal` e nunca resolver. Respostas e exceções posteriores da tentativa antiga não alcançam a sessão nova. A invalidação explícita agora se apresenta de forma consistente como `consultation_context_changed` e mantém `retryable=false`.

Esse cancelamento **não certifica** interrupção de requisição já despachada à BFF ou de inferência eventualmente iniciada/paga. Um ACK ausente ou timeout não autoriza retransmitir automaticamente a mesma consulta; isso exige contrato idempotente real, governança de custo e evidência do backend privado. Os novos testes são apenas de transporte injetado, sem rede real.
