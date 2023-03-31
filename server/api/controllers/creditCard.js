const httpStatus = require('http-status');
const { creditCardService } = require('../services/creditCard');

const create = async (req, res) => {
  const newcreditCard = await creditCardService.create(req.body);
  res.status(httpStatus.OK).json(newcreditCard);
};

const getAll = async (req, res) => {
  const creditCards = await creditCardService.getAll();
  res.status(httpStatus.OK).json(creditCards);
};

const get = async (req, res) => {
  const { id } = req.params;
  const creditCard = await creditCardService.get(id);
  res.status(httpStatus.OK).json(creditCard);
};

const update = async (req, res) => {
  const { id } = req.params;
  const creditCard = await creditCardService.update(id, req.body);
  res.status(httpStatus.OK).json(creditCard);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const creditCard = await creditCardService.remove(id, req.body);
  res.status(httpStatus.OK).json(creditCard);
};

module.exports = {
  create,
  get,
  getAll,
  update,
  remove,
};
