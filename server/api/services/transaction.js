const httpStatus = require('http-status');
const Joi = require('joi');
const Transaction = require('../models/transaction');
const APIError = require('../../utils/api-error');
const { transactionGatewayEnum, transactionStatusEnum, accountTypesEnum } = require('../../utils/enums');
const { creditCardService } = require('./creditCard');
const { accountService } = require('./account');

const insertionSchema = Joi.object({
  creditAccountId: Joi.string().required(),
  debitAccountId: Joi.any(),
  amount: Joi.number().required(),
  status: Joi.string().valid(...Object.values(transactionStatusEnum)),
  gateway: Joi.string().valid(...Object.values(transactionGatewayEnum)).required(),
  gatewayId: Joi.alternatives().conditional('gateway', {
    is: Joi.string()
      .valid(...[transactionGatewayEnum.CREDIT_CARD, transactionGatewayEnum.TRANSFER]),
    then: Joi.string().required(),
    otherwise: Joi.any(),
  }),
  comment: Joi.string(),
  userId: Joi.string().required(),
  currencyExchange: Joi.string().required(),

});

const createUserTransactionSchema = Joi.object({
  amount: Joi.number().required(),
  gateway: Joi.string().valid(...Object.values(transactionGatewayEnum)).required(),
  debitAccountId: Joi.alternatives().conditional('gateway', { is: transactionGatewayEnum.DEPOSIT, then: Joi.any(), otherwise: Joi.string().required() }),
  creditAccountIban: Joi.string().required(),
  comment: Joi.string(),
  userId: Joi.string().required(),
  creditCardInfo: Joi.alternatives().conditional('gateway', { is: transactionGatewayEnum.CREDIT_CARD, then: Joi.object({ number: Joi.string().required(), expirationDate: Joi.string().required(), securityCode: Joi.string().required() }), otherwise: Joi.any() }),

});

const compareDate = (date1, date2) => {
  const month = date1.split('/')[0];
  const year = date1.split('/')[1];
  const date = new Date(year, month - 1);
  return date >= date2;
};

function filter(arr, criteria) {
  return arr.filter((obj) => Object.keys(criteria).every((c) => obj[c] == criteria[c]));
}

const create = async (transaction) => {
  const { error, value } = insertionSchema.validate(transaction);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const newTransaction = await Transaction.create(value);
  return newTransaction;
};

const getAll = async (filters, isArray = true) => {
  const transactions = await Transaction.findAll({
    where: { ...filters },
    raw: true,
    nest: true,
  });

  if (!isArray) {
    return transactions[0];
  }
  return transactions;
};

const get = async (id) => {
  const transaction = await getAll({ id }, false);
  if (!transaction) throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  return transaction;
};

const update = async (id, payload) => {
  const { error, value } = insertionSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await Transaction.update(value, { where: { id }, limit: 1 });
  if (!updatedValue) throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

const remove = async (id) => {
  await Transaction.destroy({ where: { id }, limit: 1 });
};

const createUserTransaction = async ({ userId, accountId }, payload) => {
  let transaction = { ...payload, userId, debitAccountId: accountId };
  const { error } = createUserTransactionSchema.validate(transaction);
  if (error) throw new APIError({ message: error, status: httpStatus.BAD_REQUEST });
  const creditAccount = await accountService.getAll({ iban: transaction.creditAccountIban }, false);
  if (!creditAccount) throw new APIError({ message: `Account with the following IBAN is not found ${transaction.creditAccountIban}`, status: httpStatus.CONFLICT });
  if (creditAccount.id == accountId) throw new APIError({ message: 'Cannot send money to the same account', status: httpStatus.CONFLICT });
  if (transaction.gateway !== transactionGatewayEnum.DEPOSIT) {
    const debitAccount = await accountService.getAll({ userId, id: accountId }, false);
    if (!debitAccount) throw new APIError({ message: `Account with the following ID is not found ${transaction.debitAccount}`, status: httpStatus.CONFLICT });
    if ((creditAccount.type === accountTypesEnum.SAVING || debitAccount.type === accountTypesEnum.SAVING) && (debitAccount.userId !== userId || creditAccount.userId !== userId)) throw new APIError({ message: 'Cannot send money to someone else\'s saving account', status: httpStatus.CONFLICT });
    if (transaction.gateway === transactionGatewayEnum.TRANSFER) transaction.gatewayId = accountId;
    if (transaction.gateway === transactionGatewayEnum.CREDIT_CARD) {
      const creditCard = await creditCardService.getAll({ ...transaction.creditCardInfo }, false);
      if (!creditCard) throw new APIError({ message: 'Credit card not found', status: httpStatus.NOT_FOUND });
      if (!creditCard.isActive) throw new APIError({ message: 'Credit card  not active', status: httpStatus.CONFLICT });
      if (((creditCard.allowedLimit - creditCard.limitUsage) < transaction.amount)) { throw new APIError({ message: 'Reaching credit card limit', status: httpStatus.CONFLICT }); }
      if (!compareDate(creditCard.expirationDate, Date.now())) { throw new APIError({ message: 'Credit Card expired', status: httpStatus.CONFLICT }); }
      transaction.gatewayId = creditCard.id;
    }
    transaction = { ...transaction, creditAccountId: creditAccount.id, currencyExchange: `${debitAccount.currency}/${creditAccount.currency}` };
  } else {
    transaction = { ...transaction, creditAccountId: creditAccount.id, currencyExchange: `${creditAccount.currency}/${creditAccount.currency}` };
  }

  delete transaction.creditAccountIban;
  delete transaction.creditCardInfo;
  transaction = await create(transaction);
  return transaction;
};

const getUserTransaction = async ({ userId, transactionId }) => {
  const transaction = await getAll({ userId, id: transactionId }, false);
  if (!transaction) throw new APIError({ message: 'No transaction found', status: httpStatus.NOT_FOUND });
  return transaction;
};

const getAllUserTransaction = async ({ userId }) => {
  const transactions = await getAll({ userId });
  return transactions;
};

module.exports.transactionService = {
  create,
  getAll,
  get,
  update,
  remove,
  createUserTransaction,
  getUserTransaction,
  getAllUserTransaction,
};
