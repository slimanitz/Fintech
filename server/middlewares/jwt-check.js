/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const { jwtSecret } = require('../config/vars');
const APIError = require('../utils/api-error');

// I made a specific login in this middleware where I've make a verification
// if the user is using a good Agency ID and Iam checking as well on the database if it's coherent

const JWTCheck = (roles) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // eslint-disable-next-line consistent-return
      jwt.verify(token, jwtSecret, async (err, payload) => {
        if (err || !payload) {
          return res.sendStatus(httpStatus.UNAUTHORIZED);
        }
        const { user } = payload;
        if (roles.includes(user.role)) {
          req.user = user;
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
