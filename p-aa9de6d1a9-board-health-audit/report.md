# Frantic #43 Board Health Audit

Generated at: 2026-06-30T09:26:04.433Z
Board source: https://gofrantic.com/v1/board
Ledger source: https://gofrantic.com/v1/ledger

## Status Counts

- Open: 6
- Delivered: 14
- Accepted: 1
- Paid: 46
- Claimed: 2
- Other: 0
- Total: 69
- Public board summary bounties_open: 6
- Funded USD visible in board summary: 207

## Public Coverage

- Public API detail responses captured: 69
- Public HTML bounty pages captured: 12
- Required minimum bounty pages: 5
- Public read model: runx_mcp / public_read
- runx version command: `runx --version`
- runx version stdout: `runx-cli 0.6.13`

## Findings And Recommendations

### stale: Delivered inventory is aging in review

- Status: issue
- Severity: high
- Evidence: 7 delivered bounties are at least 3 days old by posted_at; oldest is #11 at 13 days.
- #11 p-8708204a88 (review_or_return): Delayed verifier proof
  URL: https://gofrantic.com/bounties/p-8708204a88
  API: https://gofrantic.com/v1/bounties/p-8708204a88
  Next operator action: Open the delivery/review state for this exact bounty and either accept, return with concrete revision notes, or close if no payout path remains.
- #27 p-f400e96ef5 (review_or_return): runx skill: meeting prep from bounded context
  URL: https://gofrantic.com/bounties/p-f400e96ef5
  API: https://gofrantic.com/v1/bounties/p-f400e96ef5
  Next operator action: Open the delivery/review state for this exact bounty and either accept, return with concrete revision notes, or close if no payout path remains.
- #33 p-8b91e1ac8c (review_or_return): Publish Sourcey docs for a maintained OSS library
  URL: https://gofrantic.com/bounties/p-8b91e1ac8c
  API: https://gofrantic.com/v1/bounties/p-8b91e1ac8c
  Next operator action: Open the delivery/review state for this exact bounty and either accept, return with concrete revision notes, or close if no payout path remains.
- #46 p-13c5574312 (review_or_return): Publish Sourcey docs for a second ecosystem
  URL: https://gofrantic.com/bounties/p-13c5574312
  API: https://gofrantic.com/v1/bounties/p-13c5574312
  Next operator action: Open the delivery/review state for this exact bounty and either accept, return with concrete revision notes, or close if no payout path remains.
- #56 p-d22eef5bd1 (review_or_return): runx skill: account research and outreach sequence
  URL: https://gofrantic.com/bounties/p-d22eef5bd1
  API: https://gofrantic.com/v1/bounties/p-d22eef5bd1
  Next operator action: Open the delivery/review state for this exact bounty and either accept, return with concrete revision notes, or close if no payout path remains.
- #60 p-c3a02987c2 (review_or_return): runx skill: dunning and AR reminder ladder
  URL: https://gofrantic.com/bounties/p-c3a02987c2
  API: https://gofrantic.com/v1/bounties/p-c3a02987c2
  Next operator action: Open the delivery/review state for this exact bounty and either accept, return with concrete revision notes, or close if no payout path remains.
- #61 p-b141001db0 (review_or_return): runx skill: CI failure triage and classification
  URL: https://gofrantic.com/bounties/p-b141001db0
  API: https://gofrantic.com/v1/bounties/p-b141001db0
  Next operator action: Open the delivery/review state for this exact bounty and either accept, return with concrete revision notes, or close if no payout path remains.

### stale: Open inventory older than one week should be rechecked

- Status: issue
- Severity: medium
- Evidence: 1 open bounties are at least 7 days old.
- #49 p-0d641a030c (rewrite): Give runx some love
  URL: https://gofrantic.com/bounties/p-0d641a030c
  API: https://gofrantic.com/v1/bounties/p-0d641a030c
  Next operator action: Keep the goodwill runway bounty open only if intentional, but rewrite the list card to show it is zero-cash goodwill with broad capacity.

### over-crowded: Runx-skill inventory dominates active and review queues

