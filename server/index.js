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

// ✅ Replace stripColumns with a whitelist approach
function stripColumns(rows) {
  return rows.map((row) => {
    const clean = {};
    REQUIRED_COLUMNS.forEach((col) => {
      clean[col] = row[col] ?? "";  // only keep columns we know about
    });
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
  const raw =  xlsx.utils.sheet_to_json(sheet, { defval: "" });

  return raw.map((row) => {
      const clean = {};
      Object.entries(row).forEach(([key, val]) => {
        if (key && key.trim() !== "") {  // ← skip blank column headers
          clean[key] = val;
        }
      });
      return clean;
    });
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
    allRows: cleaned, //send all rows to client
  });
});

// ── Impounded & Prohibited section ──────────────────────────

const IMPOUNDED_REQUIRED_COLUMNS = [
  "DateWeighed",
  "Transporter",
  "VehicleReg",
  "AxleConfig",
  "Cargo",
  "Source",
  "Destination",
  "AxleOverload",
  "GVWOverload",
  "ProhibitionOrder",
  "Prosecutor",
  "ComputerOperator",
];

// columns to drop from impounded data
const IMPOUNDED_DROP_COLUMNS = [
  "No.",
  "DateProhibited",
  "TimeTaken",
  "TicketNo",
  "Status",
];

function stripImpoundedColumns(rows) {
  return rows.map((row) => {
    const clean = {};
    IMPOUNDED_REQUIRED_COLUMNS.forEach((col) => {
      clean[col] = row[col] ?? "";
    });
    return clean;
  });
}

function validateImpoundedColumns(rows) {
  if (!rows.length) throw new Error("File is empty — no rows found.");
  const fileColumns = Object.keys(rows[0]);
  const missing = IMPOUNDED_REQUIRED_COLUMNS.filter(
    (col) => !fileColumns.includes(col)
  );
  if (missing.length) {
    const error = new Error("Missing required columns");
    error.missing = missing;
    throw error;
  }
}

app.post("/upload/impounded", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  let rows;

  try {
    rows = parseFile(req.file);
  } catch (err) {
    return res.status(422).json({ success: false, error: err.message });
  }

  try {
    validateImpoundedColumns(rows);
  } catch (err) {
    return res.status(422).json({
      success: false,
      error: err.message,
      ...(err.missing && { missing_columns: err.missing }),
    });
  }

  const cleaned = stripImpoundedColumns(rows);
  const previewRows = cleaned.slice(0, 10);

  return res.json({
    success: true,
    filename: req.file.originalname,
    total_rows: rows.length,
    previewRows,
    allRows: cleaned,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));