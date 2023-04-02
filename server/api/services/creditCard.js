const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
const CreditCard = require('../models/creditCard');
const APIError = require('../../utils/api-error');

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
  const creditCard = CreditCard.create(value);
  return creditCard;
};

const getAllUserAccountsCreditCards = async ({ userId }) => {
  if (!ObjectId.isValid(userId)) {
    throw new APIError({ message: 'Invalid ID', status: httpStatus.NOT_FOUND });
  }
  const creditCards = await getAll({ userId });
  return creditCards;
};

const getUserAccountCreditCard = async ({ userId, accountId }) => {
  if (!ObjectId.isValid(accountId) || !ObjectId.isValid(userId)) {
    throw new APIError({ message: 'Invalid ID', status: httpStatus.NOT_FOUND });
  }
  const accounts = await CreditCard.findOne({ userId, accountId });
  return accounts;
};

const updateUserAccountCreditCard = async ({ userId, accountId }, payload) => {
  if (!ObjectId.isValid(accountId) || !ObjectId.isValid(userId)) {
    throw new APIError({ message: 'Invalid IDs', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = updateSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await CreditCard
    .findOneAndUpdate({ accountId, userId }, { $set: value }, { new: true });
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
  getAllUserAccountsCreditCards,
  getUserAccountCreditCard,
  updateUserAccountCreditCard,
};
