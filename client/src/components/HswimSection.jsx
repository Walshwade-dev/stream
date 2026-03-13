import { useCallback, useEffect, useRef, useState } from "react";
import { useHswimUpload } from "../hooks/useHswimUpload.js";

// ─────────────────────────────────────────────
// Shared PDF styles (white tables, black borders, Arial)
// ─────────────────────────────────────────────
const PDF = {
  th: {
    background: "#fff", color: "#000", border: "1px solid #000",
    fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: 8,
    padding: "3px 2px", textAlign: "center", verticalAlign: "middle",
    whiteSpace: "pre-line",
  },
  td: {
    background: "#fff", color: "#000", border: "1px solid #000",
    fontFamily: "Arial, sans-serif", fontSize: 8,
    padding: "2px 2px", textAlign: "center", verticalAlign: "middle",
  },
  label: {
    fontFamily: "Arial, sans-serif", fontWeight: "bold",
    fontSize: 10, color: "#000", marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: "Arial, sans-serif", fontWeight: "bold",
    fontSize: 11, color: "#000", marginBottom: 8,
  },
};

// ─────────────────────────────────────────────
// Dropzone
// ─────────────────────────────────────────────
function Dropzone({ label, sublabel, file, onDrop, onClear, busy }) {
  const handleDrag = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onDrop(f);
  }, [onDrop]);
  const handleChange = useCallback((e) => {
    const f = e.target.files[0];
    if (f) onDrop(f);
  }, [onDrop]);

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
    <div className="dropzone" onDragOver={handleDrag} onDrop={handleDrop}
      onClick={() => document.getElementById(`hswim-input-${label}`).click()}>
      <input id={`hswim-input-${label}`} type="file" accept=".xlsx,.xls,.csv"
        style={{ display: "none" }} onChange={handleChange} />
      <div className="drop-prompt">
        <span className="drop-icon">⬆</span>
        <span className="drop-text">{label}</span>
        <span className="drop-sub">{sublabel}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ManualField
