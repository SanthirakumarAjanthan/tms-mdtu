const router = require('express').Router();
const { ResourceQualification } = require('../models');
const { buildCrud } = require('../utils/crudFactory');
const { exportToCsv, parseCsv, csvUpload } = require('../utils/csvHelper');
const { auth } = require('../middleware/auth');

router.use(auth);

// ── Export CSV ─────────────────────────────────────────────────
router.get('/export/csv', async (req, res) => {
  try {
    const rows = await ResourceQualification.findAll();
    exportToCsv(res, 'Resource_Qualifications', ['Qualification'], rows.map(r => [r.name]));
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
      const name = (r['Qualification'] || r['name'] || '').trim();
      if (!name) continue;
      try {
        const existing = await ResourceQualification.findOne({ where: { name } });
        if (existing) { updated++; } // already exists, skip
        else { await ResourceQualification.create({ name }); inserted++; }
      } catch (e) { errors.push(`"${name}": ${e.message}`); }
    }
    res.json({ success: true, inserted, updated, errors });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

buildCrud(router, ResourceQualification, ['name']);
module.exports = router;
