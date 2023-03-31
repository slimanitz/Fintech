require('dotenv').config({ path: `.env.${process.env.APP_ENV}` });

const { env } = process;

module.exports = {
  mongoUrl: env.MONGO_URL,
  jwtSecret: env.JWT_SECRET,
  host: env.HOST,
};
