const httpStatus = require('http-status');
const Joi = require('joi');
const CreditCard = require('../models/creditCard');
const APIError = require('../../utils/api-error');

const schema = Joi.object({
  number: Joi.string().required(),
  expirationDate: Joi.date().required(),
  isActive: Joi.boolean().required(),
  securityCode: Joi.string().required(),
  account: Joi.string().required(),
  allowedLimit: Joi.number().required(),
  limitUsage: Joi.number().required(),

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

const getAll = async () => {
  const creditCards = await CreditCard.find();
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
  const creditCard = await get(id);
  await CreditCard.findByIdAndDelete(id);
};

module.exports.creditCardService = {
  create,
  get,
  getAll,
  update,
  remove,
};
