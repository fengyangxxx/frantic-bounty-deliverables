# Dependency Advisory Graph Revision Delivery

Frantic posting: `p-d239b77dd1`

Claim: `frantic:claim:89f66400-885f-4322-979f-797a3249d317`

## Delivered Package

- Package: `dependency-advisory-graph`
- Registry ref: `fengyangxxx/dependency-advisory-graph@sha-63b664648ad6`
- Public listing: <https://runx.ai/x/fengyangxxx/dependency-advisory-graph@sha-63b664648ad6>
- Pull request: <https://github.com/runxhq/runx/pull/120>
- Source commit: `e2e43eec3a95621a27b4b015dd81081b20f19baa`
- Source URL: <https://github.com/fengyangxxx/runx/tree/e2e43eec3a95621a27b4b015dd81081b20f19baa/skills/dependency-advisory-graph>
- Raw `X.yaml`: <https://raw.githubusercontent.com/fengyangxxx/runx/e2e43eec3a95621a27b4b015dd81081b20f19baa/skills/dependency-advisory-graph/X.yaml>
- Raw `SKILL.md`: <https://raw.githubusercontent.com/fengyangxxx/runx/e2e43eec3a95621a27b4b015dd81081b20f19baa/skills/dependency-advisory-graph/SKILL.md>
- Receipt: `runx:receipt:sha256:862f84e9797b9bd9e898f31c8a203620ca21c4f6aee889f53f5efd0ea77ca049`

## Revision Fix

The previous package was rejected because it did not scan a real project and relied on supplied advisory data. This revision changes that behavior: the skill parses a real npm `package-lock.json`, queries OSV `querybatch` at run time for exact package/version pairs, suppresses package-name-only matches, and emits the direct dependency to bump plus a human-readable fix path.

## Real Project Dogfood

- Target project: `eclipse-theia/security-audit`
- Project URL: <https://github.com/eclipse-theia/security-audit>
- Lockfile URL: <https://raw.githubusercontent.com/eclipse-theia/security-audit/master/package-lock.json>
- Advisory source: `https://api.osv.dev/v1/querybatch`
- Advisory source mode: `live_osv_querybatch`
- Findings: `13` exact-version matches
- Direct dependency fix paths: `13`
- Receipt status: `sealed`

Example findings:

- `brace-expansion@1.1.11` -> `GHSA-f886-m6hf-6m8v`; bump direct dependency `tslint`; evidence <https://osv.dev/vulnerability/GHSA-f886-m6hf-6m8v>
- `brace-expansion@1.1.11` -> `GHSA-v6h2-p8h4-qcjw`; bump direct dependency `tslint`; evidence <https://osv.dev/vulnerability/GHSA-v6h2-p8h4-qcjw>
- `diff@4.0.1` -> `GHSA-73rr-hh4g-fpgx`; bump direct dependency `tslint`; evidence <https://osv.dev/vulnerability/GHSA-73rr-hh4g-fpgx>
- `js-yaml@3.13.1` -> `GHSA-h67p-54hq-rp68`; bump direct dependency `tslint`; evidence <https://osv.dev/vulnerability/GHSA-h67p-54hq-rp68>
- `js-yaml@3.13.1` -> `GHSA-mh29-5h37-fv8m`; bump direct dependency `tslint`; evidence <https://osv.dev/vulnerability/GHSA-mh29-5h37-fv8m>
- `minimatch@3.0.4` -> `GHSA-23c5-xmqv-rm74`; bump direct dependency `tslint`; evidence <https://osv.dev/vulnerability/GHSA-23c5-xmqv-rm74>

## Verification Summary

- `runx-cli 0.6.13` was used.
- Registry publish succeeded for `fengyangxxx/dependency-advisory-graph@sha-63b664648ad6`.
- Registry read confirmed digest `e7ed8d35f6526dd6474dfb9c88f94dc4f9a06f34cf244b78211da45a852f81b8`.
- Clean `runx add` install succeeded.
- Source inline harness passed `2` cases: sealed-advisory-minimist-008, invalid-manifest-fails.
- Installed registry package harness passed `2` cases.
- Registry dogfood scanned a public real lockfile and queried live OSV.
- `runx verify` accepted the dogfood receipt with `valid=true` and `signature_mode=production`.
- Raw `X.yaml` and `SKILL.md` are pinned to the PR head commit and fetched with HTTP 200.

## Public Artifacts

- `publish-output.json`: HTTP 200, `sha256:8aa4cca2083248d6e59cbcaf8a2d0b9fe48054e6fa70911d35b719d38b5253f6`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/d7da7f916e177aba08481228d0e251857a9f9284/p-d239b77dd1-dependency-advisory-graph/publish-output.json>
- `registry-read-output.json`: HTTP 200, `sha256:e5a5ce6453ef9961dc09bd43898c036a2e27ed409792851438e32610541a4b01`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/d7da7f916e177aba08481228d0e251857a9f9284/p-d239b77dd1-dependency-advisory-graph/registry-read-output.json>
- `install-output.json`: HTTP 200, `sha256:8482e8505db91219a4e27014f4b4ba6a910ad90a3cb1a00ec037b8ee2b505023`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/d7da7f916e177aba08481228d0e251857a9f9284/p-d239b77dd1-dependency-advisory-graph/install-output.json>
- `harness-output.json`: HTTP 200, `sha256:0cb1d70620196a24aa8bda053b6291c283b799c894380909c5a7dadffb74cea6`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/d7da7f916e177aba08481228d0e251857a9f9284/p-d239b77dd1-dependency-advisory-graph/harness-output.json>
- `hosted-harness-output.json`: HTTP 200, `sha256:0b967512871aae03fb2ded8ae65af61e637b8df5b6f53d3092914f1658303876`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/d7da7f916e177aba08481228d0e251857a9f9284/p-d239b77dd1-dependency-advisory-graph/hosted-harness-output.json>
- `dogfood-output.json`: HTTP 200, `sha256:dfbccf29af6a23b0d272bf3c0135f784c2dab0d02c82e5cc832360347b02d723`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/d7da7f916e177aba08481228d0e251857a9f9284/p-d239b77dd1-dependency-advisory-graph/dogfood-output.json>
- `receipt-verify-output.json`: HTTP 200, `sha256:09fbe3c267143d60f30b69e964883f05ad63e88073654a23fe14587313577ee2`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/d7da7f916e177aba08481228d0e251857a9f9284/p-d239b77dd1-dependency-advisory-graph/receipt-verify-output.json>

## Graph Receipt Scope

`graph_receipt` is not applicable here. This package is a standalone `cli-tool` skill and does not compose other runx skills, so there is no separate composed graph receipt to cite. The dogfood skill run receipt is `runx:receipt:sha256:862f84e9797b9bd9e898f31c8a203620ca21c4f6aee889f53f5efd0ea77ca049`.

## Safety Notes

The skill is read-only. It reads/fetches dependency lockfiles and OSV advisory data, writes local evidence artifacts when requested, and does not install target packages, execute target application code, mutate repositories, or submit vulnerability reports.
