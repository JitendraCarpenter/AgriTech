require('dotenv').config();
const express = require('express'), cors = require('cors'), morgan = require('morgan');
const connect = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }), express.json(), morgan('dev'));
['auth', 'farms', 'crops', 'weather', 'alerts', 'resources', 'orders', 'posts', 'admin']
  .forEach(n => app.use(`/api/${n}`, require(`./routes/${n}`)));
app.use(notFound, errorHandler);

const PORT = process.env.PORT || 5000;
connect().then(() => app.listen(PORT, () => console.log(`API running on :${PORT}`)));
