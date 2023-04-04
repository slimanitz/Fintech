/* eslint-disable no-underscore-dangle */
/* worker-pool.js */

const axios = require('axios');
const { host } = require('../../config/vars');
const { transactionGatewayEnum, accountTypesEnum } = require('../../utils/enums');

const counter = 0;

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

    // STEP3 Make 3  random transactions

    for (let index = 0; index < 4; index += 1) {
      const creditAcccount = accounts[Math.floor(Math.random() * accounts.length)];

      const payload = {
        ammount: 2000,
        gateway: transactionGatewayEnum.TRANSFER,
        creditAccountIban: creditAcccount._doc.iban,
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
