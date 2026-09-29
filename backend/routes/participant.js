const router = require('express').Router();
const { ProgrammeApplication, ProgrammeSelection, TrainingProgramme, Course, TrainingProgrammeDate, Staff, Institution, Feedback } = require('../models');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET available programmes for participant
router.get('/available-programmes', async (req, res) => {
  try {
    const { year, semester } = req.query;
    const currentYear = new Date().getFullYear();
    const where = { status: 'Published' };
    // Default to current year
    where.year = year ? Number(year) : currentYear;

    let programmes = await TrainingProgramme.findAll({
      where,
      include: [{ model: Course }, { model: TrainingProgrammeDate, as: 'dates' }],
      order: [['id', 'DESC']],
    });

    // Apply semester filter based on programme dates
    if (semester) {
      const sem = Number(semester);
      programmes = programmes.filter(p => {
        if (!p.dates || p.dates.length === 0) return true;
        const month = new Date(p.dates[0].date).getMonth() + 1; // 1-12
        return sem === 1 ? month >= 1 && month <= 6 : month >= 7 && month <= 12;
      });
    }

    res.json({ success: true, data: programmes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Apply to programme
router.post('/apply', async (req, res) => {
  try {
    const { staff_id, training_programme_id } = req.body;
    const existing = await ProgrammeApplication.findOne({ where: { staff_id, training_programme_id } });
    if (existing) return res.status(400).json({ success: false, message: 'Already applied' });
    const app = await ProgrammeApplication.create({ staff_id, training_programme_id, status: 'Pending' });
    res.status(201).json({ success: true, data: app });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET my applications / selection status
router.get('/my-applications', async (req, res) => {
  try {
    const { staff_id } = req.query;
    const apps = await ProgrammeApplication.findAll({
      where: { staff_id },
      include: [
        { model: TrainingProgramme, include: [{ model: Course }, { model: TrainingProgrammeDate, as: 'dates' }] },
        { model: ProgrammeSelection },
      ],
    });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Confirm attendance
router.put('/confirm/:selectionId', async (req, res) => {
  try {
    const sel = await ProgrammeSelection.findByPk(req.params.selectionId);
    if (!sel) return res.status(404).json({ success: false, message: 'Not found' });
    await sel.update({ confirmed: true });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { staff_id, training_programme_id, ratings, comments } = req.body;
    const fb = await Feedback.create({ staff_id, training_programme_id, ratings, comments });
    res.status(201).json({ success: true, data: fb });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get feedback for a programme (summary)
router.get('/feedback/:tpId', async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      where: { training_programme_id: req.params.tpId },
      include: [{ model: Staff, attributes: ['name', 'nic'] }],
    });
    res.json({ success: true, data: feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
