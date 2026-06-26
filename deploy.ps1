# ============================================
# deploy.ps1 — 服务器端拉取镜像 & 启动容器
# ============================================
#
# 前置条件：服务器已安装 Docker，已登录阿里云镜像仓库
#   docker login --username=<阿里云账号> registry.cn-hangzhou.aliyuncs.com
#
# 使用方式：
#   .\deploy.ps1                    → 启动/更新全部服务
#   .\deploy.ps1 -Tag v1.0.0        → 指定版本
#   .\deploy.ps1 -SkipRedis          → 跳过 Redis（使用外部 Redis）
#   .\deploy.ps1 -Down               → 停止并删除全部容器
#   .\deploy.ps1 -Restart            → 重启全部容器
# ============================================

param(
    [string]$Tag = "1.0",
    [switch]$SkipRedis,
    [switch]$Down,
    [switch]$Restart
)

$ErrorActionPreference = "Stop"
$REGISTRY    = "registry.cn-hangzhou.aliyuncs.com"
$NAMESPACE   = "breakup-helper"
$NETWORK     = "breakup-net"

$IMAGE_API   = "$REGISTRY/$NAMESPACE/helper-api-service:$Tag"
$IMAGE_ADMIN = "$REGISTRY/$NAMESPACE/helper-admin-pro:$Tag"
$IMAGE_REDIS = "redis:7-alpine"

# ============================================
# 停止 & 清理
# ============================================
if ($Down) {
    Write-Host "Stopping all containers..." -ForegroundColor Yellow
    docker stop helper-api-service helper-admin-pro helper-redis 2>$null
    docker rm helper-api-service helper-admin-pro helper-redis 2>$null
    docker network rm $NETWORK 2>$null
    Write-Host "Done." -ForegroundColor Green
    exit 0
}

# ============================================
# 重启
# ============================================
if ($Restart) {
    Write-Host "Restarting all containers..." -ForegroundColor Yellow
    docker restart helper-api-service helper-admin-pro 2>$null
    if (-not $SkipRedis) { docker restart helper-redis 2>$null }
    Write-Host "Done." -ForegroundColor Green
    exit 0
}

# ============================================
# 部署
# ============================================

# 1. 创建网络（如果不存在）
$netExists = docker network ls --filter "name=$NETWORK" -q
if (-not $netExists) {
    Write-Host "Creating network: $NETWORK" -ForegroundColor Cyan
    docker network create $NETWORK
}

# 2. 拉取镜像
Write-Host "Pulling images..." -ForegroundColor Cyan
docker pull $IMAGE_API
docker pull $IMAGE_ADMIN

# 3. Redis（可选）
if (-not $SkipRedis) {
    $redisRunning = docker ps --filter "name=helper-redis" -q
    if (-not $redisRunning) {
        Write-Host "Starting Redis..." -ForegroundColor Cyan
        docker rm helper-redis 2>$null
        docker run -d `
            --name helper-redis `
            --network $NETWORK `
            --restart unless-stopped `
            -v redis_data:/data `
            $IMAGE_REDIS redis-server --appendonly yes
    } else {
        Write-Host "Redis already running, skip." -ForegroundColor Yellow
    }
}

# 4. API 服务
Write-Host "Starting helper-api-service..." -ForegroundColor Cyan
docker stop helper-api-service 2>$null
docker rm helper-api-service 2>$null
docker run -d `
    --name helper-api-service `
    --network $NETWORK `
    --restart unless-stopped `
    -p 3000:3000 `
    $IMAGE_API

# 5. Admin 前端
Write-Host "Starting helper-admin-pro..." -ForegroundColor Cyan
docker stop helper-admin-pro 2>$null
docker rm helper-admin-pro 2>$null
docker run -d `
    --name helper-admin-pro `
    --network $NETWORK `
    --restart unless-stopped `
    -p 80:80 `
    $IMAGE_ADMIN

# ============================================
Write-Host ""
Write-Host "Deploy complete!" -ForegroundColor Green
Write-Host "  API:    http://<server>:3000" -ForegroundColor Cyan
Write-Host "  Admin:  http://<server>:80" -ForegroundColor Cyan
