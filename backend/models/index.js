const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserType = sequelize.define('UserType', {
  id:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
}, { tableName: 'user_types', timestamps: false });

const User = sequelize.define('User', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nic:           { type: DataTypes.STRING(15), allowNull: false, unique: true },
  name:          { type: DataTypes.STRING(150), allowNull: false },
  email:         { type: DataTypes.STRING(150), allowNull: false, unique: true },
  mobile:        { type: DataTypes.STRING(15) },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  user_type_id:  { type: DataTypes.INTEGER, allowNull: false },
  status:        { type: DataTypes.ENUM('active','inactive'), defaultValue: 'active' },
}, { tableName: 'users', timestamps: true });

const Institution = sequelize.define('Institution', {
  id:      { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  hod:     { type: DataTypes.STRING(150) },
  name:    { type: DataTypes.STRING(200), allowNull: false },
  address: { type: DataTypes.TEXT },
  active:  { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'institutions', timestamps: true });

const Staff = sequelize.define('Staff', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  institution_id: { type: DataTypes.INTEGER },
  nic:            { type: DataTypes.STRING(15), allowNull: false, unique: true },
  name:           { type: DataTypes.STRING(150), allowNull: false },
  email:          { type: DataTypes.STRING(150) },
  designation:    { type: DataTypes.STRING(100) },
  gender:         { type: DataTypes.ENUM('Male','Female','Other') },
  district:       { type: DataTypes.STRING(50) },
  active:         { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'staff', timestamps: true });

const Course = sequelize.define('Course', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  category:     { type: DataTypes.STRING(100) },
  name:         { type: DataTypes.STRING(200), allowNull: false },
  target_group: { type: DataTypes.TEXT },
  duration:     { type: DataTypes.INTEGER, defaultValue: 1 },
  active:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'courses', timestamps: true });

const CourseCoordinator = sequelize.define('CourseCoordinator', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  linked_user_id: { type: DataTypes.INTEGER },
  nic:            { type: DataTypes.STRING(15) },
  name:           { type: DataTypes.STRING(150), allowNull: false },
  designation:    { type: DataTypes.STRING(100) },
}, { tableName: 'course_coordinators', timestamps: true });

const ResourceQualification = sequelize.define('ResourceQualification', {
  id:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'resource_qualifications', timestamps: false });

const ResourcePayment = sequelize.define('ResourcePayment', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  qualification: { type: DataTypes.STRING(100) },
  rate:          { type: DataTypes.DECIMAL(10, 2) },
}, { tableName: 'resource_payments', timestamps: false });

const ResourcePerson = sequelize.define('ResourcePerson', {
  id:               { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:             { type: DataTypes.STRING(150), allowNull: false },
  designation:      { type: DataTypes.STRING(100) },
  institution_id:   { type: DataTypes.INTEGER },
  address:          { type: DataTypes.TEXT },
  mobile:           { type: DataTypes.STRING(15) },
  email:            { type: DataTypes.STRING(150) },
  qualification_id: { type: DataTypes.INTEGER },
  payment_id:       { type: DataTypes.INTEGER },
  active:           { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'resource_persons', timestamps: true });

const FoodItem = sequelize.define('FoodItem', {
  id:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  item: { type: DataTypes.STRING(50), allowNull: false },
  cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
}, { tableName: 'food_items', timestamps: false });

const TrainingProgramme = sequelize.define('TrainingProgramme', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id:      { type: DataTypes.INTEGER },
  coordinator_id: { type: DataTypes.INTEGER },
  mode:           { type: DataTypes.ENUM('In-Class','Online','Hybrid'), defaultValue: 'In-Class' },
  status:         { type: DataTypes.ENUM('Draft','Published','Completed','Cancelled'), defaultValue: 'Draft' },
  year:           { type: DataTypes.INTEGER, defaultValue: new Date().getFullYear() },
  venue:          { type: DataTypes.STRING(200) },
}, { tableName: 'training_programmes', timestamps: true });

const TrainingProgrammeDate = sequelize.define('TrainingProgrammeDate', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  training_programme_id: { type: DataTypes.INTEGER },
  date:                  { type: DataTypes.DATEONLY },
}, { tableName: 'training_programme_dates', timestamps: false });

const TpResourcePerson = sequelize.define('TpResourcePerson', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  training_programme_id: { type: DataTypes.INTEGER },
  resource_person_id:    { type: DataTypes.INTEGER },
}, { tableName: 'tp_resource_persons', timestamps: false });

const ProgrammeApplication = sequelize.define('ProgrammeApplication', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  staff_id:              { type: DataTypes.INTEGER },
  training_programme_id: { type: DataTypes.INTEGER },
  status:                { type: DataTypes.ENUM('Pending','Selected','Not Selected'), defaultValue: 'Pending' },
  applied_at:            { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'programme_applications', timestamps: false });

const ProgrammeSelection = sequelize.define('ProgrammeSelection', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  application_id: { type: DataTypes.INTEGER },
  status:         { type: DataTypes.ENUM('Selected','Not Selected'), defaultValue: 'Selected' },
  confirmed:      { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'programme_selections', timestamps: false });

