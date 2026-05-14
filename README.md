# Cruise Ship Management System

This project is now split into two clear app folders:

- `frontend/` contains the React app
- `backend/` contains the Express and PostgreSQL API

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

## Frontend

Run the React app directly:

```bash
cd frontend
npm install
npm start
```

Or from the repo root:

```bash
npm start
```

## Backend

Run the API server:

```bash
cd backend
npm install
npm start
```

The backend requires a working PostgreSQL database and a valid `backend/.env` file.

### Email Configuration

Booking approval emails are sent through Nodemailer when a booking status changes to `Confirmed`.

Add these variables to `backend/.env` to enable real email delivery:

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

If SMTP settings are missing, the backend will continue running but will skip sending booking confirmation emails and log a warning.

## Root Helper Scripts

From the repo root, you can use:

```bash
npm start
npm run build
npm test
npm run backend:start
```
