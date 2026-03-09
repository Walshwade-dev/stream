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
    { key: "Inspection Date",  label: "Inspection Date" },
    { key: "registration",     label: "Registration" },
    { key: "Transp",           label: "Transporter" },
    { key: "Model",            label: "Model" },
    { key: "Origin",           label: "Origin" },
    { key: "destination",      label: "Destination" },
    { key: "Axleconf",         label: "Axleconf" },
    { key: "Inspstick",        label: "Inspsticker" },
    { key: "InsuaranceStic",   label: "InsuSticker" },
    { key: "Cargo",            label: "Cargo" },
    { key: "Dpermitissu",      label: "Permit Issue Date" },
    { key: "Height",           label: "Height" },
    { key: "Length",           label: "Length_" },
    { key: "Width",            label: "Width_" },
    { key: "AbnormalLPermit",  label: "Abnormal Load Permit" },
    { key: "Totaltyres",       label: "Total Tyres" },
    { key: "weighofload",      label: "Load Weight" },
    { key: "Authweight",       label: "Authorized Weight" },
    { key: "Permit No.",       label: "Permit No." },
    { key: "Date of Travel",   label: "Date of Travel" },
    { key: "Start Date",       label: "PStartD" },
    { key: "End Date",         label: "PEndD" },
  ];


function downloadPDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a3" });

    const headers = PDF_COLUMNS.map((c) => c.label);

    const rows = result.previewRows.map((row) =>
      PDF_COLUMNS.map((c) => {
        let val = formatCell(c.key, row[c.key]) ?? "";
        // truncate cargo to first 2 items
        if (c.key === "Cargo") {
          const parts = String(val).split(",").map((s) => s.trim());
          val = parts.slice(0, 2).join(", ") + (parts.length > 2 ? "..." : "");
        }
        return val;
      })
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 3,
        textColor: [0, 0, 0],
        fillColor: false,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: false,
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 7,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle",
        minCellHeight: 60,
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const x = cell.x + cell.width / 2;
          const y = cell.y + cell.height - 4;
          doc.saveGraphicsState();
          doc.text(cell.raw, x, y, {
            angle: 90,
            align: "left",
          });
          doc.restoreGraphicsState();
        }
      },
      didParseCell: (data) => {
        if (data.section === "head") {
          data.cell.text = []; // suppress default header text, we draw it manually
        }
      },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.5,
      margin: { top: 30, left: 20, right: 20 },
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
                      {Object.keys(result.previewRows[0]).map((col) => (
                        <th key={col}><span>{col}</span></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.previewRows.map((row, i) => (
                      <tr key={i}>
                        {Object.entries(row).map(([col, val], j) => (
                          <td key={j}>{formatCell(col, val)}</td>
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