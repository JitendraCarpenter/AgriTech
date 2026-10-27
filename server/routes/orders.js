const r = require('express').Router();
const { Order, Resource } = require('../models'), { protect, restrictTo } = require('../middleware/auth'), { h } = require('../utils/crud');
r.use(protect);

r.get('/', h(async (q, s) => s.json(await Order.find(q.user.role === 'admin' ? {} : { user: q.user._id }).populate('user', 'name email').sort('-createdAt'))));

r.post('/', h(async (q, s) => {
  const items = q.body.items || [];
  if (!items.length) return s.status(400).json({ message: 'Your cart is empty' });
  const found = await Resource.find({ _id: { $in: items.map(i => i.resource) } });
  const lines = []; let total = 0;
  for (const i of items) {
    const p = found.find(x => x.id === i.resource), n = Number(i.qty);
    if (!p || !(n > 0)) return s.status(400).json({ message: 'Invalid item in cart' });
    if (p.stock < n) return s.status(400).json({ message: `${p.name}: only ${p.stock} left in stock` });
    lines.push({ resource: p._id, name: p.name, qty: n, price: p.price }); total += n * p.price;
  }
  await Promise.all(lines.map(l => Resource.updateOne({ _id: l.resource }, { $inc: { stock: -l.qty } })));
  s.status(201).json(await Order.create({ user: q.user._id, items: lines, total }));
}));

// Farmers can cancel their own pending orders; stock goes back
r.patch('/:id/cancel', h(async (q, s) => {
  const o = await Order.findOne({ _id: q.params.id, user: q.user._id });
  if (!o) return s.status(404).json({ message: 'Order not found' });
  if (o.status !== 'pending') return s.status(400).json({ message: 'Only pending orders can be cancelled' });
  o.status = 'cancelled'; await o.save();
  await Promise.all(o.items.map(l => Resource.updateOne({ _id: l.resource }, { $inc: { stock: l.qty } })));
  s.json(o);
}));

// Admin approval / tracking
r.patch('/:id/status', restrictTo('admin'), h(async (q, s) => {
  const o = await Order.findByIdAndUpdate(q.params.id, { status: q.body.status }, { new: true, runValidators: true });
  o ? s.json(o) : s.status(404).json({ message: 'Order not found' });
}));
module.exports = r;
