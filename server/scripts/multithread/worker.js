/* eslint-disable no-underscore-dangle */
/* worker-pool.js */

const axios = require('axios');
const { host } = require('../../config/vars');
const { transactionGatewayEnum, accountTypesEnum } = require('../../utils/enums');

const simulation = async ({ email, password }, accounts) => {
  try {
    const start = Date.now();
    const instance = axios.create({
      baseURL: `${host}/api`,
      validateStatus: () => true,
    });

    // Step 1 Login

    const loginResponse = await instance.post('/users/login', { email, password: 'password' });
    if (loginResponse.status !== 200) throw new Error('');
    instance.defaults.headers.common.Authorization = `Bearer ${loginResponse.data.token}`;
    const user = loginResponse.data._doc;

    // STEP Create account and make transactions
    // const accountsResponse = await instance.get(`/users/${user._id}/accounts`);
    const accountResponse = await instance.post(`/users/${user._id}/accounts`, { type: accountTypesEnum.BASIC });

    const account = accountResponse.data;

    // STEP3 Make 4  random transactions with bank accounts

    for (let index = 0; index < 4; index += 1) {
      const creditAcccount = accounts[Math.floor(Math.random() * accounts.length)];

      const payload = {
        amount: 2000,
        gateway: transactionGatewayEnum.TRANSFER,
        creditAccountIban: creditAcccount._doc.iban,
        comment: 'Test transaction ',
      };

      await instance.post(`/users/${user._id}/accounts/${account._id}/transactions`, payload);
    }

    const creditCard = await instance.post(`/users/${user._id}/accounts/${account._id}/credit-cards`);

    // STEP4 make 4 random transactions with credit card

    for (let index = 0; index < 4; index += 1) {
      const creditAcccount = accounts[Math.floor(Math.random() * accounts.length)];

      const payload = {
        amount: 2000,
        gateway: transactionGatewayEnum.CREDIT_CARD,
        creditAccountIban: creditAcccount._doc.iban,
        creditCardInfo: {
          number: creditCard.data.number,
          securityCode: creditCard.data.securityCode,
          expirationDate: creditCard.data.expirationDate,
        },
        comment: 'Test transaction ',
      };

      await instance.post(`/users/${user._id}/accounts/${account._id}/transactions`, payload);
    }

    const end = Date.now();

    return { delay: end - start };
  } catch (e) {
    console.log('====================================');
    console.log(e.message);
    console.log('====================================');
    return { delay: 0 };
  }
};

module.exports = async ({ users, accounts }) => {
  const values = await Promise
    .all(users.map(async (user) => await simulation(user._doc, accounts)));
  return values;
};
