import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `你是 OpenClaw 安装助手，专门帮助 Windows 用户安装和配置 OpenClaw（一个基于 AI 的自动化 agent 框架）以及与飞书机器人对接。

你的知识库包含：
- Node.js 和 Git 的安装步骤
- npm 淘宝镜像源配置方法
- OpenClaw 核心安装（npm install -g openclaw@latest）和配置向导（openclaw onboard --install-daemon）
- 飞书开放平台创建企业自建应用、配置权限（im:message 等）、事件订阅（接收消息 v2.0，长连接方式）
- OpenClaw 飞书插件安装（@overlink/openclaw-feishu）及连接配置命令
- 常见错误排查：spawn npm ENOENT、npm 下载慢、Gateway is not running、机器人无法收消息等
- 常用命令：openclaw status、openclaw gateway start/stop/restart、openclaw doctor、openclaw logs 等

回答原则：
1. 用中文回答，简洁明了，不超过 200 字
2. 如果是命令，用代码格式展示
3. 如果问题不在知识范围内，建议用户到 B站 ValleyAI 视频下方留言或查阅阿里云开发者社区
4. 语气友好，鼓励用户`;

export const handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Parse body
  let message;
  try {
    const body = JSON.parse(event.body || "{}");
    message = body.message?.trim();
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing message" }),
    };
  }

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" }),
    };
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    const reply =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "抱歉，无法生成回答。";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Anthropic API error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI service error", reply: "AI 服务暂时不可用，请稍后再试。" }),
    };
  }
};
