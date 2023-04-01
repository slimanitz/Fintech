const httpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/user');
const APIError = require('../../utils/api-error');
const { jwtSecret } = require('../../config/vars');

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  isActive: Joi.boolean().required(),
});

const create = async (user) => {
  const { error, value } = schema.validate(user);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const newUser = new User(value);
  await newUser.save();
  return newUser;
};

const login = async ({ email, password }) => {
  const hashpassword = crypto.createHash('sha1').update(password, 'binary').digest('hex');
  const user = await User.findOne({ email, password: hashpassword });
  if (!user) throw new APIError({ message: 'Wrong credentials', status: httpStatus.UNAUTHORIZED });
  const token = jwt.sign({ user }, jwtSecret);
  return token;
};

const get = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  }
  const user = await User.findById(id);
  if (!user) throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  return user;
};

const getAll = async (filters) => {
  const users = await User.find({ ...filters });
  return users;
};

const update = async (id, payload) => {
  if (!ObjectId.isValid(id)) {
    throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  }
  const { error, value } = schema.validate(payload);
  if (error) throw new APIError({ message: 'Bad Payload', status: httpStatus.BAD_REQUEST });
  const updatedValue = await User.findByIdAndUpdate(id, value);
  if (!updatedValue) throw new APIError({ message: 'No user found', status: httpStatus.NOT_FOUND });
  return updatedValue;
};

const remove = async (id) => {
  await get(id);
  await User.findByIdAndDelete(id);
};

module.exports.userService = {
  create,
  get,
  getAll,
  update,
  remove,
  login,
};
