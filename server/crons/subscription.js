const cron = require('node-cron');
const moment = require('moment');
const Subscription = require('../api/models/subscription');

const currentDate = moment();

const SubscriptionCron = cron.schedule('*/4 * * * * *', async () => {
  const subscriptions = await Subscription.findAll({
    where:
     { isCancelled: false },
    raw: true,
    nest: true,
  });

  console.log('====================================');
  console.log(subscriptions);
  console.log('====================================');
  console.log(currentDate.toDate());
  console.log('====================================');
  console.log(subscriptions[0].finishDate);
  console.log('====================================');

  currentDate.add(1, 'days');
});

module.exports = SubscriptionCron;
