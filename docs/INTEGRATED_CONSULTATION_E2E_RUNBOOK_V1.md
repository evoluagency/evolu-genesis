# EVOLU — Protocolo de homologação E2E da consulta integrada V1

**Status:** PLANO DE EXECUÇÃO; NÃO EXECUTADO. `PRE_LEARNING`; primeiro release consultivo Genesis + Intelligence.  
**Gate:** `INTEGRATED_CONSULTATION_JWT_RLS_E2E` no manifesto `CONSULTATIVE_RELEASE_ACCEPTANCE_V1.json`.  
**Não autoriza:** requisição real, conexão de credenciais, gasto de IA, merge, deploy, escrita, treino ou aprovação de release.

## Evidência anterior que deve ser preservada

O arquivo versionado `evolu2/intelligence/config/platform-read-runtime.multiplus-validation.v1.json` registra, em **22/09/2026**, `PLATFORM_READ_GATE_B = CLOSED` e sessão de usuário real `PASSED`, com execução pelo servidor EVOLU (`EVOLU_APPLICATION_SERVER`), `SUPABASE_AUTH_GET_USER` e autorização `USER_JWT_RLS`. O closure path não foi a Edge Function isolada. Esse é um *registro de validação histórica*, não uma reexecução nem autorização da consulta Genesis atual. A documentação de 21/09 que cita `E2E_PENDING` antecede o fechamento registrado.

## Fluxo que deve ser homologado após liberação

`Genesis AuthenticatedPageSnapshot → POST same-origin /api/ux/intelligence/consult/v1 → BFF Platform autenticada → auth.getUser() → user JWT/RLS + grupo/CNPJ → Intelligence consultativo com fonte governada → evidência/idioma/verificação → apresentação segura Genesis`.

O identificador legado `company_selection.company_id` da Intelligence significa **CNPJ ID**, não Group ID da Genesis. O backend privado deve conferir a associação CNPJ→Grupo por fonte Platform confiável, além de Tenant, competência, entitlement, usuário e versão da sessão. JWT e dados pessoais nunca podem aparecer na UX pública ou nos relatórios de teste.

## Matriz negativa obrigatória (não executada)

| ID | Condição | Resultado exigido |
|---|---|---|
| AUTH-01 | Ausência, expiração ou troca do JWT | 401/indisponível, sem resposta substantiva, sem consulta downstream |
| AUTH-02 | `auth.getUser()` diverge do principal usado pela RPC/RLS | Falha fechada antes da leitura ou inferência |
| RLS-01 | Usuário tenta Tenant de outra organização | 403, nenhum dado nem diferença de erro que revele CNPJ |
| RLS-02 | Mesmo Tenant, Grupo não correspondente ao CNPJ | 403; jamais converter `company_id` legado em Group ID |
| RLS-03 | Mesmo Tenant, CNPJ fora da carteira/permissões do usuário | 403; nenhuma evidência de existência ou dados privados |
| RLS-04 | Tenant legítimo sem entitlement da função | 403, sem processamento de modelo |
| CTX-01 | Mudança de Tenant, Grupo, CNPJ, competência, locale ou `sessionEpoch` antes do envio | Sem despacho ao BFF |
| CTX-02 | Mesma mudança após o envio, com resposta atrasada | Descarta integralmente a resposta; nenhum dado de sessão anterior na UX |
| COST-01 | Orçamento ou inferência não permitidos | Sem inferência paga, `UNAVAILABLE`, sem tentativa automática |
| SRC-01 | Snapshot de recuperação ausente/divergente | Nenhuma resposta do modelo; erro opaco |
| LANG-01 | Locale declarado sem verificação independente do conteúdo PT/EN | `UNAVAILABLE`, sem apresentação de parecer |
| REPLAY-01 | Assinatura inválida, vencida ou duplicada | Sem resposta autorizada; armazenamento não recebe claim inválido |
| REPLAY-02 | Timeout com ACK ausente ou commit ambíguo | Sem retry automático nem segundo custo |
| MUT-01 | Toda a jornada de consulta | Nenhuma escrita operacional, Learning Event, treinamento ou promoção automática |

## Caso positivo delimitado (não executado)

Com um usuário explicitamente autorizado em ambiente **exclusivo de homologação**, confirmar `auth.getUser()` e a mesma identidade para RLS/RPC, mapear corretamente Tenant/Grupo/CNPJ/competência e provar que o request chega ao consultor de maneira autorizada. Ainda assim, só liberar a **exibição** de resposta substantiva se houver prova independente de fonte, idioma, assinatura e replay; caso contrário, o resultado correto é `UNAVAILABLE`, não “sucesso” aparente.

Não é necessário fabricar um regime fiscal conhecido: `tax_fact_status=UNKNOWN` com razão rastreada é um caso de sucesso da leitura autorizada. Isso não autoriza aconselhamento tributário sem evidência.

## Evidência mínima para registrar após execução autorizada

Armazenar em local **privado e controlado**, sem anexar tokens, dados empresariais ou logs sensíveis ao GitHub público:

- Identificação do ambiente de homologação e **hashes** das versões exatas de Platform, Genesis e Intelligence; identidade do aprovador e horário UTC.
- Matriz de casos `AUTH/RLS/CTX/COST/SRC/LANG/REPLAY/MUT` com resultado observado e aceito/reprovado; ausência de casos não equivale a sucesso.
- Confirmação do papel do mesmo `auth.getUser()` / usuário JWT / RLS em todas as leituras; negações 401/403 e não divulgação de informação entre tenants.
- Prova de ausência de escrita, treinamento, execução delegada, inferência involuntária e vazamento de sessão; evidência de custo sob controle.
- Revisão humana independente da proveniência, idioma e fidelidade fiscal/jurídica; planos de monitoramento, recuperação e rollback.

O manifesto atual permanece `decision=BLOCKED` e `integratedConsultationVerified=false`. Um relatório E2E futuro deverá ser avaliado por gate independente e autoridade de release; editar o manifesto estático não autoriza produto.

**Restrição de mudança:** nenhuma modificação de Platform ou seu CI até **01/11/2026**. Nenhuma execução descrita aqui foi realizada nesta rodada.


## Bloqueio de exibição no bridge Genesis V1 (revisão 2026-10-14)

O bridge `projectPrivatePlatformConsultation` tem agora saída **somente `UNAVAILABLE`**, inclusive quando a BFF alegar `schemaVersion=1.1.0`, `answerLocale` e `localeVerified=true`. Um JSON simples, mesmo de origem same-origin, **não é** atestado de autoridade emissora Ed25519, replay de uso único distribuído, proveniência verificável ou comprovação independente de idioma. Indicadores autoafirmados como `issuerAuthorizationVerified`, `verificationBundle.display.canShowModelAnswer` e `productionReplayStoreCertified` nunca autorizam exibição. Nenhum bloco `TEXT` ou resposta do modelo pode ser produzido pelo bridge V1.

A futura liberação de resposta consultiva exige um **novo contrato do host privado** que certifique todas as provas conjuntamente, restrito à mesma tentativa e identidade, com gates E2E revisados e autoridade explícita de release. Não basta reativar o antigo caminho `PRESENTABLE` ou alterar uma flag. Até lá, o resultado correto na Genesis é aviso localizado, sem inferência adicional ou retry automático. A Intelligence continua devolvendo `display.canShowModelAnswer=false` em seus bundles offline e não fornece certificação operacional.
