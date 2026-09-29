const router = require('express').Router();
const { Institution } = require('../models');
const { buildCrud } = require('../utils/crudFactory');
const { exportToCsv, parseCsv, csvUpload } = require('../utils/csvHelper');
const { auth } = require('../middleware/auth');

router.use(auth);

// ── Export CSV ─────────────────────────────────────────────────
router.get('/export/csv', async (req, res) => {
  try {
    const rows = await Institution.findAll();
    const headers = ['HOD Title', 'Institution Name', 'Address', 'Active'];
    const data = rows.map(r => [r.hod, r.name, r.address, r.active ? 'Yes' : 'No']);
    exportToCsv(res, 'Institutions', headers, data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Import CSV (upsert by name) ────────────────────────────────
router.post('/import/csv', csvUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const records = parseCsv(req.file.buffer);
    let inserted = 0, updated = 0, errors = [];

    for (const r of records) {
      const name = (r['Institution Name'] || r['name'] || '').trim();
      if (!name) { errors.push('Skipped row — missing Institution Name'); continue; }
      try {
        const payload = {
          name,
          hod:    r['HOD Title'] || r['hod'] || '',
          address:r['Address'] || r['address'] || '',
          active: (r['Active'] || r['active'] || 'Yes').toLowerCase() !== 'no',
        };
        const existing = await Institution.findOne({ where: { name } });
        if (existing) { await existing.update(payload); updated++; }
        else { await Institution.create(payload); inserted++; }
      } catch (e) {
        errors.push(`"${name}": ${e.message}`);
      }
    }
    res.json({ success: true, inserted, updated, errors });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

buildCrud(router, Institution, ['name', 'hod', 'address']);
module.exports = router;
