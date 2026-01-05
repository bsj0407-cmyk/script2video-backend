app.post("/script", (req, res) => {
  const { script } = req.body;

  console.log("받은 대본:", script);

  res.json({
    message: "대본 수신 완료",
    length: script.length
  });
});
