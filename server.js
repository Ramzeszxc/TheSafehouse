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
app.use(express.static(path.join(__dirname)));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:sept232005@cluster0.ecqetby.mongodb.net/?appName=Cluster0';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGODB_URI, { dbName: 'trizone' }).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connect error:', err.message);
});

function requireAdmin(req,res,next){
  const role = req.header('x-user-role') || 'guest';
  if(role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  next();
}

// --- MENU ROUTES ---
app.get('/api/menu', async (req,res) => { const items = await MenuItem.find().sort({ createdAt: 1 }); res.json(items); });
app.post('/api/menu', requireAdmin, async (req,res) => { const item = await MenuItem.create(req.body); res.status(201).json(item); });
app.put('/api/menu/:id', requireAdmin, async (req, res) => { await MenuItem.findByIdAndUpdate(req.params.id, req.body); res.json({ok:true}); });
app.delete('/api/menu/:id', requireAdmin, async (req,res) => { await MenuItem.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

// --- ORDER ROUTES ---
app.post('/api/orders', async (req,res) => {
  const { user='Guest', items=[], total=0, deliveryType='pickup', deliveryLocation='' } = req.body;
  if(!items.length) return res.status(400).json({ error: 'items required' });
  
  const order = await Order.create({ user, items, total, deliveryType, deliveryLocation });
  res.status(201).json(order);
});

// --- RESOURCES ---
app.get('/api/resources', async (req,res) => { const resources = await Resource.find(); res.json(resources); });

// ADMIN: Set specific status (Available, Occupied, Maintenance, Damaged)
app.post('/api/admin/set-status', requireAdmin, async (req,res) => {
  const { id, status } = req.body;
  const r = await Resource.findById(id);
  if(!r) return res.status(404).json({ error: 'not found' });
  
  r.status = status; 
  await r.save();
  res.json(r);
});

// --- COMBINED ACTIVITY (Bookings + Orders) ---
app.get('/api/activity', async (req,res) => {
    try {
        const bookings = await Booking.find().lean();
        const orders = await Order.find().lean();

        // Normalize data for frontend
        const normalizedBookings = bookings.map(b => ({
            ...b,
            type: 'booking',
            activityName: b.resourceName, // e.g. "Station 1"
            details: `${b.duration} hours`
        }));

        const normalizedOrders = orders.map(o => ({
            ...o,
            type: 'order',
            // Format: "Neon Burger, Cyber Soda"
            activityName: o.items.map(i => i.name).join(', '), 
            details: o.deliveryType
        }));

        // Merge
        const activity = [...normalizedBookings, ...normalizedOrders].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(activity);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

app.post('/api/bookings', async (req,res) => {
  const { resourceId, user='Guest', duration=1, rate=25 } = req.body;
  const resource = await Resource.findById(resourceId);
  if(resource.status !== 'available') return res.status(400).json({ error: 'Resource not available' });

  const start = new Date();
  const end = new Date(start.getTime() + duration*60*60*1000);
  const total = rate * duration;

  const booking = await Booking.create({ resourceId, resourceName: resource.name, user, duration, start, end, total });
  resource.status = 'occupied'; await resource.save();
  res.status(201).json(booking);
});

app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });

// SPA Fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});