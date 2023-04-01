const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');

const accountSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Types.ObjectId },
    iban: { type: String },
    type: { type: String },
    balance: { type: mongoose.Types.Decimal128 },
    isActive: { type: Boolean },

  },
  { timestamps: true },
  { versionKey: false },
);

const Account = mongoose.model('account', accountSchema);

module.exports = Account;
