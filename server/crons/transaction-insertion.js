const cron = require('node-cron');
const { sequelize } = require('../config/database');
const Transaction = require('../api/models/transaction');
const rabbitMqClient = require('../config/rabbitmq');
const { rabbitTopicsEnum } = require('../utils/enums');

const transactionInsertionCron = cron.schedule('*/3 * * * * *', async () => {
  const { messages, channel } = await rabbitMqClient.consumeData(rabbitTopicsEnum.TRANSACTIONS);
  const transactions = messages.map((message) => JSON.parse(Buffer.from(message.content)));
  Transaction.bulkCreate(transactions);
  await channel.ackAll();
  await channel.close();
});

module.exports = transactionInsertionCron;
