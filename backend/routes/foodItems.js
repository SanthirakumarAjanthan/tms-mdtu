const router = require('express').Router();
const { FoodItem } = require('../models');
const { buildCrud } = require('../utils/crudFactory');
const { auth } = require('../middleware/auth');
router.use(auth);
buildCrud(router, FoodItem, ['item']);
module.exports = router;