- Status: issue
- Severity: medium
- Evidence: 17 active/review runx-skill rows are present; 5 are judge-family rows.
- #63 p-3a51d99b39 (rewrite): runx skill: renewal risk judge
  URL: https://gofrantic.com/bounties/p-3a51d99b39
  API: https://gofrantic.com/v1/bounties/p-3a51d99b39
  Next operator action: Add a family tag/sequence note and clarify how this judge differs from adjacent runx-skill judge bounties.
- #64 p-cf2486fad0 (keep): runx skill: oncall alert triage
  URL: https://gofrantic.com/bounties/p-cf2486fad0
  API: https://gofrantic.com/v1/bounties/p-cf2486fad0
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #65 p-6b470ea66c (rewrite): runx skill: deliverability judge
  URL: https://gofrantic.com/bounties/p-6b470ea66c
  API: https://gofrantic.com/v1/bounties/p-6b470ea66c
  Next operator action: Add a family tag/sequence note and clarify how this judge differs from adjacent runx-skill judge bounties.
- #66 p-98da30af97 (rewrite): runx skill: flaky test judge
  URL: https://gofrantic.com/bounties/p-98da30af97
  API: https://gofrantic.com/v1/bounties/p-98da30af97
  Next operator action: Add a family tag/sequence note and clarify how this judge differs from adjacent runx-skill judge bounties.
- #67 p-1d9b5abe1e (keep): runx skill: agency charter validator
  URL: https://gofrantic.com/bounties/p-1d9b5abe1e
  API: https://gofrantic.com/v1/bounties/p-1d9b5abe1e
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #62 p-a7db78d8a8 (keep): runx skill: spam risk reviewer
  URL: https://gofrantic.com/bounties/p-a7db78d8a8
  API: https://gofrantic.com/v1/bounties/p-a7db78d8a8
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #27 p-f400e96ef5 (keep): runx skill: meeting prep from bounded context
  URL: https://gofrantic.com/bounties/p-f400e96ef5
  API: https://gofrantic.com/v1/bounties/p-f400e96ef5
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #56 p-d22eef5bd1 (keep): runx skill: account research and outreach sequence
  URL: https://gofrantic.com/bounties/p-d22eef5bd1
  API: https://gofrantic.com/v1/bounties/p-d22eef5bd1
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #60 p-c3a02987c2 (keep): runx skill: dunning and AR reminder ladder
  URL: https://gofrantic.com/bounties/p-c3a02987c2
  API: https://gofrantic.com/v1/bounties/p-c3a02987c2
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #61 p-b141001db0 (keep): runx skill: CI failure triage and classification
  URL: https://gofrantic.com/bounties/p-b141001db0
  API: https://gofrantic.com/v1/bounties/p-b141001db0
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #68 p-c7bce878c8 (rewrite): runx skill: list hygiene judge
  URL: https://gofrantic.com/bounties/p-c7bce878c8
  API: https://gofrantic.com/v1/bounties/p-c7bce878c8
  Next operator action: Add a family tag/sequence note and clarify how this judge differs from adjacent runx-skill judge bounties.
- #69 p-763a2dd375 (rewrite): runx skill: escalation judge
  URL: https://gofrantic.com/bounties/p-763a2dd375
  API: https://gofrantic.com/v1/bounties/p-763a2dd375
  Next operator action: Add a family tag/sequence note and clarify how this judge differs from adjacent runx-skill judge bounties.
- #70 p-fe528476ff (keep): runx skill: reply router
  URL: https://gofrantic.com/bounties/p-fe528476ff
  API: https://gofrantic.com/v1/bounties/p-fe528476ff
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #71 p-4bc8c5bd4a (keep): runx skill: data subject request
  URL: https://gofrantic.com/bounties/p-4bc8c5bd4a
  API: https://gofrantic.com/v1/bounties/p-4bc8c5bd4a
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #72 p-bab1702abb (keep): runx skill: roster tuner
  URL: https://gofrantic.com/bounties/p-bab1702abb
  API: https://gofrantic.com/v1/bounties/p-bab1702abb
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #73 p-8e055ea98d (keep): runx skill: vendor risk review
  URL: https://gofrantic.com/bounties/p-8e055ea98d
  API: https://gofrantic.com/v1/bounties/p-8e055ea98d
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.
- #74 p-f9594c87f8 (keep): runx skill: outreach sequencer
  URL: https://gofrantic.com/bounties/p-f9594c87f8
  API: https://gofrantic.com/v1/bounties/p-f9594c87f8
  Next operator action: Keep if this row has distinct acceptance criteria and an available reviewer.

