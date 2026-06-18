# Frantic Bounty Deliverables

生成时间：2026-06-18

本仓库保存两个 Frantic 任务的交付物。仓库不包含任何私钥、agent token、API key、cookie 或浏览器会话数据。

## p-b14252e1b0 / Frantic #21

任务：`runx skill: dependency CVE audit`

交付目录：

- `p-b14252e1b0-dependency-cve-audit/SKILL.md`
- `p-b14252e1b0-dependency-cve-audit/X.yaml`
- `p-b14252e1b0-dependency-cve-audit/tools/osv_lock_audit.py`
- `p-b14252e1b0-dependency-cve-audit/snyk-goof/evidence.json`
- `p-b14252e1b0-dependency-cve-audit/snyk-goof/report.md`
- `p-b14252e1b0-dependency-cve-audit/snyk-goof/receipt.json`

真实运行目标：

- Source repo: https://github.com/snyk/goof
- Lockfile: https://raw.githubusercontent.com/snyk/goof/master/package-lock.json
- Scope: direct dependencies
- Result: 46 exact package/version queries, 86 OSV advisory findings

复算命令：

```powershell
cd p-b14252e1b0-dependency-cve-audit
python tools/osv_lock_audit.py --repo-url https://github.com/snyk/goof --lockfile-url https://raw.githubusercontent.com/snyk/goof/master/package-lock.json --output-dir snyk-goof --scope direct
```

## p-b5e7d3b9b4 / Frantic #24

任务：`runx skill: verifiable web research`

交付目录：

- `p-b5e7d3b9b4-verifiable-web-research/SKILL.md`
- `p-b5e7d3b9b4-verifiable-web-research/X.yaml`
- `p-b5e7d3b9b4-verifiable-web-research/tools/verifiable_research.py`
- `p-b5e7d3b9b4-verifiable-web-research/agent-bounty-routes/evidence.json`
- `p-b5e7d3b9b4-verifiable-web-research/agent-bounty-routes/report.md`
- `p-b5e7d3b9b4-verifiable-web-research/agent-bounty-routes/receipt.json`

真实运行问题：

`Which current bounty venues in our scan expose agent-oriented work routes, and what blockers remain before an agent can submit?`

结果：

- 读取 6 个官方来源
- 生成 10 条 claim-to-source 映射
- 每个 source 记录了 URL、HTTP 状态、content type、SHA-256

复算命令：

```powershell
cd p-b5e7d3b9b4-verifiable-web-research
$env:SUPERTEAM_API_KEY = "<your-superteam-agent-api-key>"
python tools/verifiable_research.py --question "Which current bounty venues in our scan expose agent-oriented work routes, and what blockers remain before an agent can submit?" --output-dir agent-bounty-routes
Remove-Item Env:\SUPERTEAM_API_KEY
```

## runx 说明

本地已安装 `runx-cli 0.6.2`，并生成了私有 signing seed。尝试 `runx skill ...` 时：

1. `RUNX_RECEIPT_SIGN_*` 环境变量缺失问题已解决。
2. `issuer_type` 已按当前 CLI 要求调整为 `ci`。
3. Windows 运行器的 cwd 问题已通过绝对 cwd 缓解。
4. 当前阻塞在 receipt store 写入：`receipt store is unreadable: 参数错误。 (os error 87)`。

因此本次提交使用脚本生成的 `receipt.json` 作为可复算本地 receipt。`receipt.json` 包含输入来源、artifact SHA-256、网络来源和 recompute 命令。
