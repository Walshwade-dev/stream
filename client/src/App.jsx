import { useState, useRef } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SERVER = "https://stream-production-748d.up.railway.app";

export default function App() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

  const DATE_COLUMNS = [
    "Inspection Date",
    "Date of Travel",
    "Start Date",
    "End Date",
    "Dpermitissu",
  ];

  const NUMBER_COLUMNS = ["weighofload", "Authweight"];


  const PDF_COLUMNS = [
    { key: "Inspection Date",  label: "Inspection\nDate" },
    { key: "registration",     label: "Registration" },
    { key: "Transp",           label: "Transporter" },
    { key: "Model",            label: "Model" },
    { key: "Origin",           label: "Origin" },
    { key: "destination",      label: "Destination" },
    { key: "Axleconf",         label: "Axleconf" },
    { key: "Inspstick",        label: "Inspsticker" },
    { key: "InsuaranceStic",   label: "InsuSticker" },
    { key: "Cargo",            label: "Cargo" },
    { key: "Dpermitissu",      label: "Permit Issue\nDate" },
    { key: "Height",           label: "Height" },
    { key: "Length",           label: "Length_" },
    { key: "Width",            label: "Width_" },
    { key: "AbnormalLPermit",  label: "Abnormal\nLoad Permit" },
    { key: "Totaltyres",       label: "Total Tyres" },
    { key: "weighofload",      label: "Load Weight" },
    { key: "Authweight",       label: "Authorized\nWeight" },
    { key: "Permit No.",       label: "Permit No." },
    { key: "Date of Travel",   label: "Date of\nTravel" },
    { key: "Start Date",       label: "PStartD" },
    { key: "End Date",         label: "PEndD" }
  ];


