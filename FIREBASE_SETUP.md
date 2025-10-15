# Firebase 配置指南

本文档详细说明如何设置 Firebase 项目并配置应用。

## 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"或"Create a project"
3. 输入项目名称，例如：`mini-social-media`
4. 选择是否启用 Google Analytics（可选）
5. 点击"创建项目"

## 2. 注册 Web 应用

1. 在项目概览页面，点击 Web 图标 `</>`
2. 输入应用昵称，例如：`Mini Social Media Web`
3. 不需要设置 Firebase Hosting（除非你想部署）
4. 点击"注册应用"

## 3. 获取配置信息

注册应用后，你会看到 Firebase 配置代码，类似这样：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**重要**：复制这些配置信息，你将在下一步使用它们。

## 4. 配置应用

打开项目中的 `src/firebase.js` 文件，将你的 Firebase 配置替换进去：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // 替换为你的 apiKey
  authDomain: "YOUR_AUTH_DOMAIN",      // 替换为你的 authDomain
  projectId: "YOUR_PROJECT_ID",        // 替换为你的 projectId
  storageBucket: "YOUR_STORAGE_BUCKET", // 替换为你的 storageBucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // 替换为你的 messagingSenderId
  appId: "YOUR_APP_ID"                 // 替换为你的 appId
};
```

## 5. 启用 Authentication

1. 在 Firebase Console 左侧菜单，点击"Authentication"
2. 点击"Get started"或"开始使用"
3. 选择"Sign-in method"标签
4. 点击"Email/Password"
5. 启用"Email/Password"选项
6. 点击"保存"

## 6. 创建 Firestore Database

1. 在 Firebase Console 左侧菜单，点击"Firestore Database"
2. 点击"创建数据库"
3. 选择启动模式：
   - **测试模式**（推荐用于开发）：允许任何人读写数据，30天后过期
   - **生产模式**：需要设置安全规则
4. 选择数据库位置（建议选择离你最近的区域）
5. 点击"启用"

## 7. 设置 Firestore 安全规则

创建数据库后，需要设置安全规则以保护数据：

1. 在 Firestore Database 页面，点击"规则"标签
2. 将以下规则复制粘贴到编辑器中：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // messages 集合的规则
    match /messages/{messageId} {
      // 所有人都可以读取消息
      allow read: if true;
      
      // 只有认证用户可以创建消息
      allow create: if request.auth != null
        && request.resource.data.authorId == request.auth.uid;
      
      // 只有消息作者可以更新和删除
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
  }
}
```

3. 点击"发布"

## 8. 安全规则说明

上述规则确保：

- ✅ 任何人（包括未登录用户）都可以读取消息
- ✅ 只有登录用户可以创建消息
- ✅ 创建消息时，authorId 必须与当前用户 ID 匹配
- ✅ 只有消息作者可以更新或删除自己的消息

## 9. 验证配置

完成以上步骤后：

1. 运行 `npm run dev` 启动开发服务器
2. 打开浏览器访问 `http://localhost:5173`
3. 尝试注册一个新用户
4. 发布一条消息
5. 如果一切正常，配置成功！

## 常见问题

### Q: 无法注册或登录？

**A**: 检查以下几点：
- 确认 Authentication 中的 Email/Password 已启用
- 检查 `src/firebase.js` 中的配置是否正确
- 打开浏览器控制台查看错误信息

### Q: 无法发布或查看消息？

**A**: 检查以下几点：
- 确认 Firestore Database 已创建
- 确认安全规则已正确设置
- 检查浏览器控制台的错误信息

### Q: 提示权限错误？

**A**: 
- 检查 Firestore 安全规则是否正确设置
- 确保用户已登录（需要登录才能发布消息）
- 检查是否尝试编辑/删除别人的消息

## 额外配置（可选）

### 配置域名白名单

如果你要部署应用，需要添加域名到授权域名列表：

1. 进入 Authentication → Settings → Authorized domains
2. 点击"添加域"
3. 输入你的域名

### 配置用户数据

你可以在 Firestore 中为用户创建额外的集合来存储用户资料：

```javascript
// 可以在未来扩展用户功能时使用
match /users/{userId} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

## 获取帮助

如果遇到问题：

1. 查看 [Firebase 官方文档](https://firebase.google.com/docs)
2. 查看浏览器控制台的错误信息
3. 检查 Firebase Console 中的日志
4. 提交 GitHub Issue

祝你使用愉快！🎉


