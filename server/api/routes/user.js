const express = require('express');
const {
  create, get,
  getAll, update, remove, login, createUserAccount,
  getAllUserAccounts, getUserAccount,
  updateUserAccount, createUserCreditCard,
  getAllUserCreditCards,
  getUserCreditCard, updateUserCreditCard,
  createUserTransaction,
  getAllUserTransactions,
  getUserTransaction,
} = require('../controllers/user');
const { userRolesEnum } = require('../../utils/enums');
const authenticateJWT = require('../../middlewares/auth');
const checkUserAsset = require('../../middlewares/security');

const router = express.Router();

// USERS
router.post('/', create);
router.get('/:id', get);
router.post('/login', login);
router.get('/', getAll);
router.patch('/:id', update);
router.delete('/:id', remove);

// Accounts
router.post('/:userId/accounts', authenticateJWT([userRolesEnum.CLIENT]), createUserAccount);
router.get('/:userId/accounts', authenticateJWT([userRolesEnum.CLIENT]), getAllUserAccounts);
router.get('/:userId/accounts/:accountId', authenticateJWT([userRolesEnum.CLIENT]), checkUserAsset, getUserAccount);
router.patch('/:userId/accounts/:accountId', authenticateJWT([userRolesEnum.CLIENT]), checkUserAsset, updateUserAccount);

// Credit cards
router.post('/:userId/accounts/:accountId/credit-cards', authenticateJWT([userRolesEnum.CLIENT]), checkUserAsset, createUserCreditCard);
router.get('/:userId/credit-cards', authenticateJWT([userRolesEnum.CLIENT]), getAllUserCreditCards);
router.get('/:userId/credit-cards/:creditCardId', authenticateJWT([userRolesEnum.CLIENT]), checkUserAsset, getUserCreditCard);
router.patch('/:userId/credit-cards/:creditCardId', authenticateJWT([userRolesEnum.CLIENT]), checkUserAsset, updateUserCreditCard);

// Transactions
router.post('/:userId/accounts/:accountId/transactions', authenticateJWT([userRolesEnum.CLIENT]), createUserTransaction);
router.get('/:userId/transactions', authenticateJWT([userRolesEnum.CLIENT]), getAllUserTransactions);
router.get('/:userId/transactions/:transactionId', authenticateJWT([userRolesEnum.CLIENT]), getUserTransaction);

module.exports = router;
