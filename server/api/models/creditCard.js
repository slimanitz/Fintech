const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');

const creditCardSchema = new mongoose.Schema(
  {
    number: { type: String },
    expirationDate: { type: Date, default: Date.now },
    isActive: { type: Boolean },
    securityCode: { type: String },
    account: { type: mongoose.Types.ObjectId },
    allowedLimit: { type: mongoose.Decimal128 },
    limitUsage: { type: mongoose.Decimal128 },

  },
  { timestamps: true },
  { versionKey: false },
);

const CreditCard = mongoose.model('creditCard', creditCardSchema);

module.exports = CreditCard;
