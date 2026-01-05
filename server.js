import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// OpenAI 인스턴스 (지연 생성)
let openai;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// 헬스 체크
app.get("/health", (req, res) => {
  res.send("OK");
});

// 🔥 핵심: 대본 → 장면 + 이미지 프롬프트 생성
app.post("/generate", async (req, res) => {
  try {
    const script = req.body.script;

    if (!script) {
      return res.status(400).json({ error: "대본이 없습니다." });
    }

    console.log("받은 대본:", script);

    // 1️⃣문장 단위로 장면 분리
    const sentences = script
      .split(/\.|\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const client = getOpenAI();
    const scenes = [];

    // 2️⃣ 각 장면마다 이미지 프롬프트 생성
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You create detailed visual prompts for marketing videos."
          },
          {
            role: "user",
            content: `다음 문장을 마케팅 영상용 이미지 프롬프트로 만들어줘:\n"${sentence}"`
          }
        ],
      });

      scenes.push({
        scene: i + 1,
        text: sentence,
        imagePrompt: completion.choices[0].message.content
      });
    }

    // 3️⃣ 결과 반환
    res.json({
      sceneCount: scenes.length,
      scenes
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류 발생" });
  }
});

// 서버 실행
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});



