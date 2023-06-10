/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const { connect, sequelize } = require('../config/database');
const User = require('../api/models/user');
const Account = require('../api/models/account');
const CreditCard = require('../api/models/creditCard');
const { userRolesEnum, accountTypesEnum } = require('../utils/enums');

const main = async () => {
  await connect();
  // await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  // await sequelize.sync({ force: true });
  // await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

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
      email: index + faker.internet.email().toLowerCase(),
      password: crypto.createHash('sha1').update('password', 'binary').digest('hex'),
      role: Object
        .values(userRolesEnum)[Math.floor(Math.random() * Object.values(userRolesEnum).length)],
    });
  }
  users = await User.bulkCreate(users);
  console.log('Users created succesfully');

  for (let index = 0; index < 300; index++) {
    accounts.push({
      userId: users[Math.floor(Math.random() * users.length)].id,
      type: Object
        .values(accountTypesEnum)[Math.floor(Math.random() * Object
          .values(accountTypesEnum).length)],
      balance: faker.finance.amount(0, 5000),
      isActive: Math.random() < 0.5,
      iban: faker.finance.iban(),
      currency: 'EUR',
    });
  }
  accounts = await Account.bulkCreate(accounts);
  console.log('Bank accounts created');

  for (let index = 0; index < 1000; index++) {
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const dateObj = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
    const month = dateObj.getUTCMonth() + 1; // months from 1-12
    const year = dateObj.getUTCFullYear();
    const expirationDate = `${month}/${year}`;
    creditCards.push({
      number: faker.finance.creditCardNumber().replaceAll('-', ''),
      expirationDate,
      securityCode: faker.finance.creditCardCVV(),
      accountId: account.id,
      userId: account.userId,
      allowedLimit: faker.finance.amount(8000, 10000),
      limitUsage: faker.finance.amount(0, 8000),
      isActive: Math.random() < 0.5,
    });
  }

  creditCards = await CreditCard.bulkCreate(creditCards);
  console.log('Credit cards accounts created');
  process.exit();
};

main();
