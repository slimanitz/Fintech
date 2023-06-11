const httpStatus = require('http-status');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/user');
const APIError = require('../../utils/api-error');
const { jwtSecret } = require('../../config/vars');
const { userRolesEnum } = require('../../utils/enums');

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  isActive: Joi.boolean(),
  role: Joi.string().valid(...Object.values(userRolesEnum)),
});

const updateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
});

const create = async (user) => {
  const { error, value } = schema.validate(user);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  value.password = crypto.createHash('sha1').update(value.password, 'binary').digest('hex');
  const newUser = await User.create(value);
  return newUser;
};

const getAll = async (filters, isArray = true) => {
  const users = await User.findAll({
    raw: true,
    nest: true,
    where: { ...filters },
  });
  if (!isArray) {
    return users[0];
  }
  return users;
};

const get = async (id) => {
  const user = await getAll({ id }, false);
  if (!user) throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  return user;
};

const login = async ({ email, password }) => {
  const hashpassword = crypto.createHash('sha1').update(password, 'binary').digest('hex');
  const user = await getAll({ email, password: hashpassword, isActive: true }, false);
  if (!user) throw new APIError({ message: 'Wrong credentials', status: httpStatus.UNAUTHORIZED });
  const token = jwt.sign({ user }, jwtSecret, { expiresIn: '2h' });
  delete user.password;
  return { ...user, token };
};

const update = async (id, payload) => {
  const { error, value } = updateSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await User.update(value, { where: { id }, plain: true, returning: true });
  if (!updatedValue) throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

const remove = async (id) => {
  await User.destroy({ where: { id } });
};

module.exports.userService = {
  create,
  getAll,
  get,
  update,
  remove,
  login,
};
