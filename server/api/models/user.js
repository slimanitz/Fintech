const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');
const { userRolesEnum } = require('../../utils/enums');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: Object.values(userRolesEnum), default: userRolesEnum.CLIENT },

  },
  { timestamps: true },
  { versionKey: false },
);

const User = mongoose.model('user', userSchema);

module.exports = User;
