#!/usr/bin/env bash
# EVOLU Genesis V1 — manual, isolated Codespaces source QA.
# Never deploys, calls paid inference, mutates Supabase or runs GitHub Actions.
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [[ "${1:-}" != "--dry-run" && "${1:-}" != "--run" ]]; then
  echo "Usage: bash scripts/v1-codespaces-qa.sh [--dry-run|--run]" >&2
  exit 2
fi
if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
  echo "Manual QA only; no GitHub Actions." >&2
  exit 2
fi
if ! command -v node >/dev/null 2>&1 ||
   ! command -v npm >/dev/null 2>&1 ||
   ! command -v git >/dev/null 2>&1; then
  echo "Node.js, npm and Git are required for SHA-linked QA." >&2
  exit 2
fi
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != "22" ]]; then
  echo "Node.js 22 required." >&2
  exit 2
fi
if [[ ! -f package-lock.json ]]; then
  echo "Missing committed package-lock.json; refusing nondeterministic npm install." >&2
  exit 2
fi
if [[ -n "${OPENAI_API_KEY:-}" || -n "${AI_GATEWAY_API_KEY:-}" ||
      -n "${GROQ_API_KEY:-}" || -n "${SUPABASE_SERVICE_ROLE_KEY:-}" || -n "${VERCEL_OIDC_TOKEN:-}" ]]; then
  echo "Sensitive provider secrets detected. Use a credential-free source QA terminal." >&2
  exit 2
fi
expected="docs/intelligence-ui-unification-plan-v1"
actual="$(git branch --show-current)"
if [[ "$actual" != "$expected" ]]; then
  echo "Wrong branch: expected $expected; got $actual" >&2
  exit 2
fi
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Tracked source changes present. Preserve a clean commit SHA before QA." >&2
  exit 2
fi


echo "EVOLU Genesis QA — $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Repository: evoluagency/evolu-genesis"
echo "Branch: $actual"
echo "HEAD: $(git rev-parse HEAD)"
echo "Node: $(node -v); npm: $(npm -v)"
echo "Command plan: npm ci --ignore-scripts --no-audit --no-fund"
echo "              npm run typecheck"
echo "              npm run build:preview-runtime"
echo "              13 isolated source-only scripts in scripts/*.mjs"
if [[ "${1}" == "--dry-run" ]]; then
  echo "DRY RUN ONLY — no installation, compile, tests or network."
  exit 0
fi

# Isolated native Node tests of this shell's own branch/secret/dirty protections.
node --test scripts/v1-codespaces-qa-preflight.test.mjs
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
# Build just once instead of 12 repeat tsc invocations from npm test aliases.
npm run build:preview-runtime

scripts=(
  ux7-adapter-contract-tests.mjs
  consultation-contract-tests.mjs
  intelligence-delegation-tests.mjs
  intelligence-presentation-tests.mjs
  platform-consultative-bridge-tests.mjs
  consultative-status-tests.mjs
  consultative-verification-tests.mjs
  consultative-attempt-tests.mjs
  consultative-signed-verification-tests.mjs
  consultative-replay-tests.mjs
  consultative-wire-compat-tests.mjs
  consultative-bundle-tests.mjs
  consultative-release-acceptance-tests.mjs
)
for name in "${scripts[@]}"; do
  echo "Running synthetic contract test: scripts/$name"
  node "scripts/$name"
done
echo "Genesis source QA passed at $(git rev-parse HEAD)"
echo "Inspect local generated-file changes before committing anything:"
git status --short
