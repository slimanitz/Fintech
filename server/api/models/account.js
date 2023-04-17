const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { accountTypesEnum } = require('../../utils/enums');
const User = require('./user');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: 'id' } },
  iban: { type: DataTypes.STRING, unique: true },
  type: {
    type: DataTypes.ENUM(Object.values(accountTypesEnum)),
    defaultValue: accountTypesEnum.BASIC,
  },
  balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  currency: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
  underscored: true,
});

Account.belongsTo(User, { foreignKey: 'userId' });

module.exports = Account;
