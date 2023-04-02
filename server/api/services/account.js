const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
const Account = require('../models/account');
const APIError = require('../../utils/api-error');
const { accountTypesEnum } = require('../../utils/enums');

const schema = Joi.object({
  owner: Joi.string().required(),
  iban: Joi.string(),
  type: Joi.string().valid(...Object.values(accountTypesEnum)),
  balance: Joi.number(),
  isActive: Joi.boolean(),

});

const updateSchema = Joi.object({
  owner: Joi.string(),
  iban: Joi.string(),
  type: Joi.string().valid(...Object.values(accountTypesEnum)),
  balance: Joi.number(),
  isActive: Joi.boolean(),

});

const create = async (account) => {
  const { error, value } = schema.validate(account);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const newAccount = new Account(value);
  await newAccount.save();
  return newAccount;
};

const get = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No account found', status: httpStatus.NOT_FOUND });
  }
  const account = await Account.findById(id);
  if (!account) throw new APIError({ message: 'No account found', status: httpStatus.NOT_FOUND });
  return account;
};

const getAll = async (filters) => {
  const accounts = await Account.find({ ...filters });
  return accounts;
};

const update = async (id, payload) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No account found', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = schema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await Account.findByIdAndUpdate(id, value);
  if (!updatedValue) throw new APIError({ message: 'No account found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

const remove = async (id) => {
  await get(id);
  await Account.findByIdAndDelete(id);
};

const createUserAccount = async (userId, payload) => {
  if (!ObjectId.isValid(userId)) {
    throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  }
  let account = { ...payload, owner: userId };
  account = await create(account);
  return account;
};

const getAllUserAccounts = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'Invalid ID', status: httpStatus.NOT_FOUND });
  }
  const accounts = await getAll({ owner: id });
  return accounts;
};

const getUserAccount = async (userId, accountId) => {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(accountId)) {
    throw new APIError({ message: 'Invalid ID', status: httpStatus.NOT_FOUND });
  }
  const accounts = await Account.findOne({ owner: userId, _id: accountId });
  return accounts;
};

const updateUserAccount = async ({ userId, accountId }, payload) => {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(accountId)) {
    throw new APIError({ message: 'Invalid IDs', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = updateSchema.validate(payload);
  console.log(error);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await Account
    .findOneAndUpdate({ _id: accountId, owner: userId }, { $set: value }, { new: true });
  if (!updatedValue) throw new APIError({ message: 'No account found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

module.exports.accountService = {
  create,
  get,
  getAll,
  update,
  remove,
  createUserAccount,
  getAllUserAccounts,
  getUserAccount,
  updateUserAccount,
};
