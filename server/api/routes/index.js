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
router.use('/accounts', account);
router.use('/transactions', transaction);
router.use('/credit-cards', creditCard);
// __ROUTE__

module.exports = router;
