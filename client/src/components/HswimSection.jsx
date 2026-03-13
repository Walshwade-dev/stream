import { useCallback } from "react";
import { useHswimUpload } from "../hooks/useHswimUpload.js";
import { GRAPH_COLUMNS, SUMMARY_FIELDS, CENSUS_FIELDS } from "../config/hswimColumns.js";

function Dropzone({ label, sublabel, file, onDrop, onClear, busy }) {
  const handleDrag = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onDrop(f); }, [onDrop]);
  const handleChange = useCallback((e) => { const f = e.target.files[0]; if (f) onDrop(f); }, [onDrop]);

  if (file) {
    return (
      <div className="dropzone dropzone-filled">
        <div className="file-info">
          <span className="file-icon">📄</span>
          <div>
            <div className="file-name">{file.name}</div>
            <div className="file-meta">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          {!busy && <button className="clear-btn" onClick={onClear}>×</button>}
        </div>
      </div>
    );
  }

  return (
    <div
      className="dropzone"
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById(`hswim-input-${label}`).click()}
    >
      <input
        id={`hswim-input-${label}`}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <div className="drop-prompt">
        <span className="drop-icon">⬆</span>
        <span className="drop-text">{label}</span>
        <span className="drop-sub">{sublabel}</span>
      </div>
    </div>
  );
}

function ManualField({ label, fieldKey, value, onChange, type = "number", placeholder = "0" }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 4, padding: "6px 10px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit", outline: "none" }}
        onFocus={e => e.target.style.borderColor = "#4ade80"}
        onBlur={e => e.target.style.borderColor = "#1e293b"}
      />
    </div>
  );
}

