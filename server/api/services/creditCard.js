const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
const { faker } = require('@faker-js/faker');
const CreditCard = require('../models/creditCard');
const APIError = require('../../utils/api-error');
const Account = require('../models/account');
const { accountTypesEnum } = require('../../utils/enums');

const schema = Joi.object({
  number: Joi.string().required(),
  expirationDate: Joi.date().required(),
  isActive: Joi.boolean(),
  securityCode: Joi.string().required(),
  accountId: Joi.string().required(),
  userId: Joi.string().required(),
  allowedLimit: Joi.number().required(),
  limitUsage: Joi.number(),
});

const userCreationSchema = Joi.object({
  accountId: Joi.string().required(),
  userId: Joi.string().required(),
});

const updateSchema = Joi.object({
  isActive: Joi.boolean(),
  allowedLimit: Joi.number(),
});

const create = async (creditCard) => {
  const { error, value } = schema.validate(creditCard);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const newCreditCard = new CreditCard(value);
  await newCreditCard.save();
  return newCreditCard;
};

const get = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  }
  const creditCard = await CreditCard.findById(id);
  if (!creditCard) throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  return creditCard;
};

const getAll = async (filters) => {
  const creditCards = await CreditCard.find({ ...filters });
  return creditCards;
};

const update = async (id, payload) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = schema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await CreditCard.findByIdAndUpdate(id, value);
  if (!updatedValue) throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

const remove = async (id) => {
  await get(id);
  await CreditCard.findByIdAndDelete(id);
};

const createUserAccountCreditCard = async ({ userId, accountId }) => {
  if (!ObjectId.isValid(accountId) || !ObjectId.isValid(userId)) {
    throw new APIError({ message: 'Invalid IDs', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = userCreationSchema.validate({ userId, accountId });
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });

  const account = await Account.findOne({ userId, _id: accountId });
  if (!account) throw new APIError({ message: `Account with given id ${accountId} IS NOT FOUND !`, status: httpStatus.NOT_FOUND });
  if (account.type === accountTypesEnum.SAVING) throw new APIError({ message: 'Cannot create credit card for saving account', status: httpStatus.CONFLICT });
  value.number = faker.finance.creditCardNumber().replaceAll('-', '');
  value.securityCode = faker.finance.creditCardCVV();
  value.expirationDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
  value.allowedLimit = faker.finance.amount(8000, 10000);
  const creditCard = await create(value);
  return creditCard;
};

const getAllUsersCreditCards = async ({ userId }) => {
  if (!ObjectId.isValid(userId)) {
    throw new APIError({ message: 'Invalid ID', status: httpStatus.NOT_FOUND });
  }
  const creditCards = await getAll({ userId });
  return creditCards;
};

const getUserCreditCard = async ({ userId, creditCardId }) => {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(creditCardId)) {
    throw new APIError({ message: 'Invalid ID', status: httpStatus.NOT_FOUND });
  }
  const creditCard = await CreditCard.findOne({ _id: creditCardId, userId });
  return creditCard;
};

const updateUserCreditCard = async ({ userId, creditCardId }, payload) => {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(creditCardId)) {
    throw new APIError({ message: 'Invalid IDs', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = updateSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await CreditCard
    .findOneAndUpdate({ _id: creditCardId, userId }, { $set: value }, { new: true });
  if (!updatedValue) throw new APIError({ message: 'No Credit card found found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

module.exports.creditCardService = {
  create,
  get,
  getAll,
  update,
  remove,
  createUserAccountCreditCard,
  getAllUsersCreditCards,
  getUserCreditCard,
  updateUserCreditCard,
};
