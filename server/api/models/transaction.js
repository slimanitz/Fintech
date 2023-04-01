const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');

const transactionSchema = new mongoose.Schema(
  {
    creditAccount: { type: mongoose.Types.ObjectId },
    debitAccount: { type: mongoose.Types.ObjectId },
    ammount: { type: mongoose.Types.Decimal128 },
    isCompleted: { type: Boolean },
    gateway: { type: String },
    comment: { type: String },

  },
  { timestamps: true },
  { versionKey: false },
);

const Transaction = mongoose.model('transaction', transactionSchema);

module.exports = Transaction;
