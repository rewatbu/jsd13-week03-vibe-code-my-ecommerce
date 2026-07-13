const express = require('express');
const Inventory = require('../models/Inventory');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', adminAuth, async (req, res) => {
  try {
    const items = await Inventory.find().populate('product');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const item = await Inventory.findOne({ product: req.params.productId });
    if (!item) return res.status(404).json({ message: 'ไม่พบข้อมูลสินค้า' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:productId', adminAuth, async (req, res) => {
  try {
    const { quantity, minimumStock, maximumStock } = req.body;
    const item = await Inventory.findOneAndUpdate(
      { product: req.params.productId },
      { quantity, minimumStock, maximumStock, lastUpdated: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'ไม่พบข้อมูลสินค้า' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
