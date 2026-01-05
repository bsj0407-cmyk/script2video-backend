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
