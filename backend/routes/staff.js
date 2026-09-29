const router = require('express').Router();
const { Staff, Institution } = require('../models');
const { buildCrud } = require('../utils/crudFactory');
const { exportToExcel } = require('../utils/excel');
const { exportToCsv, parseCsv, csvUpload } = require('../utils/csvHelper');
const { auth } = require('../middleware/auth');

router.use(auth);

// ── Export Excel ───────────────────────────────────────────────
router.get('/export/excel', async (req, res) => {
  try {
    const staff = await Staff.findAll({ include: [{ model: Institution, attributes: ['name'] }] });
    const headers = ['#', 'NIC', 'Name', 'Email', 'Designation', 'Gender', 'District', 'Institution', 'Active'];
    const rows = staff.map((s, i) => [i + 1, s.nic, s.name, s.email || '', s.designation, s.gender, s.district, s.Institution?.name || '', s.active ? 'Yes' : 'No']);
    await exportToExcel(res, 'Staff_Details', 'Staff', headers, rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Export CSV ─────────────────────────────────────────────────
router.get('/export/csv', async (req, res) => {
  try {
    const staff = await Staff.findAll({ include: [{ model: Institution, attributes: ['name'] }] });
    const headers = ['NIC', 'Name', 'Email', 'Designation', 'Gender', 'District', 'Institution', 'Active'];
    const rows = staff.map(s => [s.nic, s.name, s.email || '', s.designation, s.gender, s.district, s.Institution?.name || '', s.active ? 'Yes' : 'No']);
    exportToCsv(res, 'Staff_Details', headers, rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Import CSV (upsert by NIC) ─────────────────────────────────
router.post('/import/csv', csvUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const records = parseCsv(req.file.buffer);
    let inserted = 0, updated = 0, errors = [];

    for (const r of records) {
      const nic = (r['NIC'] || r['nic'] || '').trim();
      if (!nic) { errors.push(`Skipped row — missing NIC`); continue; }
      try {
        const payload = {
          nic,
          name:        r['Name'] || r['name'] || '',
          email:       r['Email'] || r['email'] || '',
          designation: r['Designation'] || r['designation'] || '',
          gender:      r['Gender'] || r['gender'] || '',
          district:    r['District'] || r['district'] || '',
          active:      (r['Active'] || r['active'] || 'Yes').toLowerCase() !== 'no',
        };
        const existing = await Staff.findOne({ where: { nic } });
        if (existing) { await existing.update(payload); updated++; }
        else { await Staff.create(payload); inserted++; }
      } catch (e) {
        errors.push(`NIC ${nic}: ${e.message}`);
      }
    }
    res.json({ success: true, inserted, updated, errors });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── CRUD ───────────────────────────────────────────────────────
buildCrud(router, Staff, ['name', 'nic', 'designation', 'district'], [{ model: Institution, attributes: ['id', 'name'] }]);

module.exports = router;
