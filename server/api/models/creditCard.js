const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');

const creditCardSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true },
    expirationDate: { type: String },
    isActive: { type: Boolean, default: true },
    securityCode: { type: String },
    accountId: { type: mongoose.Types.ObjectId, required: true },
    allowedLimit: { type: Number },
    limitUsage: { type: Number, default: 0 },
    userId: { type: mongoose.Types.ObjectId, required: true },

  },
  { timestamps: true },
  { versionKey: false },
);

creditCardSchema.set('lean', true);
const CreditCard = mongoose.model('creditCard', creditCardSchema);

module.exports = CreditCard;
