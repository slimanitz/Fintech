// eslint-disable-next-line no-unused-vars
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { subscriptionTypes, subscriptionFrequency } = require('../../utils/enums');
const Account = require('./account');
const User = require('./user');

const Subscription = sequelize.define('subscription', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.ENUM,
    values: Object.values(subscriptionTypes),
  },
  amount: {
    type: DataTypes.DOUBLE,
  },
  debitAccountId: {
    type: DataTypes.INTEGER,
    references: {
      model: Account,
      key: 'id',
    },
  },
  creditAccountId: {
    type: DataTypes.INTEGER,
    references: {
      model: Account,
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  frequency: {
    type: DataTypes.ENUM,
    values: Object.values(subscriptionFrequency),
  },
  finishDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isCancelled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  version: false,
});

Subscription.belongsTo(Account, {
  foreignKey: 'debitAccountId',
});
Subscription.belongsTo(Account, {
  foreignKey: 'creditAccountId',
});
Subscription.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = Subscription;
