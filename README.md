# The Safehouse - Resource Management System

## 1\. Project Overview

The Safehouse is a full-stack web application designed to streamline resource management for an entertainment hub. It facilitates the booking of Cyber Stations and Lounge Areas, manages a Bistro food menu, and tracks real-time revenue and activity logs. The system integrates a NoSQL Database (MongoDB) with a Node.js/Express backend to provide a responsive and scalable user experience.

## 2\. Technical Stack

  * Frontend: HTML5, JavaScript (ES6), TailwindCSS (UI/UX)
  * Backend: Node.js, Express.js
  * Database: MongoDB (Atlas Cloud) via Mongoose ODM
  * Architecture: RESTful API with Single Page Application (SPA) frontend

## 3\. Database Schema Design

The database utilizes MongoDB to store unstructured and semi-structured data. The following Mongoose schemas ensure data consistency:

A. Resources (resources)

Represents physical assets (computers, rooms) available for booking.

  * `_id`: String (e.g., "pc\_1")
  * `name`: String
  * `type`: String (Enum: 'cyber', 'lounge')
  * `status`: String (Enum: 'available', 'occupied', 'maintenance', 'damaged')

B. Bookings (bookings)

Records time-based reservations of resources.

  * `resourceId`: String (Reference to Resource)
  * `user`: String (Customer Name)
  * `duration`: Number (Hours)
  * `start` / `end`: Date
  * `total`: Number (Calculated price)

C. Menu Items (menuitems)

Stores food and beverage options for the Bistro.

  * `name`: String
  * `price`: Number
  * `icon`: String (Phosphor Icon class)

D. Orders (orders)

Tracks food orders placed by customers.

  * `user`: String
  * `items`: Array of Objects
  * `deliveryType`: String ('pickup' or 'delivery')
  * `total`: Number

## 4\. CRUD Implementation

The system implements full Create, Read, Update, Delete (CRUD) operations to manage data flows efficiently.

| Operation | Context | Implementation Details |
| :--- | :--- | :--- |
| CREATE | Bistro Menu | Admin adds new food items via `POST /api/menu`. |
| READ | Dashboard | System fetches aggregated activity logs via `GET /api/activity`. |
| UPDATE | Resource Status | Admin updates station status (e.g., "Damaged") via `POST /api/admin/set-status`. |
| DELETE | Bistro Menu | Admin removes items from the menu via `DELETE /api/menu/:id`. |

## 5\. API Endpoints

The backend exposes the following REST API endpoints for client-server communication:

Menu Management

  * `GET /api/menu` - Fetch all items.
  * `POST /api/menu` - Create a new item (Admin).
  * `PUT /api/menu/:id` - Update an item (Admin).
  * `DELETE /api/menu/:id` - Remove an item (Admin).

Booking & Resources

  * `GET /api/resources` - Get status of all stations/rooms.
  * `POST /api/bookings` - Create a reservation.
  * `POST /api/admin/set-status` - Force update status (Admin).

Activity & Orders

  * `POST /api/orders` - Submit a food order.
  * `GET /api/activity` - Fetch combined history of bookings and orders.

## 6\. Installation & Usage

Prerequisites

  * Node.js installed
  * MongoDB Atlas Connection String

Setup Steps

1.  Install Dependencies:
    ```bash
    npm install
    ```
2.  Environment Setup:
    Create a `.env` file and add your MongoDB connection string:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    ```
3.  Run the Server:
    ```bash
    npm start
    ```
4.  Access the App:
    Open your browser and navigate to `http://localhost:4000`.

User Roles

  * Admin: Full access to settings, edits, and logs.
  * Customer: Can book resources and order food.
  * Guest: Read-only access to view availability.
