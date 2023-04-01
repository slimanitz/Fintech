const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');
const { transactionStatusEnum, transactionGatewayEnum } = require('../../utils/enums');

const transactionSchema = new mongoose.Schema(
  {
    creditAccount: { type: mongoose.Types.ObjectId },
    debitAccount: { type: mongoose.Types.ObjectId },
    ammount: { type: Number },
    status: { type: String, enum: transactionStatusEnum },
    gateway: { type: String, enum: transactionGatewayEnum },
    comment: { type: String },

  },
  { timestamps: true },
  { versionKey: false },
);

const Transaction = mongoose.model('transaction', transactionSchema);

module.exports = Transaction;
