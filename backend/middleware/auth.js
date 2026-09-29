const jwt = require('jsonwebtoken');
const { User, UserType } = require('../models');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { include: [{ model: UserType, attributes: ['name'] }] });
    if (!user || user.status !== 'active')
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Role-based access control — pass allowed role names as array
const rbac = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const userRole = req.user.UserType?.name;
  if (!roles.includes(userRole))
    return res.status(403).json({ success: false, message: `Access denied for role: ${userRole}` });
  next();
};

module.exports = { auth, rbac };
