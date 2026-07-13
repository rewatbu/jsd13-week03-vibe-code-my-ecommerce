const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  origin: { type: String, required: true },
  roastLevel: { type: String, enum: ['Light', 'Medium', 'Medium-Dark', 'Dark'], required: true },
  weight: { type: Number, required: true },
  unit: { type: String, default: 'กรัม' },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
