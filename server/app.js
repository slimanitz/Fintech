const { redisClient } = require('./config/cache');
const { connect, sequelize } = require('./config/database');
const rabbitMqClient = require('./config/rabbitmq');
const app = require('./config/server');
const { host } = require('./config/vars');
const SubscriptionCron = require('./crons/subscription-to-transaction');
const transactionCron = require('./crons/transaction-validation');
const transactionInsertionCron = require('./crons/transaction-insertion');

app.listen(8080, async () => {
  await connect();
  await rabbitMqClient.connectQueue();
  await rabbitMqClient.createSubject('transactions');
  console.log(`The server is running on ${host}`);
});

module.exports = app;
