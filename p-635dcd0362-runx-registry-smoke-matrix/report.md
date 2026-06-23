# Frantic #47 - public runx registry install smoke matrix

## Summary

This package runs a Docker-isolated smoke matrix with exact command transcripts for two public runx registry packages:

- `fengyangxxx/dependency-advisory-graph@0.1.1`
- `runx/dependency-cve-audit@sha-e11c90bbeb16`

The top-level receipt for the matrix validation is `runx:receipt:sha256:82251304640295337fe3b135feb8d08c7fa133fed3c9a1935401433cb5fb01f7`.

Important correction: `runx/dependency-cve-audit@sha-e11c90bbeb16` was installable and inspectable, but its published run path failed with `execution.exit_code=1` / `MODULE_NOT_FOUND`. The failure is recorded in the package run receipt and tracked publicly at https://github.com/runxhq/runx/issues/138.

## Environment

- OS: Linux 66693dea4477 6.18.33.1-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC Fri Jun  5 01:12:21 UTC 2026 x86_64 GNU/Linux
- Shell: `/bin/bash`
- Container: `node:24-bookworm`
- Node/npm: `node=v24.17.0; npm=11.13.0`
- Install method: `npm install -g @runxhq/cli@0.6.13`
- Exact `runx --version` output: `runx-cli 0.6.13`
- Registry: `https://api.runx.ai`
- Fresh runx home/isolation: `artifacts-docker/docker-runx-home` inside a fresh Docker container
- Receipt signing/verify mode: runx local-development fixture key inside the container; verify commands used `--allow-local-development-signatures --json`

## Matrix

| Package | Registry/install/inspect exits | Harness/run exits | Run receipt | Verify |
| --- | --- | --- | --- | --- |
| `fengyangxxx/dependency-advisory-graph@0.1.1` | registry 0, install 0, inspect 0 | harness 0, run wrapper 0, execution 0 | `runx:receipt:sha256:8decbb55fd16ede3e94b0f4969585a41739f216fc79e94a5935938953101f0ad` | verify `true` |
| `runx/dependency-cve-audit@sha-e11c90bbeb16` | registry 0, install 0, inspect 0 | harness 0, run wrapper 0, execution 1 failed (process_failed) | `runx:receipt:sha256:2e71ac12c544e9190a5ff45f43eb8d78b42b927da1f08fba86d4558c358f14ea` | verify `true` |

## Command Evidence

- runx CLI install stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/00-install-runx-cli.stdout.txt
- runx version stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/01-runx-version.stdout.txt
- environment stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/02-os-shell.stdout.txt
- Docker command index: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-index.json
- fengyangxxx/dependency-advisory-graph@0.1.1 registry read stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/10-dag-registry-read.stdout.txt
- fengyangxxx/dependency-advisory-graph@0.1.1 install stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/20-dag-add-install.stdout.txt
- fengyangxxx/dependency-advisory-graph@0.1.1 inspect stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/30-dag-skill-inspect-installed.stdout.txt
- fengyangxxx/dependency-advisory-graph@0.1.1 harness stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/40-dag-harness-installed.stdout.txt
- fengyangxxx/dependency-advisory-graph@0.1.1 run stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/50-dag-skill-run.stdout.txt
- fengyangxxx/dependency-advisory-graph@0.1.1 receipt verify stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/90-verify-50-dag-skill-run-8decbb55fd16ede3.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 registry read stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/11-cve-registry-read.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 install stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/21-cve-add-install.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 inspect stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/31-cve-skill-inspect-installed.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 harness stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/41-cve-harness-installed.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 run stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/51-cve-skill-run.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 receipt verify stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/90-verify-51-cve-skill-run-2e71ac12c544e919.stdout.txt

## Matrix Receipt

- Matrix harness stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/99-matrix-validation-harness.stdout.txt
- Matrix receipt verify stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/90-verify-99-matrix-validation-harness-8225130464029533.stdout.txt
- Matrix receipt JSON: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/public-receipts/matrix-validation-root-receipt.json
- Matrix verify result: `true`

## Failure Handling

Registry read, install, and inspect succeeded for both public packages. The `fengyangxxx/dependency-advisory-graph@0.1.1` run path succeeded. The `runx/dependency-cve-audit@sha-e11c90bbeb16` run path failed inside the sealed receipt with `execution.exit_code=1`, `seal.disposition=failed`, and `MODULE_NOT_FOUND` for the expected `run.mjs` entrypoint. This is tracked as a public runx issue: https://github.com/runxhq/runx/issues/138.

The `runx verify ... --allow-local-development-signatures --json` commands prove the captured local-development fixture receipts are structurally valid. Even if the raw CLI verifier field prints `signature_mode: production`, this package reports it as `local-development-fixture-allowed` because the command explicitly used the local-development allowance and fixture key. Receipt verification does not convert the failed CVE execution into a successful run.

## Review Notes

- The report includes OS, shell, install method, isolated runx home, package refs, exact `runx --version`, receipt ref, and verify results.
- The evidence JSON points to raw command stdout/stderr transcript paths rather than prose-only success claims.
- The generated `artifacts-clean/` Windows diagnostic directory is intentionally ignored and is not part of the final public evidence set.
- This revision corrects the prior false-positive matrix by classifying nested skill execution from the receipt payload, not from the outer wrapper command exit code.
