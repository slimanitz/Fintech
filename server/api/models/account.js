const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const { faker } = require('@faker-js/faker');
const mongoClient = require('../../config/database');
const { accountTypesEnum } = require('../../utils/enums');

const accountSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Types.ObjectId },
    iban: { type: String, default: faker.finance.iban() },
    type: { type: String, enum: Object.values(accountTypesEnum), default: accountTypesEnum.BASIC },
    balance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

  },
  { timestamps: true },
  { versionKey: false },
);

const Account = mongoose.model('account', accountSchema);

module.exports = Account;
