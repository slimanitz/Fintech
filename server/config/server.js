const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const router = require('../api/routes');
const { errorHandler } = require('../middlewares/error');

const app = express();
app.use(cors({ origin: '*' }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

module.exports = app;
