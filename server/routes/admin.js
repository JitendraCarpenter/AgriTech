const r = require('express').Router();
const M = require('../models'), { protect, restrictTo } = require('../middleware/auth'), { h } = require('../utils/crud');
r.use(protect, restrictTo('admin'));

r.get('/stats', h(async (q, s) => {
  const [users, farms, crops, orders, posts] = await Promise.all(['User', 'Farm', 'Crop', 'Order', 'Post'].map(n => M[n].countDocuments()));
  s.json({ users, farms, crops, orders, posts });
}));
r.get('/users', h(async (q, s) => s.json(await M.User.find().sort('-createdAt'))));
r.patch('/users/:id/role', h(async (q, s) => {
  if (q.params.id === q.user.id) return s.status(400).json({ message: 'You cannot change your own role' });
  const u = await M.User.findByIdAndUpdate(q.params.id, { role: q.body.role }, { new: true, runValidators: true });
  u ? s.json(u) : s.status(404).json({ message: 'User not found' });
}));
r.delete('/users/:id', h(async (q, s) => {
  if (q.params.id === q.user.id) return s.status(400).json({ message: 'You cannot delete yourself' });
  await M.User.findByIdAndDelete(q.params.id); s.json({ message: 'Deleted' });
}));
module.exports = r;
