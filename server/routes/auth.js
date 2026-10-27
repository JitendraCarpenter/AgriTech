const r = require('express').Router(), jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models'), { protect } = require('../middleware/auth'), { h } = require('../utils/crud');

const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role, language: u.language, region: u.region });
const valid = (q, s, n) => { const e = validationResult(q); e.isEmpty() ? n() : s.status(400).json({ message: e.array()[0].msg }); };
const email = body('email').isEmail().withMessage('Enter a valid email').normalizeEmail();

r.post('/register', [body('name').trim().notEmpty().withMessage('Name is required'), email,
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')], valid,
  h(async (q, s) => {
    const { name, email, password, region, language } = q.body;   // role is never taken from the client
    const u = await User.create({ name, email, password, region, language });
    s.status(201).json({ token: sign(u), user: pub(u) });
  }));

r.post('/login', [email, body('password').notEmpty().withMessage('Password is required')], valid, h(async (q, s) => {
  const u = await User.findOne({ email: q.body.email }).select('+password');
  if (!u || !(await u.matches(q.body.password))) return s.status(401).json({ message: 'Incorrect email or password' });
  s.json({ token: sign(u), user: pub(u) });
}));

r.get('/me', protect, (q, s) => s.json(pub(q.user)));
module.exports = r;
