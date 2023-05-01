const cron = require('node-cron');
const fs = require('fs');
const { transactionStatusEnum, transactionGatewayEnum } = require('../utils/enums');
const { connect, sequelize } = require('../config/database');
const Transaction = require('../api/models/transaction');
const Account = require('../api/models/account');
const CreditCard = require('../api/models/creditCard');

const transactionCron = cron.schedule('*/3 * * * * *', async () => {
  // await connect();
  const transactions = await Transaction
    .findAll({
      where: {
        status: transactionStatusEnum.PENDING,

      },
      raw: true,
      nest: true,
      limit: 10,
    });
  //   const t = await sequelize.transaction();
  console.log('====================================');
  console.log(transactions);
  console.log('====================================');

  const results = await Promise.all(transactions.map(async (transaction) => {
    console.count('arrived');
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
          creditAccount.balance += +transaction.amount;
          await Account.update(
            { balance: creditAccount.balance },
            { where: { id: creditAccount.id }, transaction: t },
          );
          await Transaction.update(
            { status: transactionStatusEnum.APPROVED },
            { where: { id: transaction.id }, transaction: t },
          );
          await t.commit();
          console.log('success');
          return true;
        } catch (error) {
          console.log('error');
          console.log(error);
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
        if (((creditCard.allowedLimit - creditCard.limitUsage) < transaction.amount)) {
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          console.log('step 4');
          return false;
        }
        if (debitAccount.balance < transaction.amount) {
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          console.log('step 5');
          return false;
        }
        const t = await sequelize.transaction();

        try {
          creditCard.limitUsage += transaction.amount;
          await CreditCard.update(
            { limitUsage: creditCard.limitUsage },
            { where: { id: creditCard.id }, transaction: t },
          );
          creditAccount.balance += transaction.amount;
          await Account.update(
            { balance: creditAccount.balance },
            { where: { id: creditAccount.id }, transaction: t },
          );
          debitAccount.balance -= transaction.amount;
          await Account.update(
            { balance: debitAccount.balance },
            { where: { id: debitAccount.id }, transaction: t },
          );
          await Transaction.update(
            { status: transactionStatusEnum.APPROVED },
            { where: { id: transaction.id }, transaction: t },
          );
          await t.commit();
          console.log('success235');
          return true;
        } catch (error) {
          console.log('error');
          console.log(error);
          await t.rollback();
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          return false;
        }
      } else {
        if (debitAccount.balance < transaction.amount) {
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          console.log('6');
          return false;
        }
        const t = await sequelize.transaction();

        try {
          creditAccount.balance += transaction.amount;
          await Account.update(
            { balance: creditAccount.balance },
            { where: { id: creditAccount.id }, transaction: t },
          );
          debitAccount.balance -= transaction.amount;
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
          console.log(error);
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

  console.log(results);

  fs.appendFileSync('data.csv', `${results.join('", "')}`);
});

module.exports = transactionCron;
