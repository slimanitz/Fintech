const httpStatus = require('http-status');
const { accountService } = require('../services/account');

const create = async (req, res) => {
  const newaccount = await accountService.create(req.body);
  res.status(httpStatus.OK).json(newaccount);
};

const getAll = async (req, res) => {
  const accounts = await accountService.getAll();
  res.status(httpStatus.OK).json(accounts);
};

const get = async (req, res) => {
  const { id } = req.params;
  const account = await accountService.get(id);
  res.status(httpStatus.OK).json(account);
};

const update = async (req, res) => {
  const { id } = req.params;
  const account = await accountService.update(id, req.body);
  res.status(httpStatus.OK).json(account);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const account = await accountService.remove(id, req.body);
  res.status(httpStatus.OK).json(account);
};

module.exports = {
  create,
  get,
  getAll,
  update,
  remove,
};
