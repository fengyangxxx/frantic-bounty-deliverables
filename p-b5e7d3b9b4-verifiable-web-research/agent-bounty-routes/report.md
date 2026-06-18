# Verifiable Web Research Report

Question: Which current bounty venues in our scan expose agent-oriented work routes, and what blockers remain before an agent can submit?

## Answer

Frantic is currently the clearest agent-native venue in this sample: it has explicit agent signup, claim, delivery, identity, and receipt rules, and the two checked bounties are open with available claim slots. Superteam also exposes an agent API and claim-code workflow, but current actionable work depends on listings marked `AGENT_ALLOWED` or `AGENT_ONLY` in the live listing endpoints.

Remaining blockers are operational rather than research blockers: Frantic needs a verified eligible agent token for claim and delivery, and Superteam needs the registered agent API key plus later human claim flow after winning.

## Claims

### fact_frantic_signup

Frantic supports first-class agent entry through its homepage form or POST /v1/signup, returning an agent token and public agent key id. Source: `frantic_skill`.

### fact_frantic_claim_delivery

Frantic claims are made with POST /v1/claims and deliveries are submitted with POST /v1/deliveries before the claim fuse expires. Source: `frantic_skill`.

### fact_frantic_identity

Frantic funded claims require active identity proof: verified email in open_email mode or runx GitHub identity in runx_github mode. Source: `frantic_skill`.

### fact_frantic_21_open

Frantic #21 'runx skill: dependency CVE audit' is listed as open with 1 claim slot(s) available and $12 posted reward. Source: `frantic_21`.

### fact_frantic_21_criteria

Frantic #21 requires a governed skill, evidence.json, report.md, receipt reference, and a real run matching its acceptance criteria. Source: `frantic_21`.

### fact_frantic_24_open

Frantic #24 'runx skill: verifiable web research' is listed as open with 1 claim slot(s) available and $15 posted reward. Source: `frantic_24`.

### fact_frantic_24_criteria

Frantic #24 requires a governed skill, evidence.json, report.md, receipt reference, and a real run matching its acceptance criteria. Source: `frantic_24`.

### fact_superteam_agents_route

Superteam exposes an agent workflow with registration, API key, listing endpoints, submission creation, and a human claim URL containing the agent claim code. Source: `superteam_skill`.

### fact_superteam_bounties_count

Superteam bounties agent API returned 7 listing(s), including 7 listing(s) marked AGENT_ALLOWED or AGENT_ONLY. Source: `superteam_bounties`.

### fact_superteam_projects_count

Superteam projects agent API returned 0 listing(s), including 0 listing(s) marked AGENT_ALLOWED or AGENT_ONLY. Source: `superteam_projects`.

## Sources Read

- [frantic_skill] https://gofrantic.com/SKILL.md SHA-256 `3acadbacc3c3d8dd1a5d8e372dc039bb0dc7f798c66ec8f61fb6502ea3b0bab5`
- [frantic_21] https://gofrantic.com/v1/bounties/p-b14252e1b0 SHA-256 `4524cb570cc88582cb01c0a2fffcd535ff999eced417b2ac0fc3850da596f488`
- [frantic_24] https://gofrantic.com/v1/bounties/p-b5e7d3b9b4 SHA-256 `df002f0cd92ca27ae683b009bad9d6056d74d2c242d2c586bf06fdfa35cccfc7`
- [superteam_skill] https://superteam.fun/skill.md SHA-256 `44745026273c267572762b1851c46bda58d52a55a28cf54d7c1a72b76a6bb350`
- [superteam_bounties] https://superteam.fun/api/agents/listings/live?take=100&type=bounty SHA-256 `efa7c19282864cda3a8d2b202e521e94cc4f9e4fa3e2c9e85b5fb24f99e2585f`
- [superteam_projects] https://superteam.fun/api/agents/listings/live?take=100&type=project SHA-256 `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`
