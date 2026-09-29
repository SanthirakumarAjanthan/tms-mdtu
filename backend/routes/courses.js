const router = require('express').Router();
const { Course } = require('../models');
const { buildCrud } = require('../utils/crudFactory');
const { exportToCsv, parseCsv, csvUpload } = require('../utils/csvHelper');
const { auth } = require('../middleware/auth');

router.use(auth);

// ── Export CSV ─────────────────────────────────────────────────
router.get('/export/csv', async (req, res) => {
  try {
    const rows = await Course.findAll();
    const headers = ['Category', 'Training Programme Name', 'Target Group', 'Duration (Days)', 'Active'];
    const data = rows.map(r => [r.category, r.name, r.target_group, r.duration, r.active ? 'Yes' : 'No']);
    exportToCsv(res, 'Courses', headers, data);
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
      const name = (r['Training Programme Name'] || r['name'] || '').trim();
      if (!name) { errors.push('Skipped row — missing Training Programme Name'); continue; }
      try {
        const payload = {
          name,
          category:     r['Category'] || r['category'] || '',
          target_group: r['Target Group'] || r['target_group'] || '',
          duration:     Number(r['Duration (Days)'] || r['duration'] || 1),
          active:       (r['Active'] || r['active'] || 'Yes').toLowerCase() !== 'no',
        };
        const existing = await Course.findOne({ where: { name } });
        if (existing) { await existing.update(payload); updated++; }
        else { await Course.create(payload); inserted++; }
      } catch (e) {
        errors.push(`"${name}": ${e.message}`);
      }
    }
    res.json({ success: true, inserted, updated, errors });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

buildCrud(router, Course, ['name', 'category', 'target_group']);
module.exports = router;
