const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');
const { subscriptionTypes, subscriptionFrequency } = require('../../utils/enums');

const subscriptionSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: {
      type: String,
      enum: Object.values(subscriptionTypes),
    },
    amount: { type: Number },
    debitAccount: { type: mongoose.Types.ObjectId, ref: 'account' },
    creditAccount: { type: mongoose.Types.ObjectId, ref: 'account' },
    userId: { type: mongoose.Types.ObjectId, ref: 'user' },
    frequency: {
      type: String,
      enum: Object.values(subscriptionFrequency),
    },
    finishDate: { type: Date, default: Date.now },
    isCancelled: { type: Boolean, default: false },

  },
  { timestamps: true },
  { versionKey: false },
);

const Subscription = mongoose.model('subscription', subscriptionSchema);

module.exports = Subscription;
