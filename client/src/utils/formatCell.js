import { DATE_COLUMNS, NUMBER_COLUMNS } from "../config/sections";

/**
 * Formats a cell value based on its column type.
 * - DATE_COLUMNS  → DD/MM/YYYY
 * - NUMBER_COLUMNS → rounded with commas e.g. 14,500
 * - everything else → uppercased string
 */
export function formatCell(col, val) {
  if (!val) return val;

  if (DATE_COLUMNS.includes(col)) {
    const d = new Date(val);
    if (!isNaN(d))
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  if (NUMBER_COLUMNS.includes(col)) {
    const n = Math.round(Number(val));
    if (!isNaN(n)) return n.toLocaleString();
  }

  return String(val).toUpperCase();
}