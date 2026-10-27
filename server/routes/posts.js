const r = require('express').Router();
const { Post } = require('../models'), { protect } = require('../middleware/auth'), { h } = require('../utils/crud');
r.use(protect);
const pop = q => q.populate('author', 'name role').populate('replies.author', 'name role');

r.get('/', h(async (q, s) => s.json(await pop(Post.find().sort('-createdAt')))));
r.post('/', h(async (q, s) => {
  const { title, body, type } = q.body;
  s.status(201).json(await Post.create({ title, body, type, author: q.user._id }));
}));
r.post('/:id/reply', h(async (q, s) => {
  if (!q.body.body?.trim()) return s.status(400).json({ message: 'Write a reply first' });
  const p = await Post.findByIdAndUpdate(q.params.id, { $push: { replies: { author: q.user._id, body: q.body.body } } }, { new: true });
  p ? s.json(p) : s.status(404).json({ message: 'Post not found' });
}));
r.delete('/:id', h(async (q, s) => {
  const p = await Post.findById(q.params.id);
  if (!p) return s.status(404).json({ message: 'Post not found' });
  if (q.user.role !== 'admin' && !p.author.equals(q.user._id)) return s.status(403).json({ message: 'You can only delete your own posts' });
  await p.deleteOne(); s.json({ message: 'Deleted' });
}));
module.exports = r;
