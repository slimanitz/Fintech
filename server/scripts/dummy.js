/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const connect = require('../config/database');
const User = require('../api/models/user');
const Account = require('../api/models/account');
const CreditCard = require('../api/models/creditCard');
const { userRolesEnum, accountTypesEnum } = require('../utils/enums');

const main = async () => {
  await connect();
  let users = [];
  let accounts = [];
  let creditCards = [];

  users.push({
    email: 'slimaneber@gmail.com',
    password: crypto.createHash('sha1').update('password', 'binary').digest('hex'),
    name: 'Slimane',
    role: 'CLIENT',
  });

  for (let index = 0; index < 100; index++) {
    users.push({
      name: faker.name.fullName(),
      email: faker.internet.email(),
      password: crypto.createHash('sha1').update('password', 'binary').digest('hex'),
      role: Object
        .values(userRolesEnum)[Math.floor(Math.random() * Object.values(userRolesEnum).length)],
    });
  }
  users = await User.insertMany(users);
  console.log('Users created succesfully');

  for (let index = 0; index < 1000; index++) {
    accounts.push({
      userId: users[Math.floor(Math.random() * users.length)],
      type: Object
        .values(accountTypesEnum)[Math.floor(Math.random() * Object
          .values(accountTypesEnum).length)],
      balance: faker.finance.amount(0, 30000),
      isActive: Math.random() < 0.5,
      iban: faker.finance.iban(),
    });
  }
  accounts = await Account.insertMany(accounts);
  console.log('Bank accounts created');

  for (let index = 0; index < 1500; index++) {
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    creditCards.push({
      number: faker.finance.creditCardNumber().replaceAll('-', ''),
      expirationDate: faker.date.future(),
      securityCode: faker.finance.creditCardCVV(),
      accountId: account._id,
      userId: account.userId,
      allowedLimit: faker.finance.amount(8000, 10000),
      limitUsage: faker.finance.amount(0, 8000),
      isActive: Math.random() < 0.5,
    });
  }

  creditCards = await CreditCard.insertMany(creditCards);
  console.log('Credit cards accounts created');
  process.exit();
};

main();
