/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const expressMonitor = require('express-status-monitor');
const timeout = require('connect-timeout');
const router = require('../api/routes');
const { errorHandler } = require('../middlewares/error');
const rabbitMqClient = require('./rabbitmq');

const app = express();
app.use(cors({ origin: '*' }));
app.use(timeout('20s'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(expressMonitor());
app.use('/api', router);
app.use(errorHandler);

module.exports = app;
