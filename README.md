# The Safehouse - Resource Management System

## 1\. Project Overview

**The Safehouse** is a full-stack web application designed to manage resources for an entertainment hub. It facilitates the booking of Cyber Stations and Lounge Areas, manages a Bistro food menu, and tracks real-time revenue and activity logs.

[cite_start]This project was developed as a Final Project for the Information Technology Department [cite: 1, 3][cite_start], demonstrating the integration of a **NoSQL Database (MongoDB)** with a **Node.js/Express** backend[cite: 12, 22].

## [cite_start]2. Technical Stack [cite: 20]

  * [cite_start]**Frontend:** HTML5, JavaScript (ES6), TailwindCSS (UI/UX)[cite: 29].
  * [cite_start]**Backend:** Node.js, Express.js[cite: 22].
  * [cite_start]**Database:** MongoDB (Atlas Cloud) via Mongoose ODM[cite: 12].
  * **Architecture:** RESTful API with Single Page Application (SPA) frontend.

## [cite_start]3. Database Schema Design [cite: 13, 42]

The database utilizes **MongoDB** to store unstructured and semi-structured data. The following Mongoose schemas were designed to ensure data integrity:

### A. Resources (`resources`)

Represents physical assets (computers, rooms) that can be booked.

  * `_id`: String (e.g., "pc\_1")
  * `name`: String
  * `type`: String (Enum: 'cyber', 'lounge')
  * `status`: String (Enum: 'available', 'occupied', 'maintenance', 'damaged')

### B. Bookings (`bookings`)

Records time-based reservations of resources.

  * `resourceId`: String (Reference to Resource)
  * `user`: String (Customer Name)
  * `duration`: Number (Hours)
  * `start` / `end`: Date
  * `total`: Number (Calculated price)

### C. Menu Items (`menuitems`)

Stores food and beverage options for the Bistro.

  * `name`: String
  * `price`: Number
  * `icon`: String (Phosphor Icon class)

### D. Orders (`orders`)

Tracks food orders placed by customers.

  * `user`: String
  * `items`: Array of Objects
  * `deliveryType`: String ('pickup' or 'delivery')
  * `total`: Number

## [cite_start]4. CRUD Implementation [cite: 14, 15]

[cite_start]The system implements full **Create, Read, Update, Delete (CRUD)** operations, satisfying the course requirements[cite: 42].

| Operation | Context | Implementation Details |
| :--- | :--- | :--- |
| **CREATE** | Bistro Menu | Admin can add new food items via the `POST /api/menu` endpoint. |
| **READ** | Dashboard | The system fetches and aggregates data for the Activity Log via `GET /api/activity`. |
| **UPDATE** | Resource Status | Admin can update a station status (e.g., to "Damaged") via `POST /api/admin/set-status`. |
| **DELETE** | Bistro Menu | Admin can remove items from the menu via `DELETE /api/menu/:id`. |

## [cite_start]5. API Endpoints [cite: 6, 26]

The backend exposes the following REST API endpoints:

### Menu Management

  * `GET /api/menu` - Fetch all items.
  * `POST /api/menu` - Create a new item (Admin).
  * `PUT /api/menu/:id` - Update an item (Admin).
  * `DELETE /api/menu/:id` - Remove an item (Admin).

### Booking & Resources

  * `GET /api/resources` - Get status of all stations/rooms.
  * `POST /api/bookings` - Create a reservation.
  * `POST /api/admin/set-status` - Force update status (Admin).

### Activity & Orders

  * `POST /api/orders` - Submit a food order.
  * `GET /api/activity` - Fetch combined history of bookings and orders.

## 6\. Installation & Usage

### Prerequisites

  * Node.js installed
  * MongoDB Atlas Connection String

### Setup Steps

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Setup:**
    Create a `.env` file and add your MongoDB connection string:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    ```
3.  **Run the Server:**
    ```bash
    npm start
    ```
4.  **Access the App:**
    Open your browser and navigate to `http://localhost:4000`.

### User Roles

  * **Admin:** (User: `admin`, Pass: `admin123`) - Full access to settings, edits, and logs.
  * **Customer:** (User: `michael`, Pass: `1234`) - Can book resources and order food.
  * **Guest:** Read-only access to view availability.
