const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
const Transaction = require('../models/transaction');
const APIError = require('../../utils/api-error');
const { transactionGatewayEnum, transactionStatusEnum } = require('../../utils/enums');
const Account = require('../models/account');

const insertionSchema = Joi.object({
  creditAccount: Joi.string().required(),
  debitAccount: Joi.string(),
  ammount: Joi.number().required(),
  status: Joi.boolean().valid(...Object.values(transactionStatusEnum)),
  gateway: Joi.string().valid(...Object.values(transactionGatewayEnum)).required(),
  gatewayId: Joi.string(),
  comment: Joi.string(),
  userId: Joi.string().required(),

});

const createUserTransactionSchema = Joi.object({
  debitAccount: Joi.string().required(),
  ammount: Joi.number().required(),
  gateway: Joi.string()
    .valid(...[transactionGatewayEnum.CREDIT_CARD, transactionGatewayEnum.TRANSFER]).required(),
  gatewayId: Joi.alternatives().conditional('gateway', { is: transactionGatewayEnum.TRANSFER, then: Joi.string(), otherwise: Joi.string().required() }),
  creditAccountIban: Joi.string().required(),
  comment: Joi.string(),
  userId: Joi.string().required(),
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
  const account = await Account.findOne({ iban: transaction.creditAccountIban });
  if (!account) throw new APIError({ message: `Account with the following IBAN is not found ${transaction.creditAccountIban}`, status: httpStatus.CONFLICT });
  if (transaction.gateway === transactionGatewayEnum.TRANSFER) transaction.gatewayId = accountId;
  transaction = { ...transaction, creditAccount: account._id.toString() };
  delete transaction.creditAccountIban;

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
