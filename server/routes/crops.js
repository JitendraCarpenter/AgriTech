const r = require('express').Router();
const { Crop, Farm } = require('../models'), { crud, h } = require('../utils/crud'), { protect } = require('../middleware/auth');
const analyse = require('../utils/soil');

// Soil health analysis for one crop
r.get('/:id/analysis', protect, h(async (q, s) => {
  const c = await Crop.findOne({ _id: q.params.id, ...(q.user.role === 'admin' ? {} : { owner: q.user._id }) });
  c ? s.json(analyse(c.soil || {})) : s.status(404).json({ message: 'Crop not found' });
}));

// A crop can only be added to the user's own farm
r.post('/', protect, h(async (q, s, n) => {
  if (q.user.role !== 'admin' && !(await Farm.exists({ _id: q.body.farm, owner: q.user._id })))
    return s.status(403).json({ message: 'Choose one of your own farms' });
  n();
}));
r.use(crud(Crop, { populate: 'farm', required: ['name', 'farm'] }));
module.exports = r;
