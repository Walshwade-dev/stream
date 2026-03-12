import { useEffect } from "react";
import { useUpload } from "../hooks/useUpload";
import { PreviewTable } from "./PreviewTable";
import { generatePDF } from "../utils/generatePDF";
import { generateImpoundedPDF } from "../utils/generateImpoundedPDF";
import { SERVER } from "../config/sections";

/**
 * A fully self-contained upload section.
 * Handles its own state via useUpload hook.
 * @param {object} section - a section config object from SECTIONS array
 * @param {function} onResult - called with result when upload succeeds,
 *                              so App/Sidebar can track which sections are ready
 */
export function UploadSection({ section, onStatusChange, onResult }) {
  const {
    file, dragOver, status, result, errorMsg, inputRef,
    fmt, pickFile, onDragOver, onDragLeave, onDrop, upload, reset,
  } = useUpload(`${SERVER}${section.endpoint}`);

  //notify app whenever this section status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(section.id, status, result);
    }
  }, [status, result, onStatusChange, section.id]);

  // notify parent when upload succeeds
  async function handleUpload() {
    await upload().then(() => {
      if (onResult) onResult(section.id, result);
    });
  }

  function handleDownload() {
  if (section.id === "impounded") {
    generateImpoundedPDF(result);
  } else {
    generatePDF(result);
  }
}

  return (
    <div className="section-card">

      {/* Section title bar */}
      <div className="section-header">
        <span className="section-title">{section.title}</span>
        {status === "success" && (
          <span className="section-badge">✓ ready</span>
        )}
        {status === "uploading" && (
          <span className="section-badge section-badge-busy">↻ uploading</span>
        )}
        {status === "error" && (
          <span className="section-badge section-badge-error">⚠ error</span>
        )}
      </div>

      {/* Dropzone */}
      <div
        className={`dropzone ${dragOver ? "dropzone-active" : ""} ${file ? "dropzone-filled" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
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
            <span className="file-icon">
              {file.name.endsWith(".csv") ? "📄" : "📊"}
            </span>
            <div>
              <div className="file-name">{file.name}</div>
              <div className="file-meta">{fmt(file.size)}</div>
            </div>
            <button
              className="clear-btn"
              onClick={(e) => { e.stopPropagation(); reset(); }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="drop-prompt">
            <span className="drop-icon">⇪</span>
            <span className="drop-text">Drop a file or <u>browse</u></span>
            <span className="drop-sub">.csv · .xlsx · .xls</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="error" style={{ whiteSpace: "pre-line" }}>
          ⚠ {errorMsg}
        </div>
      )}

      {/* Upload button */}
      <button
        className={`upload-btn
          ${status === "uploading" ? "upload-btn-busy" : ""}
          ${!file || status === "uploading" ? "upload-btn-disabled" : ""}
        `}
        onClick={handleUpload}
        disabled={!file || status === "uploading"}
      >
        {status === "uploading" ? "↻ Uploading…" : "Upload"}
      </button>

      {/* Result block */}
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

          <PreviewTable
            rows={result.previewRows}
            columns={section.pdfColumns}
            rotated={section.id !== "impounded"}
          />

          <button className="download-btn" onClick={handleDownload}>
            ↓ Download PDF
          </button>
        </div>
      )}

    </div>
  );
}