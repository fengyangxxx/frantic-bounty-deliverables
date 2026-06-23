# Dependency Advisory Graph Delivery

Frantic posting: `p-d239b77dd1`

Claim: `frantic:claim:89f66400-885f-4322-979f-797a3249d317`

Deadline: `2026-06-23T03:17:43.295Z`

## Delivered Package

- Package: `dependency-advisory-graph`
- Registry ref: `fengyangxxx/dependency-advisory-graph@0.1.1`
- Public listing: <https://runx.ai/x/fengyangxxx/dependency-advisory-graph@0.1.1>
- Pull request: <https://github.com/runxhq/runx/pull/120>
- Source commit: `83c5c574fe635a6c23473f6649f2948dcfa3080d`
- Raw `X.yaml`: <https://raw.githubusercontent.com/fengyangxxx/runx/83c5c574fe635a6c23473f6649f2948dcfa3080d/skills/dependency-advisory-graph/X.yaml>
- Raw `SKILL.md`: <https://raw.githubusercontent.com/fengyangxxx/runx/83c5c574fe635a6c23473f6649f2948dcfa3080d/skills/dependency-advisory-graph/SKILL.md>

## What The Skill Does

The skill builds an exact-version dependency advisory graph from a dependency
manifest and advisory facts. It emits typed fields for the primary advisory
packet, graph nodes and edges, clean package records, false-positive guards,
validation metadata, optional `evidence.json`, optional `verification.json`, and
an optional Markdown report.

The dogfood run demonstrates `minimist@0.0.8` matching
`GHSA-vh95-rmgr-6w4m` from OSV/GitHub Advisory Database evidence. It also
includes two package-name-only guard cases so the result proves the skill does
not emit findings solely because a package name appears in an advisory record.

## Verification Summary

- Published to the hosted runx registry as `fengyangxxx/dependency-advisory-graph@0.1.1`.
- Clean install from `https://api.runx.ai` succeeded.
- Standalone fixtures passed for advisory hit, clean manifest, and invalid manifest stop/error.
- Harness against the clean installed registry package passed all three cases.
- Registry dogfood produced a sealed receipt.
- `runx verify` accepted the dogfood receipt.
- Targeted official catalog tests passed after moving concrete scenarios into standalone fixtures.

## Receipt

`runx:receipt:sha256:a1b3feddc1dadeb88cf239e8ce1f31035ecc6aa0fa2526e883faac5c92f54a61`

## Safety Notes

The skill is read-only. It does not install target packages, execute target
project code, mutate repositories, or submit advisories. It treats zero-finding
results as "no supplied advisory matched both package name and exact installed
version," not as proof of vulnerability absence.