// ─────────────────────────────────────────────
function ManualField({ label, fieldKey, value, onChange, type = "number", placeholder = "0" }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>
        {label}
      </label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 4, padding: "6px 10px", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit", outline: "none" }}
        onFocus={e => e.target.style.borderColor = "#4ade80"}
        onBlur={e => e.target.style.borderColor = "#1e293b"}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// PageWrapper — simulates one A4 landscape page
// ─────────────────────────────────────────────
function PageWrapper({ children, pageNum, totalPages, date, reportRef }) {
  const FOOTER_TEXT = `KeNHA/WB/MTCE/4339/2025     JUJA WEIGHBRIDGE THIKA BOUND DAILY REPORT ${date || ""}     Page ${pageNum} of ${totalPages}`;
  return (
    <div ref={reportRef} style={{
      width: 1056, minWidth: 1056, background: "#fff",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      padding: "28px 36px 20px", boxSizing: "border-box",
      marginBottom: 24, position: "relative",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 12 }}>
        <img src="/danka-logo.png" alt="Danka" style={{ height: 48, objectFit: "contain" }} />
      </div>

      {children}

      {/* Footer */}
      <div style={{ marginTop: 14, paddingTop: 5, fontFamily: "Arial, sans-serif", fontSize: 8, color: "#000", textAlign: "center", fontWeight: "bold" }}>
        {FOOTER_TEXT}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page 1 — Daily and Hourly Statistics
// ─────────────────────────────────────────────
function Page1({ rows, date, preparedBy, approvedBy }) {
  if (!rows?.length) return null;

  const numKeys = ["D","S","M","H","Q","X","C","Y","P","A","Z","G","R","E"];
  const totals = {};
  numKeys.forEach(k => { totals[k] = rows.reduce((s, r) => s + (r[k] || 0), 0); });

  const th = { ...PDF.th, borderTop: "1px solid #000", borderLeft: "1px solid #000", borderRight: "1px solid #000" };
  const td = { ...PDF.td,  borderLeft: "1px solid #000", borderTop: "1px solid #000", borderRight: "1px solid #000" };
  const tdB = { ...td, fontWeight: "bold", borderBottom: "1px solid #000", borderRight: "1px solid #000" };
  

  return (
    <PageWrapper pageNum={1} totalPages={3} date={date}>
      {/* Report title */}
      <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: 13, color: "#000", marginBottom: 10, textDecoration: "underline" }}>
        JUJA WEIGHBRIDGE THIKA BOUND DAILY REPORT
      </div>

      <div style={{ ...PDF.sectionTitle }}>1.&nbsp; DAILY AND HOURLY STATISTICS</div>

      <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%" }}>
        <colgroup>
          <col style={{ width: "6%" }} />   {/* DATE */}
          <col style={{ width: "6%" }} />   {/* TIME */}
          <col style={{ width: "4.5%" }} /> {/* D */}
          <col style={{ width: "4%" }} />   {/* S */}
          <col style={{ width: "4%" }} />   {/* M */}
          <col style={{ width: "4.5%" }} /> {/* H */}
          <col style={{ width: "4.5%" }} /> {/* Q */}
          <col style={{ width: "4.5%" }} /> {/* X */}
          <col style={{ width: "4.5%" }} /> {/* C */}
          <col style={{ width: "5%" }} />   {/* Y */}
          <col style={{ width: "5%" }} />   {/* P */}
          <col style={{ width: "5%" }} />   {/* A */}
          <col style={{ width: "5%" }} />   {/* Z */}
          <col style={{ width: "5%" }} />   {/* G */}
          <col style={{ width: "5%" }} />   {/* R */}
          <col style={{ width: "6%" }} />   {/* E */}
        </colgroup>
        <thead>
          {/* Row 1: group header + outer column names */}
          <tr>
            <th rowSpan={3} style={{ ...th, verticalAlign: "middle" }}>DATE</th>
            <th rowSpan={3} style={{ ...th, verticalAlign: "middle" }}>TIME</th>
            <th colSpan={6} style={th}>TRUCKS WEIGHED</th>
            <th rowSpan={3} style={th}>{"CALLED\nIN\n(C)"}</th>
            <th rowSpan={3} style={th}>{"TOTAL\nOVERLO\nADED\n(Y)=(A+\nZ+G+R)"}</th>
            <th rowSpan={3} style={th}>{"IMPOUNDED\n&\nPROHIBITED\n(P)=(Z+R)"}</th>
            <th rowSpan={3} style={th}>{"WARNED\nTRUCKS\n(A)"}</th>
            <th rowSpan={3} style={th}>{"CHARGED &\nPROHIBITED\n(Z)"}</th>
            <th rowSpan={3} style={th}>{"SPECIAL\nRELEASE\n(G)"}</th>
            <th rowSpan={3} style={th}>{"REDISTRI-\nBUTED\n(R)"}</th>
            <th rowSpan={3} style={th}>{"EXEMPTION\nPERMITS\nNOT\nWEIGHED\n(E)"}</th>
          </tr>
          {/* Row 2: sub-column names */}
          <tr>
            <th style={th}>{"MULTIDECK\nSCALE"}</th>
            <th style={th}>{"WEIGHED\nSAW"}</th>
            <th style={th}>{"MANUAL\nLY"}</th>
            <th style={th}>{"HSWIM\nTOTAL"}</th>
            <th style={th}>{"HSWIM –\nCLEARED"}</th>
            <th style={th}>{"TOTAL\nWEIGHED"}</th>
          </tr>
          {/* Row 3: key labels */}
          <tr>
            <th style={th}>(D)</th>
            <th style={th}>(S)</th>
            <th style={th}>(M)</th>
            <th style={th}>(H)</th>
            <th style={th}>Q = H-C</th>
            <th style={th}>{"X= (D\n+M+S)"}</th>
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
            <td style={tdB}>Totals</td>
            <td style={td}></td>
            {numKeys.map(k => <td key={k} style={tdB}>{totals[k]}</td>)}
          </tr>
        </tbody>
      </table>

      {/* Prepared / Approved */}
      <div style={{ marginTop: 10, fontFamily: "Arial, sans-serif", fontSize: 9, color: "#000" }}>
        <div><strong>Prepared by:</strong> {preparedBy || ""}</div>
        <div><strong>Approved by:</strong> {approvedBy || ""}</div>
      </div>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────
// Canvas chart (no library)
// ─────────────────────────────────────────────
function CanvasLineChart({ rows, chartHeight }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!rows?.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const CW = 580, CH = Math.max(chartHeight * 1.5, 440);
    canvas.width = CW; canvas.height = CH;

    const padL = 48, padR = 16, padT = 44, padB = 95;
    const cW = CW - padL - padR, cH = CH - padT - padB;

    const series = [
      { key: "N", name: "N=(D+S)",    color: "#1a56db", width: 2 },
      { key: "M", name: "(M)",        color: "#e8510a", width: 2 },
      { key: "Q", name: "Q= H-C",    color: "#9e9e9e", width: 3 },
      { key: "X", name: "X=(D+S+M)", color: "#c97d0a", width: 2.5 },
    ];

    const allV = series.flatMap(s => rows.map(r => Number(r[s.key]) || 0));
    const yMax = Math.ceil(Math.max(...allV, 1) / 50) * 50;
    const toX = i => padL + (i / (rows.length - 1)) * cW;
    const toY = v => padT + cH - (v / yMax) * cH;

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, CW, CH);
    // Chart border box
    ctx.strokeStyle = "#ccc"; ctx.lineWidth = 1;
    ctx.strokeRect(padL, padT, cW, cH);

    // Title
    ctx.fillStyle = "#111"; ctx.font = "bold 17px Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("Graph on Trucks Weighed per Hour", CW / 2, 10);

    // Grid + Y labels
    ctx.font = "10px Arial"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let v = 0; v <= yMax; v += 50) {
      const y = toY(v);
      ctx.strokeStyle = "#cccccc"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + cW, y); ctx.stroke();
      ctx.fillStyle = "#888"; ctx.fillText(v, padL - 5, y);
    }

    // X labels
    ctx.font = "9px Arial"; ctx.fillStyle = "#555";
    ctx.textAlign = "right"; ctx.textBaseline = "top";
    rows.forEach((r, i) => {
      const x = toX(i), y = padT + cH + 5;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 4);
      ctx.fillText(r.time || "", 0, 0); ctx.restore();
    });

    // Lines
    series.forEach(s => {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width; ctx.lineJoin = "round";
      ctx.beginPath();
      rows.forEach((r, i) => {
        const x = toX(i), y = toY(Number(r[s.key]) || 0);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // Legend
    const legendY = CH - 14, swatchW = 24, gap = 120;
    const totalLegendW = series.length * gap;
    let lx = (CW - totalLegendW) / 2;
    ctx.font = "11px Arial"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    series.forEach(s => {
      ctx.strokeStyle = s.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lx, legendY); ctx.lineTo(lx + swatchW, legendY); ctx.stroke();
      ctx.fillStyle = "#111"; ctx.fillText(s.name, lx + swatchW + 5, legendY);
      lx += gap;
    });
  }, [rows, chartHeight]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: chartHeight, display: "block" }} />;
}

