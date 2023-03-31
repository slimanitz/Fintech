const httpStatus = require('http-status');
const { userService } = require('../services/user');

const create = async (req, res) => {
  const newuser = await userService.create(req.body);
  res.status(httpStatus.OK).json(newuser);
};

const getAll = async (req, res) => {
  const users = await userService.getAll();
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

module.exports = {
  create,
  get,
  getAll,
  update,
  remove,
};
