$ErrorActionPreference = "Stop"
$CPANEL_URL   = "https://osszcollection.com:2083"
$CPANEL_USER   = "YOUR_CPANEL_USERNAME"
$CPANEL_PASS   = "YOUR_CPANEL_PASSWORD"
$DOMAIN        = "osszcollection.com"
$REMOTE_DIR    = "/public_html"
$DB_NAME       = "osszcollection_laravel"
$DB_USER       = "osszcollection_user"
$DB_PASSWORD   = ""

Write-Host "`n[STEP] Creating deployment ZIP..." -ForegroundColor Cyan
$zipPath = Join-Path $PSScriptRoot "ossz-laravel-deploy.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
$tempDir = Join-Path $PSScriptRoot "_deploy_tmp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

$excludeDirs = @("vendor", "node_modules", ".next", ".git", ".gitkeep", "_deploy_tmp")
$excludeFiles = @(".gitkeep", "ossz-laravel-deploy.zip")

Get-ChildItem -Path $PSScriptRoot -Recurse -File | Where-Object {
    $relative = $_.FullName.Substring($PSScriptRoot.Length + 1)
    $excluded = $false
    foreach ($d in $excludeDirs) { if ($relative -like "$d\*" -or $relative -like "$d/*") { $excluded = $true; break } }
    foreach ($f in $excludeFiles) { if ($_.Name -eq $f) { $excluded = $true; break } }
    -not $excluded
} | ForEach-Object {
    $relative = $_.FullName.Substring($PSScriptRoot.Length + 1)
    $dest = Join-Path $tempDir $relative
    $destDir = Split-Path $dest -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $_.FullName $dest
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal
Remove-Item $tempDir -Recurse -Force
Write-Host "   [OK] ZIP created successfully" -ForegroundColor Green

Write-Host "`n[STEP] Testing cPanel connection..." -ForegroundColor Cyan
$pair = "$($CPANEL_USER):$($CPANEL_PASS)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)
$headers = @{ "Authorization" = "Basic $base64" }
Invoke-RestMethod -Uri "$CPANEL_URL/execute/Fileman/list_files?dir=%2F" -Headers $headers -SkipCertificateCheck -TimeoutSec 15 | Out-Null
Write-Host "   [OK] Connected to cPanel" -ForegroundColor Green

Write-Host "`n[STEP] Uploading deploy ZIP to cPanel..." -ForegroundColor Cyan
$uploadUrl = "$CPANEL_URL/execute/Fileman/upload_files?dir=$([System.Uri]::EscapeDataString($REMOTE_DIR))"
$fileBytes = [System.IO.File]::ReadAllBytes($zipPath)
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"
$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"file-1`"; filename=`"ossz-laravel-deploy.zip`"",
    "Content-Type: application/zip",
    "",
    [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes),
    "--$boundary--"
) -join $LF
$bodyBytes = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($bodyLines)
Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $headers -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyBytes -SkipCertificateCheck -TimeoutSec 120 | Out-Null
Write-Host "   [OK] ZIP uploaded to $REMOTE_DIR" -ForegroundColor Green

Write-Host "`n[STEP] Extracting ZIP on server..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$CPANEL_URL/execute/Fileman/extract" -Method Post -Headers $headers -Body "dir=$([System.Uri]::EscapeDataString($REMOTE_DIR))&file=ossz-laravel-deploy.zip" -ContentType "application/x-www-form-urlencoded" -SkipCertificateCheck -TimeoutSec 30 | Out-Null
Write-Host "   [OK] ZIP extracted" -ForegroundColor Green

Write-Host "`n===================================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT FILES UPLOADED & EXTRACTED!" -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Green