const Attendance = sequelize.define('Attendance', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  staff_id:              { type: DataTypes.INTEGER },
  training_programme_id: { type: DataTypes.INTEGER },
  date:                  { type: DataTypes.DATEONLY },
  present:               { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'attendance', timestamps: false });

const Feedback = sequelize.define('Feedback', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  staff_id:              { type: DataTypes.INTEGER },
  training_programme_id: { type: DataTypes.INTEGER },
  ratings:               { type: DataTypes.JSON },
  comments:              { type: DataTypes.TEXT },
}, { tableName: 'feedback', timestamps: true });

const Budget = sequelize.define('Budget', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  training_programme_id: { type: DataTypes.INTEGER },
  description:           { type: DataTypes.STRING(255), allowNull: false },
  category:              { type: DataTypes.STRING(100) },
  amount:                { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
}, { tableName: 'budgets', timestamps: false });

const FoodSelection = sequelize.define('FoodSelection', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  training_programme_id: { type: DataTypes.INTEGER, unique: true },
  morning:               { type: DataTypes.TINYINT, defaultValue: 0 },
  lunch:                 { type: DataTypes.TINYINT, defaultValue: 0 },
  evening:               { type: DataTypes.TINYINT, defaultValue: 0 },
}, { tableName: 'food_selection', timestamps: false });

const EmailLog = sequelize.define('EmailLog', {
  id:                    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  training_programme_id: { type: DataTypes.INTEGER },
  staff_id:              { type: DataTypes.INTEGER },
  sent_at:               { type: DataTypes.DATE },
  status:                { type: DataTypes.ENUM('sent','failed'), defaultValue: 'sent' },
}, { tableName: 'email_logs', timestamps: false });

// ─── Associations ────────────────────────────────────────────────
UserType.hasMany(User,               { foreignKey: 'user_type_id' });
User.belongsTo(UserType,             { foreignKey: 'user_type_id' });

Institution.hasMany(Staff,           { foreignKey: 'institution_id' });
Staff.belongsTo(Institution,         { foreignKey: 'institution_id' });

Institution.hasMany(ResourcePerson,  { foreignKey: 'institution_id' });
ResourcePerson.belongsTo(Institution,{ foreignKey: 'institution_id' });

ResourceQualification.hasMany(ResourcePerson, { foreignKey: 'qualification_id' });
ResourcePerson.belongsTo(ResourceQualification, { foreignKey: 'qualification_id' });

ResourcePayment.hasMany(ResourcePerson, { foreignKey: 'payment_id' });
ResourcePerson.belongsTo(ResourcePayment, { foreignKey: 'payment_id' });

Course.hasMany(TrainingProgramme,    { foreignKey: 'course_id' });
TrainingProgramme.belongsTo(Course,  { foreignKey: 'course_id' });

CourseCoordinator.hasMany(TrainingProgramme, { foreignKey: 'coordinator_id' });
TrainingProgramme.belongsTo(CourseCoordinator, { foreignKey: 'coordinator_id', as: 'coordinator' });

TrainingProgramme.hasMany(TrainingProgrammeDate, { foreignKey: 'training_programme_id', as: 'dates' });
TrainingProgrammeDate.belongsTo(TrainingProgramme, { foreignKey: 'training_programme_id' });

TrainingProgramme.hasMany(TpResourcePerson, { foreignKey: 'training_programme_id' });
TpResourcePerson.belongsTo(ResourcePerson, { foreignKey: 'resource_person_id', as: 'resourcePerson' });

TrainingProgramme.hasMany(ProgrammeApplication, { foreignKey: 'training_programme_id' });
ProgrammeApplication.belongsTo(TrainingProgramme, { foreignKey: 'training_programme_id' });
ProgrammeApplication.belongsTo(Staff,             { foreignKey: 'staff_id' });
Staff.hasMany(ProgrammeApplication,               { foreignKey: 'staff_id' });

ProgrammeApplication.hasOne(ProgrammeSelection,   { foreignKey: 'application_id' });
ProgrammeSelection.belongsTo(ProgrammeApplication,{ foreignKey: 'application_id' });

TrainingProgramme.hasMany(Attendance, { foreignKey: 'training_programme_id' });
Attendance.belongsTo(Staff,           { foreignKey: 'staff_id' });

TrainingProgramme.hasMany(Feedback,   { foreignKey: 'training_programme_id' });
Feedback.belongsTo(Staff,             { foreignKey: 'staff_id' });

TrainingProgramme.hasMany(Budget,     { foreignKey: 'training_programme_id' });

TrainingProgramme.hasOne(FoodSelection, { foreignKey: 'training_programme_id' });
TrainingProgramme.hasMany(EmailLog,   { foreignKey: 'training_programme_id' });
EmailLog.belongsTo(Staff,             { foreignKey: 'staff_id' });

module.exports = {
  sequelize,
  UserType, User,
  Institution, Staff,
  Course, CourseCoordinator,
  ResourceQualification, ResourcePayment, ResourcePerson,
  FoodItem,
  TrainingProgramme, TrainingProgrammeDate, TpResourcePerson,
  ProgrammeApplication, ProgrammeSelection,
  Attendance, Feedback,
  Budget, FoodSelection, EmailLog,
};
