# 🔧 故障排查指南

本文档列出了部署过程中最常见的问题及其解决方案。

---

## 🚨 最常见问题

### ❗ 网站显示 "Welcome to nginx!" 而不是应用

这是**最常见的问题**！

**原因**：Nginx 默认站点的优先级高于你的配置。

**症状**：
- GitHub Actions 显示部署成功 ✅
- 但浏览器显示 Nginx 默认欢迎页面
- 访问 `http://your-server-ip` 看到 "Welcome to nginx!"

**解决方案（在服务器上执行）**：

```bash
# 1. 删除默认站点
sudo rm /etc/nginx/sites-enabled/default

# 2. 验证只剩下你的站点
ls -la /etc/nginx/sites-enabled/
# 应该只看到 mini-social-media，没有 default

# 3. 测试 Nginx 配置
sudo nginx -t

# 4. 重启 Nginx
sudo systemctl restart nginx

# 5. 强制刷新浏览器
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

**为什么会这样？**
- 新安装的 Nginx 默认启用了一个演示站点
- 如果多个站点监听同一端口（80），第一个会被使用
- `default` 站点通常排在前面

---

## 🔍 部署相关问题

### ❓ GitHub Actions 部署失败

**症状**：Actions 运行显示红色 ❌

**可能原因**：

#### 1. SSH 连接失败

```bash
# 检查 GitHub Secrets 是否正确设置
# Settings → Secrets → Actions

# 必需的 5 个 Secrets：
SERVER_HOST=你的服务器IP或域名
SERVER_USERNAME=ubuntu (或其他用户名)
SERVER_SSH_KEY=完整的私钥内容
SERVER_PORT=22
DEPLOY_PATH=/var/www/mini-social-media/dist
```

**验证 SSH 连接**：
```bash
# 在本地电脑测试
ssh ubuntu@your-server-ip

# 如果无法连接，检查：
# 1. 服务器防火墙是否开放 22 端口
# 2. SSH 密钥是否正确
# 3. 用户名是否正确
```

#### 2. 文件权限问题

**错误信息**：`Cannot open: File exists` 或 `Operation not permitted`

**解决方案（在服务器上）**：
```bash
# 删除旧文件并重新创建目录
sudo rm -rf /var/www/mini-social-media/dist
sudo mkdir -p /var/www/mini-social-media/dist

# 修改所有者为 ubuntu（或你的用户名）
sudo chown -R ubuntu:ubuntu /var/www/mini-social-media

# 设置权限
chmod -R 755 /var/www/mini-social-media

# 验证权限
ls -la /var/www/mini-social-media/
```

#### 3. 部署路径不存在

**解决方案（在服务器上）**：
```bash
# 确保目录存在
sudo mkdir -p /var/www/mini-social-media/dist
sudo chown -R $USER:$USER /var/www/mini-social-media
```

---

## 🌐 Nginx 相关问题

### ❓ 网站显示 403 Forbidden

**原因**：Nginx 没有读取文件的权限

**解决方案**：

```bash
# 方式一：修改文件所有者为 www-data
sudo chown -R www-data:www-data /var/www/mini-social-media
sudo chmod -R 755 /var/www/mini-social-media

# 方式二：修改 Nginx 运行用户（不推荐）
# 编辑 /etc/nginx/nginx.conf
# 将 user www-data; 改为 user ubuntu;
```

**检查 SELinux（CentOS/RHEL）**：
```bash
# 临时禁用 SELinux
sudo setenforce 0

# 永久禁用（编辑 /etc/selinux/config）
SELINUX=disabled
```

### ❓ 网站显示 502 Bad Gateway

**原因**：Nginx 配置错误或服务未运行

**解决步骤**：

```bash
# 1. 检查 Nginx 状态
sudo systemctl status nginx

# 2. 如果未运行，启动它
sudo systemctl start nginx

# 3. 测试配置文件
sudo nginx -t

# 4. 查看错误日志
sudo tail -30 /var/log/nginx/error.log

# 5. 重启 Nginx
sudo systemctl restart nginx
```

### ❓ 网站显示 404 Not Found

**原因**：文件不存在或路径配置错误

**检查步骤**：

```bash
# 1. 检查 dist 目录是否有文件
ls -la /var/www/mini-social-media/dist/

# 2. 检查 index.html 是否存在
cat /var/www/mini-social-media/dist/index.html | head -10

# 3. 检查 Nginx 配置中的 root 路径
sudo grep "root" /etc/nginx/sites-available/mini-social-media
# 应该显示：root /var/www/mini-social-media/dist;

# 4. 如果文件不存在，重新部署
# 在本地推送代码触发 GitHub Actions
git push origin main
```

---

## 🔑 SSH 相关问题

### ❓ SSH 私钥格式错误

**症状**：GitHub Actions 提示 SSH 密钥无效

**正确的私钥格式**：

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(多行私钥内容)
...
-----END RSA PRIVATE KEY-----
```

**重要**：
- 必须包含 `-----BEGIN` 和 `-----END` 行
- 不要有额外的空格或换行
- 复制完整内容

**获取私钥**：
```bash
# 在服务器上
cat ~/.ssh/id_rsa

# 如果不存在，生成新的
ssh-keygen -t rsa -b 4096 -C "deploy@mini-social-media" -N ""
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## 🔥 Firebase 相关问题

### ❓ Firebase 连接失败

**症状**：网站打开后无法注册/登录

**检查步骤**：

```bash
# 1. 打开浏览器开发者工具（F12）
# 2. 查看 Console 标签的错误信息

