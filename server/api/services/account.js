const httpStatus = require('http-status');
const Joi = require('joi');
const { faker } = require('@faker-js/faker');
const Account = require('../models/account');
const APIError = require('../../utils/api-error');
const { accountTypesEnum, ibanToCurrencies } = require('../../utils/enums');
const { redisClient } = require('../../config/cache');

const schema = Joi.object({
  userId: Joi.string().required(),
  iban: Joi.string(),
  type: Joi.string().valid(...Object.values(accountTypesEnum)),
  balance: Joi.number(),
  isActive: Joi.boolean(),
  currency: Joi.string(),

});

const userCreateSchema = Joi.object({
  type: Joi.string().valid(...Object.values(accountTypesEnum)),
});

const userUpdateSchema = Joi.object({
  isActive: Joi.boolean(),

});

function filter(arr, criteria) {
  return arr.filter((obj) => Object.keys(criteria).every((c) => obj[c] == criteria[c]));
}

const create = async (account) => {
  const { error, value } = schema.validate(account);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const newAccount = await Account.create(value);
  await redisClient.deleteList('accounts');
  return newAccount;
};

const getAll = async (filters, isArray = true) => {
  let accounts = await redisClient.getList('accounts');
  if (accounts.length === 0) {
    accounts = await Account.findAll({
      raw: true,
      nest: true,
    });
    await redisClient.setList('accounts', accounts);
  }
  if (filters) accounts = filter(accounts, filters);
  if (!isArray) {
    return accounts[0];
  }
  return accounts;
};

const get = async (id) => {
  const account = await getAll({ id }, false);
  if (!account) throw new APIError({ message: 'No account found', status: httpStatus.NOT_FOUND });
  return account;
};

const update = async (id, payload) => {
  const { error, value } = schema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await Account.update(value, { where: { id }, limit: 1 });
  if (!updatedValue) throw new APIError({ message: 'No account found', status: httpStatus.NOT_FOUND });
  await redisClient.deleteList('accounts');
  return updatedValue;
};

const remove = async (id) => {
  await Account.destroy({ where: { id }, limit: 1 });
  await redisClient.deleteList('accounts');
};

const createUserAccount = async ({ userId }, payload) => {
  const { error } = userCreateSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  let account = { ...payload, userId, type: payload.type || accountTypesEnum.BASIC };
  account.iban = faker.finance.iban();
  account.currency = ibanToCurrencies[account.iban.substring(0, 2)];
  account = await Account.create(account);
  await redisClient.deleteList('accounts');
  return account;
};

const getAllUserAccounts = async ({ userId }) => {
  const accounts = await getAll({ userId });
  return accounts;
};

const getUserAccount = async ({ userId, accountId }) => {
  const accounts = await getAll({ userId, id: accountId }, false);
  return accounts;
};

const updateUserAccount = async ({ userId, accountId }, payload) => {
  const { error, value } = userUpdateSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await Account
    .update(value, { where: { id: accountId, userId }, limit: 1 });
  if (!updatedValue) throw new APIError({ message: 'No account found', status: httpStatus.NOT_FOUND });
  await redisClient.deleteList('accounts');
  return updatedValue;
};

module.exports.accountService = {
  create,
  getAll,
  update,
  remove,
  get,
  createUserAccount,
  getAllUserAccounts,
  getUserAccount,
  updateUserAccount,
};
