const express = require('express');
const {
  create, getAll, update, remove, get,
} = require('../controllers/creditCard');

const router = express.Router();

router.post('/', create);
router.get('/:id', get);
router.get('/', getAll);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
