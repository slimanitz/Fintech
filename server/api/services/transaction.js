const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
const Transaction = require('../models/transaction');
const APIError = require('../../utils/api-error');
const { transactionGatewayEnum, transactionStatusEnum } = require('../../utils/enums');

const schema = Joi.object({
  creditAccount: Joi.string().required(),
  debitAccount: Joi.string(),
  ammount: Joi.number().required(),
  status: Joi.boolean().valid(...Object.values(transactionStatusEnum)),
  gateway: Joi.string().valid(...Object.values(transactionGatewayEnum)).required(),
  comment: Joi.string().required(),

});

const create = async (transaction) => {
  const { error, value } = schema.validate(transaction);
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
  const { error, value } = schema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await Transaction.findByIdAndUpdate(id, value);
  if (!updatedValue) throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

const remove = async (id) => {
  await get(id);
  await Transaction.findByIdAndDelete(id);
};

module.exports.transactionService = {
  create,
  get,
  getAll,
  update,
  remove,
};
