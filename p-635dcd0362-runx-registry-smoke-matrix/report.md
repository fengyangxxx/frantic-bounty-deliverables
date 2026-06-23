# Frantic #47 - runx registry install smoke matrix

## Summary

This delivery runs a public runx registry smoke matrix with `runx-cli 0.6.13` against two public packages:

- `runx/dependency-cve-audit@sha-e11c90bbeb16`
- `ryde-play/dep-upgrade-plan@sha-7a1f34b0`

The package includes captured command outputs for registry reads, clean installs, skill inspection, run-path diagnostics, a Docker-governed validation harness, the emitted runx receipt, and a receipt verification transcript.

## Environment

- OS: win32
- Shell: PowerShell
- Node: v24.14.0
- runx version: `runx-cli 0.6.13`
- Registry: https://api.runx.ai
- Fresh runx home/isolation: `artifacts-clean/runx-home`
- Install method: `runx add <ref> --registry https://api.runx.ai --to <isolated package dir> --json`

## Matrix Results

- runx/dependency-cve-audit@sha-e11c90bbeb16: registry digest sha256:427c964bccd3f5f41c71a90905dd74225547e8b7af11015978e4550db3c27249; install status passed; inspect version 0.1.1; transcript set includes registry read, install, and inspect output.
- ryde-play/dep-upgrade-plan@sha-7a1f34b0: registry digest sha256:953984dff9360fdce690b32d14d841e4e296462cdc6e8e16d4995deb6abbe6db; install status passed; inspect version 0.1.0; transcript set includes registry read, install, and inspect output.

## Command Evidence

- Version: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-clean/command-logs/runx-version.stdout.txt
- Command summary: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-clean/command-summary.json
- Validation packet: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-clean/validation-packet.json
- Docker harness output: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-clean/docker-validation-harness.stdout.json
- Receipt JSON: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/receipts/sha256_727b1310aae6da8a1db1996040f09f980260f159f4c85c954a31774fe40535e3.json
- Receipt verification output: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-635dcd0362-runx-registry-smoke-matrix/artifacts-clean/receipt-verify-727b1310.json

## Run and Verify Diagnostics

- `runx skill runx/dependency-cve-audit@sha-e11c90bbeb16 --registry https://api.runx.ai -i "target_name=OWASP NodeGoat" -i target_repo=https://github.com/OWASP/NodeGoat -i target_ref=c5cb68a7084e4ae7dcc60e6a98768720a81841e8 -i package_lock_url=https://raw.githubusercontent.com/OWASP/NodeGoat/c5cb68a7084e4ae7dcc60e6a98768720a81841e8/package-lock.json -i scan_scope=direct -i include_dev=false -j` exited 1 and captured the receipt-signing environment requirement instead of silently asserting success.
- `runx skill runx/dependency-cve-audit@sha-e11c90bbeb16 --registry https://api.runx.ai -i target_name=OWASP_NodeGoat -i target_repo=https://github.com/OWASP/NodeGoat -i target_ref=c5cb68a7084e4ae7dcc60e6a98768720a81841e8 -i package_lock_url=https://raw.githubusercontent.com/OWASP/NodeGoat/c5cb68a7084e4ae7dcc60e6a98768720a81841e8/package-lock.json -i scan_scope=direct -i include_dev=false -R F:\work\ai_work\get_money\frantic-deliverables-public\p-635dcd0362-runx-registry-smoke-matrix\artifacts-clean\receipts\runx_dependency-cve-audit_sha-e11c90bbeb16_dogfood_fixed -j` exited 1 after receipt flags and sanitized input quoting; the captured output records the Windows `/usr/bin/env` spawn failure.
- Docker harness for this validation skill passed with receipt id `sha256:727b1310aae6da8a1db1996040f09f980260f159f4c85c954a31774fe40535e3`.
- `runx verify` recorded valid digest and valid content address for `runx:receipt:sha256:727b1310aae6da8a1db1996040f09f980260f159f4c85c954a31774fe40535e3`, but local-development signature verification returned `signature_malformed`.
- Public issue for verify behavior: https://github.com/runxhq/runx/issues/134
- Public issue for Windows registry skill runner behavior: https://github.com/runxhq/runx/issues/135

## Review Checklist

- At least two public registry packages are covered.
- Registry read, add/install, and inspect output is captured for each package.
- Exact `runx --version` output is present in evidence.
- The report records OS, shell, install method, isolated runx home, package refs, receipt ref, verify result, and exact failures.
- Blocking verify/runtime failures have public follow-up issues.
- No private token or credential file is included in the public artifact tree.
