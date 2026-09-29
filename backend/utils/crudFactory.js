/**
 * Generic CRUD route factory.
 * Creates: GET / (list), POST / (create), PUT /:id (update), DELETE /:id (delete)
 */
const buildCrud = (router, Model, searchFields = [], include = []) => {
  const { Op } = require('sequelize');

  // LIST with search + pagination
  router.get('/', async (req, res) => {
    try {
      const { q = '', page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const where = q && searchFields.length
        ? { [Op.or]: searchFields.map(f => ({ [f]: { [Op.like]: `%${q}%` } })) }
        : {};
      const { count, rows } = await Model.findAndCountAll({ where, include, offset, limit: Number(limit), order: [['id', 'DESC']] });
      res.json({ success: true, total: count, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET by ID
  router.get('/:id', async (req, res) => {
    try {
      const row = await Model.findByPk(req.params.id, { include });
      if (!row) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: row });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // CREATE
  router.post('/', async (req, res) => {
    try {
      const row = await Model.create(req.body);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // UPDATE
  router.put('/:id', async (req, res) => {
    try {
      const row = await Model.findByPk(req.params.id);
      if (!row) return res.status(404).json({ success: false, message: 'Not found' });
      await row.update(req.body);
      res.json({ success: true, data: row });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // DELETE (soft: toggle active) or hard delete
  router.delete('/:id', async (req, res) => {
    try {
      const row = await Model.findByPk(req.params.id);
      if (!row) return res.status(404).json({ success: false, message: 'Not found' });
      // If model has 'active' field, soft-delete; else hard-delete
      if ('active' in row.dataValues) {
        await row.update({ active: false });
        res.json({ success: true, message: 'Deactivated' });
      } else {
        await row.destroy();
        res.json({ success: true, message: 'Deleted' });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};

module.exports = { buildCrud };