# 常见错误：
# - API key invalid: Firebase 配置错误
# - Network error: 防火墙问题
# - Permission denied: Firestore 规则问题
```

**解决方案**：

1. **检查 Firebase 配置**：
   - 打开 `src/firebase.js`
   - 确认所有配置项正确
   - 确认 `apiKey`, `projectId` 等与 Firebase Console 一致

2. **检查 Firestore 规则**：
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /messages/{messageId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null 
           && request.auth.uid == resource.data.authorId;
       }
     }
   }
   ```

3. **检查 Authentication 设置**：
   - Firebase Console → Authentication
   - 确认 Email/Password 已启用

### ❓ 无法注册用户

**常见错误消息**：

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `auth/email-already-in-use` | 邮箱已注册 | 使用其他邮箱或登录 |
| `auth/invalid-email` | 邮箱格式错误 | 检查邮箱格式 |
| `auth/weak-password` | 密码太弱 | 至少 6 个字符 |
| `auth/operation-not-allowed` | Email/Password 未启用 | 在 Firebase Console 启用 |

---

## 🌍 网络相关问题

### ❓ 无法访问服务器

**检查步骤**：

```bash
# 1. 检查服务器是否运行
# 登录云服务器控制台查看实例状态

# 2. 检查防火墙
sudo ufw status
# 应该显示：
# 80/tcp    ALLOW
# 443/tcp   ALLOW

# 3. 检查安全组（AWS/阿里云等）
# 在云服务器控制台检查安全组规则
# 入站规则应包含：
# - HTTP (80)
# - HTTPS (443)
# - SSH (22)

# 4. Ping 测试
ping your-server-ip

# 5. 端口测试
telnet your-server-ip 80
```

### ❓ 修改代码后网站没更新

**GitHub Actions 部署**：

```bash
# 1. 检查 Actions 是否成功运行
# GitHub 仓库 → Actions → 查看最新 workflow

# 2. 如果成功但网站未更新，清除浏览器缓存
# Chrome: Ctrl + Shift + Delete
# 或强制刷新：Ctrl + Shift + R (Mac: Cmd + Shift + R)

# 3. 检查服务器上的文件时间戳
ssh ubuntu@your-server-ip
ls -lt /var/www/mini-social-media/dist/
# 查看文件修改时间是否是最新的
```

**手动部署**：

```bash
# 重新运行部署脚本
./deploy.sh
```

---

## 🛠️ 诊断工具

### 完整健康检查脚本

在服务器上运行此脚本来诊断所有常见问题：

```bash
#!/bin/bash

echo "=== 迷你社交网站健康检查 ==="
echo ""

# 1. 检查 Nginx 状态
echo "📊 Nginx 状态:"
sudo systemctl status nginx | grep Active

# 2. 检查启用的站点
echo ""
echo "🌐 启用的站点:"
ls -la /etc/nginx/sites-enabled/

# 3. 检查文件权限
echo ""
echo "📁 文件权限:"
ls -la /var/www/mini-social-media/dist/ | head -10

# 4. 检查 Nginx 配置
echo ""
echo "⚙️  Nginx 配置测试:"
sudo nginx -t

# 5. 检查端口监听
echo ""
echo "🔌 端口监听:"
sudo netstat -tlnp | grep nginx

# 6. 检查防火墙
echo ""
echo "🔥 防火墙状态:"
sudo ufw status | grep -E "80|443"

# 7. 最近的 Nginx 错误
echo ""
echo "❌ 最近的错误 (如有):"
sudo tail -5 /var/log/nginx/error.log

echo ""
echo "=== 检查完成 ==="
```

保存为 `health-check.sh`，然后：

```bash
chmod +x health-check.sh
./health-check.sh
```

---

## 📞 获取更多帮助

如果以上方案都无法解决问题：

### 1. 收集诊断信息

```bash
# 在服务器上运行
sudo nginx -t > nginx-test.txt 2>&1
sudo systemctl status nginx > nginx-status.txt
ls -laR /var/www/mini-social-media/ > file-list.txt
sudo tail -50 /var/log/nginx/error.log > nginx-errors.txt
```

### 2. 查看日志

- **Nginx 访问日志**：`/var/log/nginx/mini-social-media-access.log`
- **Nginx 错误日志**：`/var/log/nginx/mini-social-media-error.log`
- **GitHub Actions 日志**：仓库 → Actions → 点击 workflow
- **浏览器控制台**：F12 → Console 标签

### 3. 参考文档

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 完整部署指南
- [部署说明.md](./部署说明.md) - 快速部署说明
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Firebase 文档](https://firebase.google.com/docs)

---

## ✅ 快速检查清单

遇到问题时，按此顺序检查：

- [ ] 删除了 Nginx 默认站点？(`sudo rm /etc/nginx/sites-enabled/default`)
- [ ] Nginx 配置测试通过？(`sudo nginx -t`)
- [ ] Nginx 服务正在运行？(`sudo systemctl status nginx`)
- [ ] 文件权限正确？(`ls -la /var/www/mini-social-media/dist/`)
- [ ] dist 目录有文件？(`ls /var/www/mini-social-media/dist/index.html`)
- [ ] 防火墙开放 80 端口？(`sudo ufw status`)
- [ ] 浏览器已强制刷新？(Ctrl+Shift+R)
- [ ] GitHub Secrets 设置正确？(5 个 secrets 都有)
- [ ] Firebase 配置正确？(检查 `src/firebase.js`)

如果全部打勾仍有问题，查看具体的错误日志！

---

**记住**：90% 的部署问题都是由以下 3 个原因造成的：
1. ❌ 没有删除 Nginx 默认站点
2. ❌ 文件权限不正确
3. ❌ GitHub Secrets 设置错误

先检查这三项！🎯

