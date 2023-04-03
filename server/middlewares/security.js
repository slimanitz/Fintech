/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
const httpStatus = require('http-status');
const APIError = require('../utils/api-error');
const Account = require('../api/models/account');
const CreditCard = require('../api/models/creditCard');
const Transaction = require('../api/models/transaction');

// I made a specific login in this middleware where I've make a verification
// if the user is using a good Agency ID and Iam checking as well on the database if it's coherent

const checkUserAsset = async (req, res, next) => {
  const {
    userId, accountId, creditCardId, transactionId,
  } = req.params;
  console.log('====================================');
  console.log('HERE');
  console.log('====================================');

  if (accountId && !(await Account.find({ userId }))) { throw new APIError({ message: 'Trying to access to someone else assets', status: httpStatus.CONFLICT }); }
  if (creditCardId && !(await CreditCard.find({ userId }))) throw new APIError({ message: 'Trying to access to someone else assets', status: httpStatus.CONFLICT });
  if (transactionId && !(await Transaction.find({ userId }))) throw new APIError({ message: 'Trying to access to someone else assets', status: httpStatus.CONFLICT });

  return next();
};

module.exports = checkUserAsset;
