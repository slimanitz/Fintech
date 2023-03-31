const httpStatus = require('http-status');
const { transactionService } = require('../services/transaction');

const create = async (req, res) => {
  const newtransaction = await transactionService.create(req.body);
  res.status(httpStatus.OK).json(newtransaction);
};

const getAll = async (req, res) => {
  const transactions = await transactionService.getAll();
  res.status(httpStatus.OK).json(transactions);
};

const get = async (req, res) => {
  const { id } = req.params;
  const transaction = await transactionService.get(id);
  res.status(httpStatus.OK).json(transaction);
};

const update = async (req, res) => {
  const { id } = req.params;
  const transaction = await transactionService.update(id, req.body);
  res.status(httpStatus.OK).json(transaction);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const transaction = await transactionService.remove(id, req.body);
  res.status(httpStatus.OK).json(transaction);
};

module.exports = {
  create,
  get,
  getAll,
  update,
  remove,
};
