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

## Root Helper Scripts

From the repo root, you can use:

```bash
npm start
npm run build
npm test
npm run backend:start
```
