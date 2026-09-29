// Centralised mock data that mirrors the old-system PDFs
// (Replace with real API calls once the backend MySQL is live)

export const STAFF = [
  { id: 1, nic: '123456789V', name: 'Kumaran Arumugam',    designation: 'Development Officer',   division: 'Planning', grade: 'SL-2', mobile: '0771234567', email: 'kumaran@mdtu.gov.lk' },
  { id: 2, nic: '956712345V', name: 'Sandya Perera',        designation: 'Admin Officer',          division: 'Admin',    grade: 'SL-1', mobile: '0769876543', email: 'sandya@mdtu.gov.lk' },
  { id: 3, nic: '782345678V', name: 'Roshan Fernando',      designation: 'Senior Dev Officer',     division: 'Finance',  grade: 'SL-3', mobile: '0712345678', email: 'roshan@mdtu.gov.lk' },
  { id: 4, nic: '845623178V', name: 'Nilufar Kasim',        designation: 'Development Officer',   division: 'IT',       grade: 'SL-2', mobile: '0758901234', email: 'nilufar@mdtu.gov.lk' },
  { id: 5, nic: '912678345V', name: 'Priya Sithambaram',    designation: 'Admin Officer',          division: 'HR',       grade: 'SL-1', mobile: '0781234567', email: 'priya@mdtu.gov.lk' },
  { id: 6, nic: '678234512V', name: 'Jeevan Rathnakumar',   designation: 'Assistant Director',     division: 'Planning', grade: 'SL-4', mobile: '0763456789', email: 'jeevan@mdtu.gov.lk' },
];

export const COURSES = [
  { id: 1, courseName: 'Introduction to Project Planning',       category: 'Planning & Management', targetGroup: 'All Officers',         durationDays: 3 },
  { id: 2, courseName: 'Financial Management for Officers',       category: 'Finance',                targetGroup: 'Finance Officers',     durationDays: 2 },
  { id: 3, courseName: 'Leadership & Team Building',              category: 'Soft Skills',            targetGroup: 'Senior Officers',      durationDays: 2 },
  { id: 4, courseName: 'Government Procurement Procedures',       category: 'Procurement',            targetGroup: 'Procurement Officers', durationDays: 1 },
  { id: 5, courseName: 'IT Skills for Public Service',            category: 'IT',                     targetGroup: 'All Officers',         durationDays: 5 },
  { id: 6, courseName: 'Public Administration & Policy Analysis', category: 'Administration',         targetGroup: 'Admin Officers',       durationDays: 3 },
];

export const RESOURCE_PERSONS = [
  { id: 1, name: 'K. Jeyakumar',     designation: 'Senior Lecturer',   organisation: 'University of Jaffna',       specialisation: 'Public Management' },
  { id: 2, name: 'S. Ramanathan',    designation: 'Director (Finance)', organisation: 'Ministry of Finance',        specialisation: 'Financial Management' },
  { id: 3, name: 'Dr. P. Sritharan', designation: 'Consultant',        organisation: 'National Institute of Admin',specialisation: 'Leadership' },
  { id: 4, name: 'T. Vasanthan',     designation: 'IT Specialist',     organisation: 'ICTA',                       specialisation: 'IT & Digital Skills' },
];

export const COORDINATORS = [
  { id: 1, name: 'Kumaran Arumugam',  nic: '123456789V', designation: 'Development Officer', division: 'Planning' },
  { id: 2, name: 'Nilufar Kasim',     nic: '845623178V', designation: 'Development Officer', division: 'IT' },
  { id: 3, name: 'Jeevan Rathnakumar',nic: '678234512V', designation: 'Assistant Director',  division: 'Planning' },
];

export const TRAINING_PROGRAMMES = [
  {
    id: 1,
    year: 2026,
    courseId: 1,
    courseName: 'Introduction to Project Planning',
    resourcePerson: 'K. Jeyakumar',
    programmeDate: '2026-02-23 – 2026-02-25',
    coordinator: 'Kumaran Arumugam',
    mode: 'In-Class',
    venue: 'Training Hall A',
    status: 'Completed',
    participants: [
      { id: 1, name: 'Sandya Perera',    nic: '956712345V', division: 'Admin',   present: true },
      { id: 2, name: 'Roshan Fernando',  nic: '782345678V', division: 'Finance', present: false },
      { id: 3, name: 'Priya Sithambaram',nic: '912678345V', division: 'HR',      present: true },
    ]
  },
  {
    id: 2,
    year: 2026,
    courseId: 3,
    courseName: 'Leadership & Team Building',
    resourcePerson: 'Dr. P. Sritharan',
    programmeDate: '2026-03-10 – 2026-03-11',
    coordinator: 'Nilufar Kasim',
    mode: 'Online',
    venue: 'Zoom / Virtual',
    status: 'Ongoing',
    participants: [
      { id: 1, name: 'Kumaran Arumugam',  nic: '123456789V', division: 'Planning', present: true },
      { id: 4, name: 'Nilufar Kasim',     nic: '845623178V', division: 'IT',       present: true },
    ]
  },
  {
    id: 3,
    year: 2026,
    courseId: 5,
    courseName: 'IT Skills for Public Service',
    resourcePerson: 'T. Vasanthan',
    programmeDate: '2026-04-07 – 2026-04-11',
    coordinator: 'Jeevan Rathnakumar',
    mode: 'In-Class',
    venue: 'Computer Lab, Block B',
    status: 'Scheduled',
    participants: []
  },
];
