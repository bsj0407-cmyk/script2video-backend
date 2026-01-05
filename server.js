import express from "express";
import cors from "cors";

const app = express();

/* ===== 기본 미들웨어 ===== */
app.use(cors());
app.use(express.json());

/* ===== 서버 상태 확인 ===== */
app.get("/", (req, res) => {
  res.send("백엔드 서버 정상 작동 중");
});

app.get("/health", (req, res) => {
  res.send("OK");
});

/* ===== 대본 수신 API ===== */
app.post("/script", (req, res) => {
  const { script } = req.body;

  // 대본 없을 경우 예외 처리
  if (!script) {
    return res.status(400).json({
      message: "대본이 전달되지 않았습니다."
    });
  }

  console.log("받은 대본:", script);

  // 지금은 '잘 받았다'만 응답
  res.json({
    message: "대본 수신 완료",
    length: script.length
  });
});

/* ===== 서버 실행 ===== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});


// OpenAI 초기화 (상단)
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

//장면 이미지 생성 API 추가

app.post("/generate-images", async (req, res) => {
  const { script } = req.body;

  if (!script) {
    return res.status(400).json({ message: "대본이 없습니다." });
  }

  try {
    // 대본을 장면 3개로 단순 분리
    const scenes = script
      .split(".")
      .filter(s => s.trim().length > 0)
      .slice(0, 3);

    const images = [];

    // 각 장면마다 이미지 생성
    for (const scene of scenes) {
      const prompt = `
마케팅 영상용 장면 이미지.
상황:  ${scene}
현대적, 고품질, 시네마틱, 사실적인 스타일
`;

      const result = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024"
      });

      images.push({
        scene,
        imageUrl: result.data[0].url
      });
    }

    res.json({ images });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "이미지 생성 실패" });
  }
});


