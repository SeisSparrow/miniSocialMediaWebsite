# 快速开始指南 🚀

本指南将帮助你在 5 分钟内运行这个社交网站项目。

## 第一步：安装依赖（已完成 ✅）

```bash
npm install
```

## 第二步：配置 Firebase

### 2.1 创建 Firebase 项目

1. 访问 https://console.firebase.google.com/
2. 点击"创建项目"
3. 输入项目名称，点击继续
4. 完成项目创建

### 2.2 添加 Web 应用

1. 在项目概览中，点击 Web 图标 `</>`
2. 输入应用名称，点击注册
3. 复制显示的配置代码

### 2.3 更新配置文件

打开 `src/firebase.js`，将配置信息替换为你的：

```javascript
const firebaseConfig = {
  apiKey: "你的API密钥",
  authDomain: "你的项目.firebaseapp.com",
  projectId: "你的项目ID",
  storageBucket: "你的项目.appspot.com",
  messagingSenderId: "你的发送者ID",
  appId: "你的应用ID"
};
```

### 2.4 启用 Authentication

1. 左侧菜单 → Authentication → Get started
2. Sign-in method → Email/Password → Enable → Save

### 2.5 创建 Firestore Database

1. 左侧菜单 → Firestore Database → 创建数据库
2. 选择"测试模式"（用于开发）
3. 选择区域（推荐 asia-east1 或 asia-northeast1）
4. 点击启用

### 2.6 设置安全规则

在 Firestore Database → 规则，粘贴以下内容：

```
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

点击"发布"。

## 第三步：运行项目

```bash
npm run dev
```

浏览器访问：http://localhost:5173

## 第四步：测试功能

1. **注册账号**
   - 输入邮箱和密码（至少6位）
   - 点击注册

2. **发布消息**
   - 登录后会看到"发布新消息"表单
   - 输入标题和内容
   - 点击发布

3. **查看消息**
   - 所有消息会以卡片形式展示
   - 自动实时更新

4. **编辑/删除**
   - 自己的消息卡片底部会显示"编辑"和"删除"按钮
   - 点击编辑可以修改消息
   - 点击删除可以删除消息

## 功能清单 ✨

- ✅ 用户注册和登录
- ✅ 发布消息（标题 + 内容）
- ✅ 实时查看所有消息
- ✅ 编辑自己的消息
- ✅ 删除自己的消息
- ✅ 美观的卡片布局
- ✅ 响应式设计（支持手机）
- ✅ 渐变色背景
- ✅ 悬浮动画效果

## 项目结构

```
src/
├── components/
│   ├── Auth.jsx              # 登录/注册组件
│   ├── CreateMessage.jsx     # 发布消息组件
│   ├── MessageList.jsx       # 消息列表组件
│   └── MessageCard.jsx       # 单个消息卡片组件
├── App.jsx                   # 主应用
├── firebase.js               # Firebase 配置
└── main.jsx                  # 入口文件
```

## 常见问题

### ❓ 无法登录？

- 检查 Firebase Authentication 是否启用了 Email/Password
- 检查 firebase.js 配置是否正确

### ❓ 无法发布消息？

- 确保已登录
- 检查 Firestore 安全规则是否设置正确
- 查看浏览器控制台错误信息

### ❓ 看不到消息？

- 检查 Firestore Database 是否已创建
- 确认安全规则允许读取：`allow read: if true;`

## 下一步

- 📖 阅读完整的 [README.md](./README.md)
- 🔧 查看详细的 [Firebase 配置指南](./FIREBASE_SETUP.md)
- 🎨 自定义样式和功能

## 需要帮助？

查看浏览器控制台（F12）的错误信息，或参考：
- [Firebase 官方文档](https://firebase.google.com/docs)
- [React 官方文档](https://react.dev/)
- [Vite 官方文档](https://vitejs.dev/)

祝你使用愉快！🎉


