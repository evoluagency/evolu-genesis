# EVOLU Genesis — solicitação privada de idioma

**17/10/2026 | PR #26 DRAFT.**

A invocação canônica `createPlatformConsultativeInvocation` propaga agora
`locale: 'pt-BR' | 'en'` exclusivamente no payload enviado por ação humana ao
BFF privado Platform. Não aceita `es` ou contexto inventado, não envia
token no corpo e não muda o limite de 2048 bytes.

`LiveConsultationCoordinator` já invalida contexto antigo em troca de
sessão, escopo e idioma. Esta implementação conecta a preferência solicitada,
mas **não equivale a idioma verificado no texto da resposta**. A projeção
permanece `UNAVAILABLE`/fail-closed até que exista atestação confiável do host
e liberação formal G07. A Platform deve manter fonte vendorizada idêntica ao
blob Genesis deste commit e atualizar a paridade.

Testes de invocação e transporte ajustados; adicionar QA Node 22 no Codespaces
ao SHA atual. Sem inferência, flags, deploy, merge ou alteração do backend.
