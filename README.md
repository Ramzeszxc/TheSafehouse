TriZone Lite - Backend and local changes

What I added
- A small Express + Mongoose backend in `server.js` with endpoints for menu, orders, resources and bookings.
- Mongoose models in `/models` for MenuItem, Order, Resource, Booking.
- `package.json` with dependencies.
- `.env.example` (copy to `.env` and edit `MONGODB_URI` if you want).

Quick start (dev)

1. Install dependencies

```bash
cd /workspaces/TheSafehouse
npm install
```

2. Create `.env` (or rely on `.env.example` value) and set `MONGODB_URI`. Example:

```bash
cp .env.example .env
# Edit .env to add your own URI if needed
```

3. Start server

```bash
npm run dev
```

API (basic)
- GET `/api/menu` - list menu items
- POST `/api/menu` - create menu item (admin: send `x-user-role: admin` header)
- GET `/api/orders` - admin view orders (admin header required)
- POST `/api/orders` - create an order (body with `user`, `items`, `total`, `deliveryType`, `deliveryLocation`)
- GET `/api/resources` - get stations & lounges
- POST `/api/bookings` - create booking (body: `resourceId`, `user`, `duration`, `rate`)
- GET `/api/bookings` - admin list bookings

Notes & next steps
- For a production app add proper authentication (JWT/session) and server-side validation.
- The admin checks are a demo-only header `x-user-role: admin`. Replace with real auth.
- I updated the frontend minimally to use PHP (₱) currency and to POST orders to `/api/orders` — see `index.html` changes.
# TheSafehouse
The Safehouse is a soon to be business of Michael Angelou Quinit.
