import xlsx from "xlsx";

const COLUMN_MAP = {
  "Time": "time",
  "MultiDeck[D]": "D",
  "SingleAxle[S]": "S",
  "Mobile[]": "mob",
  "Manually[M]": "M",
  "HSWIM Total[H]": "H",
  "HSWIM[Cleared]Q=H-C": "Q",
  "Total Weighed x=[D+S+M+Q]": "X_raw",
  "Total Weighed x=[D+S+M]": "X_raw",
  "CalledIn[C]": "C",
  "WarnedTucks[A]": "A",
  "WarnedTrucks[A]": "A",
  "ChargedInCourt[Z]": "Z",
  "SpecialRelease[G]": "G",
  "Redistributed[R]": "R",
  "Impounded & Prohibited P=[Z+R]": "E",
  "Charged & Paid": "charged_paid",
};

const EXPECTED_TIMES = [
  "0000","0100","0200","0300","0400","0500",
  "0600","0700","0800","0900","1000","1100",
  "1200","1300","1400","1500","1600","1700",
  "1800","1900","2000","2100","2200","2300",
];

function toInt(val) {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseInt(String(val).replace(/,/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function normalizeHeader(raw) {
  const trimmed = String(raw).trim();
  if (COLUMN_MAP[trimmed]) return COLUMN_MAP[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(COLUMN_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }
  return null;
}

function formatTime(t) {
  const times = [
    "0000","0100","0200","0300","0400","0500",
    "0600","0700","0800","0900","1000","1100",
    "1200","1300","1400","1500","1600","1700",
    "1800","1900","2000","2100","2200","2300",
  ];
  const next = [
    "0100","0200","0300","0400","0500","0600",
    "0700","0800","0900","1000","1100","1200",
    "1300","1400","1500","1600","1700","1800",
    "1900","2000","2100","2200","2300","0000",
  ];
  const idx = times.indexOf(t);
  return idx >= 0 ? `${times[idx]}-${next[idx]}` : t;
}

function processRows(rawRows) {
  if (!rawRows.length) throw new Error("HSWIM file is empty.");

  const mappedRows = rawRows.map(row => {
    const mapped = {};
    for (const [rawKey, rawVal] of Object.entries(row)) {
      const normalKey = normalizeHeader(rawKey);
      if (normalKey) mapped[normalKey] = rawVal;
    }
    return mapped;
  });

  const hourlyRows = mappedRows.filter(row => {
    const t = String(row.time || "").trim().replace(/"/g, "");
    return EXPECTED_TIMES.includes(t);
  });

  if (hourlyRows.length === 0) throw new Error("No hourly rows found.");
  if (hourlyRows.length !== 24) throw new Error(`Expected 24 rows, found ${hourlyRows.length}.`);

  return hourlyRows.map(row => ({
    time: formatTime(String(row.time).trim().replace(/"/g, "")),
    D: toInt(row.D),
    S: toInt(row.S),
    M: toInt(row.M),
    H: toInt(row.H),
    Q: toInt(row.Q),
    C: toInt(row.C),
    A: toInt(row.A),
    Z: toInt(row.Z),
    G: toInt(row.G),
    R: toInt(row.R),
    E: toInt(row.E),
  }));
}

export function parseHswim(buffer) {
  const workbook = xlsx.read(buffer, { type: "buffer", raw: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: "", raw: false });
  return processRows(rawRows);
}