# ☁️ Cloudflare 域名配置指南

本文档详细说明如何通过 Cloudflare 域名访问你的迷你社交网站。

---

## 📋 准备工作

### 你需要：

- ✅ 一个域名（可以在 Cloudflare 购买，或将现有域名转入）
- ✅ Cloudflare 账号（免费）
- ✅ 服务器公网 IP：`3.142.202.216`

### 如果还没有域名

1. 访问 [Cloudflare 域名注册](https://www.cloudflare.com/products/registrar/)
2. 搜索并购买域名（通常 .com 约 $10-15/年）
3. 域名会自动添加到你的 Cloudflare 账户

### 如果已有域名

1. 访问 [Cloudflare](https://dash.cloudflare.com/)
2. 点击"添加站点"
3. 输入域名并按步骤操作
4. 在域名注册商处修改 NS 记录为 Cloudflare 提供的

---

## 🌐 第一步：配置 Cloudflare DNS

### 1. 登录 Cloudflare Dashboard

访问：https://dash.cloudflare.com/

### 2. 选择你的域名

在域名列表中点击你要配置的域名。

### 3. 进入 DNS 设置

左侧菜单 → **DNS** → **Records**

### 4. 添加 A 记录

#### 主域名记录

点击 **添加记录 (Add record)**：

```
类型 (Type): A
名称 (Name): @
IPv4 地址: 3.142.202.216
代理状态: 🟧 已代理 (Proxied)
TTL: Auto
```

点击 **保存 (Save)**

#### WWW 子域名记录（推荐）

再次点击 **添加记录**：

```
类型 (Type): A
名称 (Name): www
IPv4 地址: 3.142.202.216
代理状态: 🟧 已代理 (Proxied)
TTL: Auto
```

点击 **保存**

### 5. 验证 DNS 记录

你应该看到：

| 类型 | 名称 | 内容 | 代理状态 | TTL |
|------|------|------|----------|-----|
| A | @ | 3.142.202.216 | 🟧 已代理 | Auto |
| A | www | 3.142.202.216 | 🟧 已代理 | Auto |

---

## 🔧 第二步：修改 Nginx 配置

### 在服务器上执行

```bash
# 1. SSH 连接到服务器
ssh ubuntu@3.142.202.216

# 2. 编辑 Nginx 配置
sudo nano /etc/nginx/sites-available/mini-social-media
```

### 修改配置文件

找到 `server_name` 行并修改为你的域名。

**修改前**：
```nginx
server_name _;
```

**修改后**（替换 `example.com` 为你的实际域名）：
```nginx
server_name example.com www.example.com;
```

**完整配置示例**：

```nginx
server {
    listen 80;
    listen [::]:80;
    
    # 替换为你的实际域名
    server_name example.com www.example.com;
    
    root /var/www/mini-social-media/dist;
    index index.html;
    
    access_log /var/log/nginx/mini-social-media-access.log;
    error_log /var/log/nginx/mini-social-media-error.log;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json;
    
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 保存并重启

```bash
# 保存：Ctrl + O，回车
# 退出：Ctrl + X

# 测试配置
sudo nginx -t

# 应该显示：
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 重启 Nginx
sudo systemctl reload nginx

# 检查状态
sudo systemctl status nginx
```

---

## ✅ 第三步：验证配置

### 1. 检查 DNS 生效

在本地电脑运行：

```bash
# 方式一：使用 nslookup
nslookup your-domain.com

# 方式二：使用 ping
ping your-domain.com

# 应该显示 IP：3.142.202.216
```

**注意**：DNS 通常 1-5 分钟生效，最多可能需要 24 小时。

### 2. 访问网站

在浏览器打开：

```
http://your-domain.com
```

或

```
http://www.your-domain.com
```

你应该能看到你的迷你社交网站了！🎉

### 3. 测试功能

- [ ] 网站能正常打开
- [ ] 可以注册/登录
- [ ] 可以发布消息
- [ ] 可以编辑/删除消息

---

## 🔒 第四步：配置 SSL/HTTPS（强烈推荐）

### 方式一：Cloudflare Flexible SSL（最简单）⭐

这是最简单的方式，无需在服务器上配置任何东西。

#### 1. 启用 SSL

在 Cloudflare Dashboard：

**SSL/TLS** → **概述 (Overview)**

选择加密模式：
- **灵活 (Flexible)** ← 选这个（最简单）

**说明**：
- 用户 ← HTTPS → Cloudflare ← HTTP → 服务器
- 用户到 Cloudflare 是加密的
- Cloudflare 到服务器是明文（但在私有网络中）

#### 2. 强制 HTTPS

**SSL/TLS** → **边缘证书 (Edge Certificates)**

启用以下选项：
- ✅ **始终使用 HTTPS (Always Use HTTPS)**
- ✅ **自动 HTTPS 重写 (Automatic HTTPS Rewrites)**
- ✅ **最低 TLS 版本 (Minimum TLS Version)**: TLS 1.2

#### 3. 测试

访问：
```
https://your-domain.com
```

应该显示🔒安全连接！

**自动跳转测试**：
```
http://your-domain.com
```

应该自动跳转到 HTTPS。

---

### 方式二：Cloudflare Full SSL（推荐）⭐⭐⭐

更安全的方式，使用 Cloudflare Origin 证书。

#### 1. 生成 Origin 证书

在 Cloudflare Dashboard：

**SSL/TLS** → **源服务器 (Origin Server)** → **创建证书 (Create Certificate)**

配置：
- 私钥类型：RSA (2048)
- 主机名：`your-domain.com, *.your-domain.com`
- 证书有效期：15 年
- 点击 **创建**

**重要**：保存两个内容：
1. **源证书 (Origin Certificate)** - 完整复制
2. **私钥 (Private Key)** - 完整复制

#### 2. 在服务器上安装证书

```bash
# SSH 到服务器
ssh ubuntu@3.142.202.216

# 创建证书目录
sudo mkdir -p /etc/nginx/ssl

# 创建证书文件
sudo nano /etc/nginx/ssl/cloudflare-origin.crt
# 粘贴刚才复制的"源证书"内容
# 保存并退出

# 创建私钥文件
sudo nano /etc/nginx/ssl/cloudflare-origin.key
# 粘贴刚才复制的"私钥"内容
# 保存并退出

# 设置权限
sudo chmod 600 /etc/nginx/ssl/cloudflare-origin.key
sudo chmod 644 /etc/nginx/ssl/cloudflare-origin.crt
```

#### 3. 修改 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/mini-social-media
```

修改为以下内容：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name example.com www.example.com;
    
    # Cloudflare Origin 证书
    ssl_certificate /etc/nginx/ssl/cloudflare-origin.crt;
    ssl_certificate_key /etc/nginx/ssl/cloudflare-origin.key;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    root /var/www/mini-social-media/dist;
    index index.html;
    
    access_log /var/log/nginx/mini-social-media-ssl-access.log;
    error_log /var/log/nginx/mini-social-media-ssl-error.log;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json;
    
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### 4. 测试并重启

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl reload nginx
```

#### 5. 在 Cloudflare 选择 Full 模式

**SSL/TLS** → **概述** → 选择：
- **完全 (Full)** ← 选这个

#### 6. 测试 HTTPS

访问：`https://your-domain.com`

应该看到🔒安全连接，且证书有效！

---

### 方式三：Let's Encrypt（Full Strict）

如果你想要最高安全级别：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 按提示操作
```

然后在 Cloudflare 选择：
- **完全（严格）(Full Strict)**

---

## 🚀 Cloudflare 优化设置

### 1. 速度优化

**速度 (Speed)** → **优化 (Optimization)**

启用：
- ✅ **Auto Minify** - 自动压缩
  - JavaScript
  - CSS
  - HTML
- ✅ **Brotli** - 高效压缩算法
- ✅ **Early Hints** - 更快加载
- ✅ **HTTP/2 to Origin** - HTTP/2 支持
- ✅ **HTTP/3 (with QUIC)** - 最新协议

### 2. 缓存配置

**缓存 (Caching)** → **配置 (Configuration)**

- **缓存级别**: 标准
- **浏览器缓存 TTL**: 4 小时
- ✅ **始终在线 (Always Online)** - 服务器宕机时显示缓存

**缓存规则**（可选）：

创建页面规则缓存静态资源：
```
URL: *your-domain.com/*.js
URL: *your-domain.com/*.css
URL: *your-domain.com/*.jpg
URL: *your-domain.com/*.png

设置: Cache Level = Cache Everything
Edge Cache TTL = 1 month
```

### 3. 安全设置

**安全性 (Security)** → **设置**

- **安全级别**: 中等
- ✅ **Bot Fight Mode** - 机器人防护
- ✅ **Challenge Passage** - 30 分钟
- ✅ **Browser Integrity Check** - 浏览器完整性检查

### 4. 防火墙规则（可选）

**安全性** → **WAF** → **防火墙规则**

创建规则保护你的网站：

```
名称: 阻止恶意 IP
字段: IP Source Address
运算符: equals
值: (已知恶意 IP)
操作: Block
```

### 5. Page Rules（页面规则）

**规则 (Rules)** → **页面规则 (Page Rules)**

#### 强制 HTTPS
```
URL: http://*your-domain.com/*
设置: Always Use HTTPS
```

#### 缓存 API 响应（如果有）
```
URL: *your-domain.com/api/*
设置: Cache Level = Bypass
```

---

## 📊 性能测试

配置完成后，测试你的网站性能：

### 1. SSL 测试

访问：https://www.ssllabs.com/ssltest/

输入你的域名，应该得到 A 或 A+ 评分。

### 2. 速度测试

访问：https://www.webpagetest.org/

或：https://pagespeed.web.dev/

测试网站加载速度。

### 3. Cloudflare Analytics

在 Cloudflare Dashboard → **分析 (Analytics)**

查看：
- 请求数
- 带宽使用
- 缓存命中率
- 威胁拦截

---

## 🔍 故障排查

### DNS 未生效

**症状**：`nslookup` 显示旧 IP 或无法解析

**解决**：
1. 等待更长时间（最多 24 小时）
2. 清除本地 DNS 缓存：
   ```bash
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### HTTPS 显示不安全

**症状**：浏览器显示证书错误

**解决**：
1. 确认 Cloudflare SSL 模式正确
2. 如果使用 Full，确认服务器证书已安装
3. 检查 Nginx 配置中的证书路径
4. 查看 Nginx 错误日志：
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   ```

### 502 Bad Gateway

**症状**：Cloudflare 显示 502 错误

**解决**：
1. 检查源服务器是否在线
2. 检查 Nginx 是否运行：`sudo systemctl status nginx`
3. 暂时禁用 Cloudflare 代理（橙色云改为灰色云）
4. 直接访问服务器 IP 测试

### 重定向过多

**症状**：浏览器显示"重定向次数过多"

**解决**：
1. Cloudflare SSL 模式改为 Flexible 或 Full
2. 检查 Nginx 配置中的重定向规则
3. 不要在 Nginx 和 Cloudflare 同时强制 HTTPS

---

## 📱 移动端优化

### 1. 启用 AMP（加速移动页面）

如果你的应用支持 AMP，在 Cloudflare 启用。

### 2. 图片优化

**速度** → **优化** → **图片优化**

- ✅ **Polish** - 自动压缩图片（Pro 方案）
- ✅ **Mirage** - 移动端图片优化

### 3. 移动重定向

如果有移动版网站，可以设置重定向规则。

---

## 🎯 推荐配置总结

### 免费方案（Cloudflare Free）

- ✅ DNS 代理（橙色云）
- ✅ Flexible SSL
- ✅ Always Use HTTPS
- ✅ Auto Minify (JS, CSS, HTML)
- ✅ Brotli
- ✅ HTTP/2, HTTP/3
- ✅ Bot Fight Mode

### 升级方案（如果需要）

- **Pro ($20/月)**：Polish、Mirage、更多 Page Rules
- **Business ($200/月)**：高级 DDoS、WAF、更快缓存
- **Enterprise**：专属支持、自定义规则

**对于个人项目，免费方案完全够用！**

---

## ✅ 配置完成检查清单

- [ ] DNS A 记录已添加（@ 和 www）
- [ ] DNS 已生效（nslookup 测试）
- [ ] Nginx server_name 已修改
- [ ] Nginx 配置测试通过
- [ ] Nginx 已重启
- [ ] HTTP 访问正常
- [ ] SSL/TLS 已配置
- [ ] HTTPS 访问正常
- [ ] HTTP 自动跳转 HTTPS
- [ ] Cloudflare 优化已启用
- [ ] 网站功能测试通过

---

## 🎉 恭喜！

你的迷你社交网站现在可以通过专业域名访问了！

访问：`https://your-domain.com` 🚀

---

## 📚 相关资源

- [Cloudflare 官方文档](https://developers.cloudflare.com/)
- [SSL/TLS 最佳实践](https://www.cloudflare.com/learning/ssl/what-is-ssl/)
- [CDN 加速原理](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查

需要帮助？检查 Cloudflare 错误代码：https://support.cloudflare.com/hc/en-us/articles/115003011431

