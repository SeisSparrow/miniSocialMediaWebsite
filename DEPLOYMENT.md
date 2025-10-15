# 🚀 部署指南 - GitHub Actions + Nginx

本文档详细说明如何使用 GitHub Actions 自动部署项目到服务器，并使用 Nginx 提供 Web 服务。

---

## 📋 目录

1. [部署架构](#部署架构)
2. [服务器准备](#服务器准备)
3. [GitHub Actions 配置](#github-actions-配置)
4. [Nginx 配置](#nginx-配置)
5. [SSL 证书配置](#ssl-证书配置)
6. [自动化部署流程](#自动化部署流程)
7. [故障排查](#故障排查)

---

## 🏗️ 部署架构

```
开发环境 (本地)
    ↓
  Git Push
    ↓
GitHub Repository (代码仓库)
    ↓
GitHub Actions (自动构建)
    ↓
SSH 部署到服务器
    ↓
Nginx 服务器 (提供 Web 访问)
    ↓
用户访问 (浏览器)
```

---

## 🖥️ 服务器准备

### 1. 服务器要求

- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **内存**: 至少 1GB RAM
- **存储**: 至少 10GB 可用空间
- **网络**: 公网 IP 地址
- **权限**: sudo 权限

### 2. 安装必要软件

#### 2.1 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

#### 2.2 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS
sudo yum install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

#### 2.3 配置防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# CentOS (FirewallD)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 创建部署目录

```bash
# 创建网站目录
sudo mkdir -p /var/www/mini-social-media/dist

# 设置权限（替换 your-username 为你的用户名）
sudo chown -R $USER:$USER /var/www/mini-social-media
sudo chmod -R 755 /var/www/mini-social-media
```

### 4. 配置 SSH 密钥

#### 4.1 生成 SSH 密钥（在服务器上）

```bash
# 如果还没有 SSH 密钥，生成一个
ssh-keygen -t rsa -b 4096 -C "deploy@mini-social-media"

# 查看公钥
cat ~/.ssh/id_rsa.pub

# 添加到授权列表
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### 4.2 获取私钥（用于 GitHub Secrets）

```bash
# 查看私钥（完整复制，包括开头和结尾）
cat ~/.ssh/id_rsa
```

**重要**: 复制整个私钥内容，包括：
```
-----BEGIN RSA PRIVATE KEY-----
... (私钥内容) ...
-----END RSA PRIVATE KEY-----
```

---

## ⚙️ GitHub Actions 配置

### 1. 设置 GitHub Secrets

在你的 GitHub 仓库中设置以下 Secrets：

1. 进入仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 Secrets：

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `SERVER_HOST` | 服务器 IP 或域名 | `123.456.78.90` 或 `your-domain.com` |
| `SERVER_USERNAME` | SSH 用户名 | `ubuntu` 或 `root` |
| `SERVER_SSH_KEY` | SSH 私钥 | 前面获取的完整私钥内容 |
| `SERVER_PORT` | SSH 端口 | `22` (默认) |
| `DEPLOY_PATH` | 部署路径 | `/var/www/mini-social-media/dist` |

### 2. GitHub Actions Workflow 文件

Workflow 文件已创建在：`.github/workflows/deploy.yml`

**工作流程说明**：

1. ✅ 检出代码
2. ✅ 设置 Node.js 环境
3. ✅ 安装依赖
4. ✅ 构建项目（生成 dist 目录）
5. ✅ 通过 SSH 上传到服务器
6. ✅ 重启 Nginx

### 3. 测试 GitHub Actions

```bash
# 1. 提交代码
git add .
git commit -m "Add deployment workflow"
git push origin main

# 2. 在 GitHub 仓库页面查看
# Actions → 查看工作流运行状态
```

---

## 🌐 Nginx 配置

### 1. 创建 Nginx 配置文件

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/mini-social-media
```

### 2. 复制配置内容

将项目中的 `nginx.conf` 文件内容复制到上面的文件中，并修改以下内容：

```nginx
server_name your-domain.com www.your-domain.com;  # 改为你的域名或 IP
```

### 3. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/mini-social-media /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 如果测试通过，重启 Nginx
sudo systemctl restart nginx
```

### 4. 验证部署

访问你的服务器 IP 或域名：
```
http://your-domain.com
或
http://123.456.78.90
```

---

## 🔒 SSL 证书配置（HTTPS）

### 方式一：使用 Let's Encrypt（免费，推荐）

#### 1. 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS
sudo yum install certbot python3-certbot-nginx -y
```

#### 2. 获取 SSL 证书

```bash
# 自动配置（推荐）
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 按照提示输入邮箱和同意条款
```

#### 3. 测试自动续期

```bash
# Let's Encrypt 证书有效期 90 天，需要自动续期
sudo certbot renew --dry-run

# 如果测试成功，证书会自动续期
```

#### 4. 设置自动续期（已自动配置）

```bash
# 检查续期定时任务
sudo systemctl status certbot.timer
```

### 方式二：使用其他 SSL 证书

如果你有其他 SSL 证书（如购买的证书）：

```bash
# 1. 上传证书文件到服务器
/etc/ssl/certs/your-domain.crt
/etc/ssl/private/your-domain.key

# 2. 修改 Nginx 配置
sudo nano /etc/nginx/sites-available/mini-social-media

# 3. 取消注释 HTTPS 部分并修改证书路径
ssl_certificate /etc/ssl/certs/your-domain.crt;
ssl_certificate_key /etc/ssl/private/your-domain.key;

# 4. 重启 Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔄 自动化部署流程

### 完整部署流程

1. **本地开发**
   ```bash
   # 修改代码
   git add .
   git commit -m "Update features"
   git push origin main
   ```

2. **GitHub Actions 自动触发**
   - ✅ 检测到 main 分支有新提交
   - ✅ 自动开始构建流程

3. **自动构建**
   - ✅ 安装依赖
   - ✅ 运行 `npm run build`
   - ✅ 生成 dist 文件夹

4. **自动部署**
   - ✅ 通过 SSH 连接服务器
   - ✅ 上传 dist 文件到服务器
   - ✅ 重启 Nginx

5. **用户访问**
   - ✅ 访问域名即可看到最新版本

### 查看部署状态

在 GitHub 仓库页面：
```
Actions → 选择最新的 workflow run → 查看详细日志
```

---

## 🔧 高级配置

### 1. 环境变量配置

如果需要在构建时使用环境变量：

```yaml
# .github/workflows/deploy.yml
- name: Build project
  run: npm run build
  env:
    NODE_ENV: production
    VITE_API_URL: ${{ secrets.API_URL }}
```

### 2. 多环境部署

创建不同的 workflow 文件：

```
.github/workflows/
  ├── deploy-staging.yml    # 测试环境
  └── deploy-production.yml # 生产环境
```

### 3. 部署前运行测试

```yaml
# 在部署前添加测试步骤
- name: Run tests
  run: npm test
```

### 4. Nginx 性能优化

```nginx
# 在 nginx.conf 中添加
worker_processes auto;
worker_connections 1024;

# HTTP/2 支持
listen 443 ssl http2;

# 开启 gzip 压缩
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
```

---

## 🐛 故障排查

### 问题 1: GitHub Actions 部署失败

**症状**: Actions 运行失败，显示 SSH 连接错误

**解决方案**:
```bash
# 1. 检查 GitHub Secrets 是否正确设置
# 2. 验证 SSH 连接
ssh -i ~/.ssh/id_rsa username@server-ip

# 3. 检查服务器防火墙
sudo ufw status

# 4. 查看 Actions 日志
GitHub → Actions → 点击失败的 workflow → 查看详细错误
```

### 问题 2: Nginx 403 Forbidden

**症状**: 访问网站显示 403 错误

**解决方案**:
```bash
# 1. 检查文件权限
ls -la /var/www/mini-social-media/dist

# 2. 修改权限
sudo chown -R www-data:www-data /var/www/mini-social-media
sudo chmod -R 755 /var/www/mini-social-media

# 3. 检查 SELinux（CentOS）
sudo setenforce 0  # 临时关闭
```

### 问题 3: Nginx 502 Bad Gateway

**症状**: 网站无法访问，显示 502 错误

**解决方案**:
```bash
# 1. 检查 Nginx 配置
sudo nginx -t

# 2. 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 3. 重启 Nginx
sudo systemctl restart nginx
```

### 问题 4: SSL 证书问题

**症状**: HTTPS 访问显示证书错误

**解决方案**:
```bash
# 1. 检查证书状态
sudo certbot certificates

# 2. 手动续期
sudo certbot renew

# 3. 检查证书路径
ls -la /etc/letsencrypt/live/your-domain.com/
```

### 问题 5: 构建失败

**症状**: npm run build 失败

**解决方案**:
```bash
# 1. 本地测试构建
npm run build

# 2. 检查 Node 版本
node -v  # 确保与服务器一致

# 3. 清除缓存重新构建
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 监控和维护

### 1. 查看 Nginx 日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/mini-social-media-access.log

# 错误日志
sudo tail -f /var/log/nginx/mini-social-media-error.log
```

### 2. 监控服务器资源

```bash
# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看 CPU 使用
top
```

### 3. 定期维护

```bash
# 每月更新系统
sudo apt update && sudo apt upgrade -y

# 清理旧日志
sudo find /var/log/nginx/ -name "*.log" -mtime +30 -delete

# 检查 SSL 证书有效期
sudo certbot certificates
```

---

## 📝 部署检查清单

部署前请确认：

- [ ] 服务器已安装 Nginx
- [ ] 防火墙已开放 80 和 443 端口
- [ ] SSH 密钥已配置
- [ ] GitHub Secrets 已正确设置
- [ ] Nginx 配置文件已创建
- [ ] 域名 DNS 已指向服务器 IP
- [ ] SSL 证书已配置（可选）
- [ ] GitHub Actions workflow 已提交

部署后验证：

- [ ] 访问 HTTP 地址能正常打开网站
- [ ] HTTPS 访问正常（如已配置）
- [ ] Firebase 功能正常（注册、登录、发帖）
- [ ] GitHub Actions 部署成功
- [ ] Nginx 日志无错误

---

## 🎯 快速部署命令摘要

```bash
# === 服务器端 ===

# 1. 安装 Nginx
sudo apt install nginx -y

# 2. 创建目录
sudo mkdir -p /var/www/mini-social-media/dist
sudo chown -R $USER:$USER /var/www/mini-social-media

# 3. 配置 Nginx
sudo nano /etc/nginx/sites-available/mini-social-media
sudo ln -s /etc/nginx/sites-available/mini-social-media /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 4. 配置 SSL（可选）
sudo certbot --nginx -d your-domain.com

# === GitHub 端 ===

# 5. 设置 Secrets
# Settings → Secrets → Actions → New repository secret

# 6. 推送代码触发部署
git push origin main
```

---

## 🔗 相关资源

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)
- [Firebase 托管备选方案](https://firebase.google.com/docs/hosting)

---

## 💡 提示

1. **首次部署**建议先在测试环境验证
2. **备份**重要数据和配置文件
3. **监控** GitHub Actions 的运行状态
4. **定期更新** SSL 证书和系统软件
5. **查看日志**以便快速定位问题

---

**祝你部署顺利！** 🚀

如有问题，请查看故障排查部分或检查相关日志文件。

