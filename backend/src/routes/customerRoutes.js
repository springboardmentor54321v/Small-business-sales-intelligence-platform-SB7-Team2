const express = require('express');
const { getCustomers, createCustomer } = require('../controllers/customerController');

const router = express.Router();

router.get('/', getCustomers);
router.post('/', createCustomer);

module.exports = router;
