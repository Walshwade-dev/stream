import { useState, useRef } from "react";

const SERVER = "https://stream-production-748d.up.railway.app";

export default function App() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

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
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.previewRows.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

      </div>
    </div>
  );
}