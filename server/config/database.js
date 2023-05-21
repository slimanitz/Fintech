const Sequelize = require('sequelize');
const {
  dbPassword, dbHost, database, dbUser,
} = require('./vars');

const sequelize = new Sequelize(
  `mysql://${dbUser}:${dbPassword}@${dbHost}:3306/${database}`,
  { logging: false },
);

const connect = async () => {
  try {
    await sequelize.authenticate();

    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, connect };
