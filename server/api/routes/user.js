const express = require('express');
const {
  create, get, getAll, update, remove, login,
} = require('../controllers/user');

const router = express.Router();

router.post('/', create);
router.get('/:id', get);
router.post('/login', login);
router.get('/', getAll);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
