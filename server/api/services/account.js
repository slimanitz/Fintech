const httpStatus = require('http-status');
const Joi = require('joi');
const Account = require('../models/account');
const APIError = require('../../utils/api-error');

const schema = Joi.object({
  owner: Joi.string().required(),
  iban: Joi.string().required(),
  type: Joi.string().required(),
  balance: Joi.number().required(),
  isActive: Joi.boolean().required(),

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

const getAll = async () => {
  const accounts = await Account.find();
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
  const account = await get(id);
  await Account.findByIdAndDelete(id);
};

module.exports.accountService = {
  create,
  get,
  getAll,
  update,
  remove,
};
