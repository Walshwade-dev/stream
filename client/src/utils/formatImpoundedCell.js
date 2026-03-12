import { IMPOUNDED_DATE_COLUMNS, IMPOUNDED_NUMBER_COLUMNS } from "../config/sections";

/**
 * Formats a cell value for the Impounded & Prohibited table.
 * - Dates   → DD/MM/YYYY
 * - Numbers → comma formatted integers
 * - Text    → UPPERCASE
 */
export function formatImpoundedCell(col, val) {
  if (val === null || val === undefined || val === "") return "";

  if (IMPOUNDED_DATE_COLUMNS.includes(col)) {
    const d = new Date(val);
    if (!isNaN(d))
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  if (IMPOUNDED_NUMBER_COLUMNS.includes(col)) {
    const n = Math.round(Number(val));
    if (!isNaN(n)) return n.toLocaleString();
  }

  return String(val).toUpperCase();
}