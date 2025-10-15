# 🌟 迷你社交网站

一个基于 React + Firebase 的现代化社交媒体平台，支持用户注册登录、发布消息、编辑和删除消息等功能。

## ✨ 功能特性

### 1. 用户系统（Firebase Authentication）
- ✅ 用户注册
- ✅ 用户登录
- ✅ 用户退出登录
- ✅ 只有登录用户才能发帖
- ✅ 只能编辑和删除自己的消息

### 2. 消息系统（Firestore）
- ✅ 发布消息（包含标题、内容、发布人、发布时间）
- ✅ 编辑自己的消息
- ✅ 删除自己的消息
- ✅ 实时消息更新
- ✅ 卡片式展示所有消息
- ✅ 登录和未登录用户都能浏览消息

### 3. 前端界面
- ✅ 现代化渐变背景设计
- ✅ 美观的卡片布局
- ✅ 响应式设计，支持移动端
- ✅ 流畅的动画效果
- ✅ 实时数据同步

## 🚀 快速开始

### 前置要求

- Node.js (v16 或更高版本)
- npm 或 yarn
- Firebase 项目

### 安装步骤

1. **克隆项目**
```bash
git clone <your-repo-url>
cd miniSocialMediaWebsite
```

2. **安装依赖**
```bash
npm install
```

3. **配置 Firebase**

   a. 访问 [Firebase Console](https://console.firebase.google.com/)
   
   b. 创建新项目或选择现有项目
   
   c. 在项目设置中获取 Firebase 配置信息
   
   d. 打开 `src/firebase.js` 文件，替换配置信息：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. **启用 Firebase 服务**

   a. 在 Firebase Console 中启用 **Authentication**
      - 进入 Authentication → Sign-in method
      - 启用 "Email/Password" 登录方式

   b. 在 Firebase Console 中启用 **Firestore Database**
      - 进入 Firestore Database
      - 创建数据库（选择生产模式或测试模式）
      - 设置安全规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      // 所有人都可以读取消息
      allow read: if true;
      
      // 只有认证用户可以创建消息
      allow create: if request.auth != null;
      
      // 只有消息作者可以更新和删除
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
  }
}
```

5. **启动开发服务器**
```bash
npm run dev
```

6. **访问应用**

打开浏览器访问: `http://localhost:5173`

## 📦 项目结构

```
miniSocialMediaWebsite/
├── public/                  # 静态资源
├── src/
│   ├── components/          # React 组件
│   │   ├── Auth.jsx        # 登录/注册组件
│   │   ├── Auth.css
│   │   ├── CreateMessage.jsx   # 创建消息组件
│   │   ├── CreateMessage.css
│   │   ├── MessageList.jsx     # 消息列表组件
│   │   ├── MessageList.css
│   │   ├── MessageCard.jsx     # 消息卡片组件
│   │   └── MessageCard.css
│   ├── App.jsx              # 主应用组件
│   ├── App.css
│   ├── main.jsx             # 入口文件
│   ├── index.css            # 全局样式
│   └── firebase.js          # Firebase 配置
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **后端服务**: Firebase
  - Authentication (用户认证)
  - Firestore (数据库)
- **样式**: CSS3 (包含渐变、动画等现代特性)

## 📱 功能说明

### 未登录用户
- 可以浏览所有消息
- 可以注册新账号
- 可以登录现有账号

### 登录用户
- 可以浏览所有消息
- 可以发布新消息
- 可以编辑自己的消息
- 可以删除自己的消息
- 可以退出登录

## 🎨 界面预览

- **渐变背景**: 紫色系渐变，营造现代科技感
- **卡片设计**: 白色卡片带阴影和悬浮效果
- **响应式布局**: 自适应不同屏幕尺寸
- **实时更新**: 消息实时同步，无需手动刷新

## 🔒 安全性

- Firebase Authentication 提供安全的用户认证
- Firestore 安全规则确保数据访问控制
- 只有消息作者可以编辑/删除自己的消息
- 所有用户都可以浏览消息内容

## 🚧 构建生产版本

```bash
npm run build
```

构建完成后，生成的文件在 `dist` 目录中。

## 📚 相关文档

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 完整部署指南（GitHub Actions + Nginx）
- **[部署说明.md](./部署说明.md)** - 快速部署说明
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - 部署完成总结
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - 故障排查指南 ⭐
- **[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)** - Cloudflare 域名配置指南 ☁️
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase 详细配置
- **[QUICK_START.md](./QUICK_START.md)** - 5分钟快速上手
- **[开始使用.md](./开始使用.md)** - 中文完整使用指南

## 📝 待优化功能

- [ ] 添加用户头像
- [ ] 支持图片上传
- [ ] 添加点赞评论功能
- [ ] 搜索和筛选功能
- [ ] 用户个人主页
- [ ] 消息分页加载

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License