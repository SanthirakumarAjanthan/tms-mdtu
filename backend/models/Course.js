const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
  },
  targetGroup: {
    type: DataTypes.STRING,
  },
  durationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  timestamps: false, // Disable auto createdAt/updatedAt to avoid conflicts with existing tables
  tableName: 'courses',
});

module.exports = Course;
