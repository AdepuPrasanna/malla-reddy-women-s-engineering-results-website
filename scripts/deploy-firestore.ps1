# Deploy Firestore rules and indexes using the Firebase Admin service account.
# Usage: .\scripts\deploy-firestore.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

$CredFile = Get-ChildItem -Path $Root -Filter "*firebase-adminsdk*.json" -File | Select-Object -First 1
if (-not $CredFile) {
  Write-Error "No *firebase-adminsdk*.json file found in repo root."
}

$env:GOOGLE_APPLICATION_CREDENTIALS = $CredFile.FullName
Write-Host "Using credentials: $($CredFile.Name)"
Write-Host "Deploying Firestore rules + indexes to malla-reddy-results-webs-ec93d..."

Push-Location $Root
try {
  npx --yes firebase-tools deploy --only firestore --project malla-reddy-results-webs-ec93d --non-interactive
} finally {
  Pop-Location
}
