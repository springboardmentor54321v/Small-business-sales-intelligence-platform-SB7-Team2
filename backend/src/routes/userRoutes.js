const express = require('express');
const { getUsers, getUserById } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
