const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');
const { userRolesEnum } = require('../../utils/enums');

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    isActive: { type: Boolean },
    role: { type: String, enum: userRolesEnum.values(), default: userRolesEnum.CLIENT },

  },
  { timestamps: true },
  { versionKey: false },
);

const User = mongoose.model('user', userSchema);

module.exports = User;
