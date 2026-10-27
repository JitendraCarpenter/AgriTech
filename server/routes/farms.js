module.exports = require('../utils/crud').crud(require('../models').Farm, { required: ['name', 'location'] });
