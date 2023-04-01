const express = require('express');
const user = require('./user');
const account = require('./account');
const transaction = require('./transaction');
const creditCard = require('./creditCard');
const authenticateJWT = require('../../middlewares/auth');
const { userRolesEnum } = require('../../utils/enums');
// __IMPORT__

const router = express.Router();
router.use('/users', user);
router.use('/accounts', authenticateJWT([userRolesEnum.ADMIN]), account);
router.use('/transactions', authenticateJWT([userRolesEnum.ADMIN]), transaction);
router.use('/creditCards', authenticateJWT([userRolesEnum.ADMIN]), creditCard);
// __ROUTE__

module.exports = router;
