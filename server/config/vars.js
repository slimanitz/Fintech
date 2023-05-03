require('dotenv').config({ path: `.env.${process.env.APP_ENV}` });

const { env } = process;

module.exports = {
  mongoUrl: env.MONGO_URL,
  jwtSecret: env.JWT_SECRET,
  host: env.HOST,
  redisHost: env.REDIS_HOST,
  redisPassword: env.REDIS_PASSWORD,
  redisPort: +env.REDIS_PORT,
  exchangeApiKey: env.EXCHANGE_API_KEY,
};
