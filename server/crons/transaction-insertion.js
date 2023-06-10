const cron = require('node-cron');
const { sequelize } = require('../config/database');
const Transaction = require('../api/models/transaction');
const rabbitMqClient = require('../config/rabbitmq');
const { rabbitTopicsEnum } = require('../utils/enums');
const { redisClient } = require('../config/cache');

const transactionInsertionCron = cron.schedule('*/10 * * * * *', async () => {
  const { messages, channel } = await rabbitMqClient.consumeData(rabbitTopicsEnum.TRANSACTIONS);
  const transactions = messages.map((message) => JSON.parse(Buffer.from(message.content)));
  const t = await sequelize.transaction();

  try {
    await Transaction.bulkCreate(transactions, { transaction: t });
    await channel.ackAll();
    await t.commit();
    await redisClient.deleteList('transactions');
  } catch (e) {
    await t.rollback();
    console.log(e.message);
  }

  await channel.close();
});

module.exports = transactionInsertionCron;
