const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, UserType, Staff } = require('../models');
const { auth } = require('../middleware/auth');

// ─── Roles that require NIC pre-verification against Staff table ───
const PROVINCIAL_ROLES = ['Institutional Coordinator', 'Participant'];

// GET /api/auth/check-nic?nic=XXXXXXXXXX  — public, no auth required
router.get('/check-nic', async (req, res) => {
  const { nic } = req.query;
  if (!nic) return res.status(400).json({ success: false, message: 'NIC is required' });
  try {
    // Check if NIC is already registered as a user
    const existingUser = await User.findOne({ where: { nic } });
    if (existingUser) {
      return res.json({ success: false, message: 'This NIC is already registered. Please login.' });
    }
    // Check NIC exists in Staff table
    const staff = await Staff.findOne({ where: { nic } });
    if (!staff) {
      return res.json({ success: false, message: 'NIC not found in the provincial staff database. Please contact the administrator.' });
    }
    return res.json({
      success: true,
      message: 'NIC verified successfully.',
      staffInfo: { name: staff.name, designation: staff.designation, district: staff.district },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/register — public self-registration
router.post('/register', [
  body('nic').notEmpty().withMessage('NIC is required'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').notEmpty().withMessage('Role is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array(), message: errors.array()[0].msg });

  const { nic, mobile, email, password, role, name } = req.body;
  try {
    // Check role exists
    const userType = await UserType.findOne({ where: { name: role } });
    if (!userType) return res.status(400).json({ success: false, message: 'Invalid role selected.' });

    // For provincial roles — verify NIC against Staff table
    if (PROVINCIAL_ROLES.includes(role)) {
      const staff = await Staff.findOne({ where: { nic } });
      if (!staff) {
        return res.status(400).json({ success: false, message: 'NIC not found in the provincial staff database.' });
      }
      // Check NIC not already registered
      const existingUser = await User.findOne({ where: { nic } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'This NIC is already registered. Please login.' });
      }
    } else {
      // For non-provincial roles — check NIC uniqueness
      const existingNic = await User.findOne({ where: { nic } });
      if (existingNic) return res.status(400).json({ success: false, message: 'NIC already in use.' });
    }

    // Check email uniqueness
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email address already in use.' });

    const password_hash = await bcrypt.hash(password, 10);
    // Provincial roles (verified via NIC) are immediately active;
    // self-registered Participants wait for Admin approval
    const isProvincial = PROVINCIAL_ROLES.includes(role);
    const newUser = await User.create({
      nic, name: name || nic, mobile, email, password_hash,
      user_type_id: userType.id,
      status: isProvincial ? 'active' : 'inactive',
    });

    res.status(201).json({
      success: true,
      message: isProvincial
        ? 'Registration successful! You can now log in.'
        : 'Registration submitted! Your account is pending administrator approval. You will be able to log in once approved.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login  — accepts NIC or email + password
router.post('/login', [
  body('identifier').notEmpty().withMessage('NIC or Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { identifier, password } = req.body;
  // Legacy support: also accept 'email' field
  const loginId = identifier || req.body.email;
  try {
    // Determine if identifier looks like a NIC (alphanumeric, no @)
    const isNic = !loginId.includes('@');
    const where = isNic ? { nic: loginId } : { email: loginId };

    const user = await User.findOne({
      where,
      include: [{ model: UserType, attributes: ['name'] }],
    });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(401).json({
      success: false,
      message: 'Your account is pending administrator approval. Please contact the MDTU office.',
    });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.UserType.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, nic: user.nic, role: user.UserType.name },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  const u = req.user;
  res.json({
    success: true,
    user: { id: u.id, name: u.name, email: u.email, nic: u.nic, role: u.UserType?.name },
  });
});

// POST /api/auth/change-password
router.post('/change-password', auth, [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Old password incorrect' });
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile — update own profile (name, email, nic)
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { name, email, nic } = req.body;
    await user.update({ name, email, nic });
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, nic: user.nic, role: req.user.role },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
