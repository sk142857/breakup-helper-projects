#!/bin/bash
# ============================================
# deploy.sh — 服务器端拉取镜像 & 启动容器
# ============================================
#
# 前置条件：服务器已安装 Docker，已登录阿里云镜像仓库
#   docker login --username=<阿里云账号> registry.cn-hangzhou.aliyuncs.com
#
# 使用方式：
#   ./deploy.sh                  → 启动/更新全部服务
#   ./deploy.sh -t v1.0.0        → 指定版本
#   ./deploy.sh -d               → 停止并删除全部容器
#   ./deploy.sh -r               → 重启全部容器
# ============================================

set -e

# 默认值
TAG="1.0"
DO_DOWN=false
DO_RESTART=false

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag) TAG="$2"; shift 2 ;;
        -d|--down) DO_DOWN=true; shift ;;
        -r|--restart) DO_RESTART=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

REGISTRY="registry.cn-hangzhou.aliyuncs.com"
NAMESPACE="hongyan-service"
NETWORK="hongyan-net"
DOCKER_HOME="/root/docker_home"

IMAGE_API="$REGISTRY/$NAMESPACE/helper-api-service:$TAG"
IMAGE_ADMIN="$REGISTRY/$NAMESPACE/helper-admin-pro:$TAG"

HOME_API="$DOCKER_HOME/helper-api-service"
HOME_ADMIN="$DOCKER_HOME/helper-admin-pro"

# ============================================
# 停止 & 清理
# ============================================
if $DO_DOWN; then
    echo -e "${YELLOW}Stopping all containers...${NC}"
    docker stop helper-api-service helper-admin-pro helper-redis 2>/dev/null || true
    docker rm helper-api-service helper-admin-pro helper-redis 2>/dev/null || true
    docker network rm "$NETWORK" 2>/dev/null || true
    echo -e "${GREEN}Done.${NC}"
    exit 0
fi

# ============================================
# 重启
# ============================================
if $DO_RESTART; then
    echo -e "${YELLOW}Restarting all containers...${NC}"
    docker restart helper-api-service helper-admin-pro 2>/dev/null || true
    docker restart helper-redis 2>/dev/null || true
    echo -e "${GREEN}Done.${NC}"
    exit 0
fi

# ============================================
# 部署
# ============================================

# 1. 创建网络（如果不存在）
if ! docker network ls --filter "name=$NETWORK" -q | grep -q .; then
    echo -e "${CYAN}Creating network: $NETWORK${NC}"
    docker network create "$NETWORK"
fi

# 2. 拉取镜像
echo -e "${CYAN}Pulling images...${NC}"
docker pull "$IMAGE_API"
docker pull "$IMAGE_ADMIN"

# 2.5. 创建宿主机挂载目录
echo -e "${CYAN}Creating host directories...${NC}"
mkdir -p "$HOME_API/logs" "$HOME_API/data"
mkdir -p "$HOME_ADMIN/logs"

# 3. 前置检查：Redis 必须已存在
if ! docker ps -a --filter "name=helper-redis" --format "{{.Names}}" | grep -q "helper-redis"; then
    echo -e "${RED}[ERROR] Redis 容器 'helper-redis' 不存在，请先手动创建！${NC}"
    exit 1
fi
echo -e "${GREEN}Redis container exists, OK.${NC}"

# 4. API 服务
echo -e "${CYAN}Starting helper-api-service...${NC}"
docker stop helper-api-service 2>/dev/null || true
docker rm helper-api-service 2>/dev/null || true
docker run -d \
    --name helper-api-service \
    --network "$NETWORK" \
    --restart unless-stopped \
    --pull always \
    -p 3000:3000 \
    -v "${HOME_API}/logs:/app/logs" \
    -v "${HOME_API}/data:/app/data" \
    "$IMAGE_API"

# 5. Admin 前端
echo -e "${CYAN}Starting helper-admin-pro...${NC}"
docker stop helper-admin-pro 2>/dev/null || true
docker rm helper-admin-pro 2>/dev/null || true
docker run -d \
    --name helper-admin-pro \
    --network "$NETWORK" \
    --restart unless-stopped \
    --pull always \
    -p 8080:8080 \
    -v "${HOME_ADMIN}/logs:/var/log/nginx" \
    "$IMAGE_ADMIN"

# ============================================
echo ""
echo -e "${GREEN}Deploy complete!${NC}"
echo -e "  API:    http://<server>:3000${CYAN}"
echo -e "  Admin:  http://<server>:8080${CYAN}"
