const httpStatus = require('http-status');
const { userService } = require('../services/user');
const { accountService } = require('../services/account');
const { creditCardService } = require('../services/creditCard');
const { transactionService } = require('../services/transaction');

// USER
const create = async (req, res) => {
  const newuser = await userService.create(req.body);
  res.status(httpStatus.OK).json(newuser);
};

const login = async (req, res) => {
  const user = await userService.login(req.body);
  res.status(httpStatus.OK).json(user);
};

const getAll = async (req, res) => {
  const users = await userService.getAll(req.query);
  res.status(httpStatus.OK).json(users);
};

const get = async (req, res) => {
  const { id } = req.params;
  const user = await userService.get(id);
  res.status(httpStatus.OK).json(user);
};

const update = async (req, res) => {
  const { id } = req.params;
  const user = await userService.update(id, req.body);
  res.status(httpStatus.OK).json(user);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const user = await userService.remove(id, req.body);
  res.status(httpStatus.OK).json(user);
};

// Account
const createUserAccount = async (req, res) => {
  const account = await accountService.createUserAccount(req.params, req.body);
  res.status(httpStatus.OK).json(account);
};
const getAllUserAccounts = async (req, res) => {
  const accounts = await accountService.getAllUserAccounts(req.params, req.body);
  res.status(httpStatus.OK).json(accounts);
};
const getUserAccount = async (req, res) => {
  const account = await accountService.getUserAccount(req.params);
  res.status(httpStatus.OK).json(account);
};
const updateUserAccount = async (req, res) => {
  const account = await accountService.updateUserAccount(req.params, req.body);
  res.status(httpStatus.OK).json(account);
};

// Credit Card

const createUserCreditCard = async (req, res) => {
  const creditCard = await creditCardService.createUserAccountCreditCard(req.params);
  res.status(httpStatus.OK).json(creditCard);
};
const getAllUserCreditCards = async (req, res) => {
  const creditCards = await creditCardService.getAllUsersCreditCards(req.params, req.body);
  res.status(httpStatus.OK).json(creditCards);
};
const getUserCreditCard = async (req, res) => {
  const creditCard = await creditCardService.getUserCreditCard(req.params);
  res.status(httpStatus.OK).json(creditCard);
};
const updateUserCreditCard = async (req, res) => {
  const creditCard = await creditCardService.updateUserCreditCard(req.params, req.body);
  res.status(httpStatus.OK).json(creditCard);
};

// TRANSACTIONS
const createUserTransaction = async (req, res) => {
  const transaction = await transactionService.createUserTransaction(req.params, req.body);
  res.status(httpStatus.OK).json(transaction);
};

const getAllUserTransactions = async (req, res) => {
  const transactions = await transactionService.getAllUserTransaction(req.params);
  res.status(httpStatus.OK).json(transactions);
};

const getUserTransaction = async (req, res) => {
  const transaction = await transactionService.getUserTransaction(req.params);
  res.status(httpStatus.OK).json(transaction);
};

module.exports = {
  create,
  get,
  getAll,
  update,
  remove,
  login,
  createUserAccount,
  getAllUserAccounts,
  getUserAccount,
  updateUserAccount,
  createUserCreditCard,
  getAllUserCreditCards,
  getUserCreditCard,
  updateUserCreditCard,
  createUserTransaction,
  getAllUserTransactions,
  getUserTransaction,

};
