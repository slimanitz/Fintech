const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
const { faker } = require('@faker-js/faker');
const CreditCard = require('../models/creditCard');
const APIError = require('../../utils/api-error');
const { accountTypesEnum } = require('../../utils/enums');
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

const create = async (creditCard) => {
  const { error, value } = schema.validate(creditCard);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const newCreditCard = await CreditCard.create(value);
  return newCreditCard;
};

const getAll = async (filters, isArray = true) => {
  const creditCards = await CreditCard.findAll({
    where: { ...filters },
    raw: true,
    nest: true,
  });

  if (!isArray) {
    return creditCards[0];
  }
  return creditCards;
};

const get = async (id) => {
  const user = await getAll({ id }, false);
  if (!user) throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  return user;
};

const update = async (id, payload) => {
  const { error, value } = schema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await CreditCard.update(value, { where: { id }, limit: 1 });
  if (!updatedValue) throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

const remove = async (id) => {
  await CreditCard.destroy({ where: { id } });
};

const createUserAccountCreditCard = async ({ userId, accountId }) => {
  const { error, value } = userCreationSchema.validate({ userId, accountId });
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const account = await accountService.getAll({ userId, id: accountId }, false);
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
  return creditCard;
};

const getAllUsersCreditCards = async ({ userId }) => {
  const creditCards = await getAll({ userId });
  return creditCards;
};

const getUserCreditCard = async ({ userId, creditCardId }) => {
  const creditCard = await getAll({ id: creditCardId, userId }, false);
  return creditCard;
};

const updateUserCreditCard = async ({ userId, creditCardId }, payload) => {
  const { error, value } = updateSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await CreditCard
    .update(value, { where: { id: creditCardId, userId }, limit: 1 });
  if (!updatedValue) throw new APIError({ message: 'No Credit card found found', status: httpStatus.NOT_FOUND });
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
