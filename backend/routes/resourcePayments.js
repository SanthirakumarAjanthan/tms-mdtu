const router = require('express').Router();
const { ResourcePayment } = require('../models');
const { buildCrud } = require('../utils/crudFactory');
const { exportToCsv, parseCsv, csvUpload } = require('../utils/csvHelper');
const { auth } = require('../middleware/auth');

router.use(auth);

// ── Export CSV ─────────────────────────────────────────────────
router.get('/export/csv', async (req, res) => {
  try {
    const rows = await ResourcePayment.findAll();
    exportToCsv(res, 'Resource_Payments', ['Qualification', 'Rate (Rs.)'], rows.map(r => [r.qualification, r.rate]));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Import CSV ─────────────────────────────────────────────────
router.post('/import/csv', csvUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const records = parseCsv(req.file.buffer);
    let inserted = 0, updated = 0, errors = [];
    for (const r of records) {
      const qualification = (r['Qualification'] || r['qualification'] || '').trim();
      if (!qualification) continue;
      try {
        const rate = Number(r['Rate (Rs.)'] || r['rate'] || 0);
        const existing = await ResourcePayment.findOne({ where: { qualification } });
        if (existing) { await existing.update({ rate }); updated++; }
        else { await ResourcePayment.create({ qualification, rate }); inserted++; }
      } catch (e) { errors.push(`"${qualification}": ${e.message}`); }
    }
    res.json({ success: true, inserted, updated, errors });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

buildCrud(router, ResourcePayment, ['qualification']);
module.exports = router;
