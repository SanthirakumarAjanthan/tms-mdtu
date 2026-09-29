const router = require('express').Router();
const { Op } = require('sequelize');
const {
  TrainingProgramme, TrainingProgrammeDate, TpResourcePerson,
  Course, CourseCoordinator, ResourcePerson,
  ProgrammeApplication, ProgrammeSelection,
  Staff, Institution, Attendance, FoodSelection, Budget, FoodItem,
  EmailLog,
} = require('../models');
const { auth } = require('../middleware/auth');
const { exportToExcel } = require('../utils/excel');
const { exportToCsv, parseCsv, csvUpload } = require('../utils/csvHelper');
const { sendConfirmationEmail } = require('../utils/email');

router.use(auth);

// ─── EXPORT Excel ─────────────────────────────────────────────
router.get('/export/excel', async (req, res) => {
  try {
    const programmes = await TrainingProgramme.findAll({
      include: [
        { model: Course, attributes: ['name', 'category'] },
        { model: CourseCoordinator, as: 'coordinator', attributes: ['name'] },
        { model: TrainingProgrammeDate, as: 'dates', attributes: ['date'] },
      ],
      order: [['id', 'DESC']],
    });
    const headers = ['#', 'Year', 'Course', 'Category', 'Coordinator', 'Mode', 'Status', 'Venue', 'Dates'];
    const rows = programmes.map((p, i) => [
      i + 1,
      p.year,
      p.Course?.name || '',
      p.Course?.category || '',
      p.coordinator?.name || '',
      p.mode,
      p.status,
      p.venue || '',
      p.dates?.map(d => d.date).join(', ') || '',
    ]);
    await exportToExcel(res, 'Training_Programmes', 'Programmes', headers, rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── IMPORT CSV ────────────────────────────────────────────────
router.post('/import/csv', csvUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const records = parseCsv(req.file.buffer);
    const courses = await Course.findAll();
    const courseMap = {};
    courses.forEach(c => { courseMap[c.name.toLowerCase()] = c.id; });
    let inserted = 0, errors = [];
    for (const r of records) {
      const courseName = (r['Course'] || r['course'] || '').trim();
      const year = r['Year'] || r['year'] || new Date().getFullYear();
      try {
        const course_id = courseMap[courseName.toLowerCase()] || null;
        await TrainingProgramme.create({
          year: Number(year),
          course_id,
          mode: r['Mode'] || r['mode'] || 'In-Class',
          status: r['Status'] || r['status'] || 'Draft',
          venue: r['Venue'] || r['venue'] || '',
        });
        inserted++;
      } catch (e) { errors.push(`Row ${inserted + errors.length + 1}: ${e.message}`); }
    }
    res.json({ success: true, inserted, errors });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── LIST Training Programmes ─────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { q = '', year = '', page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {};
    if (year) where.year = year;

    const { count, rows } = await TrainingProgramme.findAndCountAll({
      where,
      include: [
        { model: Course, attributes: ['id', 'name', 'category'] },
        { model: CourseCoordinator, as: 'coordinator', attributes: ['id', 'name'] },
        { model: TrainingProgrammeDate, as: 'dates', attributes: ['date'] },
        { model: TpResourcePerson, include: [{ model: ResourcePerson, as: 'resourcePerson', attributes: ['name'] }] },
      ],
      offset, limit: Number(limit), order: [['id', 'DESC']],
    });
    res.json({ success: true, total: count, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET single ───────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const tp = await TrainingProgramme.findByPk(req.params.id, {
      include: [
        { model: Course },
        { model: CourseCoordinator, as: 'coordinator' },
        { model: TrainingProgrammeDate, as: 'dates' },
        { model: TpResourcePerson, include: [{ model: ResourcePerson, as: 'resourcePerson' }] },
        { model: FoodSelection },
      ],
    });
    if (!tp) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: tp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CREATE ───────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const t = await require('../config/database').transaction();
  try {
    const { dates = [], resourcePersonIds = [], ...rest } = req.body;
    const tp = await TrainingProgramme.create(rest, { transaction: t });
    if (dates.length) await TrainingProgrammeDate.bulkCreate(dates.map(d => ({ training_programme_id: tp.id, date: d })), { transaction: t });
    if (resourcePersonIds.length) await TpResourcePerson.bulkCreate(resourcePersonIds.map(rp => ({ training_programme_id: tp.id, resource_person_id: rp })), { transaction: t });
    await t.commit();
    res.status(201).json({ success: true, data: tp });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── UPDATE ───────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const t = await require('../config/database').transaction();
  try {
    const tp = await TrainingProgramme.findByPk(req.params.id);
    if (!tp) return res.status(404).json({ success: false, message: 'Not found' });
    const { dates = [], resourcePersonIds = [], ...rest } = req.body;
    await tp.update(rest, { transaction: t });
    if (dates.length) {
      await TrainingProgrammeDate.destroy({ where: { training_programme_id: tp.id }, transaction: t });
      await TrainingProgrammeDate.bulkCreate(dates.map(d => ({ training_programme_id: tp.id, date: d })), { transaction: t });
    }
    if (resourcePersonIds.length) {
      await TpResourcePerson.destroy({ where: { training_programme_id: tp.id }, transaction: t });
      await TpResourcePerson.bulkCreate(resourcePersonIds.map(rp => ({ training_programme_id: tp.id, resource_person_id: rp })), { transaction: t });
    }
    await t.commit();
    res.json({ success: true, data: tp });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── DELETE ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await TrainingProgramme.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PARTICIPANTS for a programme ────────────────────────────
router.get('/:id/participants', async (req, res) => {
  try {
    const apps = await ProgrammeApplication.findAll({
      where: { training_programme_id: req.params.id },
      include: [
        { model: Staff, include: [{ model: Institution, attributes: ['name'] }] },
        { model: ProgrammeSelection },
      ],
      order: [['id', 'ASC']],
    });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SELECT / UPDATE participant status ───────────────────────
router.put('/:id/participants/:appId', async (req, res) => {
  try {
    const { status } = req.body;
    const app = await ProgrammeApplication.findByPk(req.params.appId);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    await app.update({ status });
    const sel = await ProgrammeSelection.findOne({ where: { application_id: app.id } });
    if (sel) await sel.update({ status });
    else if (status === 'Selected') await ProgrammeSelection.create({ application_id: app.id, status });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── ATTENDANCE ───────────────────────────────────────────────
router.get('/:id/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const where = { training_programme_id: req.params.id };
    if (date) where.date = date;
    const records = await Attendance.findAll({ where, include: [{ model: Staff, include: [{ model: Institution, attributes: ['name'] }] }] });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/attendance', async (req, res) => {
  try {
    const { records } = req.body; // [{ staff_id, date, present }]
    for (const r of records) {
      await Attendance.upsert({ training_programme_id: Number(req.params.id), staff_id: r.staff_id, date: r.date, present: r.present });
    }
    res.json({ success: true, message: 'Attendance saved' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── EXPORT ATTENDANCE to Excel ───────────────────────────────
router.get('/:id/attendance/export', async (req, res) => {
  try {
    const records = await Attendance.findAll({
      where: { training_programme_id: req.params.id },
      include: [{ model: Staff, include: [{ model: Institution, attributes: ['name'] }] }],
    });
    const headers = ['Name', 'NIC', 'Designation', 'Institution', 'District', 'Date', 'Present'];
    const rows = records.map(r => [r.Staff.name, r.Staff.nic, r.Staff.designation, r.Staff.Institution?.name, r.Staff.district, r.date, r.present ? 'Yes' : 'No']);
    await exportToExcel(res, 'Attendance', 'Attendance', headers, rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SEND APPROVAL EMAILS ─────────────────────────────────────
router.post('/:id/send-emails', async (req, res) => {
  try {
    const { staffIds } = req.body;
    const tp = await TrainingProgramme.findByPk(req.params.id, { include: [{ model: Course }, { model: TrainingProgrammeDate, as: 'dates' }] });
    const staff = await Staff.findAll({ where: { id: staffIds } });
    const results = [];
    for (const s of staff) {
      const r = await sendConfirmationEmail({ to: s.email || 'noemail@tms.lk', name: s.name, programme: tp.Course?.name, dates: tp.dates?.map(d => d.date), venue: tp.venue });
      await EmailLog.create({ training_programme_id: tp.id, staff_id: s.id, sent_at: new Date(), status: r.success ? 'sent' : 'failed' });
      results.push({ staff_id: s.id, ...r });
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── FOOD SELECTION ───────────────────────────────────────────
router.get('/:id/food-selection', async (req, res) => {
  try {
    const fs = await FoodSelection.findOne({ where: { training_programme_id: req.params.id } });
    res.json({ success: true, data: fs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/food-selection', async (req, res) => {
  try {
    const [fs] = await FoodSelection.upsert({ ...req.body, training_programme_id: Number(req.params.id) });
    res.json({ success: true, data: fs });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── BUDGET ───────────────────────────────────────────────────
router.get('/:id/budget', async (req, res) => {
  try {
    const budget = await Budget.findAll({ where: { training_programme_id: req.params.id }, include: [{ model: FoodItem }] });
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/budget', async (req, res) => {
  try {
    const b = await Budget.create({ ...req.body, training_programme_id: Number(req.params.id) });
    res.json({ success: true, data: b });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── UPDATE BUDGET ITEM ────────────────────────────────────────
router.put('/:id/budget/:budgetId', async (req, res) => {
  try {
    const b = await Budget.findByPk(req.params.budgetId);
    if (!b) return res.status(404).json({ success: false, message: 'Budget item not found' });
    await b.update(req.body);
    res.json({ success: true, data: b });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── DELETE BUDGET ITEM ────────────────────────────────────────
router.delete('/:id/budget/:budgetId', async (req, res) => {
  try {
    const b = await Budget.findByPk(req.params.budgetId);
    if (!b) return res.status(404).json({ success: false, message: 'Budget item not found' });
    await b.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