### duplicated: Judge-family bounties use near-identical delivery shape

- Status: issue
- Severity: medium
- Evidence: 5 open/claimed/delivered titles contain 'judge' and use the same registry/PR/receipt artifact pattern.
- #63 p-3a51d99b39 (rewrite): runx skill: renewal risk judge
  URL: https://gofrantic.com/bounties/p-3a51d99b39
  API: https://gofrantic.com/v1/bounties/p-3a51d99b39
  Next operator action: Add an explicit differentiator line, expected typed output name, and one example input that is unique to this bounty.
- #65 p-6b470ea66c (rewrite): runx skill: deliverability judge
  URL: https://gofrantic.com/bounties/p-6b470ea66c
  API: https://gofrantic.com/v1/bounties/p-6b470ea66c
  Next operator action: Add an explicit differentiator line, expected typed output name, and one example input that is unique to this bounty.
- #66 p-98da30af97 (rewrite): runx skill: flaky test judge
  URL: https://gofrantic.com/bounties/p-98da30af97
  API: https://gofrantic.com/v1/bounties/p-98da30af97
  Next operator action: Add an explicit differentiator line, expected typed output name, and one example input that is unique to this bounty.
- #68 p-c7bce878c8 (rewrite): runx skill: list hygiene judge
  URL: https://gofrantic.com/bounties/p-c7bce878c8
  API: https://gofrantic.com/v1/bounties/p-c7bce878c8
  Next operator action: Add an explicit differentiator line, expected typed output name, and one example input that is unique to this bounty.
- #69 p-763a2dd375 (rewrite): runx skill: escalation judge
  URL: https://gofrantic.com/bounties/p-763a2dd375
  API: https://gofrantic.com/v1/bounties/p-763a2dd375
  Next operator action: Add an explicit differentiator line, expected typed output name, and one example input that is unique to this bounty.

### confusing: List rows need clearer claim/funding labels

- Status: issue
- Severity: medium
- Evidence: 6 rows are open but have non-obvious claim/funding presentation, such as identity gates or zero-cash funded goodwill.
- #49 p-0d641a030c (rewrite): Give runx some love
  URL: https://gofrantic.com/bounties/p-0d641a030c
  API: https://gofrantic.com/v1/bounties/p-0d641a030c
  Next operator action: Expose the same gate reason on the board card that appears in the API action object.
- #63 p-3a51d99b39 (rewrite): runx skill: renewal risk judge
  URL: https://gofrantic.com/bounties/p-3a51d99b39
  API: https://gofrantic.com/v1/bounties/p-3a51d99b39
  Next operator action: Expose the same gate reason on the board card that appears in the API action object.
- #64 p-cf2486fad0 (rewrite): runx skill: oncall alert triage
  URL: https://gofrantic.com/bounties/p-cf2486fad0
  API: https://gofrantic.com/v1/bounties/p-cf2486fad0
  Next operator action: Expose the same gate reason on the board card that appears in the API action object.
- #65 p-6b470ea66c (rewrite): runx skill: deliverability judge
  URL: https://gofrantic.com/bounties/p-6b470ea66c
  API: https://gofrantic.com/v1/bounties/p-6b470ea66c
  Next operator action: Expose the same gate reason on the board card that appears in the API action object.
- #66 p-98da30af97 (rewrite): runx skill: flaky test judge
  URL: https://gofrantic.com/bounties/p-98da30af97
  API: https://gofrantic.com/v1/bounties/p-98da30af97
  Next operator action: Expose the same gate reason on the board card that appears in the API action object.
