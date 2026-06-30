$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$publicUrl = $env:RUNX_INPUT_PUBLIC_URL
$parentUrl = $env:RUNX_INPUT_PARENT_URL
$repoUrl = $env:RUNX_INPUT_REPO_URL
$commit = $env:RUNX_INPUT_COMMIT
$minPages = [int]($env:RUNX_INPUT_MIN_PAGES)

$failures = New-Object System.Collections.Generic.List[string]
$observations = New-Object System.Collections.Generic.List[object]

function Add-Failure([string]$message) {
  $script:failures.Add($message) | Out-Null
}

function Require-Input([string]$name, [string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) {
    Add-Failure "$name is required"
  }
}

function Get-Title([string]$html) {
  $m = [regex]::Match($html, "<title>(.*?)</title>", "IgnoreCase")
  if ($m.Success) { return $m.Groups[1].Value }
  return ""
}

function Get-Generator([string]$html) {
  $m = [regex]::Match($html, '<meta name="generator" content="([^"]+)"', "IgnoreCase")
  if ($m.Success) { return $m.Groups[1].Value }
  return ""
}

function Get-PackageLinks([string]$html) {
  $links = [regex]::Matches($html, 'href="([^"]+)"') |
    ForEach-Object { $_.Groups[1].Value } |
    Where-Object { $_.StartsWith("/scafld/docs/go-api/pkg-") } |
    Sort-Object -Unique
  return @($links)
}

function Fetch-Text([string]$url) {
  $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 30 -Headers @{
    "User-Agent" = "frantic33-sourcey-docs-validation/0.1"
    "Accept" = "text/html,application/json,text/plain;q=0.9,*/*;q=0.8"
  }
  return [pscustomobject]@{
    status = [int]$response.StatusCode
    text = [string]$response.Content
    url = $url
  }
}

function Fetch-Json([string]$url) {
  return Invoke-RestMethod -Uri $url -TimeoutSec 30 -Headers @{
    "User-Agent" = "frantic33-sourcey-docs-validation/0.1"
    "Accept" = "application/vnd.github+json"
  }
}

function Github-Api-Url([string]$repo, [string]$suffix) {
  $m = [regex]::Match($repo, '^https://github\.com/([^/]+)/([^/]+)/?$')
  if (-not $m.Success) {
    throw "unsupported repo_url: $repo"
  }
  return "https://api.github.com/repos/$($m.Groups[1].Value)/$($m.Groups[2].Value)$suffix"
}

Require-Input "public_url" $publicUrl
Require-Input "parent_url" $parentUrl
Require-Input "repo_url" $repoUrl
Require-Input "commit" $commit
if ($minPages -lt 1) {
  Add-Failure "min_pages must be positive"
}

if ($failures.Count -eq 0) {
  $publicPage = Fetch-Text $publicUrl
  $publicTitle = Get-Title $publicPage.text
  $publicGenerator = Get-Generator $publicPage.text
  $packageLinks = Get-PackageLinks $publicPage.text
  if ($publicPage.status -ne 200) { Add-Failure "public_url status $($publicPage.status)" }
  if ($publicGenerator -notmatch "Sourcey\s+3\.") {
    Add-Failure "public_url generator missing Sourcey marker: $publicGenerator"
  }
  if ($packageLinks.Count -lt $minPages) {
    Add-Failure "Sourcey package page count $($packageLinks.Count) below $minPages"
  }
  $observations.Add([pscustomobject]@{
    id = "public_url_sourcey_site"
    url = $publicUrl
    status = $publicPage.status
    title = $publicTitle
    generator = $publicGenerator
    package_page_count = $packageLinks.Count
    sample_pages = @($packageLinks | Select-Object -First 12 | ForEach-Object { "https://0state.com$_" })
  }) | Out-Null

  $parentPage = Fetch-Text $parentUrl
  $parentHasRepo = $parentPage.text.Contains("https://github.com/nilstate/scafld")
  $parentHasDocs = $parentPage.text.Contains("/scafld/docs")
  if ($parentPage.status -ne 200) { Add-Failure "parent_url status $($parentPage.status)" }
  if (-not $parentHasRepo) { Add-Failure "parent_url does not link target repo" }
  if (-not $parentHasDocs) { Add-Failure "parent_url does not link docs area" }
  $observations.Add([pscustomobject]@{
    id = "parent_domain_project_home"
    url = $parentUrl
    status = $parentPage.status
    title = Get-Title $parentPage.text
    links_target_repo = $parentHasRepo
    links_docs_area = $parentHasDocs
  }) | Out-Null

  $repo = Fetch-Json (Github-Api-Url $repoUrl "")
  if ($repo.full_name -ne "nilstate/scafld") { Add-Failure "unexpected repo $($repo.full_name)" }
  if ($repo.license.spdx_id -ne "MIT") { Add-Failure "unexpected license $($repo.license.spdx_id)" }
  $observations.Add([pscustomobject]@{
    id = "target_repo_metadata"
    repo_url = $repoUrl
    full_name = $repo.full_name
    license = $repo.license.spdx_id
    pushed_at = $repo.pushed_at
    description = $repo.description
  }) | Out-Null

  $commitJson = Fetch-Json (Github-Api-Url $repoUrl "/commits/$commit")
  if ($commitJson.sha -ne $commit) { Add-Failure "commit mismatch $($commitJson.sha)" }
  $observations.Add([pscustomobject]@{
    id = "pinned_commit"
    repo_url = $repoUrl
    commit = $commitJson.sha
    commit_date = $commitJson.commit.committer.date
    commit_message = ($commitJson.commit.message -split "`n")[0]
  }) | Out-Null

  $sampleUrls = @(
    "https://0state.com/scafld/docs/go-api/pkg-internal-core-receipt",
    "https://0state.com/scafld/docs/go-api/pkg-internal-app-validate",
    "https://0state.com/scafld/docs/go-api/pkg-internal-adapters-cli-config"
  )
  $samplePages = @()
  foreach ($url in $sampleUrls) {
    $page = Fetch-Text $url
    $generator = Get-Generator $page.text
    $title = Get-Title $page.text
    if (($page.status -ne 200) -or ($generator -notmatch "Sourcey\s+3\.")) {
      Add-Failure "sample page failed $url"
    }
    $samplePages += [pscustomobject]@{
      url = $url
      status = $page.status
      title = $title
      generator = $generator
      length = $page.text.Length
    }
  }
  $observations.Add([pscustomobject]@{
    id = "live_docs_spot_checks"
    pages = $samplePages
  }) | Out-Null
}

$result = [pscustomobject]@{
  ok = ($failures.Count -eq 0)
  checked_at = (Get-Date).ToUniversalTime().ToString("o")
  inputs = [pscustomobject]@{
    public_url = $publicUrl
    parent_url = $parentUrl
    repo_url = $repoUrl
    commit = $commit
    min_pages = $minPages
  }
  observations = $observations
  failures = $failures
}

$result | ConvertTo-Json -Depth 12
if ($failures.Count -gt 0) {
  exit 1
}
