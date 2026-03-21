#!/usr/bin/env pwsh
# MagicAppDev full-stack deployment script
# Builds all packages, applies D1 migrations, then deploys all Cloudflare Workers.
#
# Usage:
#   ./scripts/deploy.ps1                  # Deploy everything
#   ./scripts/deploy.ps1 -SkipMigrations  # Skip D1 migrations
#   ./scripts/deploy.ps1 -Only api        # Deploy only the API

param(
    [switch]$SkipMigrations,
    [ValidateSet("api", "web", "agent", "all")]
    [string]$Only = "all"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Results = [System.Collections.Generic.List[PSCustomObject]]::new()

function Step {
    param([string]$Label)
    Write-Host "`n===================================================" -ForegroundColor Cyan
    Write-Host "  $Label" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
}

function Run {
    param(
        [string]$Label,
        [string]$WorkDir,
        [scriptblock]$Command
    )
    Step $Label
    $start = Get-Date
    try {
        Push-Location $WorkDir
        & $Command
        if ($LASTEXITCODE -ne 0) { throw "Exit code $LASTEXITCODE" }
        $elapsed = ((Get-Date) - $start).TotalSeconds
        Write-Host "  OK ($([math]::Round($elapsed, 1))s)" -ForegroundColor Green
        $Results.Add([PSCustomObject]@{ Step = $Label; Status = "OK"; Time = "$([math]::Round($elapsed, 1))s" })
    } catch {
        $elapsed = ((Get-Date) - $start).TotalSeconds
        Write-Host "  FAILED: $_" -ForegroundColor Red
        $Results.Add([PSCustomObject]@{ Step = $Label; Status = "FAILED"; Time = "$([math]::Round($elapsed, 1))s" })
        throw
    } finally {
        Pop-Location
    }
}

$deployStart = Get-Date

Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "  MagicAppDev Deployment  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Magenta
Write-Host "  Target: $Only$(if ($SkipMigrations) { '  (migrations skipped)' })" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

# ── 1. Build all packages ──────────────────────────────────────────────────────
# turbo build handles dependency order: shared → database → web (vite) / api / agent
Run "Build all packages (turbo)" $Root {
    pnpm turbo build
}

# ── 2. Apply D1 migrations (remote) ───────────────────────────────────────────
if (-not $SkipMigrations) {
    Run "Apply D1 migrations (remote)" "$Root\packages\database" {
        pnpm run migrate:prod
    }
} else {
    Write-Host "`n  [SKIP] D1 migrations (-SkipMigrations flag set)" -ForegroundColor Yellow
}

# ── 3. Deploy API ──────────────────────────────────────────────────────────────
if ($Only -eq "all" -or $Only -eq "api") {
    Run "Deploy API -> magicappdev-api.magicappdev.workers.dev" "$Root\packages\api" {
        pnpm run deploy
    }
}

# ── 4. Deploy Web ──────────────────────────────────────────────────────────────
if ($Only -eq "all" -or $Only -eq "web") {
    Run "Deploy Web -> app.magicappdev.workers.dev" "$Root\apps\web" {
        pnpm run deploy
    }
}

# ── 5. Deploy Agent ────────────────────────────────────────────────────────────
if ($Only -eq "all" -or $Only -eq "agent") {
    Run "Deploy Agent -> magicappdev-agent" "$Root\packages\agent" {
        pnpm run deploy
    }
}

# ── Summary ───────────────────────────────────────────────────────────────────
$totalTime = [math]::Round(((Get-Date) - $deployStart).TotalSeconds, 1)
Write-Host "`n===================================================" -ForegroundColor Cyan
Write-Host "  Deployment Summary  (${totalTime}s total)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
$Results | Format-Table -AutoSize
Write-Host "Deployment complete." -ForegroundColor Green

