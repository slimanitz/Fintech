/* worker-pool.js */

const axios = require('axios');
const moment = require('moment');
const { host } = require('../../config/vars');
const {
  transactionGatewayEnum, accountTypesEnum, subscriptionFrequency, ibanToCurrencies,
} = require('../../utils/enums');

let requestSuccess = 0;
let totalRequests = 0;

const simulation = async ({ email, password }, accounts) => {
  try {
    const start = Date.now();
    const instance = axios.create({
      baseURL: `${host}/api`,
      validateStatus: () => true,
    });

    // Step 1 Login
    const loginResponse = await instance.post('/users/login', { email: email.toLowerCase(), password: 'password' });
    totalRequests++;
    if (loginResponse.status !== 200) requestSuccess++;
    instance.defaults.headers.common.Authorization = `Bearer ${loginResponse.data.token}`;
    const user = loginResponse.data;

    // STEP Create account and make transactions
    // const accountsResponse = await instance.get(`/users/${user.id}/accounts`);
    const accountResponse = await instance.post(`/users/${user.id}/accounts`, { type: accountTypesEnum.BASIC });
    totalRequests++;
    if (accountResponse.status === 200) requestSuccess++;

    const account = accountResponse.data;

    // STEP3 Make 4  random transactions with bank accounts

    for (let index = 0; index < 50; index += 1) {
      const creditAcccount = accounts[Math.floor(Math.random() * accounts.length)];

      const payload = {
        amount: Math.floor(Math.random() * 2000),
        gateway: transactionGatewayEnum.TRANSFER,
        creditAccountIban: creditAcccount.iban,
        comment: 'Test transaction ',
      };

      const res = await instance.post(`/users/${user.id}/accounts/${account.id}/transactions`, payload);
      totalRequests++;
      if (res.status === 200) requestSuccess++;
    }

    const creditCard = await instance.post(`/users/${user.id}/accounts/${account.id}/credit-cards`);

    // STEP4 make 4 random transactions with credit card

    for (let index = 0; index < 50; index += 1) {
      const creditAcccount = accounts[Math.floor(Math.random() * accounts.length)];

      const payload = {
        amount: Math.floor(Math.random() * 2000),
        gateway: transactionGatewayEnum.CREDIT_CARD,
        creditAccountIban: creditAcccount.iban,
        creditCardInfo: {
          number: creditCard.data.number,
          securityCode: creditCard.data.securityCode,
          expirationDate: creditCard.data.expirationDate,
        },
        comment: 'Test transaction ',
      };

      const res = await instance.post(`/users/${user.id}/accounts/${account.id}/transactions`, payload);
      totalRequests++;
      if (res.status === 200) requestSuccess++;
    }

    // STEP5 CREATE SUBSCRIPTION

    for (let index = 0; index < 2; index += 1) {
      const creditAcccount = accounts[Math.floor(Math.random() * accounts.length)];

      const payload = {
        amount: Math.floor(Math.random() * 2000),
        creditAccountIban: creditAcccount.iban,
        name: 'Test Subscription ',
        frequency: Object.values(subscriptionFrequency)[
          Math.floor(
            Math.random() * Object.values(subscriptionFrequency).length,
          )
        ],
        finishDate: moment().add(2, 'years'),
      };

      const res = await instance.post(`/users/${user.id}/accounts/${account.id}/subscriptions`, payload);
      totalRequests++;
      if (res.status === 200) requestSuccess++;
    }

    const end = Date.now();

    return {
      delay: end - start,
      success: `${requestSuccess}/${totalRequests}`,
      rate: (requestSuccess / totalRequests) * 100,
    };
  } catch (e) {
    console.log(e.message);
    return { delay: 0, success: `${requestSuccess}/${totalRequests}` };
  }
};

module.exports = async ({ users, accounts }) => {
  const values = await Promise
    .all(users.map(async (user) => await simulation(user, accounts)));
  return values;
};
