# 基础服务部署文档

> 前置条件：服务器已安装 Docker，创建 `/root/docker_home/` 根目录。

## 1. Redis

```bash
# 创建挂载目录
mkdir -p /root/docker_home/helper-redis/data

# 创建网络（如果不存在）
docker network create hongyan-net 2>/dev/null || true

# 启动 Redis
docker run -d \
  --name helper-redis \
  --network hongyan-net \
  --restart unless-stopped \
  -v /root/docker_home/helper-redis/data:/data \
  registry.cn-hangzhou.aliyuncs.com/hongyan-service/redis:7-alpine \
  redis-server --appendonly yes
```

## 2. Nginx（反向代理）

```bash
# 创建挂载目录
mkdir -p /root/docker_home/nginx-server/conf.d
mkdir -p /root/docker_home/nginx-server/logs
mkdir -p /root/docker_home/nginx-server/html
mkdir -p /root/docker_home/nginx-server/ssl

# 上传 SSL 证书到该目录（阿里云免费证书或 Let's Encrypt）
# /root/docker_home/nginx-server/ssl/api.hyqingren.com.pem
# /root/docker_home/nginx-server/ssl/api.hyqingren.com.key

# 创建默认 nginx 配置
cat > /root/docker_home/nginx-server/conf.d/default.conf << 'EOF'
# 限流区域（谨慎策略：10r/s，突发=20，无延迟）
limit_req_zone $binary_remote_addr zone=admin_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# Admin 前端（HTTP，无证书）
server {
    listen 80;
    server_name admin.hyqingren.com;

    # 基础防御
    server_tokens off;
    client_max_body_size 10m;
    client_body_buffer_size 128k;
    large_client_header_buffers 4 16k;

    # 限制请求方法
    if ($request_method !~ ^(GET|HEAD|POST)$) {
        return 405;
    }

    # gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml
        application/x-javascript
        image/svg+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        font/opentype;

    location / {
        limit_req zone=admin_limit burst=20 nodelay;
        proxy_pass http://helper-admin-pro:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API 服务（仅 HTTPS）
server {
    listen 443 ssl;
    http2 on;
    server_name api.hyqingren.com;

    # 基础防御
    server_tokens off;
    client_max_body_size 10m;
    client_body_buffer_size 128k;
    large_client_header_buffers 4 16k;

    # 限制请求方法
    if ($request_method !~ ^(GET|HEAD|POST|PUT|DELETE|PATCH)$) {
        return 405;
    }

    # 安全响应头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # SSL 证书（请替换为实际路径）
    ssl_certificate     /etc/nginx/ssl/api.hyqingren.com.pem;
    ssl_certificate_key /etc/nginx/ssl/api.hyqingren.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
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
  -v /root/docker_home/nginx-server/conf.d:/etc/nginx/conf.d \
  -v /root/docker_home/nginx-server/logs:/var/log/nginx \
  -v /root/docker_home/nginx-server/html:/usr/share/nginx/html \
  -v /root/docker_home/nginx-server/ssl:/etc/nginx/ssl \
  registry.cn-hangzhou.aliyuncs.com/hongyan-service/nginx:alpine
```

---

## 目录结构总览

```
/root/docker_home/
├── helper-redis/
│   └── data/              # Redis 持久化数据
├── nginx-server/
│   ├── conf.d/             # Nginx 站点配置
│   ├── logs/               # Nginx 访问/错误日志
│   ├── html/               # 静态文件
│   └── ssl/                # SSL 证书
├── helper-api-service/     # deploy.sh 自动管理
│   ├── logs/
│   ├── data/
│   └── uploads/            # 上传的图片文件（容器内外共享）

```
