import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .csv and .xlsx files are allowed"), false);
    }
  },
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, mimetype, size, buffer } = req.file;

  res.json({
    message: "File received successfully",
    filename: originalname,
    mimetype,
    size,
    bytes: buffer.length,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));