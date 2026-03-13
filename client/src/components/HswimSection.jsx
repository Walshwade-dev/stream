import { useCallback, useEffect, useRef, useState } from "react";
import { useHswimUpload } from "../hooks/useHswimUpload.js";


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

// ─────────────────────────────────────────────
// ManualField
// ─────────────────────────────────────────────
function ManualField({ label, fieldKey, value, onChange, type = "number", placeholder = "0" }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{
        display: "block", color: "#94a3b8", fontSize: 10,
        letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase",
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        style={{
          width: "100%", background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 4, padding: "6px 10px", color: "#e2e8f0",
          fontSize: 12, fontFamily: "inherit", outline: "none",
        }}
        onFocus={e => e.target.style.borderColor = "#4ade80"}
        onBlur={e => e.target.style.borderColor = "#1e293b"}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// HourlyTable  (Table 1)
// ─────────────────────────────────────────────
function HourlyTable({ rows, date }) {
  if (!rows?.length) return null;

  const numKeys = ["D","S","M","H","Q","X","C","Y","P","A","Z","G","R","E"];
  const totals = {};
  numKeys.forEach(k => { totals[k] = rows.reduce((s, r) => s + (r[k] || 0), 0); });

  const DT = "5%";
  const DC = "4%";

  const thBase = {
    background: "#fff", color: "#000", border: "1px solid #000",
    textAlign: "center", fontFamily: "Arial, sans-serif", fontWeight: "bold",
    fontSize: 8, padding: "2px 1px", verticalAlign: "bottom", overflow: "hidden",
  };
  const tdBase = {
    background: "#fff", color: "#000", border: "1px solid #000",
    textAlign: "center", fontFamily: "Arial, sans-serif",
    fontSize: 8, padding: "2px 1px", overflow: "hidden",
  };
  const thWide  = { ...thBase, verticalAlign: "middle" };
  const thGroup = { ...thBase, verticalAlign: "middle", fontSize: 9, fontWeight: "bold" };
  const tdBold  = { ...tdBase, fontWeight: "bold" };

  const rot = (text) => (
    <span style={{ display: "block", whiteSpace: "pre-line", fontSize: 8, lineHeight: 1.2, textAlign: "center" }}>
      {text}
    </span>
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Hourly Data Preview
      </div>
      <div style={{ width: "100%", overflowX: "hidden", border: "1px solid #000" }}>
        <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%", fontFamily: "Arial, sans-serif" }}>
          <colgroup>
            <col style={{ width: DT }} />
            <col style={{ width: DT }} />
            {numKeys.map(k => <col key={k} style={{ width: DC }} />)}
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={3} style={thWide}>DATE</th>
              <th rowSpan={3} style={thWide}>TIME</th>
              <th colSpan={6} style={thGroup}>TRUCKS WEIGHED</th>
              <th rowSpan={2} style={thBase}>{rot("CALLED\nIN")}</th>
              <th rowSpan={2} style={thBase}>{rot("TOTAL\nOVER\nLOAD")}</th>
              <th rowSpan={2} style={thBase}>{rot("IMP &\nPROH")}</th>
              <th rowSpan={2} style={thBase}>{rot("WARNED\nTRUCKS")}</th>
              <th rowSpan={2} style={thBase}>{rot("CHG &\nPROH")}</th>
              <th rowSpan={2} style={thBase}>{rot("SPEC\nREL")}</th>
              <th rowSpan={2} style={thBase}>{rot("REDIS\nTRIB")}</th>
              <th rowSpan={2} style={thBase}>{rot("EXM\nPMT\nNOT\nWGH")}</th>
            </tr>
            <tr>
              <th style={thBase}>{rot("MULTI\nDECK\nSCALE")}</th>
              <th style={thBase}>{rot("WEIGH\nED\nSAW")}</th>
              <th style={thBase}>{rot("MAN\nUALLY")}</th>
              <th style={thBase}>{rot("HSWIM\nTOTAL")}</th>
              <th style={thBase}>{rot("HSWIM\nCLEAR")}</th>
              <th style={thBase}>{rot("TOTAL\nWEIGH")}</th>
            </tr>
            <tr>
              <th style={thBase}>{rot("(D)")}</th>
              <th style={thBase}>{rot("(S)")}</th>
              <th style={thBase}>{rot("(M)")}</th>
              <th style={thBase}>{rot("(H)")}</th>
              <th style={thBase}>{rot("Q=\nH-C")}</th>
              <th style={thBase}>{rot("X=\nD+M\n+S")}</th>
              <th style={thBase}>{rot("(C)")}</th>
              <th style={thBase}>{rot("(Y)=\nA+Z\n+G+R")}</th>
              <th style={thBase}>{rot("(P)=\nZ+R")}</th>
              <th style={thBase}>{rot("(A)")}</th>
              <th style={thBase}>{rot("(Z)")}</th>
              <th style={thBase}>{rot("(G)")}</th>
              <th style={thBase}>{rot("(R)")}</th>
              <th style={thBase}>{rot("(E)")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={tdBase}>{i === 0 ? (date || "") : ""}</td>
                <td style={tdBase}>{row.time}</td>
                <td style={tdBase}>{row.D}</td>
                <td style={tdBase}>{row.S}</td>
                <td style={tdBase}>{row.M}</td>
                <td style={tdBase}>{row.H}</td>
                <td style={tdBase}>{row.Q}</td>
                <td style={tdBase}>{row.X}</td>
                <td style={tdBase}>{row.C}</td>
                <td style={tdBase}>{row.Y}</td>
                <td style={tdBase}>{row.P}</td>
                <td style={tdBase}>{row.A}</td>
                <td style={tdBase}>{row.Z}</td>
                <td style={tdBase}>{row.G}</td>
                <td style={tdBase}>{row.R}</td>
                <td style={tdBase}>{row.E}</td>
              </tr>
            ))}
            <tr>
              <td style={tdBold}>Totals</td>
              <td style={tdBase}></td>
              {numKeys.map(k => <td key={k} style={tdBold}>{totals[k]}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CanvasLineChart — pure canvas, no library
// chartHeight prop drives canvas logical height
// so it matches the table beside it exactly.
// ─────────────────────────────────────────────
function CanvasLineChart({ rows, chartHeight }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!rows?.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    // Logical canvas size — ×2 for crisp rendering on high-DPI screens.
    // CSS height is set to chartHeight so it occupies exactly the right space.
    const CW = 900;
    const CH = Math.max(chartHeight * 2, 300);
    canvas.width  = CW;
    canvas.height = CH;

    // ── Padding ───────────────────────────────────
    const padLeft   = 44;
    const padRight  = 12;
    const padTop    = 36;
    const padBottom = 80;   // x-axis labels + legend
    const chartW    = CW - padLeft - padRight;
    const chartH    = CH - padTop - padBottom;

    // ── Series ────────────────────────────────────
    const series = [
      { key: "N", name: "N=(D+S)",    color: "#2563eb", width: 2 },
      { key: "M", name: "(M)",        color: "#f97316", width: 2 },
      { key: "Q", name: "Q= H-C",    color: "#aaaaaa", width: 3 },
      { key: "X", name: "X=(D+S+M)", color: "#ca8a04", width: 2 },
    ];

    // ── Y scale ───────────────────────────────────
    const allValues = series.flatMap(s => rows.map(r => Number(r[s.key]) || 0));
    const dataMax   = Math.max(...allValues, 1);
    const yMax      = Math.ceil(dataMax / 50) * 50;

    const toX = i => padLeft + (i / (rows.length - 1)) * chartW;
    const toY = v => padTop  + chartH - (v / yMax) * chartH;

    // ── Clear ─────────────────────────────────────
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, CW, CH);

    // ── Title ─────────────────────────────────────
    ctx.fillStyle    = "#111";
    ctx.font         = "bold 16px Arial";
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Graph on Trucks Weighed per Hour", CW / 2, 10);

    // ── Y grid + labels ───────────────────────────
    ctx.font         = "11px Arial";
    ctx.textAlign    = "right";
    ctx.textBaseline = "middle";
    for (let v = 0; v <= yMax; v += 50) {
      const y = toY(v);
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();
      ctx.fillStyle = "#555";
      ctx.fillText(v, padLeft - 5, y);
    }

    // ── X labels rotated -45° ─────────────────────
    ctx.font         = "9px Arial";
    ctx.fillStyle    = "#555";
    ctx.textAlign    = "right";
    ctx.textBaseline = "top";
    rows.forEach((r, i) => {
      const x = toX(i);
      const y = padTop + chartH + 4;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(r.time || "", 0, 0);
      ctx.restore();
    });

    // ── Lines ─────────────────────────────────────
    series.forEach(s => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth   = s.width;
      ctx.lineJoin    = "round";
      ctx.beginPath();
      rows.forEach((r, i) => {
        const x = toX(i);
        const y = toY(Number(r[s.key]) || 0);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // ── Legend ────────────────────────────────────
    const legendY   = CH - 18;
    const itemW     = 120;
    const swatchW   = 22;
    let lx          = (CW - series.length * itemW) / 2;
    ctx.font         = "11px Arial";
    ctx.textAlign    = "left";
    ctx.textBaseline = "middle";
    series.forEach(s => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth   = 2.5;
      ctx.beginPath();
      ctx.moveTo(lx, legendY);
      ctx.lineTo(lx + swatchW, legendY);
      ctx.stroke();
      ctx.fillStyle = "#111";
      ctx.fillText(s.name, lx + swatchW + 5, legendY);
      lx += itemW;
    });

  }, [rows, chartHeight]);

  // CSS height matches the table; width fills container up to maxWidth on parent
  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: chartHeight, display: "block" }}
    />
  );
}

