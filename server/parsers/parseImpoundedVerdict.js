import xlsx from "xlsx";

// Matches "App-" followed by digits — each match = one weighed permit
const PERMIT_REGEX = /App-\d+/gi;

// Possible column names for the verdict field
const VARDICT_HEADERS = [
  "Vardict",
  "vardict",
  "VARDICT",
  "Verdict",
  "verdict",
  "VERDICT",
];

function findVardictKey(row) {
  for (const key of VARDICT_HEADERS) {
    if (key in row) return key;
  }
  // Fallback: case-insensitive search
  const lower = Object.keys(row).find(
    k => k.trim().toLowerCase() === "vardict" ||
         k.trim().toLowerCase() === "verdict"
  );
  return lower || null;
}

export function parseImpoundedVerdict(buffer) {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rawRows = xlsx.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  if (!rawRows.length) {
    throw new Error("Impounded file is empty — no rows found.");
  }

  // Detect the vardict column from the first non-empty row
  const sampleRow = rawRows.find(r => Object.keys(r).length > 0);
  const vardictKey = findVardictKey(sampleRow || rawRows[0]);

  if (!vardictKey) {
    const found = Object.keys(sampleRow || rawRows[0]).join(", ");
    throw new Error(
      `Could not find 'Vardict' column. Columns found: ${found}`
    );
  }

  // Count every App-XXXXX occurrence across all verdict cells
  let F = 0;
  const details = []; // for debugging / preview

  for (const row of rawRows) {
    const cell = String(row[vardictKey] || "");
    const matches = cell.match(PERMIT_REGEX);
    if (matches && matches.length > 0) {
      F += matches.length;
      details.push({
        permits: matches,
        count: matches.length,
        raw: cell.substring(0, 80), // truncated for preview
      });
    }
  }

  return {
    F,               // total weighed exemption permits
    totalRows: rawRows.length,
    matchedRows: details.length,
    details,         // useful for preview / debugging
  };
}