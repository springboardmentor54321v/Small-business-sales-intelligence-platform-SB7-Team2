const express = require('express');
const { getInventory, updateInventory } = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', getInventory);
router.put('/:id', updateInventory);

module.exports = router;
