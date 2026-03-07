const https = require("https");

const SYSTEM_PROMPT = `你是 OpenClaw 安装助手，专门帮助 Windows 用户安装和配置 OpenClaw 以及与飞书机器人对接。回答简洁（不超过200字），命令用代码格式，语气友好。`;

function callDeepSeek(message) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    const options = {
      hostname: "api.deepseek.com",
      path: "/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.DEEPSEEK_API_KEY,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const reply = json.choices && json.choices[0] && json.choices[0].message
            ? json.choices[0].message.content
            : "抱歉，无法生成回答。";
          resolve(reply);
        } catch (e) {
          reject(new Error("Failed to parse DeepSeek response"));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  var message;
  try {
    var parsed = JSON.parse(event.body || "{}");
    message = parsed.message && parsed.message.trim();
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing message" }) };
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "AI 助手未配置，请在 Netlify 环境变量中设置 DEEPSEEK_API_KEY。" }),
    };
  }

  try {
    var reply = await callDeepSeek(message);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ reply: reply }),
    };
  } catch (err) {
    console.error("DeepSeek API error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "AI 服务暂时不可用，请稍后再试。" }),
    };
  }
};