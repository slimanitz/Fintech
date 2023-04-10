const express = require('express');
const user = require('./user');
const account = require('./account');
const transaction = require('./transaction');
const creditCard = require('./creditCard');
const { userRolesEnum } = require('../../utils/enums');
const subscription = require('./subscription');
// __IMPORT__

const router = express.Router();
router.use('/users', user);
router.use('/accounts', account);
router.use('/transactions', transaction);
router.use('/credit-cards', creditCard);
router.use('/subscriptions', subscription);
// __ROUTE__

module.exports = router;
