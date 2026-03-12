import { formatCell } from "../utils/formatCell";
import { formatImpoundedCell } from "../utils/formatImpoundedCell";

/**
 * @param {Array}   rows      - previewRows from server
 * @param {Array}   columns   - PDF_COLUMNS or IMPOUNDED_COLUMNS
 * @param {boolean} rotated   - true for wide load (rotated), false for impounded (normal)
 */
export function PreviewTable({ rows, columns, rotated = true }) {
  if (!rows?.length) return null;

  const formatter = rotated ? formatCell : formatImpoundedCell;

  return (
    <div className="table-wrapper">
      {/* ✅ adds either "rotated" or "horizontal" class to scope CSS */}
      <table className={`preview-table ${rotated ? "rotated" : "horizontal"}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>
                <span>{col.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key}>
                  <span>{formatter(col.key, row[col.key])}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}