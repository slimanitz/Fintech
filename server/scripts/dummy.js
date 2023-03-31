/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const connect = require('../config/database');
const User = require('../api/models/user');
const Account = require('../api/models/account');
const CreditCard = require('../api/models/creditCard');

const main = async () => {
  await connect();
  let users = [];
  let accounts = [];
  let creditCards = [];
  const ACCOUNT_TYPES = ['Basic', 'Saving'];

  for (let index = 0; index < 100; index++) {
    users.push({
      name: faker.name.fullName(),
      email: faker.internet.email(),
      password: crypto.createHash('sha1').update('password', 'binary').digest('hex'),

    });
  }
  users = await User.insertMany(users);
  console.log('Users created succesfully');

  for (let index = 0; index < 1000; index++) {
    accounts.push({
      owner: users[Math.floor(Math.random() * users.length)],
      type: ACCOUNT_TYPES[Math.floor(Math.random() * ACCOUNT_TYPES.length)],
      balance: (300000 * Math.random()).toFixed(2),
      isActive: Math.random() < 0.5,
      iban: faker.finance.iban(),
    });
  }
  accounts = await Account.insertMany(accounts);
  console.log('Bank accounts created');

  for (let index = 0; index < 1500; index++) {
    creditCards.push({
      number: faker.finance.creditCardNumber(),
      expirationDate: faker.date.future(),
      securityCode: faker.finance.creditCardCVV(),
      account: accounts[Math.floor(Math.random() * accounts.length)],
      allowedLimit: Math.floor(100000 * Math.random()),
      limitUsage: Math.floor(100000 * Math.random()),
      isActive: Math.random() < 0.5,
    });
  }

  creditCards = await CreditCard.insertMany(creditCards);
  console.log('Credit cards accounts created');
  process.exit();
};

main();
