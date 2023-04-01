/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const User = require('../api/models/user');
const { jwtSecret } = require('../config/vars');
const APIError = require('../utils/api-error');

// I made a specific login in this middleware where I've make a verification
// if the user is using a good Agency ID and Iam checking as well on the database if it's coherent

const authenticateJWT = (roles) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // eslint-disable-next-line consistent-return
      jwt.verify(token, jwtSecret, async (err, payload) => {
        if (err || !payload) {
          return res.sendStatus(403);
        }
        const { user } = payload;
        const dbUser = await User.findById(user._id);

        if (dbUser && roles.includes(dbUser.role)) {
          req.user = dbUser;
          return next();
        }
        res.sendStatus(401);
      });
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    throw new APIError({ message: 'Error caught on the Auth midleware' });
  }
};

module.exports = authenticateJWT;
