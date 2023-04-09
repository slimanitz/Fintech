const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/user');
const APIError = require('../../utils/api-error');
const { jwtSecret } = require('../../config/vars');
const { userRolesEnum } = require('../../utils/enums');
const { redisClient } = require('../../config/cache');

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

function filter(arr, criteria) {
  return arr.filter((obj) => Object.keys(criteria).every((c) => obj[c] == criteria[c]));
}

const create = async (user) => {
  const { error, value } = schema.validate(user);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  value.password = crypto.createHash('sha1').update(value.password, 'binary').digest('hex');
  const newUser = new User(value);
  await newUser.save();
  await redisClient.deleteList('users');
  return newUser;
};

const getAll = async (filters, isArray = true) => {
  let users = await redisClient.getList('users');
  if (users.length === 0) {
    users = await User.find();
    await redisClient.setList('users', users);
  }
  if (filters) { users = filter(users, filters); }
  if (!isArray) {
    return users[0] || null;
  } return users;
};

const get = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  }
  const user = await getAll({ _id: id }, false);
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
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = updateSchema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await User.findOneAndUpdate({ _id: id }, { $set: value }, { new: true });

  if (!updatedValue) throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  await redisClient.deleteList('users');
  return updatedValue;
};

const remove = async (id) => {
  await User.findByIdAndDelete(id);
  await redisClient.deleteList('users');
};

module.exports.userService = {
  create,
  getAll,
  get,
  update,
  remove,
  login,
};
