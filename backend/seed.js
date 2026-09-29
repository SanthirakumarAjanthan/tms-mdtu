const bcrypt = require('bcryptjs');
const {
  sequelize,
  UserType, User,
  Institution, Staff,
  Course, CourseCoordinator,
  ResourceQualification, ResourcePayment, ResourcePerson,
  FoodItem,
  TrainingProgramme, TrainingProgrammeDate, TpResourcePerson,
  ProgrammeApplication, ProgrammeSelection,
  Attendance, Feedback, Budget, FoodSelection, EmailLog,
} = require('./models');

async function seed() {
  console.log('⏳  Syncing database...');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await sequelize.sync({ force: true });
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

  // ─── User Types ───────────────────────────────────────────────
  const userTypes = await UserType.bulkCreate([
    { name: 'Admin' },
    { name: 'Director' },
    { name: 'Training Officer' },
    { name: 'Course Coordinator' },
    { name: 'Institutional Coordinator' },
    { name: 'Participant' },
    { name: 'Special' },
  ], { returning: true });

  const typeMap = Object.fromEntries(userTypes.map(t => [t.name, t.id]));

  // ─── Demo Users (one per role) ────────────────────────────────
  const pw = (plain) => bcrypt.hashSync(plain, 10);
  await User.bulkCreate([
    { nic: '199001010001', name: 'Admin User',                email: 'admin@tms.lk',       mobile: '0771000001', password_hash: pw('admin123'),   user_type_id: typeMap['Admin'] },
    { nic: '199001010002', name: 'Director Silva',            email: 'director@tms.lk',    mobile: '0771000002', password_hash: pw('director123'), user_type_id: typeMap['Director'] },
    { nic: '199001010003', name: 'T. Officer Rajan',          email: 'officer@tms.lk',     mobile: '0771000003', password_hash: pw('officer123'),  user_type_id: typeMap['Training Officer'] },
    { nic: '199001010004', name: 'Coordinator Nila',          email: 'coord@tms.lk',       mobile: '0771000004', password_hash: pw('coord123'),    user_type_id: typeMap['Course Coordinator'] },
    { nic: '199001010005', name: 'Inst. Coord. Siva',         email: 'instcoord@tms.lk',   mobile: '0771000005', password_hash: pw('instcoord123'),user_type_id: typeMap['Institutional Coordinator'] },
    { nic: '199001010006', name: 'Participant Anbu',          email: 'participant@tms.lk', mobile: '0771000006', password_hash: pw('part123'),     user_type_id: typeMap['Participant'] },
    { nic: '199001010007', name: 'Special Access User',       email: 'special@tms.lk',     mobile: '0771000007', password_hash: pw('special123'),  user_type_id: typeMap['Special'] },
  ]);

  // ─── Resource Qualifications ──────────────────────────────────
  const quals = await ResourceQualification.bulkCreate([
    { name: 'PhD' }, { name: 'Masters' }, { name: 'Bachelor Degree' },
    { name: 'All Island Service' }, { name: 'Diploma' }, { name: 'Other' },
  ], { returning: true });

  // ─── Resource Payments ────────────────────────────────────────
  await ResourcePayment.bulkCreate([
    { qualification: 'PhD',              rate: 5000.00 },
    { qualification: 'Masters',          rate: 4000.00 },
    { qualification: 'Bachelor Degree',  rate: 3000.00 },
    { qualification: 'All Island Service', rate: 3500.00 },
    { qualification: 'Diploma',          rate: 2500.00 },
    { qualification: 'Other',            rate: 2000.00 },
  ]);

  // ─── Food Items ───────────────────────────────────────────────
  await FoodItem.bulkCreate([
    { item: 'No Need',       cost: 0 },
    { item: 'Morning Snack', cost: 150 },
    { item: 'Lunch',         cost: 450 },
    { item: 'Evening Snack', cost: 150 },
  ]);

  // ─── Sample Institutions ──────────────────────────────────────
  const institutions = await Institution.bulkCreate([
    { hod: 'Governor', name: "Governor's Secretariat",           address: 'Jaffna', active: true },
    { hod: 'Chairman', name: 'Council Secretariat',              address: 'Jaffna', active: true },
    { hod: 'Chairman', name: 'Public Service Commission',        address: 'Jaffna', active: true },
    { hod: 'Director', name: 'Department of Internal Audit',     address: 'Jaffna', active: true },
    { hod: 'Director', name: 'Department of Legal',              address: 'Jaffna', active: true },
    { hod: 'Director', name: 'Department of IT',                 address: 'Jaffna', active: true },
    { hod: 'Director', name: 'Department of Motor Traffic',      address: 'Jaffna', active: true },
    { hod: 'Director', name: 'Department of Local Government',   address: 'Jaffna', active: true },
    { hod: 'Director', name: 'Department of Agriculture',        address: 'Vavuniya', active: true },
    { hod: 'Director', name: 'Department of Health Services',    address: 'Kilinochchi', active: true },
    { hod: 'Director', name: 'Department of Education (Jaffna)', address: 'Jaffna', active: true },
    { hod: 'Director', name: 'Department of Social Services',    address: 'Mullaitivu', active: true },
  ], { returning: true });

  // ─── Sample Staff ─────────────────────────────────────────────
  const staffMembers = await Staff.bulkCreate([
    { institution_id: institutions[0].id, nic: '198501010011', name: 'Kumaran Arumugam',   email: 'kumaran@gov.lk',   designation: 'Development Officer',  gender: 'Male',   district: 'Jaffna',      active: true },
    { institution_id: institutions[1].id, nic: '199201230012', name: 'Sandya Perera',       email: 'sandya@gov.lk',    designation: 'Admin Officer',         gender: 'Female', district: 'Jaffna',      active: true },
    { institution_id: institutions[2].id, nic: '198712150013', name: 'Roshan Fernando',     email: 'roshan@gov.lk',    designation: 'Senior Dev Officer',    gender: 'Male',   district: 'Vavuniya',    active: true },
    { institution_id: institutions[3].id, nic: '199005200014', name: 'Nilufar Kasim',       email: 'nilufar@gov.lk',   designation: 'Development Officer',   gender: 'Female', district: 'Kilinochchi', active: true },
    { institution_id: institutions[4].id, nic: '198809100015', name: 'Priya Sithambaram',   email: 'priya@gov.lk',     designation: 'Admin Officer',         gender: 'Female', district: 'Mullaitivu',  active: true },
    { institution_id: institutions[5].id, nic: '197504120016', name: 'Jeevan Rathnakumar',  email: 'jeevan@gov.lk',    designation: 'Assistant Director',    gender: 'Male',   district: 'Jaffna',      active: true },
  ], { returning: true });

  // ─── Sample Courses ───────────────────────────────────────────
  const courses = await Course.bulkCreate([
    { category: 'Planning & Management', name: 'Introduction to Project Planning',       target_group: 'All Officers',         duration: 3, active: true },
    { category: 'Finance',               name: 'Financial Management for Officers',      target_group: 'Finance Officers',     duration: 2, active: true },
    { category: 'Soft Skills',           name: 'Leadership & Team Building',             target_group: 'Senior Officers',      duration: 2, active: true },
    { category: 'Procurement',           name: 'Government Procurement Procedures',      target_group: 'Procurement Officers', duration: 1, active: true },
    { category: 'ICT',                   name: 'IT Skills for Public Service',           target_group: 'All Officers',         duration: 5, active: true },
    { category: 'Admin',                 name: 'Public Administration & Policy Analysis',target_group: 'Admin Officers',       duration: 3, active: true },
    { category: 'Legal',                 name: 'Labour Law & Industrial Relations',      target_group: 'HR Officers',          duration: 2, active: true },
    { category: 'Language',              name: 'Official Language Skills (Tamil)',        target_group: 'All Officers',         duration: 5, active: true },
  ], { returning: true });

  // ─── Resource Persons ─────────────────────────────────────────
  const rps = await ResourcePerson.bulkCreate([
    { name: 'K. Jeyakumar',     designation: 'Senior Lecturer',    institution_id: institutions[10].id, mobile: '0771111001', email: 'jeyakumar@uni.lk', qualification_id: quals[0].id, payment_id: 1, active: true },
    { name: 'S. Ramanathan',    designation: 'Director (Finance)', institution_id: institutions[3].id,  mobile: '0771111002', email: 'ramanathan@fin.lk',qualification_id: quals[1].id, payment_id: 2, active: true },
    { name: 'Dr. P. Sritharan', designation: 'Consultant',         institution_id: institutions[0].id,  mobile: '0771111003', email: 'sritharan@gov.lk', qualification_id: quals[0].id, payment_id: 1, active: true },
    { name: 'T. Vasanthan',     designation: 'IT Specialist',      institution_id: institutions[5].id,  mobile: '0771111004', email: 'vasanthan@ict.lk', qualification_id: quals[2].id, payment_id: 3, active: true },
  ], { returning: true });

  // ─── Course Coordinators ──────────────────────────────────────
  const coordinators = await CourseCoordinator.bulkCreate([
    { nic: '198501010011', name: 'Kumaran Arumugam',  designation: 'Development Officer' },
    { nic: '199005200014', name: 'Nilufar Kasim',     designation: 'Development Officer' },
    { nic: '197504120016', name: 'Jeevan Rathnakumar',designation: 'Assistant Director' },
  ], { returning: true });

  // ─── Training Programmes ──────────────────────────────────────
  const tp1 = await TrainingProgramme.create({ course_id: courses[0].id, coordinator_id: coordinators[0].id, mode: 'In-Class', status: 'Completed', year: 2026, venue: 'Training Hall A' });
  await TrainingProgrammeDate.bulkCreate([
    { training_programme_id: tp1.id, date: '2026-02-23' },
    { training_programme_id: tp1.id, date: '2026-02-24' },
    { training_programme_id: tp1.id, date: '2026-02-25' },
  ]);
  await TpResourcePerson.create({ training_programme_id: tp1.id, resource_person_id: rps[0].id });

  const tp2 = await TrainingProgramme.create({ course_id: courses[2].id, coordinator_id: coordinators[1].id, mode: 'Online', status: 'Published', year: 2026, venue: 'Zoom / Virtual' });
  await TrainingProgrammeDate.bulkCreate([
    { training_programme_id: tp2.id, date: '2026-03-10' },
    { training_programme_id: tp2.id, date: '2026-03-11' },
  ]);
  await TpResourcePerson.create({ training_programme_id: tp2.id, resource_person_id: rps[2].id });

  const tp3 = await TrainingProgramme.create({ course_id: courses[4].id, coordinator_id: coordinators[2].id, mode: 'In-Class', status: 'Published', year: 2026, venue: 'Computer Lab, Block B' });
  await TrainingProgrammeDate.bulkCreate([
    { training_programme_id: tp3.id, date: '2026-04-07' },
    { training_programme_id: tp3.id, date: '2026-04-08' },
    { training_programme_id: tp3.id, date: '2026-04-09' },
    { training_programme_id: tp3.id, date: '2026-04-10' },
    { training_programme_id: tp3.id, date: '2026-04-11' },
  ]);
  await TpResourcePerson.create({ training_programme_id: tp3.id, resource_person_id: rps[3].id });

  // ─── Applications + Selections ────────────────────────────────
  const app1 = await ProgrammeApplication.create({ staff_id: staffMembers[1].id, training_programme_id: tp1.id, status: 'Selected' });
  await ProgrammeSelection.create({ application_id: app1.id, status: 'Selected', confirmed: true });
  const app2 = await ProgrammeApplication.create({ staff_id: staffMembers[2].id, training_programme_id: tp1.id, status: 'Selected' });
  await ProgrammeSelection.create({ application_id: app2.id, status: 'Selected', confirmed: false });

  // ─── Attendance ───────────────────────────────────────────────
  await Attendance.bulkCreate([
    { staff_id: staffMembers[1].id, training_programme_id: tp1.id, date: '2026-02-23', present: true },
    { staff_id: staffMembers[1].id, training_programme_id: tp1.id, date: '2026-02-24', present: true },
    { staff_id: staffMembers[1].id, training_programme_id: tp1.id, date: '2026-02-25', present: false },
    { staff_id: staffMembers[2].id, training_programme_id: tp1.id, date: '2026-02-23', present: false },
    { staff_id: staffMembers[2].id, training_programme_id: tp1.id, date: '2026-02-24', present: true },
    { staff_id: staffMembers[2].id, training_programme_id: tp1.id, date: '2026-02-25', present: true },
  ]);

  // ─── Food Selection ───────────────────────────────────────────
  await FoodSelection.create({ training_programme_id: tp1.id, morning: 1, lunch: 2, evening: 1 });

  console.log('✅  Database seeded successfully!');
  console.log('\n📋  Demo Login Credentials:');
  console.log('─────────────────────────────────────────────────');
  console.log('Role                     | Email                 | Password');
  console.log('Admin                    | admin@tms.lk          | admin123');
  console.log('Director                 | director@tms.lk       | director123');
  console.log('Training Officer         | officer@tms.lk        | officer123');
  console.log('Course Coordinator       | coord@tms.lk          | coord123');
  console.log('Institutional Coordinator| instcoord@tms.lk      | instcoord123');
  console.log('Participant              | participant@tms.lk    | part123');
  console.log('Special                  | special@tms.lk        | special123');
  process.exit(0);
}

seed().catch(err => { console.error('❌  Seed error:', err.message); process.exit(1); });
