const express = require('express');
const {
  create, get, getAll, update, remove,
} = require('../controllers/account');
const authenticateJWT = require('../../middlewares/auth');
const { userRolesEnum } = require('../../utils/enums');

const router = express.Router();

router.post('/', authenticateJWT(userRolesEnum.ADMIN), create);
router.get('/:id', get);
router.get('/', getAll);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
