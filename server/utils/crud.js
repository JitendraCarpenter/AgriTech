const express = require('express'), { protect, restrictTo } = require('../middleware/auth');
const h = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const need = fields => (req, res, next) => {
  const m = fields.filter(f => req.body[f] === undefined || req.body[f] === '');
  m.length ? res.status(400).json({ message: `Missing: ${m.join(', ')}` }) : next();
};
const found = res => d => d ? res.json(d) : res.status(404).json({ message: 'Not found' });

// Full CRUD where each user sees only their own records (admins see all).
exports.crud = (Model, { owner = 'owner', populate = '', required = [] } = {}) => {
  const r = express.Router(); r.use(protect);
  const scope = u => (u.role === 'admin' ? {} : { [owner]: u._id });
  r.get('/', h(async (q, s) => s.json(await Model.find(scope(q.user)).populate(populate).sort('-createdAt'))));
  r.post('/', need(required), h(async (q, s) => s.status(201).json(await Model.create({ ...q.body, [owner]: q.user._id }))));
  r.put('/:id', h(async (q, s) => {
    delete q.body[owner];
    found(s)(await Model.findOneAndUpdate({ _id: q.params.id, ...scope(q.user) }, q.body, { new: true, runValidators: true }));
  }));
  r.delete('/:id', h(async (q, s) => {
    const d = await Model.findOneAndDelete({ _id: q.params.id, ...scope(q.user) });
    d ? s.json({ message: 'Deleted' }) : s.status(404).json({ message: 'Not found' });
  }));
  return r;
};

// Everyone signed in can read; only admins can write.
exports.adminCrud = (Model, required = []) => {
  const r = express.Router(); r.use(protect);
  r.get('/', h(async (q, s) => s.json(await Model.find().sort('-createdAt'))));
  r.post('/', restrictTo('admin'), need(required), h(async (q, s) => s.status(201).json(await Model.create(q.body))));
  r.put('/:id', restrictTo('admin'), h(async (q, s) => found(s)(await Model.findByIdAndUpdate(q.params.id, q.body, { new: true, runValidators: true }))));
  r.delete('/:id', restrictTo('admin'), h(async (q, s) => {
    const d = await Model.findByIdAndDelete(q.params.id);
    d ? s.json({ message: 'Deleted' }) : s.status(404).json({ message: 'Not found' });
  }));
  return r;
};
exports.h = h;
