# ============================================
# build.ps1 — 构建镜像 & 推送到阿里云容器镜像服务
# ============================================
#
# 使用方式：
#   .\build.ps1              → 构建两个镜像（不推送）
#   .\build.ps1 -Push        → 构建 + 推送
#   .\build.ps1 -Push -Tag v1.0.0   → 构建 + 打版本标签 + 推送 latest + v1.0.0
#
# 阿里云镜像仓库：
#   registry.cn-hangzhou.aliyuncs.com/breakup-helper/helper-api-service
#   registry.cn-hangzhou.aliyuncs.com/breakup-helper/helper-admin-pro
# ============================================

param(
    [switch]$Push,
    [string]$Tag = "1.0"
)

$ErrorActionPreference = "Stop"
$REGISTRY = "registry.cn-hangzhou.aliyuncs.com"
$NAMESPACE = "breakup-helper"
$ROOT = $PSScriptRoot

$images = @(
    @{ Name = "helper-api-service"; Dockerfile = "$ROOT\packages\helper-api-service\Dockerfile" },
    @{ Name = "helper-admin-pro";  Dockerfile = "$ROOT\packages\helper-admin-pro\Dockerfile" }
)

foreach ($img in $images) {
    $fullName = "$REGISTRY/$NAMESPACE/$($img.Name):$Tag"
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Building: $fullName" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    docker build -t $fullName -f $img.Dockerfile $ROOT
    if ($LASTEXITCODE -ne 0) { throw "Build failed: $($img.Name)" }

    # 同时打 latest 标签
    if ($Tag -ne "latest") {
        $latestName = "$REGISTRY/$NAMESPACE/$($img.Name):latest"
        docker tag $fullName $latestName
    }

    if ($Push) {
        Write-Host "Pushing: $fullName" -ForegroundColor Green
        docker push $fullName
        if ($LASTEXITCODE -ne 0) { throw "Push failed: $($img.Name)" }

        if ($Tag -ne "latest") {
            Write-Host "Pushing: $latestName" -ForegroundColor Green
            docker push $latestName
        }
    }
}

Write-Host "`nDone!" -ForegroundColor Green
if (-not $Push) {
    Write-Host "Tip: add -Push to push images to Alibaba Cloud" -ForegroundColor Yellow
}
