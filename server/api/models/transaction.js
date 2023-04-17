// eslint-disable-next-line no-unused-vars
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { transactionStatusEnum, transactionGatewayEnum } = require('../../utils/enums');
const Account = require('./account');
const User = require('./user');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  creditAccountId: { type: DataTypes.UUID, allowNull: false, references: { model: Account, key: 'id' } },
  debitAccountId: { type: DataTypes.UUID, references: { model: Account, key: 'id' }, allowNull: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: 'id' } },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: {
    type:
    DataTypes.ENUM(Object.values(transactionStatusEnum)),
    defaultValue: transactionStatusEnum.PENDING,
  },
  gateway: { type: DataTypes.ENUM(Object.values(transactionGatewayEnum)) },
  gatewayId: { type: DataTypes.UUID, allowNull: true },
  comment: { type: DataTypes.STRING, defaultValue: '' },
  currencyExchange: { type: DataTypes.STRING },
}, {
  timestamps: true,
  underscored: true,
});

Transaction.belongsTo(Account, { foreignKey: 'creditAccountId' });
Transaction.belongsTo(Account, { foreignKey: 'debitAccountId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = Transaction;