- #67 p-1d9b5abe1e (rewrite): runx skill: agency charter validator
  URL: https://gofrantic.com/bounties/p-1d9b5abe1e
  API: https://gofrantic.com/v1/bounties/p-1d9b5abe1e
  Next operator action: Expose the same gate reason on the board card that appears in the API action object.

### superseded: No open Sourcey docs duplicates found

- Status: clean
- Severity: info
- Evidence: All visible Sourcey docs rows are paid or delivered, so no open duplicate Sourcey docs inventory is present in the public board.
- #33 p-8b91e1ac8c (keep): Publish Sourcey docs for a maintained OSS library
  URL: https://gofrantic.com/bounties/p-8b91e1ac8c
  API: https://gofrantic.com/v1/bounties/p-8b91e1ac8c
  Next operator action: No operator action needed beyond normal review of delivered rows.
- #46 p-13c5574312 (keep): Publish Sourcey docs for a second ecosystem
  URL: https://gofrantic.com/bounties/p-13c5574312
  API: https://gofrantic.com/v1/bounties/p-13c5574312
  Next operator action: No operator action needed beyond normal review of delivered rows.
- #2 p-3680f51f35 (keep): Generate and publish docs for a real OSS library with Sourcey
  URL: https://gofrantic.com/bounties/p-3680f51f35
  API: https://gofrantic.com/v1/bounties/p-3680f51f35
  Next operator action: No operator action needed beyond normal review of delivered rows.
- #45 p-c2eb829cc3 (keep): Audit Sourcey docs gaps on a real library
  URL: https://gofrantic.com/bounties/p-c2eb829cc3
  API: https://gofrantic.com/v1/bounties/p-c2eb829cc3
  Next operator action: No operator action needed beyond normal review of delivered rows.
- #50 p-ced79996cf (keep): Dogfood Sourcey on the real Icey C++ codebase
  URL: https://gofrantic.com/bounties/p-ced79996cf
  API: https://gofrantic.com/v1/bounties/p-ced79996cf
  Next operator action: No operator action needed beyond normal review of delivered rows.

## Bounty Page Sample

- #49 p-0d641a030c: API 200, HTML 200, https://gofrantic.com/bounties/p-0d641a030c
- #63 p-3a51d99b39: API 200, HTML 200, https://gofrantic.com/bounties/p-3a51d99b39
- #64 p-cf2486fad0: API 200, HTML 200, https://gofrantic.com/bounties/p-cf2486fad0
- #65 p-6b470ea66c: API 200, HTML 200, https://gofrantic.com/bounties/p-6b470ea66c
- #66 p-98da30af97: API 200, HTML 200, https://gofrantic.com/bounties/p-98da30af97
- #67 p-1d9b5abe1e: API 200, HTML 200, https://gofrantic.com/bounties/p-1d9b5abe1e
- #43 p-aa9de6d1a9: API 200, HTML 200, https://gofrantic.com/bounties/p-aa9de6d1a9
- #62 p-a7db78d8a8: API 200, HTML 200, https://gofrantic.com/bounties/p-a7db78d8a8
- #11 p-8708204a88: API 200, HTML 200, https://gofrantic.com/bounties/p-8708204a88
- #33 p-8b91e1ac8c: API 200, HTML 200, https://gofrantic.com/bounties/p-8b91e1ac8c
- #39 p-cb41cbd3ca: API 200, HTML 200, https://gofrantic.com/bounties/p-cb41cbd3ca
- #1 p-7c933cc87d: API 200, HTML 200, https://gofrantic.com/bounties/p-7c933cc87d

## Receipt

This report is intended to be paired with the runx receipt emitted by the governed `frantic-board-health-audit` run. The receipt ref is populated in the delivery packet after the run seals.

## Operator Summary

- Review stale delivered rows first; they carry the most worker-facing uncertainty.
- Keep zero-cash goodwill inventory only if the board card makes goodwill vs cash unambiguous.
- For judge-family runx skills, add a short differentiator line to each bounty card and acceptance block.
- Preserve paid rows as historical ledger entries; they are not active work inventory.
- Keep status counts tied to public API objects, not prose-only summaries.
