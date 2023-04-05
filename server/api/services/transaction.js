const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
const Transaction = require('../models/transaction');
const APIError = require('../../utils/api-error');
const { transactionGatewayEnum, transactionStatusEnum, accountTypesEnum } = require('../../utils/enums');
const Account = require('../models/account');
const CreditCard = require('../models/creditCard');

const insertionSchema = Joi.object({
  creditAccount: Joi.string().required(),
  debitAccount: Joi.any(),
  amount: Joi.number().required(),
  status: Joi.boolean().valid(...Object.values(transactionStatusEnum)),
  gateway: Joi.string().valid(...Object.values(transactionGatewayEnum)).required(),
  gatewayId: Joi.alternatives().conditional('gateway', {
    is: Joi.string()
      .valid(...[transactionGatewayEnum.CREDIT_CARD, transactionGatewayEnum.TRANSFER]),
    then: Joi.string().required(),
    otherwise: Joi.any(),
  }),
  comment: Joi.string(),
  userId: Joi.string().required(),
  currencyExchange: Joi.string().required(),

});

const createUserTransactionSchema = Joi.object({
  amount: Joi.number().required(),
  gateway: Joi.string().valid(...Object.values(transactionGatewayEnum)).required(),
  debitAccount: Joi.alternatives().conditional('gateway', { is: transactionGatewayEnum.DEPOSIT, then: Joi.any(), otherwise: Joi.string().required() }),
  creditAccountIban: Joi.string().required(),
  comment: Joi.string(),
  userId: Joi.string().required(),
  creditCardInfo: Joi.alternatives().conditional('gateway', { is: transactionGatewayEnum.CREDIT_CARD, then: Joi.object({ number: Joi.string().required(), expirationDate: Joi.date().required(), securityCode: Joi.string().required() }), otherwise: Joi.any() }),

});

const create = async (transaction) => {
  const { error, value } = insertionSchema.validate(transaction);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const newTransaction = new Transaction(value);
  await newTransaction.save();
  return newTransaction;
};

const get = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  }
  const transaction = await Transaction.findById(id);
  if (!transaction) throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  return transaction;
};

const getAll = async (filters) => {
  const transactions = await Transaction.find({ ...filters });
  return transactions;
};

const update = async (id, payload) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = insertionSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await Transaction.findByIdAndUpdate(id, value);
  if (!updatedValue) throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

const remove = async (id) => {
  await get(id);
  await Transaction.findByIdAndDelete(id);
};

const createUserTransaction = async ({ userId, accountId }, payload) => {
  let transaction = { ...payload, userId, debitAccount: accountId };
  const { error } = createUserTransactionSchema.validate(transaction);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const creditAccount = await Account.findOne({ iban: transaction.creditAccountIban });
  if (!creditAccount) throw new APIError({ message: `Account with the following IBAN is not found ${transaction.creditAccountIban}`, status: httpStatus.CONFLICT });
  if (creditAccount._id.equals(accountId)) throw new APIError({ message: 'Cannot send money to the same account', status: httpStatus.CONFLICT });
  if (transaction.gateway !== transactionGatewayEnum.DEPOSIT) {
    const debitAccount = await Account.findOne({ userId, _id: accountId });
    if (!debitAccount) throw new APIError({ message: `Account with the following ID is not found ${transaction.debitAccount}`, status: httpStatus.CONFLICT });
    if ((creditAccount.type === accountTypesEnum.SAVING || debitAccount.type === accountTypesEnum.SAVING) && (!debitAccount.userId.equals(userId) || !creditAccount.userId.equals(userId))) throw new APIError({ message: 'Cannot send money to someone else\'s saving account', status: httpStatus.CONFLICT });
    if (transaction.gateway === transactionGatewayEnum.TRANSFER) transaction.gatewayId = accountId;
    if (transaction.gateway === transactionGatewayEnum.CREDIT_CARD) {
      const creditCard = await CreditCard.findOne({ ...transaction.creditCardInfo });
      if (!creditCard) throw new APIError({ message: 'Credit card not found', status: httpStatus.NOT_FOUND });
      if (!creditCard.isActive) throw new APIError({ message: 'Credit card  not active', status: httpStatus.CONFLICT });
      if (((creditCard.allowedLimit - creditAccount.limitUsage) < transaction.amount)) { throw new APIError({ message: 'Reaching credit card limit', status: httpStatus.CONFLICT }); }
      if (creditCard.expirationDate < Date.now()) { throw new APIError({ message: 'Credit Card expired', status: httpStatus.CONFLICT }); }
      transaction.gatewayId = creditCard._id.toString();
      console.log('====================================');
      console.log('Credit card', transaction);
      console.log('====================================');
    }
    transaction = { ...transaction, creditAccount: creditAccount._id.toString(), currencyExchange: `${debitAccount.currency}/${creditAccount.currency}` };
  } else {
    transaction = { ...transaction, creditAccount: creditAccount._id.toString(), currencyExchange: `${creditAccount.currency}/${creditAccount.currency}` };
  }

  delete transaction.creditAccountIban;
  delete transaction.creditCardInfo;

  transaction = await create(transaction);
  return transaction;
};

const getUserTransaction = async ({ userId, transactionId }) => {
  if (!ObjectId.isValid(userId) && !ObjectId.isValid(transactionId)) {
    throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  }
  const transaction = await Transaction.findOne({ userId, _id: transactionId });
  if (!transaction) throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  return transaction;
};

const getAllUserTransaction = async ({ userId }) => {
  const transactions = await Transaction.find({ userId });
  return transactions;
};

module.exports.transactionService = {
  create,
  get,
  getAll,
  update,
  remove,
  createUserTransaction,
  getUserTransaction,
  getAllUserTransaction,
};
