// eslint-disable-next-line no-unused-vars
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { userRolesEnum } = require('../../utils/enums');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  role: { type: DataTypes.ENUM(Object.values(userRolesEnum)), defaultValue: userRolesEnum.CLIENT },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = User;
