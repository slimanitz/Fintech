const cron = require('node-cron');
const { transactionStatusEnum, transactionGatewayEnum } = require('../utils/enums');
const { connect, sequelize } = require('../config/database');
const Transaction = require('../api/models/transaction');
const Account = require('../api/models/account');
const CreditCard = require('../api/models/creditCard');

const transactionCron = cron.schedule('*/10 * * * * *', async () => {
  await connect();
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
    try {
      const debitAccount = await Account.findByPk(transaction.debitAccountId);
      if (!debitAccount && transactionGatewayEnum.DEPOSIT) {
        await Transaction.update(
          { status: transactionStatusEnum.REFUSED },
          { where: { id: transaction.id } },
        );
        console.log('1');
        return false;
      }
      const creditAccount = await Account.findByPk(transaction.creditAccountId);
      if (!creditAccount) {
        await Transaction.update(
          { status: transactionStatusEnum.REFUSED },
          { where: { id: transaction.id } },
        );
        console.log('2');
        return false;
      }
      if (transaction.gateway == transactionGatewayEnum.DEPOSIT) {
        const t = await sequelize.transaction();

        try {
          creditAccount.balance += transaction.amount;
          await creditAccount.save({ transaction: t });
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
          console.log('3');
          return false;
        }
        if (((creditCard.allowedLimit - creditCard.limitUsage) < transaction.amount)) {
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          console.log('4');
          return false;
        }
        if (debitAccount.balance < transaction.amount) {
          await Transaction.update(
            { status: transactionStatusEnum.REFUSED },
            { where: { id: transaction.id } },
          );
          console.log('5');
          return false;
        }
        const t = await sequelize.transaction();

        try {
          creditCard.limitUsage += transaction.amount;
          await creditCard.save({ transacation: t });
          creditAccount.balance += transaction.amount;
          await creditAccount.save({ transacation: t });
          debitAccount.balance -= transaction.amount;
          await debitAccount.save({ transacation: t });
          await Transaction.update(
            { status: transactionStatusEnum.APPROVED },
            { where: { id: transaction.id }, transaction: t },
          );
          await t.commit();
          console.log('success');
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
          await creditAccount.save({ transaction: t });
          debitAccount.balance -= transaction.amount;
          await debitAccount.save({ transaction: t });

          await Transaction.update(
            { status: transactionStatusEnum.APPROVED },
            { where: { id: transaction.id } },
          );
          await t.commit();
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
      }
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
      console.log('====================================');
      console.log('refused');
      console.log('====================================');
      await Transaction.update(
        { status: transactionStatusEnum.REFUSED },
        { where: { id: transaction.id } },
      );
      return false;
    }
  }));

  console.log('====================================');
  console.log(results);
  console.log('====================================');
  console.log('running a task every 3 seconds');
});

module.exports = transactionCron;
