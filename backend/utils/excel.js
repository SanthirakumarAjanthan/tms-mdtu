const ExcelJS = require('exceljs');

/**
 * Generic Excel export helper.
 * @param {Object} res        - Express response object
 * @param {string} filename   - File name without extension
 * @param {string} sheetName  - Sheet tab name
 * @param {string[]} headers  - Column header labels
 * @param {Array[]} rows      - Array of arrays (one per data row)
 */
async function exportToExcel(res, filename, sheetName, headers, rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);

  // Header row
  ws.addRow(headers);
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Data rows
  rows.forEach(r => ws.addRow(r));

  // Auto-width columns
  ws.columns.forEach(col => {
    let max = 10;
    col.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > max) max = len;
    });
    col.width = Math.min(max + 4, 50);
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
}

module.exports = { exportToExcel };
