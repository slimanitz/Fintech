const cron = require('node-cron');
const moment = require('moment');
const { Op } = require('sequelize');
const Subscription = require('../api/models/subscription');
const { subscriptionFrequency, transactionGatewayEnum } = require('../utils/enums');
const Transaction = require('../api/models/transaction');
const { transactionService } = require('../api/services/transaction');
const { sequelize } = require('../config/database');

let currentDate = moment();

const SubscriptionCron = cron.schedule('*/5 * * * * *', async () => {
  const subscriptions = await Subscription.findAll({
    where: {
      isCancelled: false,
      finishDate: { [Op.gt]: currentDate.toDate() },
      [Op.or]: [
        {
          [Op.and]: {
            frequency: subscriptionFrequency.DAILY,
            lastTransaction: {
              [Op.lt]: currentDate.clone().subtract(1, 'days').toDate(),
            },
          },
        },
        {
          [Op.and]: {
            frequency: subscriptionFrequency.WEEKLY,
            lastTransaction: {
              [Op.lt]: currentDate.clone().subtract(7, 'days').toDate(),
            },
          },
        },
        {
          [Op.and]: {
            frequency: subscriptionFrequency.MONTHLY,
            lastTransaction: {
              [Op.lt]: currentDate.clone().subtract(1, 'months').toDate(),
            },
          },
        },
      ],
    },
    raw: true,
    nest: true,
    limit: 10,
  });

  const result = await Promise.all(subscriptions.map(async (subscription) => {
    const transaction = {
      creditAccountId: subscription.creditAccountId,
      debitAccountId: subscription.debitAccountId,
      amount: subscription.amount,
      gateway: transactionGatewayEnum.TRANSFER,
      gatewayId: subscription.debitAccountId,
      comment: `Subscription ${subscription.id}`,
      userId: subscription.userId,
      currencyExchange: subscription.currencyExchange,
    };

    await transactionService.create(transaction);

    const t = await sequelize.transaction();

    try {
      await Subscription.update({ lastTransaction: currentDate.toDate() }, {
        where: { id: subscription.id },
        transaction: t,
      });
      await Transaction.create(transaction, { transaction: t });
      await t.commit();
      console.log('Transaction Created succesfully');
      return true;
    } catch (error) {
      await t.rollback();
      console.log('Error creating transaction from subscription');
      return false;
    }
  }));

  console.log(result);

  console.log('====================================');
  console.log('Subscriptions', subscriptions);
  console.log('====================================');

  currentDate = currentDate.add(1, 'day');
});

module.exports = SubscriptionCron;
