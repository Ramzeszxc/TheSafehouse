const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: String, required: true },
  items: [{ name: String, price: Number, qty: { type: Number, default: 1 } }],
  total: { type: Number, required: true },
  deliveryType: { type: String, enum: ['delivery','pickup'], required: true },
  deliveryLocation: { type: String }, // station id or lounge name
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
