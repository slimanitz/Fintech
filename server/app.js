const { redisClient } = require('./config/cache');
const { connect, sequelize } = require('./config/database');
const app = require('./config/server');
const { host } = require('./config/vars');
const transactionCron = require('./crons/transaction-validation');

app.listen(8080, async () => {
  await connect();
  // await sequelize.sync({ force: true });
  console.log(redisClient.status);
  console.log(`The server is running on ${host}`);
  transactionCron.start();
});

module.exports = app;