// ─────────────────────────────────────────────
// Page 2 — Daily Hourly Data + Chart
// ─────────────────────────────────────────────
function Page2({ rows, date }) {
  const tableRef = useRef(null);
  const [tableH, setTableH] = useState(400);

  useEffect(() => {
    if (tableRef.current) {
      const h = tableRef.current.getBoundingClientRect().height;
      if (h > 50) setTableH(h);
    }
  }, [rows]);

  if (!rows?.length) return null;

  const numKeys = ["N","M","Q","X"];
  const totals = {};
  numKeys.forEach(k => { totals[k] = rows.reduce((s, r) => s + (Number(r[k]) || 0), 0); });

  const th = { ...PDF.th, fontSize: 9, padding: "5px 3px", borderRight: "1px solid #000" };
  const td = { ...PDF.td, fontSize: 9, padding: "4px 3px",borderRight: "1px solid #000" };
  const tdB = { ...td, fontWeight: "bold" };

  return (
    <PageWrapper pageNum={2} totalPages={3} date={date}>
      <div style={PDF.sectionTitle}>2.&nbsp;&nbsp; DAILY HOURLY DATA</div>

      <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
        {/* Table */}
        <div ref={tableRef} style={{ flex: "0 0 32%", overflowX: "hidden", boxSizing: "border-box", alignSelf: "stretch" }}>
          <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%" }}>
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "18%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={th}>Time</th>
                <th style={th}>{"Multideck\nweighed"}</th>
                <th style={th}>{"Manu\nally"}</th>
                <th style={th}>{"HSWIM\nCLEARED"}</th>
                <th style={th}>{"Total\nweighed"}</th>
              </tr>
              <tr>
                <th style={th}></th>
                <th style={th}>N=(D+S)</th>
                <th style={th}>(M)</th>
                <th style={th}>Q = H-C</th>
                <th style={th}>X= (N+M)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={td}>{row.time}</td>
                  <td style={td}>{row.N ?? 0}</td>
                  <td style={td}>{row.M ?? 0}</td>
                  <td style={td}>{row.Q ?? 0}</td>
                  <td style={td}>{row.X ?? 0}</td>
                </tr>
              ))}
              <tr>
                <td style={tdB}>Total</td>
                <td style={tdB}>{totals.N}</td>
                <td style={tdB}>{totals.M}</td>
                <td style={tdB}>{totals.Q}</td>
                <td style={tdB}>{totals.X}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chart */}
         <div style={{ flex: "1 1 0", background: "#fff", padding: "8px 8px 8px 18px", display: "flex", alignItems: "center" }}>
          <CanvasLineChart rows={rows} chartHeight={tableH} />
        </div>
      </div>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────
