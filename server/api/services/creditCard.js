const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
const { faker } = require('@faker-js/faker');
const CreditCard = require('../models/creditCard');
const APIError = require('../../utils/api-error');
const { accountTypesEnum } = require('../../utils/enums');
const { redisClient } = require('../../config/cache');
const { accountService } = require('./account');

const schema = Joi.object({
  number: Joi.string().required(),
  expirationDate: Joi.string().required(),
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

function filter(arr, criteria) {
  return arr.filter((obj) => Object.keys(criteria).every((c) => obj[c] == criteria[c]));
}

const create = async (creditCard) => {
  const { error, value } = schema.validate(creditCard);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const newCreditCard = new CreditCard(value);
  await newCreditCard.save();
  await redisClient.deleteList('creditCards');
  return newCreditCard;
};

const getAll = async (filters, isArray = true) => {
  let creditCards = await redisClient.getList('creditCards');
  if (creditCards.length === 0) {
    creditCards = await CreditCard.find().lean();
    await redisClient.setList('creditCards', creditCards);
  }
  if (filters) creditCards = filter(creditCards, filters);
  if (!isArray) {
    if (creditCards.length > 1) { throw new APIError({ message: 'More than one element in the array' }); }
    return creditCards[0];
  }
  return creditCards;
};

const get = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  }
  const user = await getAll({ _id: id }, false);
  if (!user) throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  return user;
};

const update = async (id, payload) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = schema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await CreditCard.findByIdAndUpdate(id, value);
  if (!updatedValue) throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  await redisClient.deleteList('creditCards');
  return updatedValue;
};

const remove = async (id) => {
  await CreditCard.findByIdAndDelete(id);
  await redisClient.deleteList('creditCards');
};

const createUserAccountCreditCard = async ({ userId, accountId }) => {
  if (!ObjectId.isValid(accountId) || !ObjectId.isValid(userId)) {
    throw new APIError({ message: 'Invalid IDs', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = userCreationSchema.validate({ userId, accountId });
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });

  const account = await accountService.getAll({ userId, _id: accountId }, false);
  if (!account) throw new APIError({ message: `Account with given id ${accountId} IS NOT FOUND !`, status: httpStatus.NOT_FOUND });
  if (account.type == accountTypesEnum.SAVING) throw new APIError({ message: 'Cannot create credit card for saving account', status: httpStatus.CONFLICT });
  value.number = faker.finance.creditCardNumber().replaceAll('-', '');
  value.securityCode = faker.finance.creditCardCVV();
  const dateObj = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
  const month = dateObj.getUTCMonth() + 1; // months from 1-12
  const year = dateObj.getUTCFullYear();
  value.expirationDate = `${month}/${year}`;
  value.allowedLimit = faker.finance.amount(8000, 10000);
  const creditCard = await create(value);
  await redisClient.deleteList('creditCards');
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
  const creditCard = await getAll({ _id: creditCardId, userId }, false);
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
  await redisClient.deleteList('creditCards');
  return updatedValue;
};

module.exports.creditCardService = {
  create,
  getAll,
  update,
  get,
  remove,
  createUserAccountCreditCard,
  getAllUsersCreditCards,
  getUserCreditCard,
  updateUserCreditCard,
};
