/**
 * CSV export + import helpers for TMS backend.
 */
const { parse } = require('csv-parse/sync');

/**
 * Stream a CSV file download.
 * @param {Object} res          Express response
 * @param {string} filename     File name without extension
 * @param {string[]} headers    Column header labels
 * @param {Array[]} rows        Array of value arrays (one per data row)
 */
function exportToCsv(res, filename, headers, rows) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);

  // BOM for Excel UTF-8 compatibility
  let csv = '\uFEFF';
  csv += headers.map(h => `"${h}"`).join(',') + '\r\n';
  rows.forEach(row => {
    csv += row.map(v => {
      const val = v == null ? '' : String(v);
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',') + '\r\n';
  });

  res.send(csv);
}

/**
 * Parse a Buffer / string of CSV content into an array of objects.
 * First row is treated as headers.
 * @param {Buffer|string} buffer
 * @returns {Object[]}
 */
function parseCsv(buffer) {
  return parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
}

/**
 * multer in-memory storage middleware (for CSV upload).
 * Usage: router.post('/import/csv', csvUpload.single('file'), handler)
 */
const multer = require('multer');
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.csv$/i)) {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});

module.exports = { exportToCsv, parseCsv, csvUpload };
