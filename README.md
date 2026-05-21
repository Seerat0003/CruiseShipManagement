# 🚢 Cruise Ship Management System

A web-based Cruise Ship Management System built with React, Express, Apollo Server (GraphQL), and WebSockets (Socket.io). It is designed to handle operation workflows like ship booking, facility reservations, scheduling, and admin controls—with a focus on modular design, security, and transaction notifications.

This project is split into two clear app folders:
- `frontend/` contains the React app
- `backend/` contains the Express, GraphQL, WebSockets, and PostgreSQL API

---

## 🚀 Features

- **Role-Based Access Control**: Dynamic routing and personalized views for Admins, Voyagers, and Managers.
- **Voyager Portal**: Browse cruises, request service allocations (Spa, Salon, Dining, Gym), order catering, and view bookings.
- **Admin Control Centre**: Comprehensive database statistics, inventory management (CRUD), booking approvals, and automated Voyager notifications.
- **Manager Panels**: Dedicated service views for real-time tracking of facility allocations.
- **GraphQL API**: Query and mutate all backend resources efficiently on a single `/graphql` endpoint.
- **WebSockets Enabled**: Live real-time notification streams for voyager booking requests and status updates.
- **Automated Email Dispatch**: Integrates Nodemailer for transactional booking confirmations.

---

## ⚙️ Tech Stack

- **Frontend**: React, Apollo Client, Socket.io-client, React Router Dom, Bootstrap
- **Backend**: Node.js, Express.js, Apollo Server, GraphQL, Socket.io, JWT Authentication, Nodemailer
- **Database / ORM**: PostgreSQL, Sequelize
- **Testing**: Jest, Supertest
- **CI/CD**: GitHub Actions

---

## Project Structure

```text
Cruise-Ship-Management/
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
├── backend/
│   ├── package.json
│   ├── config/
│   ├── models/
│   └── routes/
└── package.json
```

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

### 2. Email Configuration
Booking approval emails are sent through Nodemailer when a booking status changes to `Confirmed`. Add these variables to `backend/.env` to enable real email delivery:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
MAIL_FROM_NAME=Ocean Serenity Fleet
MAIL_FROM_EMAIL=noreply@yourdomain.com
MAIL_REPLY_TO=support@yourdomain.com
```

*Note: If SMTP settings are missing, the backend will continue running but will skip sending booking confirmation emails and log a warning.*

### 3. Launch Services

#### Start Backend API (Port 5001)
```bash
cd backend
npm install
npm start
```

#### Start Frontend UI (Port 3000)
```bash
cd frontend
npm install
npm start
```

---

## 🏁 Helper Scripts

From the repo root, you can use:
- `npm start` - Boot up the frontend and backend servers together.
- `npm run build` - Compile the frontend React application.
- `npm test` - Run the automated test suites.
- `npm run backend:start` - Start only the backend API server.
