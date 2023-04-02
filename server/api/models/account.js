const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');
const { accountTypesEnum } = require('../../utils/enums');

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true },
    iban: { type: String, unique: true },
    type: { type: String, enum: Object.values(accountTypesEnum), default: accountTypesEnum.BASIC },
    balance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    currency: { type: String, required: true },

  },
  { timestamps: true },
  { versionKey: false },
);

const Account = mongoose.model('account', accountSchema);

module.exports = Account;
