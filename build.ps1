# ============================================
# build.ps1 — 构建镜像 & 推送到阿里云容器镜像服务
# ============================================
#
# 使用方式：
#   .\build.ps1              → 构建 + 推送两个镜像
#   .\build.ps1 -Tag v1.0.0  → 构建 + 打版本标签 + 推送 latest + v1.0.0
#
# 阿里云镜像仓库：
#   registry.cn-hangzhou.aliyuncs.com/hongyan-service/helper-api-service
#   registry.cn-hangzhou.aliyuncs.com/hongyan-service/helper-admin-pro
# ============================================

param(
    [string]$Tag = "1.0"
)

$ErrorActionPreference = "Stop"
$REGISTRY = "registry.cn-hangzhou.aliyuncs.com"
$NAMESPACE = "hongyan-service"
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

    Write-Host "Pushing: $fullName" -ForegroundColor Green
    docker push $fullName
    if ($LASTEXITCODE -ne 0) { throw "Push failed: $($img.Name)" }
}

Write-Host "`nDone!" -ForegroundColor Green
