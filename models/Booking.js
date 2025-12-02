const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  resourceId: { type: String, required: true },
  resourceName: { type: String },
  user: { type: String, required: true },
  duration: { type: Number, required: true },
  start: { type: Date, default: Date.now },
  end: { type: Date, required: true },
  total: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
