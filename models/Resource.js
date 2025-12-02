const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  type: { type: String, enum: ['cyber','lounge'], required: true },
  status: { type: String, enum: ['available','occupied','maintenance'], default: 'available' }
});

module.exports = mongoose.model('Resource', ResourceSchema);
