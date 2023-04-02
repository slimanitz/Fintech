const express = require('express');
const {
  create, get,
  getAll, update, remove, login, createUserAccount,
  getAllUserAccounts, getUserAccount, updateUserAccount, createUserAccountCreditCard,
  getAllUserAccountCreditCards, getUserAccountCreditCard,
} = require('../controllers/user');
const { userRolesEnum } = require('../../utils/enums');
const authenticateJWT = require('../../middlewares/auth');

const router = express.Router();

// USERS
router.post('/', authenticateJWT([userRolesEnum.ADMIN, userRolesEnum.CLIENT]), create);
router.get('/:id', authenticateJWT([userRolesEnum.ADMIN]), get);
router.post('/login', login);
router.get('/', authenticateJWT([userRolesEnum.ADMIN]), getAll);
router.patch('/:id', authenticateJWT([userRolesEnum.ADMIN]), update);
router.delete('/:id', authenticateJWT([userRolesEnum.ADMIN]), remove);

// Accounts
router.post('/:userId/accounts', authenticateJWT([userRolesEnum.CLIENT]), createUserAccount);
router.get('/:userId/accounts', authenticateJWT([userRolesEnum.CLIENT]), getAllUserAccounts);
router.get('/:userId/accounts/:accountId', authenticateJWT([userRolesEnum.CLIENT]), getUserAccount);
router.patch('/:userId/accounts/:accountId', authenticateJWT([userRolesEnum.CLIENT]), updateUserAccount);

// Credit cards
router.post('/:userId/accounts/:accountId/credit-cards', authenticateJWT([userRolesEnum.CLIENT]), createUserAccountCreditCard);
router.get('/:userId/accounts/:accountId/credit-cards', authenticateJWT([userRolesEnum.CLIENT]), getAllUserAccountCreditCards);
router.get('/:userId/accounts/:accountId/credit-cards/:creditCardId', authenticateJWT([userRolesEnum.CLIENT]), getUserAccountCreditCard);
router.patch('/:userId/accounts/:accountId/credit-cards/:creditCardId', authenticateJWT([userRolesEnum.CLIENT]), updateUserAccountCreditCard);

module.exports = router;
