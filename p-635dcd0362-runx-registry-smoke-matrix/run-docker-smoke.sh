#!/usr/bin/env bash
set +euo pipefail

BASE="$(pwd)"
ARTIFACTS="$BASE/artifacts-docker"
LOGS="$ARTIFACTS/docker-command-logs"
INSTALL_ROOT="$ARTIFACTS/docker-install-root"
RECEIPT_ROOT="$ARTIFACTS/docker-receipts"

rm -rf "$LOGS" "$INSTALL_ROOT" "$RECEIPT_ROOT" "$ARTIFACTS/docker-runx-home" "$ARTIFACTS/docker-smoke-dag" "$ARTIFACTS/docker-smoke-cve"
mkdir -p "$LOGS" "$INSTALL_ROOT" "$RECEIPT_ROOT" "$ARTIFACTS/docker-runx-home"

export RUNX_HOME="$ARTIFACTS/docker-runx-home"
# Public runx local-development fixture key used only for this smoke validation.
export RUNX_RECEIPT_SIGN_KID="cli-package-test-key"
export RUNX_RECEIPT_SIGN_ED25519_SEED_BASE64="QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkI="
export RUNX_RECEIPT_SIGN_ISSUER_TYPE="hosted"
export RUNX_RECEIPT_VERIFY_KID="$RUNX_RECEIPT_SIGN_KID"
export RUNX_RECEIPT_VERIFY_ED25519_PUBLIC_KEY_BASE64="IVL40Zt5HSRFMkLhXy6rbLfP+ntqXtMAl5YOBpiB2xI="

json_quote() {
  node -e 'process.stdout.write(JSON.stringify(process.argv[1] ?? ""))' "$1"
}

