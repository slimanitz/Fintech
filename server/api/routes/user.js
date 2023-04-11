const express = require('express');
const {
  create,
  getAll, update, remove, login, createUserAccount,
  getAllUserAccounts, getUserAccount,
  updateUserAccount, createUserCreditCard,
  getAllUserCreditCards,
  getUserCreditCard, updateUserCreditCard,
  createUserTransaction,
  getAllUserTransactions,
  getUserTransaction,
  get,
  createUserSubscription,
  getAllUserSubscriptions,
  updateUserSubscription,
} = require('../controllers/user');
const { userRolesEnum } = require('../../utils/enums');
const JWTCheck = require('../../middlewares/jwt-check');
const coherenceCheck = require('../../middlewares/coherence-check');

const router = express.Router();

// USERS
router.post('/', create);
router.get('/:id', get);
router.post('/login', login);
router.get('/', getAll);
router.patch('/:id', update);
router.delete('/:id', remove);

// Accounts
router.post('/:userId/accounts', JWTCheck([userRolesEnum.CLIENT]), createUserAccount);
router.get('/:userId/accounts', JWTCheck([userRolesEnum.CLIENT]), getAllUserAccounts);
router.get('/:userId/accounts/:accountId', JWTCheck([userRolesEnum.CLIENT]), coherenceCheck, getUserAccount);
router.patch('/:userId/accounts/:accountId', JWTCheck([userRolesEnum.CLIENT]), coherenceCheck, updateUserAccount);

// Credit cards
router.post('/:userId/accounts/:accountId/credit-cards', JWTCheck([userRolesEnum.CLIENT]), coherenceCheck, createUserCreditCard);
router.get('/:userId/credit-cards', JWTCheck([userRolesEnum.CLIENT]), getAllUserCreditCards);
router.get('/:userId/credit-cards/:creditCardId', JWTCheck([userRolesEnum.CLIENT]), coherenceCheck, getUserCreditCard);
router.patch('/:userId/credit-cards/:creditCardId', JWTCheck([userRolesEnum.CLIENT]), coherenceCheck, updateUserCreditCard);

// Transactions
router.post('/:userId/accounts/:accountId/transactions', JWTCheck([userRolesEnum.CLIENT]), createUserTransaction);
router.get('/:userId/transactions', JWTCheck([userRolesEnum.CLIENT]), getAllUserTransactions);
router.get('/:userId/transactions/:transactionId', JWTCheck([userRolesEnum.CLIENT]), getUserTransaction);

// Subscriptions
router.post('/:userId/accounts/:accountId/subscriptions', JWTCheck([userRolesEnum.CLIENT]), createUserSubscription);
router.get('/:userId/subscriptions', JWTCheck([userRolesEnum.CLIENT]), getAllUserSubscriptions);
router.patch('/:userId/subscriptions/:subscriptionId', JWTCheck([userRolesEnum.CLIENT]), updateUserSubscription);

module.exports = router;
