require('dotenv').config({ path: `.env.${process.env.APP_ENV}` });

const { env } = process;

module.exports = {
  jwtSecret: env.JWT_SECRET,
  host: env.HOST,
  redisHost: env.REDIS_HOST,
  redisPassword: env.REDIS_PASSWORD,
  redisPort: +env.REDIS_PORT,
  exchangeApiKey: env.EXCHANGE_API_KEY,
  dbUser: env.DB_USER,
  dbPassword: env.DB_PASSWORD,
  dbHost: env.DB_HOST,
  database: env.DATABASE,
};
