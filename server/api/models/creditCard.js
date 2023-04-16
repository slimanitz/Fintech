// eslint-disable-next-line no-unused-vars
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Account = require('./account');
const User = require('./user');

const CreditCard = sequelize.define('CreditCard', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  number: { type: DataTypes.STRING, unique: true },
  expirationDate: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  securityCode: { type: DataTypes.STRING },
  accountId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Account, key: 'id' } },
  allowedLimit: { type: DataTypes.FLOAT },
  limitUsage: { type: DataTypes.FLOAT, defaultValue: 0 },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
}, {
  timestamps: true,
  underscored: true,
});

CreditCard.belongsTo(Account, { foreignKey: 'accountId' });
CreditCard.belongsTo(User, { foreignKey: 'userId' });
module.exports = CreditCard;
