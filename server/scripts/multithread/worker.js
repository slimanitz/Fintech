/* worker-pool.js */

const axios = require('axios');
const { host } = require('../../config/vars');
const { transactionGatewayEnum, accountTypesEnum, subscriptionFrequency } = require('../../utils/enums');

let requestSuccess = 0;
let totalRequests = 0;

const simulation = async ({ email, password }, accounts) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const start = Date.now();
    const instance = axios.create({
      baseURL: `${host}/api`,
      validateStatus: () => true,
    });

    // Step 1 Login
    console.log('LOGIN', email);
    const loginResponse = await instance.post('/users/login', { email: email.toLowerCase(), password: 'password' });
    totalRequests++;
    if (loginResponse.status !== 200) requestSuccess++;
    instance.defaults.headers.common.Authorization = `Bearer ${loginResponse.data.token}`;
    const user = loginResponse.data;

    // STEP Create account and make transactions
    // const accountsResponse = await instance.get(`/users/${user._id}/accounts`);
    const accountResponse = await instance.post(`/users/${user._id}/accounts`, { type: accountTypesEnum.BASIC });
    totalRequests++;
    if (accountResponse.status === 200) requestSuccess++;

    const account = accountResponse.data;

    // STEP3 Make 4  random transactions with bank accounts

    for (let index = 0; index < 4; index += 1) {
      const creditAcccount = accounts[Math.floor(Math.random() * accounts.length)];

      const payload = {
        amount: 2000,
        gateway: transactionGatewayEnum.TRANSFER,
        creditAccountIban: creditAcccount.iban,
        comment: 'Test transaction ',
      };

      const res = await instance.post(`/users/${user._id}/accounts/${account._id}/transactions`, payload);
      totalRequests++;
      if (res.status === 200) requestSuccess++;
    }

    const creditCard = await instance.post(`/users/${user._id}/accounts/${account._id}/credit-cards`);

    // STEP4 make 4 random transactions with credit card

    for (let index = 0; index < 4; index += 1) {
      const creditAcccount = accounts[Math.floor(Math.random() * accounts.length)];

      const payload = {
        amount: 2000,
        gateway: transactionGatewayEnum.CREDIT_CARD,
        creditAccountIban: creditAcccount.iban,
        creditCardInfo: {
          number: creditCard.data.number,
          securityCode: creditCard.data.securityCode,
          expirationDate: creditCard.data.expirationDate,
        },
        comment: 'Test transaction ',
      };

      const res = await instance.post(`/users/${user._id}/accounts/${account._id}/transactions`, payload);
      totalRequests++;
      if (res.status === 200) requestSuccess++;
    }

    // STEP5 CREATE SUBSCRIPTION

    for (let index = 0; index < 2; index += 1) {
      const creditAcccount = accounts[Math.floor(Math.random() * accounts.length)];

      const payload = {
        amount: 2000,
        creditAccountIban: creditAcccount.iban,
        name: 'Test Subscription ',
        frequency: subscriptionFrequency.DAILY,
        finishDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      };

      const res = await instance.post(`/users/${user._id}/accounts/${account._id}/subscriptions`, payload);
      totalRequests++;
      if (res.status === 200) requestSuccess++;
    }

    const end = Date.now();

    return { delay: end - start, success: `${requestSuccess}/${totalRequests}` };
  } catch (e) {
    console.log('====================================');
    console.log(e.message);
    console.log('======================w==============');
    return { delay: 0, success: `${requestSuccess}/${totalRequests}` };
  }
};

module.exports = async ({ users, accounts }) => {
  const values = await Promise
    .all(users.map(async (user) => await simulation(user, accounts)));
  return values;
};
