const express = require('express');
const { getSales, createSale, getSaleById, updateSale, deleteSale, } = require('../controllers/salesController');

const router = express.Router();

router.get('/', getSales);
router.get("/:id", getSaleById);
router.post('/', createSale);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);

module.exports = router;
