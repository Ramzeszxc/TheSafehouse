/**
 * Simple Express + Mongoose backend for TriZone Lite demo
 * - Provides menu, orders, resources, bookings endpoints
 * - Intended for local development with MongoDB Atlas
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const Resource = require('./models/Resource');
const Booking = require('./models/Booking');

const app = express();
app.use(cors());
app.use(express.json());
// Serve static frontend from project root so index.html is served on '/'
app.use(express.static(path.join(__dirname)));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:sept232005@cluster0.ecqetby.mongodb.net/?appName=Cluster0';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGODB_URI, { dbName: 'trizone' }).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connect error:', err.message);
});

// Simple middleware to check admin header (for demo only)
function requireAdmin(req,res,next){
  const role = req.header('x-user-role') || 'guest';
  if(role !== 'admin') return res.status(403).json({ error: 'Admin required (send header x-user-role: admin)' });
  next();
}

// Seed simple menu/resources if empty
async function seedIfEmpty(){
  const menuCount = await MenuItem.countDocuments();
  if(menuCount === 0){
    await MenuItem.create([
      { name: 'Neon Burger', price: 120, icon: 'ph-hamburger' },
      { name: 'Cyber Soda', price: 45, icon: 'ph-coffee' },
      { name: 'Power Fries', price: 80, icon: 'ph-pizza' },
      { name: 'Energy Shot', price: 60, icon: 'ph-lightning' }
    ]);
    console.log('Seeded menu');
  }

  const resCount = await Resource.countDocuments();
  if(resCount === 0){
    const resources = [];
    for(let i=1;i<=10;i++) resources.push({ _id: `pc_${i}`, name: `Station ${i}`, type: 'cyber', status: 'available'});
    for(let i=1;i<=4;i++) resources.push({ _id: `rm_${i}`, name: `Lounge ${String.fromCharCode(64+i)}`, type: 'lounge', status: 'available'});
    await Resource.create(resources);
    console.log('Seeded resources');
  }
}

// MENU endpoints
app.get('/api/menu', async (req,res) => {
  const items = await MenuItem.find().sort({ createdAt: 1 });
  res.json(items);
});

app.post('/api/menu', requireAdmin, async (req,res) => {
  const { name, price, icon } = req.body;
  if(!name || !price) return res.status(400).json({ error: 'name and price required' });
  const item = await MenuItem.create({ name, price, icon });
  res.status(201).json(item);
});

// Update menu item (admin)
app.put('/api/menu/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, price, icon } = req.body;
  if(!name && (price === undefined) && !icon) return res.status(400).json({ error: 'nothing to update' });
  // Basic server-side validation
  if(name && typeof name !== 'string') return res.status(400).json({ error: 'name must be a string' });
  if(name && name.trim().length < 2) return res.status(400).json({ error: 'name too short' });
  if(price !== undefined){
    const p = Number(price);
    if(Number.isNaN(p) || p <= 0) return res.status(400).json({ error: 'price must be a positive number' });
  }
  try {
    const update = {};
    if(name) update.name = name;
    if(price !== undefined) update.price = price;
    if(icon) update.icon = icon;
    const item = await MenuItem.findByIdAndUpdate(id, update, { new: true });
    if(!item) return res.status(404).json({ error: 'not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/menu/:id', requireAdmin, async (req,res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ORDERS
app.post('/api/orders', async (req,res) => {
  const { user='Guest', items=[], total=0, deliveryType='pickup', deliveryLocation='' } = req.body;
  if(!items.length) return res.status(400).json({ error: 'items required' });
  const order = await Order.create({ user, items, total, deliveryType, deliveryLocation });
  res.status(201).json(order);
});

app.get('/api/orders', requireAdmin, async (req,res) => {
  const orders = await Order.find().sort({ timestamp: -1 });
  res.json(orders);
});

// RESOURCES / BOOKINGS
app.get('/api/resources', async (req,res) => {
  const resources = await Resource.find();
  res.json(resources);
});

app.get('/api/bookings', requireAdmin, async (req,res) => {
  const bookings = await Booking.find().sort({ start: -1 });
  res.json(bookings);
});

app.post('/api/bookings', async (req,res) => {
  const { resourceId, user='Guest', duration=1, rate=25 } = req.body;
  if(!resourceId) return res.status(400).json({ error: 'resourceId required' });
  const resource = await Resource.findById(resourceId);
  if(!resource) return res.status(404).json({ error: 'Resource not found' });
  if(resource.status === 'occupied') return res.status(400).json({ error: 'Resource already occupied' });

  const start = new Date();
  const end = new Date(start.getTime() + duration*60*60*1000);
  const total = rate * duration;

  const booking = await Booking.create({ resourceId, resourceName: resource.name, user, duration, start, end, total });
  resource.status = 'occupied'; await resource.save();
  res.status(201).json(booking);
});

app.post('/api/admin/toggle-maintenance', requireAdmin, async (req,res) => {
  const { id } = req.body;
  const r = await Resource.findById(id);
  if(!r) return res.status(404).json({ error: 'not found' });
  r.status = r.status === 'maintenance' ? 'available' : 'maintenance';
  await r.save();
  res.json(r);
});

app.listen(PORT, async () => {
  await seedIfEmpty();
  console.log(`Server running on http://localhost:${PORT}`);
});

// Fallback: serve index.html for non-API routes (so SPA works)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});
