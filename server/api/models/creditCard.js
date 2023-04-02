const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const { faker } = require('@faker-js/faker');
const mongoClient = require('../../config/database');

const creditCardSchema = new mongoose.Schema(
  {
    number: { type: String, default: (faker.finance.creditCardNumber()).replaceAll('-', '') },
    expirationDate: {
      type: Date,
      default: new Date(new Date()
        .setFullYear(new Date()
          .getFullYear() + 2)),
    },
    isActive: { type: Boolean, default: true },
    securityCode: { type: String, default: faker.finance.creditCardCVV() },
    accountId: { type: mongoose.Types.ObjectId },
    allowedLimit: { type: Number, default: faker.finance.amount(8000, 10000) },
    limitUsage: { type: Number, default: 0 },
    userId: { type: mongoose.Types.ObjectId },

  },
  { timestamps: true },
  { versionKey: false },
);

const CreditCard = mongoose.model('creditCard', creditCardSchema);

module.exports = CreditCard;
