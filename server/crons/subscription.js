const cron = require('node-cron');
const moment = require('moment');
const Subscription = require('../api/models/subscription');
const { subscriptionFrequency } = require('../utils/enums');

const currentDate = moment();

const SubscriptionCron = cron.schedule('*/5 * * * * *', async () => {
  const subscriptions = await Subscription.findAll({
    where:
     { isCancelled: false },
    raw: true,
    nest: true,
    limit:10
  });

  subscriptions.forEach(subscription => {
    if(subscription.frequency == subscriptionFrequency.DAILY && lastTransaction)

    
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
