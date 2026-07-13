const express = require('express');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const inventory = await Inventory.findOne({ product: item.product });
      if (!inventory || inventory.quantity < item.quantity) {
        return res.status(400).json({ message: `สินค้า ${item.productName} ไม่เพียงพอ` });
      }
      totalAmount += item.unitPrice * item.quantity;
      orderItems.push({ ...item, subtotal: item.unitPrice * item.quantity });
    }

    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { quantity: -item.quantity }, lastUpdated: new Date() }
      );
    }

    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingFee: 50,
      paymentMethod,
      shippingAddress
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { customer: req.user._id };
    const orders = await Order.find(filter).populate('customer', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'firstName lastName email phone');
    if (!order) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });
    if (req.user.role !== 'admin' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
