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

  // await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  // await sequelize.sync({ force: true });
  // await sequelize.query('SET FOREIGN_KEY_CHECKS = 1'); console.log(redisClient.status);
  console.log(`The server is running on ${host}`);
});

module.exports = app;
