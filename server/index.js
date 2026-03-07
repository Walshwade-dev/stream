import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  const message = `WADE Says Hello, the server is running at port ${PORT}`;
  const frames = message.split("").map((_, i) => message.slice(0, i + 1));

  let i = 0;

  const interval = setInterval(() => {
    res.write(`data: ${frames[i]}\n\n`);
    i++;

    // when we reach the last frame, stop — no more writing
    if (i >= frames.length) clearInterval(interval);
  }, 80);

  req.on("close", () => clearInterval(interval));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));