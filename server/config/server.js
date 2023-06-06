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
app.use(timeout('10s'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(expressMonitor());
app.use('/api', router);

// app.post('/publish', async (req, res) => {
//   rabbitMqClient.publishData('transactions', 'test');
//   res.send({ message: 'Published succesfully' });
// });
// app.get('/consume', async (req, res) => {
//   const messages = await rabbitMqClient.consumeData(req.body.topic);
//   console.log('====================================');
//   console.log(messages);
//   // rabbitMqClient.channel.ack(messages[0]);
//   // messages.length > 0 ? await rabbitMqClient.channel.ack(messages[messages.length - 1]) : console.log('Empty');

//   res.send({ message: 'consumed succesfully' });
// });

app.use(errorHandler);

module.exports = app;
