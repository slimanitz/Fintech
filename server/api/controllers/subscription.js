const httpStatus = require('http-status');
const { subscriptionService } = require('../services/subscription');

const create = async (req, res) => {
  const newsubscription = await subscriptionService.create(req.body);
  res.status(httpStatus.OK).json(newsubscription);
};

const getAll = async (req, res) => {
  const subscriptions = await subscriptionService.getAll(req.query);
  res.status(httpStatus.OK).json(subscriptions);
};

const get = async (req, res) => {
  const { id } = req.params;
  const subscription = await subscriptionService.get(id);
  res.status(httpStatus.OK).json(subscription);
};

const update = async (req, res) => {
  const { id } = req.params;
  const subscription = await subscriptionService.update(id, req.body);
  res.status(httpStatus.OK).json(subscription);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const subscription = await subscriptionService.remove(id, req.body);
  res.status(httpStatus.OK).json(subscription);
};

module.exports = {
  create,
  get,
  getAll,
  update,
  remove,
};
