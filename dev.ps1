# ============================================
# Breakup Helper - Local Dev Environment
# Usage: .\dev.ps1
# Services: Server(3000) + Admin(5173)
# Depends: MySQL(3306) + Redis(6379)
# ============================================

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

# Fix garbled output (PowerShell 5.1 defaults to GBK)
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$env:LESSCHARSET = "utf-8"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Breakup Helper - Local Dev" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ---- helper: kill process on port ----
function Stop-PortProcess {
    param([int]$Port, [string]$Label)

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

    if ($connections) {
        foreach ($ownerPid in $connections) {
            $proc = Get-Process -Id $ownerPid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "[KILL] Port ${Port} ($Label) by $($proc.ProcessName) (PID: $ownerPid)..." -ForegroundColor Yellow
                Stop-Process -Id $ownerPid -Force -ErrorAction SilentlyContinue
                Start-Sleep -Milliseconds 800
                Write-Host "        Done." -ForegroundColor Green
            }
        }
    }
    else {
        Write-Host "[ OK ] Port ${Port} ($Label) free" -ForegroundColor Green
    }
}

# ---- 1. kill occupied ports ----
Write-Host "[1/3] Check port usage..." -ForegroundColor Cyan
Stop-PortProcess 3000 "Server"
Stop-PortProcess 5173 "Admin"
Write-Host ""

# ---- 2. copy .env ----
Write-Host "[2/3] Setup .env..." -ForegroundColor Cyan

$envDev = Join-Path $Root "packages\helper-api-service\.env.development"
$envTarget = Join-Path $Root "packages\helper-api-service\.env"

if (Test-Path $envDev) {
    Copy-Item $envDev $envTarget -Force
    Write-Host "       .env.development -> .env  copied" -ForegroundColor Green
}
else {
    Write-Host "       [WARN] $envDev not found, skip" -ForegroundColor Yellow
}
Write-Host ""

# ---- 3. start services via concurrently (single terminal, no encoding issues) ----
Write-Host "[3/3] Start dev services..." -ForegroundColor Cyan
Write-Host "       Server : http://localhost:3000" -ForegroundColor White
Write-Host "       Admin  : http://localhost:5173" -ForegroundColor White
Write-Host "       Ctrl+C to stop all" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $Root
pnpm dev

