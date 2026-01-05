import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

/* ===============================
   기본 설정
================================ */
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ===============================
   서버 상태 확인
================================ */
app.get("/", (req, res) => {
  res.send("백엔드 서버 정상 작동 중");
});

app.get("/health", (req, res) => {
  res.send("OK");
});

/* ===============================
   대본 수신 테스트 API
================================ */
app.post("/script", (req, res) => {
  const { script } = req.body;

  if (!script) {
    return res.status(400).json({
      message: "대본이 전달되지 않았습니다."
    });
  }

  console.log("받은 대본:", script);

  res.json({
    message: "대본 수신 완료",
    length: script.length
  });
});

/* ===============================
   🎨 이미지 생성 API (핵심)
================================ */
app.post("/generate-images", async (req, res) => {
  const { script } = req.body;

  if (!script) {
    return res.status(400).json({
      message: "대본이 없습니다."
    });
  }

  try {
    /* 대본을 간단히 장면분리 3개 */
    const scenes = script
      .split(".")
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 3);

    const images = [];

    /* 장면별 이미지 생성 */
    for (const scene of scenes) {
      const prompt = `
마케팅 영상용 장면 이미지.
상황: ${scene}
스타일: 현대적, 고급스러움, 시네마틱, 사실적
조명: 자연광, 부드러운 조명
`;

      const result = await openai.images.generate({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1024"
      });

      images.push({
        scene,
        imageUrl: result.data[0].url
      });
    }

    /* 결과반환 */
    res.json({
      images
    });

  } catch (error) {
    console.error("이미지 생성 오류:", error);
    res.status(500).json({
      message: "이미지 생성 실패"
    });
  }
});

/* ===============================
   서버 실행
================================ */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});


console.log("API KEY 존재 여부:", !!process.env.OPENAI_API_KEY);


