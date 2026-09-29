const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./Course');

const TrainingProgramme = sequelize.define('TrainingProgramme', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  resourcePerson: {
    type: DataTypes.STRING,
  },
  programmeDate: {
    type: DataTypes.STRING, // e.g. "2026-02-23, 2026-02-28" based on screenshot
  },
  courseCoordinator: {
    type: DataTypes.STRING,
  },
  modeOfTraining: {
    type: DataTypes.STRING, // e.g., In-Class, Online
  },
  status: {
    type: DataTypes.INTEGER, // e.g. 1 for Published
    defaultValue: 1,
  }
}, {
  timestamps: false, // Disable auto createdAt/updatedAt to avoid conflicts with existing tables
  tableName: 'training_programmes',
});

// Relationships
TrainingProgramme.belongsTo(Course, { foreignKey: 'courseId' });
Course.hasMany(TrainingProgramme, { foreignKey: 'courseId' });

module.exports = TrainingProgramme;
