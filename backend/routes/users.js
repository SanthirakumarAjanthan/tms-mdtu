const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User, UserType } = require('../models');
const { auth } = require('../middleware/auth');
const { exportToExcel } = require('../utils/excel');
const { exportToCsv, parseCsv, csvUpload } = require('../utils/csvHelper');

router.use(auth);

// ── User Types (must be before /:id) ──────────────────────────
router.get('/types', async (req, res) => {
  try {
    const types = await UserType.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, data: types });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Export Excel ───────────────────────────────────────────────
router.get('/export/excel', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: UserType, attributes: ['name'] }],
      attributes: { exclude: ['password_hash'] },
      order: [['id', 'ASC']],
    });
    const headers = ['#', 'NIC', 'Full Name', 'Email', 'Mobile', 'Role', 'Status'];
    const rows = users.map((u, i) => [
      i + 1, u.nic, u.name, u.email, u.mobile,
      u.UserType?.name || '', u.status,
    ]);
    await exportToExcel(res, 'Users', 'Users', headers, rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Import CSV ─────────────────────────────────────────────────
router.post('/import/csv', csvUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const records = parseCsv(req.file.buffer);
    const types = await UserType.findAll();
    const typeMap = {};
    types.forEach(t => { typeMap[t.name.toLowerCase()] = t.id; });

    let inserted = 0, updated = 0, errors = [];

    for (const r of records) {
      const nic   = (r['NIC'] || r['nic'] || '').trim();
      const email = (r['Email'] || r['email'] || '').trim();
      if (!nic || !email) { errors.push(`Skipped — missing NIC or Email`); continue; }
      try {
        const roleKey = (r['Role'] || r['role'] || '').trim().toLowerCase();
        const user_type_id = typeMap[roleKey] || null;
        const payload = {
          nic,
          name:         r['Full Name'] || r['Name'] || r['name'] || '',
          email,
          mobile:       r['Mobile'] || r['mobile'] || '',
          user_type_id,
          status:       (r['Status'] || r['status'] || 'active').toLowerCase(),
        };
        const existing = await User.findOne({ where: { nic } });
        if (existing) { await existing.update(payload); updated++; }
        else {
          const password_hash = await bcrypt.hash('tms@1234', 10);
          await User.create({ ...payload, password_hash });
          inserted++;
        }
      } catch (e) { errors.push(`NIC ${nic}: ${e.message}`); }
    }
    res.json({ success: true, inserted, updated, errors });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── List users ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    const { Op } = require('sequelize');
    const offset = (Number(page) - 1) * Number(limit);
    const where = q
      ? { [Op.or]: [{ name: { [Op.like]: `%${q}%` } }, { nic: { [Op.like]: `%${q}%` } }, { email: { [Op.like]: `%${q}%` } }] }
      : {};
    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: UserType, attributes: ['name'] }],
      attributes: { exclude: ['password_hash'] },
      offset, limit: Number(limit),
      order: [['id', 'DESC']],
    });
    res.json({ success: true, total: count, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Create user ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const password_hash = await bcrypt.hash(password || 'tms@1234', 10);
    const user = await User.create({ ...rest, password_hash });
    res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── Update user ────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    const { password, ...rest } = req.body;
    if (password) rest.password_hash = await bcrypt.hash(password, 10);
    await user.update(rest);
    res.json({ success: true, data: { id: user.id, name: user.name } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── Toggle status ──────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    await user.update({ status: user.status === 'active' ? 'inactive' : 'active' });
    res.json({ success: true, message: `User ${user.status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