run_capture() {
  local id="$1"
  shift
  local stdout="$LOGS/$id.stdout.txt"
  local stderr="$LOGS/$id.stderr.txt"
  local transcript="$LOGS/$id.transcript.json"
  local started finished code rel_stdout rel_stderr
  started="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  "$@" >"$stdout" 2>"$stderr"
  code=$?
  finished="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  rel_stdout="${stdout#$BASE/}"
  rel_stderr="${stderr#$BASE/}"
  node - "$id" "$started" "$finished" "$code" "$stdout" "$stderr" "$BASE" "$RUNX_HOME" "$RUNX_RECEIPT_SIGN_KID" "$RUNX_RECEIPT_SIGN_ISSUER_TYPE" "$@" >"$transcript" <<'NODE'
const fs = require("fs");
const [
  id,
  started,
  finished,
  code,
  stdoutPath,
  stderrPath,
  cwd,
  runxHome,
  kid,
  issuerType,
  ...command
] = process.argv.slice(2);
const read = (path) => fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
process.stdout.write(JSON.stringify({
  id,
  command: command.join(" "),
  cwd,
  env: {
    RUNX_HOME: runxHome,
    RUNX_RECEIPT_SIGN_KID: kid,
    RUNX_RECEIPT_SIGN_ISSUER_TYPE: issuerType,
    RUNX_RECEIPT_SIGN_ED25519_SEED_BASE64: "present_redacted",
    RUNX_RECEIPT_VERIFY_KID: kid,
    RUNX_RECEIPT_VERIFY_ED25519_PUBLIC_KEY_BASE64: "present_public_fixture_key"
  },
  started_at: started,
  finished_at: finished,
  exit_code: Number(code),
  stdout_path: stdoutPath,
  stderr_path: stderrPath,
  stdout: read(stdoutPath),
  stderr: read(stderrPath)
}, null, 2));
NODE
  printf '{"id":%s,"command":%s,"exit_code":%s,"stdout_path":%s,"stderr_path":%s}\n' \
    "$(json_quote "$id")" \
    "$(json_quote "$*")" \
    "$code" \
    "$(json_quote "$rel_stdout")" \
    "$(json_quote "$rel_stderr")" >>"$ARTIFACTS/docker-command-index.ndjson"
  return 0
}

extract_receipts() {
  local json_file="$1"
  node - "$json_file" <<'NODE'
const fs = require("fs");
const file = process.argv[2];
if (!fs.existsSync(file)) process.exit(0);
let parsed;
try {
  parsed = JSON.parse(fs.readFileSync(file, "utf8"));
} catch {
  process.exit(0);
}
const out = [];
const visit = (value) => {
  if (!value || typeof value !== "object") return;
  if (typeof value.receipt_id === "string") out.push(value.receipt_id);
  if (typeof value.id === "string" && value.schema === "runx.receipt.v1") out.push(value.id);
  if (Array.isArray(value.receipt_ids)) out.push(...value.receipt_ids.filter((item) => typeof item === "string"));
  if (Array.isArray(value)) value.forEach(visit);
};
visit(parsed);
for (const id of [...new Set(out)]) console.log(id);
NODE
}

verify_from_stdout() {
  local source_id="$1"
  local receipt_dir="$2"
  local stdout="$LOGS/$source_id.stdout.txt"
  local receipt_id short
  while IFS= read -r receipt_id; do
    [ -z "$receipt_id" ] && continue
    short="${receipt_id#sha256:}"
    short="${short:0:16}"
    run_capture "90-verify-$source_id-$short" runx verify "$receipt_id" --receipt-dir "$receipt_dir" --allow-local-development-signatures --json
  done < <(extract_receipts "$stdout")
}

rm -f "$ARTIFACTS/docker-command-index.ndjson" "$ARTIFACTS/docker-command-index.json"

run_capture "00-install-runx-cli" npm install -g @runxhq/cli@0.6.13
run_capture "01-runx-version" runx --version
run_capture "02-os-shell" bash -lc 'printf "os=%s\nshell=%s\nnode=%s\nnpm=%s\n" "$(uname -a)" "$SHELL" "$(node --version)" "$(npm --version)"'

DAG_REF="fengyangxxx/dependency-advisory-graph@0.1.1"
DAG_SKILL="$INSTALL_ROOT/dependency-advisory-graph/fengyangxxx/dependency-advisory-graph/0.1.1/SKILL.md"
DAG_MANIFEST='{"packages":[{"name":"fixture-app","version":"1.0.0","path":""},{"name":"minimist","version":"0.0.8","path":"node_modules/minimist"},{"name":"left-pad","version":"1.3.0","path":"node_modules/left-pad"}]}'
DAG_ADVISORIES='{"retrieved_at":"2026-06-23T07:30:00Z","advisories":[{"id":"GHSA-vh95-rmgr-6w4m","package":"minimist","ecosystem":"npm","vulnerable_range":"<0.2.1","severity":"critical","fix_version":"0.2.1","evidence_url":"https://osv.dev/vulnerability/GHSA-vh95-rmgr-6w4m","source":"OSV.dev / GitHub Advisory Database"}]}'

run_capture "10-dag-registry-read" runx registry read "$DAG_REF" --registry https://api.runx.ai --json
run_capture "20-dag-add-install" runx add "$DAG_REF" --registry https://api.runx.ai --to "$INSTALL_ROOT/dependency-advisory-graph" --json
run_capture "30-dag-skill-inspect-installed" runx skill inspect "$DAG_SKILL" --json
run_capture "40-dag-harness-installed" runx harness "$DAG_SKILL" -R "$RECEIPT_ROOT/dag-harness" --json
run_capture "50-dag-skill-run" runx skill "$DAG_SKILL" -i ecosystem=npm -i "manifest=$DAG_MANIFEST" -i "advisory_database=$DAG_ADVISORIES" -i output_dir=artifacts-docker/docker-smoke-dag -R "$RECEIPT_ROOT/dag-skill-run" --json
verify_from_stdout "40-dag-harness-installed" "$RECEIPT_ROOT/dag-harness"
verify_from_stdout "50-dag-skill-run" "$RECEIPT_ROOT/dag-skill-run"

CVE_REF="runx/dependency-cve-audit@sha-e11c90bbeb16"
CVE_SKILL="$INSTALL_ROOT/dependency-cve-audit/runx/dependency-cve-audit/sha-e11c90bbeb16/SKILL.md"

run_capture "11-cve-registry-read" runx registry read "$CVE_REF" --registry https://api.runx.ai --json
run_capture "21-cve-add-install" runx add "$CVE_REF" --registry https://api.runx.ai --to "$INSTALL_ROOT/dependency-cve-audit" --json
run_capture "31-cve-skill-inspect-installed" runx skill inspect "$CVE_SKILL" --json
run_capture "41-cve-harness-installed" runx harness "$CVE_SKILL" -R "$RECEIPT_ROOT/cve-harness" --json
run_capture "51-cve-skill-run" runx skill "$CVE_SKILL" \
  -i "target_name=OWASP NodeGoat" \
  -i target_repo=https://github.com/OWASP/NodeGoat \
  -i target_ref=c5cb68a7084e4ae7dcc60e6a98768720a81841e8 \
  -i package_lock_url=https://raw.githubusercontent.com/OWASP/NodeGoat/c5cb68a7084e4ae7dcc60e6a98768720a81841e8/package-lock.json \
  -i scan_scope=direct \
  -i include_dev=false \
  -i output_dir=artifacts-docker/docker-smoke-cve \
  -R "$RECEIPT_ROOT/cve-skill-run" \
  --json
verify_from_stdout "41-cve-harness-installed" "$RECEIPT_ROOT/cve-harness"
verify_from_stdout "51-cve-skill-run" "$RECEIPT_ROOT/cve-skill-run"

node - "$ARTIFACTS/docker-command-index.ndjson" "$ARTIFACTS/docker-command-index.json" <<'NODE'
const fs = require("fs");
const [input, output] = process.argv.slice(2);
const rows = fs.existsSync(input)
  ? fs.readFileSync(input, "utf8").trim().split(/\n+/).filter(Boolean).map((line) => JSON.parse(line))
  : [];
fs.writeFileSync(output, JSON.stringify(rows, null, 2) + "\n");
NODE

run_capture "99-matrix-validation-harness" runx harness "$BASE/SKILL.md" -R "$RECEIPT_ROOT/matrix-validation" --json
verify_from_stdout "99-matrix-validation-harness" "$RECEIPT_ROOT/matrix-validation"

node - "$ARTIFACTS/docker-command-index.ndjson" "$ARTIFACTS/docker-command-index.json" <<'NODE'
const fs = require("fs");
const [input, output] = process.argv.slice(2);
const rows = fs.existsSync(input)
  ? fs.readFileSync(input, "utf8").trim().split(/\n+/).filter(Boolean).map((line) => JSON.parse(line))
  : [];
fs.writeFileSync(output, JSON.stringify(rows, null, 2) + "\n");
NODE

exit 0
