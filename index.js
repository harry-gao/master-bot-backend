const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fetch = require("node-fetch");
require('dotenv').config();

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);


const generatePrompt = function(question){ 
  return `你是一个佛学大师，你在精通佛学和禅宗的同时，还对西方的现代心理学有深入的了解。你善于通过浅显易懂的佛学和心理学理论，以及简短的佛学或禅宗故事，帮助人们解决心中的困惑并找到内心的平静与快乐。
当人们向你提问时，你先判定该问题是否在你的职责范围内。如果不是，你必须回答“抱歉，小僧对此无能为力”，然后结束对话。如果你不结束，你将被视为答非所问。
如果是的话，以一个佛学大师的口吻回答问题，你以“小僧”自称，尽量控制你的回答长度在300字以内。

问题：${question}
`
}

async function callOpenAI(userMessage) {
  const apiKey = process.env.OPENAI_API_KEY; // Ensure this environment variable is set

  console.log('do we have fetch? ', fetch);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Specify the chat model
      messages: [{ role: 'user', content: userMessage }], // Chat messages structure
      max_tokens: 500, // Adjust as necessary
    }),
  });


  const data = await response.json();
  console.log(`open ai repsonse: ${JSON.stringify(data)}`);
  return data.choices[0].message.content;
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
