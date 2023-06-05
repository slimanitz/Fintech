const cron = require('node-cron');
const { sequelize } = require('../config/database');
const Transaction = require('../api/models/transaction');
const Account = require('../api/models/account');
const CreditCard = require('../api/models/creditCard');
const { exchangeApiKey } = require('../config/vars');
const rabbitMqClient = require('../config/rabbitmq');
const { rabbitTopicsEnum } = require('../utils/enums');

const transactionInsertionCron = cron.schedule('*/10 * * * * *', async () => {
  const { messages, channel } = await rabbitMqClient.consumeData(rabbitTopicsEnum.TRANSACTIONS);
  const transactions = messages.map((message) => JSON.parse(Buffer.from(message.content)));
  console.log(transactions);
  Transaction.bulkCreate(transactions);
  console.log('====================================');
  console.log('Insertion was a success');
  console.log('====================================');
  await channel.ackAll();
  console.log('ACKEEED');
  await channel.close();
  console.log('====================================');
  console.log('ack was a success');
  console.log('====================================');
  console.log('====================================');
  console.log('From rabbit', transactions);
  console.log('====================================');
});

module.exports = transactionInsertionCron;
