const router = require('express').Router();
const { ResourcePerson, Institution, ResourceQualification, ResourcePayment } = require('../models');
const { buildCrud } = require('../utils/crudFactory');
const { exportToCsv, parseCsv, csvUpload } = require('../utils/csvHelper');
const { auth } = require('../middleware/auth');

router.use(auth);

const INCLUDE = [
  { model: Institution, attributes: ['id', 'name'] },
  { model: ResourceQualification, attributes: ['id', 'name'] },
  { model: ResourcePayment, attributes: ['id', 'qualification', 'rate'] },
];

// ── Export CSV ─────────────────────────────────────────────────
router.get('/export/csv', async (req, res) => {
  try {
    const rows = await ResourcePerson.findAll({ include: INCLUDE });
    const headers = ['Name', 'Designation', 'Institution', 'Qualification', 'Mobile', 'Email', 'Address', 'Active'];
    const data = rows.map(r => [
      r.name, r.designation,
      r.Institution?.name || '',
      r.ResourceQualification?.name || '',
      r.mobile, r.email, r.address,
      r.active ? 'Yes' : 'No',
    ]);
    exportToCsv(res, 'Resource_Persons', headers, data);
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
      const name = (r['Name'] || r['name'] || '').trim();
      if (!name) { errors.push('Skipped row — missing Name'); continue; }
      try {
        // Resolve institution by name
        const instName = (r['Institution'] || '').trim();
        let institution_id = null;
        if (instName) {
          const inst = await Institution.findOne({ where: { name: instName } });
          if (inst) institution_id = inst.id;
        }
        // Resolve qualification by name
        const qualName = (r['Qualification'] || '').trim();
        let qualification_id = null;
        if (qualName) {
          const qual = await ResourceQualification.findOne({ where: { name: qualName } });
          if (qual) qualification_id = qual.id;
        }
        const payload = {
          name,
          designation:      r['Designation'] || r['designation'] || '',
          mobile:           r['Mobile'] || r['mobile'] || '',
          email:            r['Email'] || r['email'] || '',
          address:          r['Address'] || r['address'] || '',
          institution_id,
          qualification_id,
          active:           (r['Active'] || r['active'] || 'Yes').toLowerCase() !== 'no',
        };
        const existing = await ResourcePerson.findOne({ where: { name } });
        if (existing) { await existing.update(payload); updated++; }
        else { await ResourcePerson.create(payload); inserted++; }
      } catch (e) {
        errors.push(`"${name}": ${e.message}`);
      }
    }
    res.json({ success: true, inserted, updated, errors });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

buildCrud(router, ResourcePerson, ['name', 'designation', 'email', 'mobile'], INCLUDE);
module.exports = router;
