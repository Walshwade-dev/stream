import express from "express";
import cors from "cors";
import multer from "multer";
import Papa from "papaparse";
import xlsx from "xlsx";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const REQUIRED_COLUMNS = [
  "Inspection Date",
  "registration",
  "Transp",
  "Model",
  "Origin",
  "destination",
  "Axleconf",
  "Inspstick",
  "InsuaranceStic",
  "Cargo",
  "Dpermitissu",
  "Height",
  "Length",
  "Width",
  "AbnormalLPermit",
  "Totaltyres",
  "weighofload",
  "Authweight",
  "Permit No.",
  "Date of Travel",
  "Start Date",
  "End Date",
];


// Strip excluded columns from every row
const EXCLUDE_COLUMNS = ["No", "status", "Weighbridge Station Bound"];

function stripColumns(rows) {
  return rows.map((row) => {
    const clean = { ...row };
    EXCLUDE_COLUMNS.forEach((col) => delete clean[col]);
    return clean;
  });
}



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

// Parse buffer into array of row objects
function parseFile(file) {
  const { mimetype, buffer } = file;

  // CSV
  if (mimetype === "text/csv") {
    const text = buffer.toString("utf-8");
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (errors.length) throw new Error(`CSV parse error: ${errors[0].message}`);
    return data;
  }

  // XLSX / XLS
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
}

// Check all required columns exist
function validateColumns(rows) {
  if (!rows.length) throw new Error("File is empty — no rows found.");

  const fileColumns = Object.keys(rows[0]);
  const missing = REQUIRED_COLUMNS.filter((col) => !fileColumns.includes(col));

  if (missing.length) {
    const error = new Error("Missing required columns");
    error.missing = missing;
    throw error;
  }
}

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded",
    });
  }

  let rows;

  // Parse
  try {
    rows = parseFile(req.file);
  } catch (err) {
    return res.status(422).json({
      success: false,
      error: err.message,
    });
  }

  // Validate columns
  try {
    validateColumns(rows);
  } catch (err) {
    return res.status(422).json({
      success: false,
      error: err.message,
      ...(err.missing && { missing_columns: err.missing }),
    });
  }

  const cleaned = stripColumns(rows);
  const previewRows = cleaned.slice(0, 10);

  return res.json({
    success: true,
    filename: req.file.originalname,
    total_rows: rows.length,
    previewRows,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));