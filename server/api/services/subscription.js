const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const Joi = require('joi');
const Subscription = require('../models/subscription');
const APIError = require('../../utils/api-error');
const { redisClient } = require('../../config/cache');
const { subscriptionTypes, subscriptionFrequency, accountTypesEnum } = require('../../utils/enums');
const { accountService } = require('./account');

const schema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  amount: Joi.number().required(),
  debitAccount: Joi.string().required(),
  creditAccount: Joi.string().required(),
  userId: Joi.string().required(),
  frequency: Joi.string().required(),
  finishDate: Joi.date().required(),

});

const createUserSubscriptionSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  debitAccount: Joi.string().required(),
  creditAccountIban: Joi.string().required(),
  userId: Joi.string().required(),
  frequency: Joi.string().valid(...Object.values(subscriptionFrequency)).required(),
  finishDate: Joi.date().required(),

});

const updateUserSubscriptionSchema = Joi.object({
  name: Joi.string().required(),
  isCancelled: Joi.boolean(),

});

function filter(arr, criteria) {
  return arr.filter((obj) => Object.keys(criteria).every((c) => obj[c] == criteria[c]));
}

const create = async (subscription) => {
  const { error, value } = schema.validate(subscription);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const newSubscription = await Subscription.create(value);
  await redisClient.deleteList('subscriptions');
  return newSubscription;
};

const getAll = async (filters, isArray = true) => {
  let subscriptions = await redisClient.getList('subscriptions');
  if (subscriptions.length === 0) {
    subscriptions = await Subscription.findAll({
      raw: true,
      nest: true,
    });
    await redisClient.setList('subscriptions', subscriptions);
  }
  if (filters) subscriptions = filter(subscriptions, filters);
  if (!isArray) {
    return subscriptions[0];
  }
  return subscriptions;
};

const get = async (id) => {
  const user = await getAll({ id }, false);
  if (!user) throw new APIError({ message: 'No creditCard found', status: httpStatus.NOT_FOUND });
  return user;
};

const update = async (id, payload) => {
  const { error, value } = schema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await Subscription
    .update(value, { where: { id } });
  if (!updatedValue) throw new APIError({ message: 'No subscription found', status: httpStatus.NOT_FOUND });
  await redisClient.deleteList('subscriptions');
  return updatedValue;
};

const remove = async (id) => {
  await Subscription.destroy({ where: { id }, limit: 1 });
  await redisClient.deleteList('subscriptions');
};

const createUserSubscription = async ({ userId, accountId }, payload) => {
  let subscription = { ...payload, userId, debitAccount: accountId };
  const { error } = createUserSubscriptionSchema.validate(subscription);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const creditAccount = await accountService
    .getAll({ iban: subscription.creditAccountIban }, false);
  if (!creditAccount) throw new APIError({ message: `Account with the following IBAN is not found ${subscription.creditAccountIban}`, status: httpStatus.CONFLICT });
  if (creditAccount.id == accountId) throw new APIError({ message: 'Cannot smake subscription to the same account', status: httpStatus.CONFLICT });
  const debitAccount = await accountService.getAll({ userId, id: accountId }, false);
  if (!debitAccount) throw new APIError({ message: `Account with the following ID is not found ${subscription.debitAccount}`, status: httpStatus.CONFLICT });
  if ((creditAccount.type === accountTypesEnum.SAVING || debitAccount.type === accountTypesEnum.SAVING) && (debitAccount.userId.toString() !== userId || creditAccount.userId.toString() !== userId)) throw new APIError({ message: 'Cannot make subscription to someone else s saving account', status: httpStatus.CONFLICT });

  subscription = {
    ...subscription,
    creditAccount: creditAccount.id,
    type: subscriptionTypes.DEBIT,
  };

  delete subscription.creditAccountIban;

  subscription = await create(subscription);
  return subscription;
};

const getAllUsersSubscriptions = async ({ userId }) => {
  const creditCards = await getAll({ userId });
  return creditCards;
};

const updateUserSubscription = async ({ userId, subscriptionId }, payload) => {
  const { error, value } = updateUserSubscriptionSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await Subscription
    .update(value, { where: { id: subscriptionId, userId } });
  if (!updatedValue) throw new APIError({ message: 'No Subscription found', status: httpStatus.NOT_FOUND });
  await redisClient.deleteList('creditCards');
  return updatedValue;
};

module.exports.subscriptionService = {
  create,
  get,
  getAll,
  update,
  remove,
  createUserSubscription,
  getAllUsersSubscriptions,
  updateUserSubscription,
};
