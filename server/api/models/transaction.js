const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const mongoClient = require('../../config/database');
const { transactionStatusEnum, transactionGatewayEnum } = require('../../utils/enums');

const transactionSchema = new mongoose.Schema(
  {
    creditAccount: { type: mongoose.Types.ObjectId, required: true, ref: 'account' },
    debitAccount: { type: mongoose.Types.ObjectId, ref: 'account' },
    userId: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(transactionStatusEnum),
      default: transactionStatusEnum.PENDING,
    },
    gateway: { type: String, enum: Object.values(transactionGatewayEnum) },
    gatewayId: { type: mongoose.Types.ObjectId, required: true },
    comment: { type: String, default: '' },
    currencyExchange: { type: String },

  },
  { timestamps: true },
  { versionKey: false },
);

const Transaction = mongoose.model('transaction', transactionSchema);

module.exports = Transaction;