// Page 3 — Traffic Census + Daily Summary
// ─────────────────────────────────────────────
function Page3({ summary, census, F, date }) {
  if (!summary) return null;

  const s = { ...summary, F: F ?? 0 };
  const eF = Number(s.F) || 0;
  const eE = Number(s.E) || 0;
  s.exemptTotal = eE + eF;

  const buses         = Number(census?.buses)          || 0;
  const veh3500to7000 = Number(census?.veh3500to7000)  || 0;
  const veh7000plus   = Number(census?.veh7000plus)    || 0;
  const K             = buses + veh3500to7000 + veh7000plus;

  const th = PDF.th;
  const td = PDF.td;

  return (
    <PageWrapper pageNum={3} totalPages={3} date={date}>

      {/* ── 3. TRAFFIC CENSUS DATA ── */}
      <div style={PDF.sectionTitle}>3.&nbsp;&nbsp; TRAFFIC CENSUS DATA</div>
      <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%", marginBottom: 24 }}>
        <colgroup>
          <col style={{ width: "14%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={th}>{"Buses>=\n3500kg"}</th>
            <th style={th}>{"Vehicles>= 3500kg\nbut <7000 excluding\nbuses"}</th>
            <th style={th}>{"Vehicles>=\n7000\nexcluding\nbuses"}</th>
            <th style={th}>{"Total\nTraffic\nCensus\n(K)"}</th>
            <th style={th}>{"Exemption\npermits Not\nweighed (E)"}</th>
            <th style={th}>{"Total\nWeighed"}</th>
            <th style={th}>{"Total\nTraffic"}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>{buses.toLocaleString()}</td>
            <td style={td}>{veh3500to7000.toLocaleString()}</td>
            <td style={td}>{veh7000plus.toLocaleString()}</td>
            <td style={td}>{K.toLocaleString()}</td>
            <td style={td}>{eE}</td>
            <td style={td}>{s.X ?? 0}</td>
            <td style={td}>{s.T ?? 0}</td>
          </tr>
        </tbody>
      </table>

      {/* ── 4. DAILY SUMMARY ── */}
      <div style={PDF.sectionTitle}>4.&nbsp;&nbsp; DAILY SUMMARY</div>
      <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%" }}>
        <colgroup>
          {Array.from({ length: 16 }).map((_, i) => (
            <col key={i} style={{ width: `${100/16}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th style={th}>{"Weighed\nby\nHSWIM\n(Q)"}</th>
            <th style={th}>{"Weighed\nMultideck\nScale\ntotal\n(N)=D+S"}</th>
            <th style={th}>{"Manually\nWeighed\n(M)"}</th>
            <th style={th}>{"Total\nweighed\n(X)"}</th>
            <th style={th}>{"Total\nTraffic\n(T)"}</th>
            <th style={th}>{"Total\nOverload\n(Y)\nA+Z+G+R"}</th>
            <th style={th}>{"Warned\n(A)"}</th>
            <th style={th}>{"Charged\n&Prohib\nited\n(Z)"}</th>
            <th style={th}>{"Special\nrelease\n(G)"}</th>
            <th style={th}>{"Vehicles\nCharged\nbut\nRedistrib\nuted (R)"}</th>
            <th style={th}>{"Impounded\n& prohibit\ned (P)\nZ+R+G"}</th>
            <th style={th}>{"Cases\ncleared\nin Court\n(B)"}</th>
            <th style={th}>{"Transgre\nssions"}</th>
            <th colSpan={3} style={th}>{"Exemption permits"}</th>
          </tr>
          <tr>
            <th style={th}>(Q=H-C)</th>
            <th style={th}>(N)</th>
            <th style={th}>(M)</th>
            <th style={th}>(X)=(S+M)</th>
            <th style={th}>(T)=(Q+X+K+E)</th>
            <th style={th}>(Y)</th>
            <th style={th}>(A)</th>
            <th style={th}>(Z)</th>
            <th style={th}>(G)</th>
            <th style={th}>(R)</th>
            <th style={th}>(P)</th>
            <th style={th}>(B)</th>
            <th style={th}>(L)</th>
            <th style={th}>{"Not\nweighed\n(E)"}</th>
            <th style={th}>{"Weighed\n(F)"}</th>
            <th style={th}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>{s.Q ?? 0}</td>
            <td style={td}>{s.N ?? 0}</td>
            <td style={td}>{s.M ?? 0}</td>
            <td style={td}>{s.X ?? 0}</td>
            <td style={td}>{s.T ?? 0}</td>
            <td style={td}>{s.Y ?? 0}</td>
            <td style={td}>{s.A ?? 0}</td>
            <td style={td}>{s.Z ?? 0}</td>
            <td style={td}>{s.G ?? 0}</td>
            <td style={td}>{s.R ?? 0}</td>
            <td style={td}>{s.P ?? 0}</td>
            <td style={td}>{s.B ?? 0}</td>
            <td style={td}>{s.L ?? 0}</td>
            <td style={td}>{eE}</td>
            <td style={td}>{eF}</td>
            <td style={td}>{s.exemptTotal}</td>
          </tr>
        </tbody>
      </table>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────
// HswimSection (root export)
// ─────────────────────────────────────────────
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

  const hasHswim     = !!hswimResult;
  const hasImpounded = !!impoundedResult;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

      {/* ── LEFT ─────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>

        <div className="section-card">
          <div className="section-header">
            <span className="section-title">HSWIM DAILY STATISTICS</span>
            {hasHswim && <span className="section-badge">✓ {hswimResult.totalRows} ROWS</span>}
            {busy && !hasHswim && <span className="section-badge section-badge-busy">UPLOADING…</span>}
          </div>
          <Dropzone label="Drop HSWIM Daily CSV / XLSX" sublabel=".csv or .xlsx · 24 hourly rows"
            file={hswimFile} onDrop={uploadHswim} onClear={clearHswim} busy={busy} />
        </div>

        <div className="section-card">
          <div className="section-header">
            <span className="section-title">IMPOUNDED & OVERLOADED</span>
            {hasImpounded && <span className="section-badge">✓ F = {impoundedResult.F}</span>}
            {busy && !hasImpounded && <span className="section-badge section-badge-busy">UPLOADING…</span>}
          </div>
          <Dropzone label="Drop Impounded & Overloaded CSV / XLSX" sublabel=".csv or .xlsx · Vardict column required"
            file={impoundedFile} onDrop={uploadImpounded} onClear={clearImpounded} busy={busy} />
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

        {/* ── A4 PREVIEW ── */}
        {hasHswim && (
          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <Page1
              rows={hswimResult.reportData?.hourlyRows}
              date={manualFields.date}
              preparedBy={manualFields.preparedBy}
              approvedBy={manualFields.approvedBy}
            />
            <Page2
              rows={hswimResult.reportData?.graphRows}
              date={manualFields.date}
            />
            <Page3
              summary={hswimResult.reportData?.summary}
              census={hswimResult.reportData?.census}
              F={impoundedResult?.F}
              date={manualFields.date}
            />
          </div>
        )}
      </div>

      {/* ── RIGHT: manual fields ──────────────────────── */}
      <div style={{ width: 220, minWidth: 220, flexShrink: 0, background: "#0f172a", borderRadius: 8, padding: "16px 14px", position: "sticky", top: 64 }}>
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