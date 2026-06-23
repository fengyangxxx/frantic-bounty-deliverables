# Frantic #47 - public runx registry install smoke matrix

## Summary

This package runs a Docker-isolated smoke matrix with exact command transcripts for two public runx registry packages:

- `fengyangxxx/dependency-advisory-graph@0.1.1`
- `runx/dependency-cve-audit@sha-e11c90bbeb16`

The top-level receipt for the matrix validation is `runx:receipt:sha256:4679e1c90125c1eb4af3024c09a36769201ebdb554f254238a89ad59a1aec90d`.

## Environment

- OS: Linux ea60ed76aea3 6.18.33.1-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC Fri Jun  5 01:12:21 UTC 2026 x86_64 GNU/Linux
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
| `fengyangxxx/dependency-advisory-graph@0.1.1` | registry 0, install 0, inspect 0 | harness 0, run 0 | `runx:receipt:sha256:282a35d6a49c4c3fa6e5256f810e31488917e2ebbe07beb164d8ce912b3dc06a` | verify `true` |
| `runx/dependency-cve-audit@sha-e11c90bbeb16` | registry 0, install 0, inspect 0 | harness 0, run 0 | `runx:receipt:sha256:ddc174164b6f52dc036f389c6c678cdc258ad1f72721e9d462bfd0020cb3c31e` | verify `true` |

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
- fengyangxxx/dependency-advisory-graph@0.1.1 receipt verify stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/90-verify-50-dag-skill-run-282a35d6a49c4c3f.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 registry read stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/11-cve-registry-read.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 install stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/21-cve-add-install.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 inspect stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/31-cve-skill-inspect-installed.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 harness stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/41-cve-harness-installed.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 run stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/51-cve-skill-run.stdout.txt
- runx/dependency-cve-audit@sha-e11c90bbeb16 receipt verify stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/90-verify-51-cve-skill-run-ddc174164b6f52dc.stdout.txt

## Matrix Receipt

- Matrix harness stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/99-matrix-validation-harness.stdout.txt
- Matrix receipt verify stdout: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/docker-command-logs/90-verify-99-matrix-validation-harness-4679e1c90125c1eb.stdout.txt
- Matrix receipt JSON: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-docker/public-receipts/matrix-validation-root-receipt.json
- Matrix verify result: `true`

## Failure Handling

No blocking registry read, install, run, or verify failure was observed in the Docker smoke run. Because the matrix and both package run receipts verify as `valid: true`, there is no new public runx issue required for this pass.

## Review Notes

- The report includes OS, shell, install method, isolated runx home, package refs, exact `runx --version`, receipt ref, and verify results.
- The evidence JSON points to raw command stdout/stderr transcript paths rather than prose-only success claims.
- The generated `artifacts-clean/` Windows diagnostic directory is intentionally ignored and is not part of the final public evidence set.
- No Frantic claim/delivery API was called by this worker.