// ─────────────────────────────────────────────
// GraphSection — Table 2 left + chart right
// Chart height = table height, chart maxWidth
// prevents over-enlarging on wide screens.
// ─────────────────────────────────────────────
function GraphSection({ rows }) {
  // Hooks must come before any early return (rules-of-hooks)
  const tableRef = useRef(null);
  const [tableH, setTableH] = useState(400);

  useEffect(() => {
    if (tableRef.current) {
      const h = tableRef.current.getBoundingClientRect().height;
      if (h > 50) setTableH(h);
    }
  }, [rows]);

  if (!rows?.length) return null;

  const numKeys = ["N", "M", "Q", "X"];
  const totals  = {};
  numKeys.forEach(k => {
    totals[k] = rows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  });

  const thStyle = {
    background: "#fff", color: "#000", border: "1px solid #000",
    fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: 10,
    padding: "5px 6px", textAlign: "center", whiteSpace: "pre-line",
    verticalAlign: "middle",
  };
  const tdStyle = {
    background: "#fff", color: "#000", border: "1px solid #000",
    fontFamily: "Arial, sans-serif", fontSize: 10,
    padding: "3px 6px", textAlign: "center",
  };
  const tdBoldStyle = { ...tdStyle, fontWeight: "bold" };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
        Graph Table (Table 2)
      </div>

      {/* Outer wrapper: caps total section width on large screens */}
      <div style={{ width: "100%", maxWidth: 960, display: "flex", gap: 0, alignItems: "stretch", border: "1px solid #ccc" }}>

        {/* ── LEFT: data table — natural width ── */}
        <div ref={tableRef} style={{ flex: "0 0 35%", overflowX: "hidden", borderRight: "1px solid #ccc" }}>
          <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%", fontFamily: "Arial, sans-serif" }}>
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "17.5%" }} />
              <col style={{ width: "17.5%" }} />
              <col style={{ width: "17.5%" }} />
              <col style={{ width: "17.5%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>{"Multideck\nWeighed"}</th>
                <th style={thStyle}>{"Manu\nally"}</th>
                <th style={thStyle}>{"HSWIM\nCLEARED"}</th>
                <th style={thStyle}>{"Total\nWeighed"}</th>
              </tr>
              <tr>
                <th style={thStyle}></th>
                <th style={thStyle}>N=(D+S)</th>
                <th style={thStyle}>(M)</th>
                <th style={thStyle}>Q = H-C</th>
                <th style={thStyle}>X= (N+M)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{row.time}</td>
                  <td style={tdStyle}>{row.N ?? 0}</td>
                  <td style={tdStyle}>{row.M ?? 0}</td>
                  <td style={tdStyle}>{row.Q ?? 0}</td>
                  <td style={tdStyle}>{row.X ?? 0}</td>
                </tr>
              ))}
              <tr>
                <td style={tdBoldStyle}>Total</td>
                <td style={tdBoldStyle}>{totals.N}</td>
                <td style={tdBoldStyle}>{totals.M}</td>
                <td style={tdBoldStyle}>{totals.Q}</td>
                <td style={tdBoldStyle}>{totals.X}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── RIGHT: canvas chart — matches table height, centered vertically ── */}
        <div style={{
          flex: "1 1 65%",
          background: "#fff",
          padding: "8px",
          display: "flex",
          alignItems: "center",   // vertically centres canvas when chart < container
          overflow: "hidden",
        }}>
          <CanvasLineChart rows={rows} chartHeight={tableH} />
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SummaryTable — white bordered tables matching
// desired daily summary + census screenshots
// ─────────────────────────────────────────────
function SummaryTable({ summary, census, F }) {
  if (!summary) return null;

  const s   = { ...summary, F: F ?? 0 };
  const eF  = Number(s.F) || 0;
  const eE  = Number(s.E) || 0;
  s.exemptTotal = eE + eF;

  const buses        = Number(census?.buses)         || 0;
  const veh3500to7000= Number(census?.veh3500to7000) || 0;
  const veh7000plus  = Number(census?.veh7000plus)   || 0;
  const K            = buses + veh3500to7000 + veh7000plus;

  // ── shared cell styles ──────────────────────
  const th = {
    background: "#fff", color: "#000", border: "1px solid #000",
    fontFamily: "Arial, sans-serif", fontWeight: "bold", fontSize: 9,
    padding: "5px 4px", textAlign: "center", verticalAlign: "middle",
    whiteSpace: "pre-line",
  };
  const td = {
    background: "#fff", color: "#000", border: "1px solid #000",
    fontFamily: "Arial, sans-serif", fontSize: 9,
    padding: "4px", textAlign: "center", verticalAlign: "middle",
  };
  const tbl = {
    borderCollapse: "collapse", tableLayout: "fixed",
    width: "100%", fontFamily: "Arial, sans-serif",
  };

  return (
    <div style={{ marginBottom: 16 }}>

      {/* ── DAILY SUMMARY TABLE ── */}
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Daily Summary
      </div>
      <div style={{ width: "100%", overflowX: "hidden", marginBottom: 16 }}>
        <table style={tbl}>
          <colgroup>
            {/* 14 data columns + 3 exemption sub-cols = 17 cols total */}
            {Array.from({ length: 14 }).map((_, i) => <col key={i} style={{ width: `${100/17}%` }} />)}
            <col style={{ width: `${100/17}%` }} />
            <col style={{ width: `${100/17}%` }} />
            <col style={{ width: `${100/17}%` }} />
          </colgroup>
          <thead>
            {/* Row 1: column names */}
            <tr>
              <th style={th}>{"Weighed\nby\nHSWIM\n(Q)"}</th>
              <th style={th}>{"Weighed\nMultideck\nScale\ntotal\n(N)=D\n+S"}</th>
              <th style={th}>{"Manua\nlly\nWeigh\ned (M)"}</th>
              <th style={th}>{"Total\nweighed\n(X)"}</th>
              <th style={th}>{"Total\nTraffic\n(T)"}</th>
              <th style={th}>{"Total\nOverlo\nad (Y)\nA+Z+G\n+R"}</th>
              <th style={th}>{"Warn\ned\n(A)"}</th>
              <th style={th}>{"Charg\ned\n&Proh\nibited\n(Z)"}</th>
              <th style={th}>{"Spec\nial\nrelea\nse\n(G)"}</th>
              <th style={th}>{"Vehicles\nCharged\nbut\nRedistr ibuted\n(R)"}</th>
              <th style={th}>{"Impoun\nded &\nprohibit\ned\n(P)\nZ+R+G"}</th>
              <th style={th}>{"Cases\ncleard\nd in\nCourt(\nB)"}</th>
              <th style={th}>{"Transg\nressio\nns"}</th>
              <th colSpan={3} style={th}>{"Exemption permits"}</th>
            </tr>
            {/* Row 2: formula keys */}
            <tr>
              <th style={th}>(Q=H-\nC)</th>
              <th style={th}>(N)</th>
              <th style={th}>(M)</th>
              <th style={th}>(X)=(S+M)</th>
              <th style={th}>(T)=(Q+\nX+K+E)</th>
              <th style={th}>(Y)</th>
              <th style={th}>(A)</th>
              <th style={th}>(Z)</th>
              <th style={th}>(G)</th>
              <th style={th}>(R)</th>
              <th style={th}>(P)</th>
              <th style={th}>(B)</th>
              <th style={th}>(L)</th>
              <th style={th}>{"Not\nweighed\n(E)"}</th>
              <th style={th}>{"Weigh\ned (F)"}</th>
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
      </div>

      {/* ── TRAFFIC CENSUS TABLE ── */}
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Traffic Census
      </div>
      <div style={{ width: "100%", overflowX: "hidden" }}>
        <table style={tbl}>
          <colgroup>
            <col style={{ width: "16%" }} />
            <col style={{ width: "20%" }} />
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
              <th style={th}>{"Total Weighed"}</th>
              <th style={th}>{"Total Traffic"}</th>
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
      </div>

    </div>
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

      {/* ── LEFT: main content ─────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>

        <div className="section-card">
          <div className="section-header">
            <span className="section-title">HSWIM DAILY STATISTICS</span>
            {hasHswim && <span className="section-badge">✓ {hswimResult.totalRows} ROWS</span>}
            {busy && !hasHswim && <span className="section-badge section-badge-busy">UPLOADING…</span>}
          </div>
          <Dropzone
            label="Drop HSWIM Daily CSV / XLSX"
            sublabel=".csv or .xlsx · 24 hourly rows"
            file={hswimFile} onDrop={uploadHswim} onClear={clearHswim} busy={busy}
          />
        </div>

        <div className="section-card">
          <div className="section-header">
            <span className="section-title">IMPOUNDED & OVERLOADED</span>
            {hasImpounded && <span className="section-badge">✓ F = {impoundedResult.F}</span>}
            {busy && !hasImpounded && <span className="section-badge section-badge-busy">UPLOADING…</span>}
          </div>
          <Dropzone
            label="Drop Impounded & Overloaded CSV / XLSX"
            sublabel=".csv or .xlsx · Vardict column required"
            file={impoundedFile} onDrop={uploadImpounded} onClear={clearImpounded} busy={busy}
          />
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
          <div style={{ width: "100%", overflow: "hidden" }}>
            <HourlyTable
              rows={hswimResult.reportData?.hourlyRows}
              date={manualFields.date}
            />
            <GraphSection rows={hswimResult.reportData?.graphRows} />
            <SummaryTable
              summary={hswimResult.reportData?.summary}
              census={hswimResult.reportData?.census}
              F={impoundedResult?.F}
            />
          </div>
        )}
      </div>

      {/* ── RIGHT: manual fields ────────────────────────── */}
      <div style={{
        width: 220, minWidth: 220, flexShrink: 0,
        background: "#0f172a", borderRadius: 8, padding: "16px 14px",
        position: "sticky", top: 64,
      }}>
        <div style={{
          color: "#4ade80", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          marginBottom: 14, borderBottom: "1px solid #1e293b", paddingBottom: 8,
        }}>
          Manual Fields
        </div>

        <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>
          Court & Compliance
        </div>
        <ManualField label="Cases Cleared in Court [B]" fieldKey="B"    value={manualFields.B}    onChange={updateManual} />
        <ManualField label="Transgressions [L]"          fieldKey="L"    value={manualFields.L}    onChange={updateManual} />

        <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.06em", margin: "12px 0 8px", textTransform: "uppercase" }}>
          Traffic Census
        </div>
        <ManualField label="Buses ≥3500kg"         fieldKey="buses"         value={manualFields.buses}         onChange={updateManual} />
        <ManualField label="Vehicles ≥3500–7000kg" fieldKey="veh3500to7000" value={manualFields.veh3500to7000} onChange={updateManual} />
        <ManualField label="Vehicles ≥7000kg"      fieldKey="veh7000plus"   value={manualFields.veh7000plus}   onChange={updateManual} />

        <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.06em", margin: "12px 0 8px", textTransform: "uppercase" }}>
          Report Info
        </div>
        <ManualField label="Date"        fieldKey="date"       value={manualFields.date}       onChange={updateManual} type="text" placeholder="e.g. 12/03/2026" />
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