// const cron = require('node-cron');
// const { default: mongoose } = require('mongoose');
// const { transactionStatusEnum, transactionGatewayEnum } = require('../utils/enums');
// const { creditCardService } = require('../api/services/creditCard');
// const { transactionService } = require('../api/services/transaction');
// const connect = require('../config/database');
// const { accountService } = require('../api/services/account');
// const Transaction = require('../api/models/transaction');
// const Account = require('../api/models/account');
// const CreditCard = require('../api/models/creditCard');

// const transactionCron = cron.schedule('*/5 * * * * *', async () => {
//   await connect();
//   const conn = mongoose.connection;
//   const transactions = await transactionService.getAll({ status: transactionStatusEnum.PENDING });
//   const updates = Promise.all(transactions.map(async (transaction) => {
//     try {
//       const debitAccount = await Account.findById(transaction.debitAccount);
//       if (!debitAccount && transactionGatewayEnum.DEPOSIT) {
//         return {
//           updateOne: {
//             filter: { _id: transaction._id },
//             update: { status: transactionStatusEnum.REFUSED },
//           },
//         };
//       }
//       const creditAccount = await Account.findById(transaction.creditAccount);
//       if (!creditAccount) {
//         return {
//           updateOne: {
//             filter: { _id: transaction._id },
//             update: { status: transactionStatusEnum.REFUSED },
//           },
//         };
//       }
//       if (transaction.gateway == transactionGatewayEnum.DEPOSIT) {
//         const session = await conn.startSession();
//         try {
//           session.startTransaction();
//           creditAccount.balance += transaction.amount;
//           await Account(creditAccount).save({ session });
//           await session.commitTransaction();
//           session.endSession();
//           console.log('success');
//           return { _id: transaction._id, status: transactionStatusEnum.APPROVED };
//         } catch (error) {
//           console.log('error');
//           console.log(error);
//           await session.abortTransaction();
//           session.endSession();
//           return {
//             updateOne: {
//               filter: { _id: transaction._id },
//               update: { status: transactionStatusEnum.REFUSED },
//             },
//           };
//         }
//       } else if (transaction.gateway == transactionGatewayEnum.CREDIT_CARD) {
//         const creditCard = await CreditCard.findById(transaction.gatewayId);
//         if (!creditCard) {
//           return {
//             updateOne: {
//               filter: { _id: transaction._id },
//               update: { status: transactionStatusEnum.REFUSED },
//             },
//           };
//         }
//         if (((creditCard.allowedLimit - creditCard.limitUsage) < transaction.amount)) {
//           return {
//             updateOne: {
//               filter: { _id: transaction._id },
//               update: { status: transactionStatusEnum.REFUSED },
//             },
//           };
//         }
//         if (debitAccount.balance < transaction.amount) {
//           return {
//             updateOne: {
//               filter: { _id: transaction._id },
//               update: { status: transactionStatusEnum.REFUSED },
//             },
//           };
//         }
//         const session = await conn.startSession();
//         try {
//           session.startTransaction();
//           creditCard.limitUsage += transaction.amount;
//           await CreditCard(creditCard).save({ session });
//           creditAccount.balance += transaction.amount;
//           await Account(creditAccount).save({ session });
//           debitAccount.balance -= transaction.amount;
//           await Account(debitAccount).save({ session });

//           await session.commitTransaction();
//           session.endSession();
//           console.log('success');
//           return {
//             updateOne: {
//               filter: { _id: transaction._id },
//               update: { status: transactionStatusEnum.APPROVED },
//             },
//           };
//         } catch (error) {
//           console.log('error');
//           console.log(error);
//           await session.abortTransaction();
//           session.endSession();
//           return {
//             updateOne: {
//               filter: { _id: transaction._id },
//               update: { status: transactionStatusEnum.REFUSED },
//             },
//           };
//         }
//       } else {
//         if (debitAccount.balance < transaction.amount) {
//           return {
//             updateOne: {
//               filter: { _id: transaction._id },
//               update: { status: transactionStatusEnum.REFUSED },
//             },
//           };
//         }
//         const session = await conn.startSession();
//         try {
//           session.startTransaction();
//           creditAccount.balance += transaction.amount;
//           await creditAccount.save({ session });
//           debitAccount.balance -= transaction.amount;
//           await debitAccount.save({ session });

//           await session.commitTransaction();
//           session.endSession();
//           console.log('success');
//           return {
//             updateOne: {
//               filter: { _id: transaction._id },
//               update: { status: transactionStatusEnum.APPROVED },
//             },
//           };
//         } catch (error) {
//           console.log('error');
//           console.log(error);
//           await session.abortTransaction();
//           session.endSession();
//           return {
//             updateOne: {
//               filter: { _id: transaction._id },
//               update: { status: transactionStatusEnum.REFUSED },
//             },
//           };
//         }
//       }
//     } catch (error) {
//       return {
//         updateOne: {
//           filter: { _id: transaction._id },
//           update: { status: transactionStatusEnum.REFUSED },
//         },
//       };
//     }
//   }));

//   await Transaction.bulkWrite(updates);
//   console.log('running a task every 3 seconds');
// });

// module.exports = transactionCron;
