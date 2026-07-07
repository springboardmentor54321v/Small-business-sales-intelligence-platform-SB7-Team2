const express = require('express');
const { getSales, createSale } = require('../controllers/salesController');

const router = express.Router();

router.get('/', getSales);
router.post('/', createSale);

module.exports = router;
