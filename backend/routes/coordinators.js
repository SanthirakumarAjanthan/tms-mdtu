const router = require('express').Router();
const { CourseCoordinator } = require('../models');
const { buildCrud } = require('../utils/crudFactory');
const { auth } = require('../middleware/auth');
router.use(auth);
buildCrud(router, CourseCoordinator, ['name', 'nic', 'designation']);
module.exports = router;
