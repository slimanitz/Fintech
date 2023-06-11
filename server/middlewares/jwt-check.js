/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const { jwtSecret } = require('../config/vars');
const APIError = require('../utils/api-error');
const { redisClient } = require('../config/cache');

// I made a specific login in this middleware where I've make a verification
// if the user is using a good Agency ID and Iam checking as well on the database if it's coherent

const JWTCheck = (roles) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // eslint-disable-next-line consistent-return
      const cacheUserRole = await redisClient.get(token);
      if (cacheUserRole) {
        if (roles.includes(cacheUserRole)) {
          return next();
        }
        res.sendStatus(httpStatus.UNAUTHORIZED);
        return;
      }

      jwt.verify(token, jwtSecret, async (err, payload) => {
        if (err || !payload) {
          return res.sendStatus(httpStatus.UNAUTHORIZED);
        }
        const { user } = payload;
        if (roles.includes(user.role)) {
          await redisClient.set(token, user.role);
          await redisClient.expire(token, 60000);
          return next();
        }
        res.sendStatus(httpStatus.UNAUTHORIZED);
      });
    } else {
      res.sendStatus(httpStatus.UNAUTHORIZED);
    }
  } catch (e) {
    throw new APIError({ message: 'Error caught on the Auth midleware' });
  }
};

module.exports = JWTCheck;
