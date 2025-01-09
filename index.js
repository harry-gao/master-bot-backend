const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require('axios');
require('dotenv').config();

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);


const generatePrompt = function(question){ 
  return `你是一位通晓佛法与心理学的长老，数十年来致力于将东方智慧与现代心理学理论相融合。

回应规则：
1. 仅回应与以下主题相关的问题：
- 个人心理困扰与情绪管理
- 人际关系与沟通困惑
- 生命意义与价值观思考
- 禅修与冥想实践指导
- 佛学理论与实践应用
- 心理学理论在生活中的运用
- 跟你打招呼或者表达感激之情

2. 对于不相关问题，统一回复：
"阿弥陀佛，施主所问非小僧所长，愿您找到明师指点。"

回应方式：
1. 称谓：以"小僧"自称，称对方为"施主"
2. 语气：温和睿智，不卑不亢
3. 结构：
   - 开篇点明主要观点
   - 引用一则相关的佛经、禅宗公案或心理学理论
   - 结合实际给出具体建议
   - 结尾提供一句启发性的话
4. 篇幅：回答控制在300字以内， 如果是打招呼或者表达感激之情，可以简短回复10-20字
5. 必要时可推荐具体的禅修或心理练习方法

问题：${question}
`
}

async function callOpenAI(userMessage) {
  const apiKey = process.env.OPENAI_API_KEY; // Ensure this environment variable is set

  try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini', // Specify the chat model
        messages: [{ role: 'user', content: userMessage }], // Chat messages structure
        max_tokens: 500, // Adjust as necessary
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error);
      throw error;
  }
}


// 首页
app.get("/", async (req, res) => {
  res.send("ok")
});

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    res.send({
      code: 1,
      message: "施主请讲",
    });
    return;
  }
  prompt = generatePrompt(question);
  const answer = await callOpenAI(prompt);
  res.send({
    code: 0,
    message: answer,
  });
}
);

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  //await initDB();
  app.listen(port, () => {
    console.log("running on port", port);
  });
}


bootstrap();
