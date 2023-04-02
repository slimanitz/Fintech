const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');

const creditCardSchema = new mongoose.Schema(
  {
    number: { type: String },
    expirationDate: {
      type: Date,
      default: new Date(new Date()
        .setFullYear(new Date()
          .getFullYear() + 2)),
    },
    isActive: { type: Boolean, default: true },
    securityCode: { type: String },
    account: { type: mongoose.Types.ObjectId },
    allowedLimit: { type: Number },
    limitUsage: { type: Number, default: 0 },

  },
  { timestamps: true },
  { versionKey: false },
);

const CreditCard = mongoose.model('creditCard', creditCardSchema);

module.exports = CreditCard;
