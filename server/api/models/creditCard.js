const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const { faker } = require('@faker-js/faker');
const mongoClient = require('../../config/database');

const creditCardSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true },
    expirationDate: {
      type: Date,
      default: new Date(new Date()
        .setFullYear(new Date()
          .getFullYear() + 2)),
    },
    isActive: { type: Boolean, default: true },
    securityCode: { type: String, default: faker.finance.creditCardCVV() },
    accountId: { type: mongoose.Types.ObjectId, required: true },
    allowedLimit: { type: Number, default: faker.finance.amount(8000, 10000) },
    limitUsage: { type: Number, default: 0 },
    userId: { type: mongoose.Types.ObjectId, required: true },

  },
  { timestamps: true },
  { versionKey: false },
);

const CreditCard = mongoose.model('creditCard', creditCardSchema);

module.exports = CreditCard;
