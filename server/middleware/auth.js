const jwt = require('jsonwebtoken'), { User } = require('../models');

exports.protect = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Please sign in to continue' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) return res.status(401).json({ message: 'This account no longer exists' });
    next();
  } catch { res.status(401).json({ message: 'Session expired. Please sign in again' }); }
};
exports.restrictTo = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Only admins can do this' });