function HourlyTable({ rows, date }) {
  if (!rows?.length) return null;

  const numKeys = ["D","S","M","H","Q","X","C","Y","P","A","Z","G","R","E"];
  const totals = {};
  numKeys.forEach(k => { totals[k] = rows.reduce((s, r) => s + (r[k] || 0), 0); });

  const thBase = {
    background: "#fff", color: "#000", border: "1px solid #000",
    textAlign: "center", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: 10,
  };
  const thRot = { ...thBase, width: 55, minWidth: 55, padding: "4px 2px", verticalAlign: "bottom", height: "auto" };
  const thNarrow = { ...thBase, width: 28, minWidth: 28, maxWidth: 30, padding: "4px 1px", verticalAlign: "bottom", height: "auto" };
  const tdNarrow = { ...td, width: 28, minWidth: 28, maxWidth: 30, padding: "2px 1px" };
  const thWide = { ...thBase, width: 70, minWidth: 70, padding: "4px 2px", verticalAlign: "middle" };
  const td = { background: "#fff", color: "#000", border: "1px solid #000", textAlign: "center", fontFamily: "Arial, sans-serif", fontSize: 10, padding: "2px 1px", whiteSpace: "nowrap" };
  const tdBold = { ...td, fontWeight: "bold" };

  const rot = (text) => (
  <span style={{ display: "block", whiteSpace: "pre-line", fontSize: 9, lineHeight: 1.3, textAlign: "center" }}>
    {text}
  </span>
);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Hourly Data Preview
      </div>
      <div className="table-wrapper" style={{overflow: "auto", maxHeight: "none"}}>
        <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%", minWidth: 900, fontFamily: "Arial, sans-serif" }}>
          <thead>
            {/* Row 1: group labels */}
            <tr>
              <th rowSpan={3} style={thWide}>DATE</th>
              <th rowSpan={3} style={thWide}>TIME</th>
              <th colSpan={6} style={{ ...thBase, padding: "4px 2px" }}>TRUCKS WEIGHED</th>
              <th rowSpan={3} style={thRot}>{rot("CALLED\nIN")}</th>
              <th rowSpan={3} style={thRot}>{rot("TOTAL\nOVERLO\nADED")}</th>
              <th rowSpan={3} style={thRot}>{rot("IMPOUNDED\n& PROHIB-\nITED")}</th>
              <th rowSpan={3} style={thRot}>{rot("WARNED\nTRUCKS")}</th>
              <th rowSpan={3} style={thRot}>{rot("CHARGED &\nPROHIBITED")}</th>
              <th rowSpan={3} style={thRot}>{rot("SPECIAL\nRELEASE")}</th>
              <th rowSpan={3} style={thRot}>{rot("REDISTRI-\nBUTED")}</th>
              <th rowSpan={3} style={thRot}>{rot("EXEMPTION\nPERMITS\nNOT\nWEIGHED")}</th>
            </tr>
            {/* Row 2: sub-column names */}
            <tr>
              <th style={thNarrow}>{rot("MULTIDECK\nSCALE")}</th>
              <th style={thNarrow}>{rot("WEIGHED\nSAW")}</th>
              <th style={thNarrow}>{rot("MANUAL\nLY")}</th>
              <th style={thNarrow}>{rot("HSWIM\nTOTAL")}</th>
              <th style={thNarrow}>{rot("HSWIM –\nCLEARED")}</th>
              <th style={thNarrow}>{rot("TOTAL\nWEIGHED")}</th>
            </tr>
            {/* Row 3: key labels */}
            <tr>
              <th style={tdNarrow}>{rot("(D)")}</th>
              <th style={tdNarrow}>{rot("(S)")}</th>
              <th style={tdNarrow}>{rot("(M)")}</th>
              <th style={tdNarrow}>{rot("(H)")}</th>
              <th style={tdNarrow}>{rot("Q = H-C")}</th>
              <th style={tdNarrow}>{rot("X=(D\n+M+S)")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={td}>{i === 0 ? (date || "") : ""}</td>
                <td style={td}>{row.time}</td>
                <td style={td}>{row.D}</td>
                <td style={td}>{row.S}</td>
                <td style={td}>{row.M}</td>
                <td style={td}>{row.H}</td>
                <td style={td}>{row.Q}</td>
                <td style={td}>{row.X}</td>
                <td style={td}>{row.C}</td>
                <td style={td}>{row.Y}</td>
                <td style={td}>{row.P}</td>
                <td style={td}>{row.A}</td>
                <td style={td}>{row.Z}</td>
                <td style={td}>{row.G}</td>
                <td style={td}>{row.R}</td>
                <td style={td}>{row.E}</td>
              </tr>
            ))}
            <tr>
              <td style={tdBold}>Totals</td>
              <td style={td}></td>
              {["D","S","M","H","Q","X","C","Y","P","A","Z","G","R","E"].map(k => (
                <td key={k} style={tdBold}>{totals[k]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GraphTable({ rows }) {
  if (!rows?.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Graph Table (Table 2)
      </div>
      <div className="table-wrapper">
        <table className="preview-table horizontal">
          <thead>
            <tr>
              {GRAPH_COLUMNS.map(col => (
                <th key={col.key} className="th-horizontal"><span>{col.label}</span></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {GRAPH_COLUMNS.map(col => (
                  <td key={col.key} className="td-horizontal"><span>{row[col.key] ?? ""}</span></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryTable({ summary, census, F }) {
  if (!summary) return null;
  const mergedSummary = { ...summary, F: F ?? 0 };
  const K = (Number(census?.buses)||0) + (Number(census?.veh3500to7000)||0) + (Number(census?.veh7000plus)||0);
  const mergedCensus = { ...census, K };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>Daily Summary</div>
      <div className="result">
        {SUMMARY_FIELDS.map(f => (
          <div className="result-row" key={f.key}>
            <span className="result-label">{f.label}</span>
            <span className="result-val">{mergedSummary[f.key] ?? 0}</span>
          </div>
        ))}
      </div>
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", margin: "12px 0 6px", textTransform: "uppercase" }}>Traffic Census</div>
      <div className="result">
        {CENSUS_FIELDS.map(f => (
          <div className="result-row" key={f.key}>
            <span className="result-label">{f.label}</span>
            <span className="result-val">{mergedCensus[f.key] ?? mergedSummary[f.key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HswimSection({ section, onStatusChange }) {
  const {
    hswimFile, impoundedFile,
    hswimResult, impoundedResult,
    busy, error,
    manualFields, updateManual,
    uploadHswim, uploadImpounded,
    clearHswim, clearImpounded,
    buildFinalReport,
  } = useHswimUpload(onStatusChange, section.id);

  const handleGenerate = async () => {
    const report = await buildFinalReport();
    if (report) onStatusChange(section.id, "success", { reportData: report, ready: true });
  };

  const hasHswim = !!hswimResult;
  const hasImpounded = !!impoundedResult;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

      {/* ── LEFT ───────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        <div className="section-card">
          <div className="section-header">
            <span className="section-title">HSWIM DAILY STATISTICS</span>
            {hasHswim && <span className="section-badge">✓ {hswimResult.totalRows} ROWS</span>}
            {busy && !hasHswim && <span className="section-badge section-badge-busy">UPLOADING…</span>}
          </div>
          <Dropzone label="Drop HSWIM Daily CSV / XLSX" sublabel=".csv or .xlsx · 24 hourly rows" file={hswimFile} onDrop={uploadHswim} onClear={clearHswim} busy={busy} />
        </div>

        <div className="section-card">
          <div className="section-header">
            <span className="section-title">IMPOUNDED & OVERLOADED</span>
            {hasImpounded && <span className="section-badge">✓ F = {impoundedResult.F}</span>}
            {busy && !hasImpounded && <span className="section-badge section-badge-busy">UPLOADING…</span>}
          </div>
          <Dropzone label="Drop Impounded & Overloaded CSV / XLSX" sublabel=".csv or .xlsx · Vardict column required" file={impoundedFile} onDrop={uploadImpounded} onClear={clearImpounded} busy={busy} />
          {hasImpounded && (
            <div className="result" style={{ margin: "0 24px 16px" }}>
              <div className="result-row">
                <span className="result-label">Exemption Permits Weighed [F]</span>
                <span className="result-ok">{impoundedResult.F}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Total Rows Scanned</span>
                <span className="result-val">{impoundedResult.totalRows}</span>
              </div>
            </div>
          )}
        </div>

        {error && <div className="error">⚠ {error}</div>}

        {hasHswim && (
          <div style={{ margin: "0 0 16px" }}>
            <HourlyTable rows={hswimResult.reportData?.hourlyRows} date={manualFields.date} />
            <GraphTable rows={hswimResult.reportData?.graphRows} />
            <SummaryTable summary={hswimResult.reportData?.summary} census={hswimResult.reportData?.census} F={impoundedResult?.F} />
          </div>
        )}
      </div>

      {/* ── RIGHT: manual fields ────────────────────────── */}
      <div style={{ width: 220, minWidth: 220, background: "#0f172a", borderRadius: 8, padding: "16px 14px", position: "sticky", top: 64 }}>
        <div style={{ color: "#4ade80", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, borderBottom: "1px solid #1e293b", paddingBottom: 8 }}>
          Manual Fields
        </div>

        <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>Court & Compliance</div>
        <ManualField label="Cases Cleared in Court [B]" fieldKey="B" value={manualFields.B} onChange={updateManual} />
        <ManualField label="Transgressions [L]" fieldKey="L" value={manualFields.L} onChange={updateManual} />

        <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.06em", margin: "12px 0 8px", textTransform: "uppercase" }}>Traffic Census</div>
        <ManualField label="Buses ≥3500kg" fieldKey="buses" value={manualFields.buses} onChange={updateManual} />
        <ManualField label="Vehicles ≥3500–7000kg" fieldKey="veh3500to7000" value={manualFields.veh3500to7000} onChange={updateManual} />
        <ManualField label="Vehicles ≥7000kg" fieldKey="veh7000plus" value={manualFields.veh7000plus} onChange={updateManual} />

        <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.06em", margin: "12px 0 8px", textTransform: "uppercase" }}>Report Info</div>
        <ManualField label="Date" fieldKey="date" value={manualFields.date} onChange={updateManual} type="text" placeholder="e.g. 12/03/2026" />
        <ManualField label="Prepared By" fieldKey="preparedBy" value={manualFields.preparedBy} onChange={updateManual} type="text" placeholder="Name" />
        <ManualField label="Approved By" fieldKey="approvedBy" value={manualFields.approvedBy} onChange={updateManual} type="text" placeholder="Name" />

        <button
          className={`upload-btn${!hasHswim || busy ? " upload-btn-disabled" : ""}`}
          style={{ margin: "16px 0 0", width: "100%" }}
          disabled={!hasHswim || busy}
          onClick={handleGenerate}
        >
          {busy ? "BUILDING…" : "BUILD REPORT"}
        </button>

        {hasHswim && (
          <div style={{ color: "#475569", fontSize: 10, textAlign: "center", marginTop: 8 }}>
            {hasImpounded ? `F=${impoundedResult.F} loaded` : "Upload impounded file for F count"}
          </div>
        )}
      </div>
    </div>
  );
}