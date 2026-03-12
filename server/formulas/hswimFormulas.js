// Pure formula functions — no I/O, fully testable in isolation
// These mirror every red-cell formula in the colored Excel template

// ─── Per-row derived fields ────────────────────────────────────────────────

// X = D + S + M  (Total Weighed)
export const calcX = row => row.D + row.S + row.M;

// N = D + S  (Multideck Scale total — used in graph table)
export const calcN = row => row.D + row.S;

// Y = A + Z + G + R  (Total Overloaded)
export const calcY = row => row.A + row.Z + row.G + row.R;

// P = Z + R  (Impounded & Prohibited)
export const calcP = row => row.Z + row.R;

// Enrich a single hourly row with all derived fields
export function enrichRow(row) {
  return {
    ...row,
    X: calcX(row),
    N: calcN(row),
    Y: calcY(row),
    P: calcP(row),
  };
}

// ─── Column totals ─────────────────────────────────────────────────────────

export function calcTotals(enrichedRows) {
  const sum = key => enrichedRows.reduce((acc, r) => acc + (r[key] || 0), 0);

  const D = sum("D");
  const S = sum("S");
  const M = sum("M");
  const H = sum("H");
  const Q = sum("Q");
  const C = sum("C");
  const A = sum("A");
  const Z = sum("Z");
  const G = sum("G");
  const R = sum("R");
  const E = sum("E");

  // Derived totals
  const X = D + S + M;
  const N = D + S;
  const Y = A + Z + G + R;
  const P = Z + R;

  return { D, S, M, H, Q, C, A, Z, G, R, E, X, N, Y, P };
}

// ─── Traffic Census (Table 3) ──────────────────────────────────────────────

// K = total traffic census count (sum of the 3 vehicle categories)
export const calcK = ({ buses, veh3500to7000, veh7000plus }) =>
  buses + veh3500to7000 + veh7000plus;

// T = total traffic (Q + X + K + E)
export const calcT = ({ Q, X, K, E }) => Q + X + K + E;

// ─── Daily Summary (Table 4) ───────────────────────────────────────────────

export function buildSummary({ totals, census, manualFields, F }) {
  const { Q, N, M, X, Y, A, Z, G, R, P, E } = totals;
  const { buses, veh3500to7000, veh7000plus } = census;
  const { B, L } = manualFields;

  const K = calcK(census);
  const T = calcT({ Q, X, K, E });

  return {
    // Weighed counts
    Q,               // Weighed by HSWIM
    N,               // Weighed Scale total (D+S)
    M,               // Manually weighed
    X,               // Total weighed

    // Traffic
    T,               // Total traffic

    // Overload actions
    Y,               // Total overloaded
    A,               // Warned
    Z,               // Charged & Prohibited
    G,               // Special Release
    R,               // Redistributed
    P,               // Impounded & Prohibited (Z+R)

    // Court / legal
    B,               // Cases cleared in court (manual)
    L,               // Transgressions (manual)

    // Exemption permits
    E,               // Not weighed
    F,               // Weighed (from impounded file)
    exemptTotal: E + F,

    // Census
    buses,
    veh3500to7000,
    veh7000plus,
    K,               // Total traffic census
  };
}

// ─── Graph table (Table 2) ─────────────────────────────────────────────────

// Returns the 24-row simplified table used for both the preview and the chart
export function buildGraphRows(enrichedRows) {
  return enrichedRows.map(row => ({
    time:  row.time,
    N:     row.N,          // Multideck weighed (D+S)
    M:     row.M,          // Manually
    Q:     row.Q,          // HSWIM Cleared
    X:     row.X,          // Total weighed (N+M)
  }));
}

// ─── Full report data object ───────────────────────────────────────────────

export function buildReportData({ hourlyRows, census, manualFields, F }) {
  const enrichedRows = hourlyRows.map(enrichRow);
  const totals       = calcTotals(enrichedRows);
  const summary      = buildSummary({ totals, census, manualFields, F });
  const graphRows    = buildGraphRows(enrichedRows);

  return {
    hourlyRows:   enrichedRows,   // Table 1 — 24 rows with all derived fields
    graphRows,                     // Table 2 — simplified 5-col rows
    totals,                        // Column totals
    summary,                       // Table 3 + Table 4 values
    census,                        // Raw census inputs
    manualFields,                  // B, L
    F,                             // Weighed exemption permits
  };
}