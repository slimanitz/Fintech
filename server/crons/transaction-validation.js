const cron = require('node-cron');
const fs = require('fs');
const axios = require('axios');
const { transactionStatusEnum, transactionGatewayEnum } = require('../utils/enums');
const { sequelize } = require('../config/database');
const Transaction = require('../api/models/transaction');
const Account = require('../api/models/account');
const CreditCard = require('../api/models/creditCard');
const { exchangeApiKey } = require('../config/vars');

const exchangeInstance = axios.create({
  baseURL: `https://v6.exchangerate-api.com/v6/${exchangeApiKey}/pair`,
  timeout: 1000,
  validateStatus: () => true,

});

const isTheSameCurrency = (exchangeCurrency) => {
  const currencies = exchangeCurrency.split('/');
  return currencies[0] === currencies[1];
};

const getConversionResult = async (currencyPair, amount) => {
  const response = await exchangeInstance.get(`/${currencyPair}/${amount}`);
  return response.data.conversion_result;
};

const transactionCron = cron.schedule('*/30 * * * * *', async () => {
  const transactions = await Transaction
    .findAll({
      where: {
        status: transactionStatusEnum.PENDING,

      },
      raw: true,
      nest: true,
      limit: 10,
    });

  const results = await Promise.all(transactions.map(async (transaction) => {
    const amount = isTheSameCurrency(transaction.currencyExchange)
      ? transaction.amount
      : await getConversionResult(transaction.currencyExchange);

    try {
      const debitAccount = await Account.findByPk(transaction.debitAccountId);
      if (!debitAccount && transactionGatewayEnum.DEPOSIT) {
        await Transaction.update(
          { status: transactionStatusEnum.REFUSED },
          { where: { id: transaction.id } },
        );
        console.log('step 1');
        return false;
      }
      const creditAccount = await Account.findByPk(transaction.creditAccountId);
      if (!creditAccount) {
        await Transaction.update(
          { status: transactionStatusEnum.REFUSED },
          { where: { id: transaction.id } },
        );
        console.log('step 2');
        return false;
      }
      if (transaction.gateway == transactionGatewayEnum.DEPOSIT) {
        const t = await sequelize.transaction();

        try {
          creditAccount.balance += amount;
          await Account.update(
            { balance: creditAccount.balance },
            { where: { id: creditAccount.id }, transaction: t },
          );
          await Transaction.update(
            { status: transactionStatusEnum.APPROVED },
            { where: { id: transaction.id }, transaction: t },
          );
          await t.commit();
          return true;
        } catch (error) {
          await t.rollback();
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          return false;
        }
      } else if (transaction.gateway == transactionGatewayEnum.CREDIT_CARD) {
        const creditCard = await CreditCard.findByPk(transaction.gatewayId);
        if (!creditCard) {
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          console.log('step 3');
          return false;
        }
        if (((creditCard.allowedLimit - creditCard.limitUsage) < amount)) {
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          console.log('step 4');
          return false;
        }
        if (debitAccount.balance < amount) {
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          console.log('step 5');
          return false;
        }
        const t = await sequelize.transaction();

        try {
          creditCard.limitUsage += amount;

          await CreditCard.update(
            { limitUsage: creditCard.limitUsage },
            { where: { id: creditCard.id }, transaction: t },
          );
          creditAccount.balance += transaction.amount;
          await Account.update(
            { balance: creditAccount.balance },
            { where: { id: creditAccount.id }, transaction: t },
          );
          debitAccount.balance -= amount;
          await Account.update(
            { balance: debitAccount.balance },
            { where: { id: debitAccount.id }, transaction: t },
          );
          await Transaction.update(
            { status: transactionStatusEnum.APPROVED },
            { where: { id: transaction.id }, transaction: t },
          );
          await t.commit();
          return true;
        } catch (error) {
          await t.rollback();
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          return false;
        }
      } else {
        if (debitAccount.balance < amount) {
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          console.log('step 6');
          return false;
        }
        const t = await sequelize.transaction();

        try {
          creditAccount.balance += transaction.amount;
          await Account.update(
            { balance: creditAccount.balance },
            { where: { id: creditAccount.id }, transaction: t },
          );
          debitAccount.balance -= amount;
          await Account.update(
            { balance: debitAccount.balance },
            { where: { id: debitAccount.id }, transaction: t },
          );
          await Transaction.update(
            { status: transactionStatusEnum.APPROVED },
            { where: { id: transaction.id }, transaction: t },
          );
          await t.commit();
          return true;
        } catch (error) {
          await t.rollback();
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          return false;
        }
      }
    } catch (error) {
      console.log(error);
      await Transaction.update(
        { status: transactionStatusEnum.REFUSED },
        { where: { id: transaction.id } },
      );
      return false;
    }
  }));

  fs.appendFileSync('data.csv', `${results.join('", "')}`);
});

module.exports = transactionCron;
