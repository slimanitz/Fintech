/* eslint-disable import/no-extraneous-dependencies */
const httpStatus = require('http-status');
const APIError = require('../utils/api-error');
const Account = require('../api/models/account');
const CreditCard = require('../api/models/creditCard');
const Transaction = require('../api/models/transaction');

// I made a specific login in this middleware where I've make a verification
// if the user is using a good Agency ID and Iam checking as well on the database if it's coherent

const coherenceCheck = async (req, res, next) => {
  const {
    userId, accountId, creditCardId, transactionId,
  } = req.params;

  if (accountId && !(await Account.findOne({ where: { userId, id: accountId } }))) { throw new APIError({ message: 'Trying to access to someone else assets', status: httpStatus.CONFLICT }); }
  if (creditCardId && !(await CreditCard.findOne({ where: { userId, id: creditCardId } }))) throw new APIError({ message: 'Trying to access to someone else assets', status: httpStatus.CONFLICT });
  if (transactionId && !(await Transaction.findOne({ where: { userId, id: transactionId } }))) throw new APIError({ message: 'Trying to access to someone else assets', status: httpStatus.CONFLICT });

  return next();
};

module.exports = coherenceCheck;
