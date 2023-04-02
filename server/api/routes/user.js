const express = require('express');
const {
  create, get, getAll, update, remove, login, createUserAccount, getAllUserAccounts, getUserAccount, updateUserAccount,
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

module.exports = router;
