# OpenClaw 安装指南网站

OpenClaw 本地安装 + 飞书对接完全指南，面向 Windows 零基础用户。

## 功能特性

- 📖 分步骤安装教程（Node.js → 镜像源 → OpenClaw → 飞书对接）
- 📋 一键复制所有命令
- 🤖 AI 安装助手（右下角 🦞 图标，由 Claude 驱动）
- 📱 响应式设计，手机也可查阅
- 🔍 常见问题排查 & 命令速查表

---

## 部署到 Netlify

### 方法一：通过 Netlify 网站一键部署

1. 将本项目推送到 GitHub/GitLab
2. 登录 [Netlify](https://app.netlify.com) → New site from Git
3. 选择仓库，Publish directory 填 `.`（根目录）
4. 在 **Site settings → Environment variables** 添加：
   ```
   ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxxxxx
   ```
5. 点击 Deploy site

### 方法二：Netlify CLI 部署

```bash
# 安装依赖
npm install

# 安装 Netlify CLI（全局）
npm install -g netlify-cli

# 本地预览（需先设置环境变量）
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
netlify dev

# 部署
netlify deploy --prod
```

---

## 环境变量说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 密钥，用于驱动右下角 AI 助手 | 是 |

> 没有 API Key？访问 [console.anthropic.com](https://console.anthropic.com) 申请。

---

## 项目结构

```
.
├── index.html                  # 主页面（单文件，含所有样式和脚本）
├── netlify.toml                # Netlify 构建 & 路由配置
├── package.json                # 依赖声明
├── README.md                   # 本文档
└── netlify/
    └── functions/
        └── chat.mjs            # AI 聊天 Serverless 函数
```

---

## 本地开发

```bash
npm install
netlify dev
# 访问 http://localhost:8888
```

---

## AI 助手说明

右下角 🦞 按钮会弹出 AI 安装助手，调用 Netlify Functions（`/netlify/functions/chat`）转发到 Anthropic Claude API。使用 `claude-haiku-4-5-20251001` 模型，针对 OpenClaw 安装场景做了系统提示优化。

如不需要 AI 助手功能，可删除 `netlify/functions/` 目录，并在 `index.html` 中移除 `sendChat` 函数及聊天面板 HTML。

---

## 参考来源

- B站 [ValleyAI](https://space.bilibili.com/) OpenClaw 14天教程
- [阿里云开发者社区](https://developer.aliyun.com/) 实测经验
- [飞书开放平台文档](https://open.feishu.cn/document/)
