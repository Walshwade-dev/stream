import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { IMPOUNDED_COLUMNS } from "../config/sections";
import { formatImpoundedCell } from "./formatImpoundedCell";

/**
 * Generates and downloads a PDF for the Impounded & Prohibited section.
 * This table is HORIZONTAL — headers are not rotated.
 * @param {object} result - server response with allRows/previewRows and filename
 */
export function generateImpoundedPDF(result) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  const pageWidth  = doc.internal.pageSize.getWidth();
  const margins    = { top: 30, left: 14, right: 14 };
  const availableWidth = pageWidth - margins.left - margins.right;
  const colWidth   = availableWidth / IMPOUNDED_COLUMNS.length;

  const headers = IMPOUNDED_COLUMNS.map((c) => c.label);

  const allRows = result.allRows ?? result.previewRows;
  const rows = allRows.map((row) =>
    IMPOUNDED_COLUMNS.map((c) =>
      formatImpoundedCell(c.key, row[c.key]) ?? ""
    )
  );

  autoTable(doc, {
    showHead: "firstPage",
    rowPageBreak: "avoid",
    head: [headers],
    body: rows,

    styles: {
      font:          "helvetica",
      fontSize:      7,
      cellPadding:   3,
      textColor:     [0, 0, 0],
      fillColor:     [255, 255, 255],
      lineColor:     [0, 0, 0],
      lineWidth:     0.5,
      halign:        "center",
      valign:        "middle",
      overflow:      "linebreak",   // ✅ normal text wrapping
    },

    headStyles: {
      fillColor:     [255, 255, 255],
      textColor:     [0, 0, 0],
      fontStyle:     "bold",
      fontSize:      7,
      lineColor:     [0, 0, 0],
      lineWidth:     0.5,
      halign:        "center",
      valign:        "middle",
      whiteSpace:    "pre",         // ✅ respects \n in header labels
    },

    columnStyles: IMPOUNDED_COLUMNS.reduce((acc, _, i) => {
      acc[i] = { cellWidth: colWidth };
      return acc;
    }, {}),

    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.5,
    margin: margins,
  });

  doc.save(`${result.filename.replace(/\.[^/.]+$/, "")}_impounded_report.pdf`);
}