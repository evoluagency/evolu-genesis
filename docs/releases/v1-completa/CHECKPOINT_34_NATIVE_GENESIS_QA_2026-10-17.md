# Checkpoint 34 — QA nativo da Genesis

**Data:** 17/10/2026 UTC. **PR #26:** aberta, DRAFT. **Código testado:** `e8c4342ac2aed359739b1fd59b67c0e9f0cf47ea`, branch `docs/intelligence-ui-unification-plan-v1`. A publicação desta documentação não modifica o código validado.

## Execução comprovada

Checkout integral em máquina de desenvolvimento existente, Node **22.23.3**, npm **10.9.9**, Debian 12, Chromium **155.0.8059.79**. Instalação reproduzível pelo lockfile, sem scripts de instalação, credenciais de provedor ou backend privado. Início do runner: **2026-10-17T23:35:02Z**. Exit final: **0**.

| Comando/verificação | Resultado |
| --- | --- |
| `bash scripts/v1-codespaces-qa.sh --dry-run` | PASS |
| Preflight do executor | 10/10 PASS |
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS |
| `npm run typecheck` | PASS |
| `npm run build:preview-runtime` | PASS; compilação TypeScript configurada, não build de backend |
| 14 scripts contratuais do runner | 180 testes TAP PASS + script de adapters PASS |
| Total TAP, incluindo preflight | **190/190 PASS**, 0 falhas/skips/cancelamentos |
| `npm audit --json` | exit 0; 0 vulnerabilidades reportadas |
| `npm run homologate:intelligence:browser` | exit 0; **4/4 cenários**, 8 capturas, 0 erros |
| `npm run homologate:browser` | exit 0; **44 PASS, 6 REVIEW, 0 FAIL**, 40 capturas, 0 erros de runtime |

Os scripts efetivamente executados foram: `ux7-adapter-contract-tests.mjs`, `consultation-contract-tests.mjs`, `intelligence-delegation-tests.mjs`, `intelligence-presentation-tests.mjs`, `platform-consultative-bridge-tests.mjs`, `live-platform-consultation-tests.mjs`, `consultative-status-tests.mjs`, `consultative-verification-tests.mjs`, `consultative-attempt-tests.mjs`, `consultative-signed-verification-tests.mjs`, `consultative-replay-tests.mjs`, `consultative-wire-compat-tests.mjs`, `consultative-bundle-tests.mjs` e `consultative-release-acceptance-tests.mjs`. O runner compila uma vez e chama os mesmos arquivos dos aliases npm, evitando compilações repetidas.

Há cobertura executada de sensores tipados, coordenação/cancelamento de respostas antigas, grupo distinto de CNPJ, apresentação canônica de intents, PT-BR/EN, ação humana explícita e separação entre demonstração sintética e ambiente privado. Não há aliases separados chamados `sensores`, `coordenação` ou `i18n` no package.json; a cobertura configurada está nas suítes de delegação/apresentação/consulta e no browser.

## Diagnósticos e correções

O commit `32833402b2c147c37b3311480f9d52555966ce1d` consolida seis correções mínimas desta execução, anteriores ao transporte de idioma em `e8c4342`:

| Arquivo | Causa e correção |
| --- | --- |
| `scripts/v1-codespaces-qa.sh` | Inclui a suíte existente `live-platform-consultation-tests.mjs`, ausente do runner anterior |
| `preview/shared-ux/shell.css` | Abas móveis cortadas; permite quebra de linha no breakpoint móvel |
| `preview/company-financial-workspace/index.html` | O renderer buscava `#demoBoundary`, mas o elemento não possuía esse id; restaura o vínculo exigido |
| `preview/company-financial-workspace/finance-workspace.css` | Abas financeiras móveis cortadas após o renderer voltar a funcionar; permite quebra de linha |
| `scripts/ux-browser-homologation.mjs` | O sumário não refletia exceções de runtime; passa a classificá-las como falha e preserva a descrição original |
| `vercel.json` | Desativa deploy automático somente desta branch de revisão |

Na observação inicial do browser, o workspace financeiro produzia **9 exceções**: `TypeError: Cannot set properties of null (setting 'textContent')`, em `render`, pela ausência de `#demoBoundary`. Também houve corte das abas móveis de escritório, fiscal e financeiro. Nenhum teste foi removido nem a validação foi afrouxada. O resultado atual registra zero exceções e zero casos FAIL.

Os logs iniciais estavam em `/tmp` e não sobreviveram à parada da máquina; não foram reconstruídos como se fossem logs originais. As falhas observadas acima e o diff do commit identificam o diagnóstico. Os logs íntegros e capturas desta entrega foram produzidos novamente sobre o código atual e preservados antes da publicação.

O commit posterior `e8c4342` encaminha o idioma solicitado e acrescenta a regressão correspondente. Foi preservado e validado. Solicitar um idioma **não atesta** o idioma da resposta, a identidade do host ou sua autorização.

## Limites e aceite

O runner geral termina com `AUTOMATED_PASS_REVIEW_REQUIRED`. Os seis casos REVIEW são cinco verificações de zoom: viewport equivalente a 200% não substitui zoom real; e uma revisão de navegação da página de empresa, que não apresenta regiões de scroll. A revisão humana das cinco categorias visuais permanece pendente. Os rótulos T13–T17 desse runner são categorias próprias de browser e **não representam execução das 18 jornadas E2E da matriz de release**.

Esta entrega comprova QA de código e navegação local sintética. Não comprova autenticação privada, sessão/expiração, isolamento JWT/RLS, persistência de decisão profissional, proveniência, atestação de host/idioma, aceitação operacional ou autorização de release. Não houve merge, deploy, migração, ativação de inferência/aprendizagem, consulta paga ou acesso a dados reais.

Os quatro arquivos canônicos de apresentação mantêm paridade com o consumidor revisado, incluindo o bridge de idioma atual, blob `25ccfabd1ab3dc53f9b66bd30c0ff0eb616bd499`. A correção de layout não altera esses quatro arquivos.

Evidências: [logs, relatórios e 48 capturas](./evidence/checkpoint-34-2026-10-17/), com [manifesto SHA-256](./evidence/checkpoint-34-2026-10-17/MANIFEST.sha256). A compilação gera arquivos em `preview/runtime`; esses outputs não foram tratados como alterações manuais de código nem versionados neste checkpoint.
