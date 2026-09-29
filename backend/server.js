require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// ─── Rate Limiting (auth only) ────────────────────────────────
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: 'Too many requests' });

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/institutions', require('./routes/institutions'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/coordinators', require('./routes/coordinators'));
app.use('/api/resource-persons', require('./routes/resourcePersons'));
app.use('/api/resource-qualifications', require('./routes/resourceQualifications'));
app.use('/api/resource-payments', require('./routes/resourcePayments'));
app.use('/api/food-items', require('./routes/foodItems'));
app.use('/api/users', require('./routes/users'));
app.use('/api/training-programmes', require('./routes/trainingProgrammes'));
app.use('/api/participant', require('./routes/participant'));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅  Database connected');
    app.listen(PORT, () => console.log(`🚀  TMS API running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌  DB Error:', err.message));