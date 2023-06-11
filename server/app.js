const { connect, sequelize } = require('./config/database');
const app = require('./config/server');
const { host } = require('./config/vars');
const SubscriptionCron = require('./crons/subscription-to-transaction');
const transactionCron = require('./crons/transaction-validation');

app.listen(8080, async () => {
  await connect();
  // await sequelize.sync({ force: true });
  console.log(`The server is running on ${host}`);
});

module.exports = app;