function downloadPDF() {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const margins = { top: 30, left: 10, right: 10 };
  const cellHeight = 80;
  const headHeight = 70;

  // ✅ Available width exactly
  const pageWidth = doc.internal.pageSize.getWidth();
  const availableWidth = pageWidth - margins.left - margins.right; // 575pt

  // Relative weights — wider columns get more space
  const NARROW = 1;
  const NORMAL = 1.5;
  const WIDE   = 3;

  const COLUMN_WEIGHTS = {
    "Inspection Date":  NORMAL,
    "registration":     NORMAL,
    "Transp":           WIDE,
    "Model":            NORMAL,
    "Origin":           NORMAL,
    "destination":      NORMAL,
    "Axleconf":         NARROW,
    "Inspstick":        NARROW,
    "InsuaranceStic":   NARROW,
    "Cargo":            WIDE,
    "Dpermitissu":      NORMAL,
    "Height":           NARROW,
    "Length":           NARROW,
    "Width":            NARROW,
    "AbnormalLPermit":  NORMAL,
    "Totaltyres":       NARROW,
    "weighofload":      NORMAL,
    "Authweight":       NORMAL,
    "Permit No.":       NORMAL,
    "Date of Travel":   NORMAL,
    "Start Date":       NORMAL,
    "End Date":         NORMAL,
  };

  // ✅ Total weight units
  const totalWeight = PDF_COLUMNS.reduce(
    (sum, col) => sum + (COLUMN_WEIGHTS[col.key] ?? NORMAL), 0
  );

  // ✅ Each column gets a proportion of availableWidth — always sums to exactly availableWidth
  const COLUMN_WIDTHS = {};
  PDF_COLUMNS.forEach((col) => {
    COLUMN_WIDTHS[col.key] = (COLUMN_WEIGHTS[col.key] ?? NORMAL) / totalWeight * availableWidth;
  });

  const headers = PDF_COLUMNS.map((c) => c.label);

  const allRows = result.allRows ?? result.previewRows;
  const rows = allRows.map((row) =>
    PDF_COLUMNS.map((c) => {
      let val = formatCell(c.key, row[c.key]) ?? "";
      return val;
    })
  );

  autoTable(doc, {
    showHead: "firstPage",
    rowPageBreak: "avoid",
    head: [headers],
    body: rows,

    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 0,
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      halign: "center",
      valign: "middle",
      minCellHeight: cellHeight,
      overflow: "hidden",
    },

    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 7,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      minCellHeight: headHeight,
      overflow: "hidden",
    },

    columnStyles: PDF_COLUMNS.reduce((acc, col, i) => {
      acc[i] = { cellWidth: COLUMN_WIDTHS[col.key] };
      return acc;
    }, {}),

    didParseCell: (data) => {
      data.cell.text = [];
    },

    didDrawCell: (data) => {
      const { doc, cell } = data;
      const rawText = String(cell.raw ?? "").trim();
      if (!rawText) return;

      const colKey = PDF_COLUMNS[data.column.index]?.key;
      if (!colKey) return; // ✅ guard against phantom columns
      const isWrappable = ["Transp", "Cargo"].includes(colKey);

      doc.saveGraphicsState();
      doc.setFontSize(7);
      doc.setFont("helvetica", data.section === "head" ? "bold" : "normal");

      if (data.section === "head") {
        const x = cell.x + cell.width / 2;
        const y = cell.y + cell.height - 4;
        doc.text(rawText, x, y, { angle: 90, align: "left" });

      } else if (isWrappable) {
        const lineSpacing = 9;
        const maxTextWidth = cell.height - 6;
        const words = rawText.split(/[\s,]+/).filter(Boolean);
        const lines = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (doc.getTextWidth(testLine) <= maxTextWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);

        const maxLines = Math.floor(cell.width / lineSpacing);
        const visibleLines = lines.slice(0, maxLines);
        const totalBlockWidth = visibleLines.length * lineSpacing;
        const startX = cell.x + (cell.width - totalBlockWidth) / 2 + lineSpacing / 2;

        visibleLines.forEach((line, i) => {
          const textWidth = doc.getTextWidth(line);
          const xLine = startX + i * lineSpacing;
          const yLine = cell.y + (cell.height + textWidth) / 2;
          doc.text(line, xLine, yLine, { angle: 90, align: "left" });
        });

      } else {
        const x = cell.x + cell.width / 2;
        const textWidth = doc.getTextWidth(rawText);
        const y = cell.y + (cell.height + textWidth) / 2;
        doc.text(rawText, x, y, { angle: 90, align: "left" });
      }

      doc.restoreGraphicsState();
    },

    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.5,
    margin: margins,
  });

  doc.save(`${result.filename.replace(/\.[^/.]+$/, "")}_report.pdf`);
}

  function validateFile(f) {
    const ext = f.name.split(".").pop().toLowerCase();
    return ["csv", "xlsx", "xls"].includes(ext);
  }

  function pickFile(f) {
    if (!f) return;
    if (!validateFile(f)) {
      setErrorMsg("Only .csv, .xlsx, or .xls files are accepted.");
      setFile(null);
      return;
    }
    setErrorMsg("");
    setFile(f);
    setStatus("idle");
    setResult(null);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files[0]);
  }

  function formatCell(col, val) {
    if (!val) return val;
    if (DATE_COLUMNS.includes(col)) {
      const d = new Date(val);
      if (!isNaN(d)) return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    if (NUMBER_COLUMNS.includes(col)) {
      const n = Math.round(Number(val));
      if (!isNaN(n)) return n.toLocaleString();
    }
    return String(val).toUpperCase();
  }

  async function upload() {
  if (!file) return;
  setStatus("uploading");
  setResult(null);
  setErrorMsg("");

  const form = new FormData();
  form.append("file", file);

  try {
    const res = await fetch(`${SERVER}/upload`, { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      // show missing columns by name if present
      if (data.missing_columns?.length) {
        setErrorMsg(
          `Missing required columns:\n${data.missing_columns.join(", ")}`
        );
      } else {
        setErrorMsg(data.error || "Upload failed");
      }
      setStatus("error");
      return;
    }
    setResult(data);
    console.log("Server response:", data);
    setStatus("success");
  } catch (err) {
    setErrorMsg(err.message);
    setStatus("error");
  }
}

  function reset() {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const fmt = (bytes) =>
    bytes < 1024 ? `${bytes} B`
    : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1048576).toFixed(2)} MB`;

  return (
    <div className="root">
      <div className="card">

        <div className="header">
          <div className="header-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <span className="header-title"></span>
        </div>

        <div
          className={`dropzone ${dragOver ? "dropzone-active" : ""} ${file ? "dropzone-filled" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !file && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: "none" }}
            onChange={(e) => pickFile(e.target.files[0])}
          />

          {file ? (
            <div className="file-info">
              <span className="file-icon">{file.name.endsWith(".csv") ? "📄" : "📊"}</span>
              <div>
                <div className="file-name">{file.name}</div>
                <div className="file-meta">{fmt(file.size)}</div>
              </div>
              <button className="clear-btn" onClick={(e) => { e.stopPropagation(); reset(); }}>✕</button>
            </div>
          ) : (
            <div className="drop-prompt">
              <span className="drop-icon">⇪</span>
              <span className="drop-text">Drop a file or <u>browse</u></span>
              <span className="drop-sub">.csv · .xlsx · .xls</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="error" style={{ whiteSpace: "pre-line" }}>
            ⚠ {errorMsg}
          </div>
        )}

        <button
          className={`upload-btn ${status === "uploading" ? "upload-btn-busy" : ""} ${!file || status === "uploading" ? "upload-btn-disabled" : ""}`}
          onClick={upload}
          disabled={!file || status === "uploading"}
        >
          {status === "uploading" ? "↻ Uploading…" : "Upload"}
        </button>


        {status === "success" && result && (
          <div className="result">
            <div className="result-row">
              <span className="result-label">status</span>
              <span className="result-ok">✓ received</span>
            </div>
            <div className="result-row">
              <span className="result-label">filename</span>
              <span className="result-val">{result.filename}</span>
            </div>
            <div className="result-row">
              <span className="result-label">total rows</span>
              <span className="result-val">{result.total_rows?.toLocaleString()}</span>
            </div>

            {result.previewRows?.length > 0 && (
              <div className="table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {PDF_COLUMNS.map((col) => {
                        return (
                          <th key={col.key}>
                            <span>{col.label}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {result.previewRows.map((row, i) => (
                      <tr key={i}>
                        {PDF_COLUMNS.map((col) => (
                          <td key={col.key}>
                            <span>{formatCell(col.key, row[col.key])}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button className="download-btn" onClick={downloadPDF}>
              ↓ Download PDF
            </button>
          </div>
        )}

      </div>
    </div>
  );
}