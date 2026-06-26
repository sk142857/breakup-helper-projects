# 基础服务部署文档

> 前置条件：服务器已安装 Docker，创建 `/docker_home` 根目录。

## 1. Redis

```bash
# 创建挂载目录
mkdir -p /docker_home/helper-redis/data

# 创建网络（如果不存在）
docker network create hongyan-net 2>/dev/null || true

# 启动 Redis
docker run -d \
  --name helper-redis \
  --network hongyan-net \
  --restart unless-stopped \
  -v /docker_home/helper-redis/data:/data \
  registry.cn-hangzhou.aliyuncs.com/hongyan-service/redis:7-alpine \
  redis-server --appendonly yes
```

## 2. Nginx（反向代理）

```bash
# 创建挂载目录
mkdir -p /docker_home/nginx-server/conf.d
mkdir -p /docker_home/nginx-server/logs
mkdir -p /docker_home/nginx-server/html
mkdir -p /docker_home/nginx-server/ssl

# 上传 SSL 证书到该目录（阿里云免费证书或 Let's Encrypt）
# /docker_home/nginx-server/ssl/api.hyqingren.com.pem
# /docker_home/nginx-server/ssl/api.hyqingren.com.key

# 创建默认 nginx 配置
cat > /docker_home/nginx-server/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name api.hyqingren.com;

    # Admin 前端
    location / {
        proxy_pass http://helper-admin-pro:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 服务
    location /api/ {
        proxy_pass http://helper-api-service:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.hyqingren.com;

    # SSL 证书（请替换为实际路径）
    ssl_certificate     /etc/nginx/ssl/api.hyqingren.com.pem;
    ssl_certificate_key /etc/nginx/ssl/api.hyqingren.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Admin 前端
    location / {
        proxy_pass http://helper-admin-pro:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # API 服务
    location /api/ {
        proxy_pass http://helper-api-service:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

# 启动 Nginx
docker run -d \
  --name nginx-server \
  --network hongyan-net \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /docker_home/nginx-server/conf.d:/etc/nginx/conf.d \
  -v /docker_home/nginx-server/logs:/var/log/nginx \
  -v /docker_home/nginx-server/html:/usr/share/nginx/html \
  -v /docker_home/nginx-server/ssl:/etc/nginx/ssl \
  registry.cn-hangzhou.aliyuncs.com/hongyan-service/nginx:alpine
```

---

## 目录结构总览

```
/docker_home/
├── helper-redis/
│   └── data/              # Redis 持久化数据
├── nginx-server/
│   ├── conf.d/             # Nginx 站点配置
│   ├── logs/               # Nginx 访问/错误日志
│   ├── html/               # 静态文件
│   └── ssl/                # SSL 证书
├── helper-api-service/     # deploy.ps1 自动管理
│   ├── logs/
│   └── data/
└── helper-admin-pro/       # deploy.ps1 自动管理
    └── logs/
```
