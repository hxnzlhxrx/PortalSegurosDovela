$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

node --check (Join-Path $root 'public/js/public-app.js')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node --check (Join-Path $root 'public/js/public-repository.js')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node (Join-Path $PSScriptRoot 'claim-status.cjs')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Output 'PASS: claim status syntax and focused behavior.'
