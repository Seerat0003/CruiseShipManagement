# 🚢 Cruise Ship Management System

A web-based Cruise Ship Management System built with React and Express, designed to handle operations like ship booking, facility reservations, scheduling, and admin controls — with a focus on modular design, security, and transaction notifications.

---

## 🚀 Features

- **Role-Based Access Control**: Dynamic routing and personalized views for Admins, Voyagers, and Managers.
- **Voyager Portal**: Browse cruises, request service allocations (Spa, Salon, Dining, Gym), order catering, and view bookings.
- **Admin Control Centre**: Comprehensive database statistics, inventory management (CRUD), booking approvals, and automated Voyager notifications.
- **Manager Panels**: Dedicated service views for real-time tracking of facility allocations.
- **Automated Email Dispatch**: Integrates Nodemailer for transactional booking confirmations.

---

## ⚙️ Tech Stack

- **Frontend**: React, React Router Dom, Bootstrap / React Bootstrap
- **Backend**: Node.js, Express.js, JWT Authentication, Nodemailer
- **Database / ORM**: PostgreSQL, Sequelize
- **Version Control**: Git

---

## 🛠️ Getting Started

### 1. Database Configuration
Ensure PostgreSQL is running locally on port `5432` with a database named `cruisemanagement`. The connection credentials can be edited in `backend/.env`.

Seed the database tables and default entries:
```bash
cd backend
npm install
node seed.js
```

### 2. Launch Services
Run the following commands in separate terminals to boot up both servers:

#### Start Backend API (Port 5001)
```bash
cd backend
node index.js
```

#### Start Frontend UI (Port 3000)
```bash
npm install
npm start
```

