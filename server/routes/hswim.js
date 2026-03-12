import express from "express";
import multer from "multer";
import { parseHswim }  from "../parsers/parseHswim.js";
import { parseImpoundedVerdict } from "../parsers/parseImpoundedVerdict.js";
import { buildReportData } from "../formulas/hswimFormulas.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
  const name = file.originalname.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx, .xls and .csv files are allowed"), false);
  }
},
});

// ── POST /upload/hswim ────────────────────────────────────────────────────
// Accepts: HSWIM daily statistics xlsx
// Body fields (form-data):
//   file       — the xlsx file
//   preparedBy — string
//   approvedBy — string
//   date       — string (display date for the report)
//
// Returns: { success, reportData } where reportData contains
//          hourlyRows, graphRows, totals ready for PDF generation.
//          census / manualFields / F are empty defaults until
//          the client calls /upload/hswim-combined with all inputs.

router.post("/upload/hswim", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

 let hourlyRows;
try {
hourlyRows = parseHswim(req.file.buffer);
} catch (err) {
return res.status(422).json({ success: false, error: err.message });
}

  // Build partial reportData — census and F will come later from the client
  const defaultCensus = { buses: 0, veh3500to7000: 0, veh7000plus: 0 };
  const defaultManual = { B: 0, L: 0 };

  const reportData = buildReportData({
    hourlyRows,
    census: defaultCensus,
    manualFields: defaultManual,
    F: 0,
  });

  return res.json({
    success: true,
    filename: req.file.originalname,
    totalRows: hourlyRows.length,
    reportData,
    // Convenience preview: first 5 hourly rows
    previewRows: reportData.hourlyRows.slice(0, 5),
  });
});

// ── POST /upload/hswim-impounded ──────────────────────────────────────────
// Accepts: Impounded & Overloaded xlsx
// Returns: { success, F, matchedRows, totalRows, details }

router.post("/upload/hswim-impounded", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  let result;
  try {
    result = parseImpoundedVerdict(req.file.buffer);
  } catch (err) {
    return res.status(422).json({ success: false, error: err.message });
  }

  return res.json({
    success: true,
    filename: req.file.originalname,
    F: result.F,
    matchedRows: result.matchedRows,
    totalRows: result.totalRows,
    details: result.details.slice(0, 10), // preview first 10 for UI
  });
});

// ── POST /upload/hswim-combined ───────────────────────────────────────────
// Final merge: takes hourlyRows (already parsed) + all manual inputs
// Called by the client when all fields are ready for PDF generation
// Body (JSON):
// {
//   hourlyRows: [...],      ← from /upload/hswim response
//   F: number,              ← from /upload/hswim-impounded response
//   buses: number,
//   veh3500to7000: number,
//   veh7000plus: number,
//   B: number,              ← cases cleared in court
//   L: number,              ← transgressions
//   preparedBy: string,
//   approvedBy: string,
//   date: string,
// }

router.post("/upload/hswim-combined", express.json(), (req, res) => {
  const {
    hourlyRows,
    F = 0,
    buses = 0,
    veh3500to7000 = 0,
    veh7000plus = 0,
    B = 0,
    L = 0,
    preparedBy = "",
    approvedBy = "",
    date = "",
  } = req.body;

  if (!hourlyRows || !Array.isArray(hourlyRows)) {
    return res.status(400).json({
      success: false,
      error: "hourlyRows array is required",
    });
  }

  const census      = { buses, veh3500to7000, veh7000plus };
  const manualFields = { B, L };

  const reportData = buildReportData({
    hourlyRows,
    census,
    manualFields,
    F,
  });

  return res.json({
    success: true,
    reportData: {
      ...reportData,
      meta: { preparedBy, approvedBy, date },
    },
  });
});

export default router;