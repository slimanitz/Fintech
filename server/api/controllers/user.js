const httpStatus = require('http-status');
const { userService } = require('../services/user');
const { accountService } = require('../services/account');
const { creditCardService } = require('../services/creditCard');

// USER
const create = async (req, res) => {
  const newuser = await userService.create(req.body);
  res.status(httpStatus.OK).json(newuser);
};

const login = async (req, res) => {
  const token = await userService.login(req.body);
  res.status(httpStatus.OK).json({ token });
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

const createUserAccountCreditCard = async (req, res) => {
  const account = await creditCardService.createUserAccount(req.params, req.body);
  res.status(httpStatus.OK).json(account);
};
const getAllUserAccountCreditCards = async (req, res) => {
  const accounts = await creditCardService.getAllUserAccounts(req.params, req.body);
  res.status(httpStatus.OK).json(accounts);
};
const getUserAccountCreditCard = async (req, res) => {
  const account = await creditCardService.getUserAccount(req.params);
  res.status(httpStatus.OK).json(account);
};
const updateUserAccountCreditCard = async (req, res) => {
  const account = await creditCardService.updateUserAccount(req.params, req.body);
  res.status(httpStatus.OK).json(account);
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
  createUserAccountCreditCard,
  getAllUserAccountCreditCards,
  getUserAccountCreditCard,
  updateUserAccountCreditCard,

};
