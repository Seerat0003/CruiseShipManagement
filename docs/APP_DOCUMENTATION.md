# Cruise Ship Management System Documentation

## 1. What This App Is

This project is a full-stack cruise operations app with:

- a `React` frontend in `frontend/`
- an `Express + Sequelize + PostgreSQL` backend in `backend/`

The system is designed around three main usage modes:

- `Public visitor`: can view cruises, services, and booking occupancy data
- `Voyager`: can sign up, log in, browse cruises/services, and request bookings
- `Admin`: can log in, view platform metrics, approve bookings, view voyagers, and create cruises

There are also several `Manager` pages in the frontend, but they are currently placeholder screens and are not connected to real backend data.

At a high level, the app is trying to solve this workflow:

1. A guest creates an account. 
2. The guest logs in as a `voyager`.
3. The voyager browses available cruises and onboard services.
4. The voyager requests a reservation for a time slot.
5. The booking is stored with `Pending` status.
6. An admin reviews requests in the dashboard.
7. When an admin confirms a booking, the booking status becomes `Confirmed`.
8. The backend attempts to send a notification email for confirmed bookings.

## 2. Folder Structure

```text
Cruise-Ship-Management/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── seed.js
├── database/
│   └── schema.sql
├── frontend/
│   ├── public/
│   └── src/
└── docs/
    └── APP_DOCUMENTATION.md
```

## 3. How The App Starts

### Frontend startup

The root `package.json` forwards most common commands to the frontend:

- `npm start` runs the React app
- `npm run build` builds the React app
- `npm test` runs frontend tests

The frontend entry point is:

- `frontend/src/index.js`

That file renders the root `<App />` component inside `React.StrictMode`.

### Backend startup

The backend entry point is:

- `backend/index.js`

When the backend starts, it:

1. creates an Express app
2. enables `cors()`
3. enables `express.json()`
4. registers the API route groups
5. authenticates to PostgreSQL
6. runs `sequelize.sync({ alter: true })`
7. performs a test read of all users
8. starts listening on port `5001` by default

The backend uses `.env` values loaded from `backend/.env` through:

- `backend/config/db.js`

Based on the code, the important environment variables are:

- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `JWT_SECRET`
- optionally `PORT`

## 4. Frontend Architecture

The frontend uses `react-router-dom` for routing. The main router is defined in:

- `frontend/src/App.js`

### Main routes

#### Public routes

- `/` -> home page
- `/admin/login` -> login page
- `/admin/signup` -> signup page

#### Voyager routes

- `/voyager/dashboard`
- `/voyager/catering`
- `/voyager/stationery`
- `/voyager/resort`
- `/voyager/party`
- `/voyager/fitness`
- `/voyager/beauty`

#### Admin routes

- `/admin/dashboard`
- `/admin/manage`
- `/admin/voyager`

#### Manager routes

- `/manager/viewparty`
- `/manager/viewsalon`
- `/manager/viewresort`
- `/manager/viewfitness`
- `/manager/viewcatering`
- `/manager/viewstationery`

### Important note about login state

`App.js` stores login status in local React state:

- `const [loggedIn, setLoggedIn] = useState(false);`

This means the app does **not** restore `loggedIn` from `localStorage` on page refresh. So:

- the `token` and `user` may still exist in `localStorage`
- but the top-level `loggedIn` state resets to `false` after a refresh

This causes a behavior mismatch:

- `Navigation.jsx` reads the user role from `localStorage`
- but it still depends on the `loggedIn` prop to decide which menu to show

So after refreshing, a user may still be technically authenticated for API calls, but parts of the UI can behave like they are logged out until the login flow runs again.

## 5. Navigation And Role-Based UI

The main navigation is in:

- `frontend/src/Navigation.jsx`

### What it does

The navbar always shows:

- the brand name `Ocean Serenity`
- a `Home` link

If not logged in:

- it shows `Sign In`
- it shows `Join`

If logged in:

- it shows a welcome message using the first name from `localStorage.user`
- it shows `Logout`

### Secondary navigation

When `loggedIn` is true, a second menu bar appears.

For `admin`:

- Fleet Overview
- Manage Inventory
- Voyager Registry

For `voyager`:

- My Dashboard
- Book Party Hall
- Book Resort/Movie
- Book Fitness Center
- Book Beauty Salon
- Order Catering

This is how the app changes the visible experience by role.

## 6. Home Page

The home page is:

- `frontend/src/Home.jsx`

### What happens there

This page is mostly a marketing and landing page. It is not deeply connected to backend business logic.

It contains:

- a hero section with a call-to-action button
- animated counters for luxury stats
- an About section
- a destinations section
- a facilities section
- a final CTA section

### CTA behavior

The main call-to-action checks the login state:

- if logged out, it sends the user to `/admin/login`
- if logged in as admin, it sends the user to `/admin/dashboard`
- if logged in as voyager, it sends the user to `/voyager/dashboard`

So the home page acts as the public entry point into the rest of the application.

## 7. Authentication Flow

Authentication is split between frontend forms and backend API routes.

### Signup

Frontend:

- `frontend/src/Admin/SignUp.jsx`

Backend:

- `POST /api/register`

### What happens during signup

1. User fills in name, email, password, and confirm password.
2. Frontend checks that password and confirm password match.
3. Frontend sends a request to `http://localhost:5001/api/register`.
4. Backend checks if the email already exists.
5. Backend hashes the password using `bcryptjs`.
6. Backend creates a `User` with role `voyager`.
7. Frontend shows a success message and redirects to login.

### Login

Frontend:

- `frontend/src/Admin/Login.jsx`

Backend:

- `POST /api/login`

### What happens during login

1. User enters email and password.
2. Frontend sends them to `http://localhost:5001/api/login`.
3. Backend finds the user by email.
4. Backend compares the password using `bcrypt.compare`.
5. If valid, backend creates a JWT token with:
   - `id`
   - `role`
6. Backend returns:
   - `token`
   - `user`
7. Frontend stores both in `localStorage`.
8. Frontend sets `loggedIn = true`.
9. Frontend redirects by role:
   - `admin` -> `/admin/dashboard`
   - everyone else -> `/voyager/dashboard`

### Logout

Handled in `Navigation.jsx`.

It:

- sets `loggedIn` to `false`
- removes `token`
- removes `user`
- redirects to `/`

## 8. Backend API Structure

The backend mounts routes like this:

- `/api` -> auth routes
- `/api/public` -> public data routes
- `/api/admin` -> admin-only routes
- `/api/voyager` -> voyager-only routes

### Auth middleware

Defined in:

- `backend/middleware/auth.js`

There are three helpers:

- `authenticate`
- `authorizeAdmin`
- `authorizeVoyager`

`authenticate`:

- reads the `Authorization` header
- strips `Bearer `
- verifies the JWT
- puts the decoded payload in `req.user`

`authorizeAdmin`:

- allows access only if `req.user.role === "admin"`

`authorizeVoyager`:

- allows access only if `req.user.role === "voyager"`

This is the core access control layer for protected APIs.

## 9. Data Model

The Sequelize models live in:

- `backend/models/`

### User

Represents a login account.

Fields:

- `id`
- `name`
- `email`
- `password`
- `role`

Table name:

- `users`

### Voyager

Represents voyager-specific profile data.

Fields:

- `id`
- `passport_number`
- `room_number`

Table name:

- `voyagers`

Important detail:

The model relationships expect a `user_id` foreign key, even though `user_id` is not explicitly listed in the model definition. Sequelize can still manage it through associations.

### Product

Represents purchasable stock items.

Fields:

- `id`
- `name`
- `category`
- `price`
- `stock`

Table name:

- `products`

### Service

Represents bookable facilities or experiences.

Fields:

- `id`
- `name`
- `category`
- `price`

Table name:

- `services`

### Booking

Represents a reservation.

Fields:

- `id`
- `start_time`
- `end_time`
- `status`

Associated foreign keys:

- `user_id`
- `service_id`
- `cruise_id`

Table name:

- `bookings`

### Cruise

Represents an active cruise trip or itinerary.

Fields:

- `id`
- `name`
- `route`
- `start_date`
- `duration_days`
- `total_seats`
- `available_seats`
- `price`
- `image_url`

Table name:

- `cruises`

### Associations

Defined in:

- `backend/models/index.js`

Relationships:

- `User hasOne Voyager`
- `Voyager belongsTo User`
- `User hasMany Booking`
- `Booking belongsTo User`
- `Service hasMany Booking`
- `Booking belongsTo Service`
- `Cruise hasMany Booking`
- `Booking belongsTo Cruise`

This means a booking can be linked either to:

- a service reservation
- a cruise reservation

In the current frontend, service bookings are implemented. Cruise booking is mostly presented in the UI, but the actual backend flow for direct cruise booking is not yet wired.

## 10. Public API Endpoints

Defined in:

- `backend/routes/public.js`

### `GET /api/public/cruises`

Returns all cruises.

Used by:

- voyager dashboard
- admin dashboard

### `GET /api/public/services`

Returns all services.

Used by:

- voyager dashboard
- service booking pages

### `GET /api/public/bookings`

Returns a reduced booking list with only:

- `service_id`
- `start_time`
- `status`

Used by:

- the booking template page to calculate slot occupancy

### Important issue

`public.js` defines `GET /bookings` twice. Both handlers do the same thing, so it does not add functionality, but it is redundant and should be cleaned up.

## 11. Voyager API Endpoints

Defined in:

- `backend/routes/voyager.js`

These routes are protected by:

- `authenticate`
- `authorizeVoyager`

### `GET /api/voyager/services`

Returns all services.

Note:

The current frontend mostly uses the public services endpoint instead of this protected one.

### `GET /api/voyager/products`

Returns all products.

Important note:

The current voyager frontend pages for catering and stationery do **not** use this endpoint. They are actually built on the service booking template, so product ordering is not truly implemented in the current UI.

### `POST /api/voyager/bookings`

Creates a new booking with:

- `user_id` from the token
- `service_id` from the request
- `start_time`
- `end_time`
- `status = "Pending"`

This is one of the main working business flows in the app.

### `GET /api/voyager/bookings`

Returns the logged-in voyager's own bookings.

Used by:

- voyager dashboard

## 12. Admin API Endpoints

Defined in:

- `backend/routes/admin.js`

These routes are protected by:

- `authenticate`
- `authorizeAdmin`

### `POST /api/admin/items`

Creates either:

- a product
- a service

The request must include `type`.

If `type === "product"`:

- creates a product with `name`, `category`, `price`, `stock`

If `type === "service"`:

- creates a service with `name`, `category`, `price`

### `PUT /api/admin/products/:id`

Updates a product.

### `DELETE /api/admin/products/:id`

Deletes a product.

### `PUT /api/admin/services/:id`

Updates a service.

### `DELETE /api/admin/services/:id`

Deletes a service.

### `GET /api/admin/bookings`

Returns all bookings and includes:

- `User`
- `Service`
- `Cruise`

This is what powers the admin's reservation table.

### `GET /api/admin/stats`

Calculates high-level metrics:

- total users
- total cruises
- total services
- total bookings
- total seats
- booked seats
- available seats

The seat totals are computed by reading all cruises and summing `total_seats` and `available_seats`.

### `PUT /api/admin/bookings/:id`

Updates the status of a booking.

This is the approval action used by the dashboard.

If the status becomes `Confirmed` and the booking has an associated user:

1. the backend creates a temporary Nodemailer test account
2. it creates a transporter
3. it sends a confirmation email
4. it logs a preview URL to the console

This means the email flow is intended for development/test mail previews, not a production mail server.

### `GET /api/admin/users`

Returns all users whose role is `voyager`.

Used by:

- the admin dashboard's registered voyagers table

### `POST /api/admin/cruises`

Creates a new cruise.

Important detail:

`available_seats` is initialized to the same value as `total_seats`.

### `GET /api/admin/facility-stats`

Builds per-service statistics by combining:

- all services
- all bookings

For each service it returns:

- `id`
- `name`
- `category`
- `total_bookings`
- `confirmed`
- `pending`

This powers the admin dashboard facility metrics screen.

## 13. Voyager Experience In The Frontend

The main voyager page is:

- `frontend/src/Voyager/VoyagerDashboard.jsx`

### What it loads

On mount, it fetches:

- public cruises
- public services
- voyager's personal bookings if a token exists

### What the voyager sees

#### My Personal Itinerary

Shows the voyager's own bookings in a table:

- booking reference
- time/date
- status

#### Available Excursions

Shows cruise cards with:

- cruise name
- duration
- route
- departure date
- seats remaining
- price

Important limitation:

Clicking `Reserve Cabin` currently sends the user to `/voyager/resort`, which is a service booking page. It does **not** create a cruise booking flow. So cruises are displayed attractively, but the end-to-end reservation behavior is not actually implemented for cruises.

#### Onboard Premium Facilities

Shows service cards with:

- service name
- service category
- price
- reserve button

The reserve button routes by category:

- Spa/Beauty -> beauty page
- Gym -> fitness page
- Dining/Party -> party page
- Entertainment -> resort page

This is how the dashboard acts as a service catalog.

## 14. Shared Booking Page Pattern

The following voyager pages are thin wrappers:

- `BookPartyHall.jsx`
- `BookBeautySalon.jsx`
- `BookFitnessCentre.jsx`
- `BookResortandMovieTickets.jsx`
- `OrderCaterItems.jsx`
- `OrderStationeryItems.jsx`

All of them render the same shared component:

- `frontend/src/Voyager/ServiceBookingTemplate.jsx`

They only change:

- the page title
- the allowed service categories

### Why this matters

This is one of the key design ideas in the frontend:

- there is really one booking engine
- the different pages are category-specific views of the same engine

## 15. How ServiceBookingTemplate Works

This is the main reservation engine for voyagers.

### Step 1: Load services

It fetches:

- `GET /api/public/services`

Then it filters the services client-side using `categoryFilter`.

Example:

- beauty page includes `Spa`, `Beauty`, `Salon`
- fitness page includes `Gym`, `Fitness`, `Sports`

### Step 2: Load all booking occupancy

It fetches:

- `GET /api/public/bookings`

This gives it enough information to see how many existing bookings already occupy a service slot.

### Step 3: User selects a date

The page requires a date before showing live capacities.

The minimum date is today, so past dates cannot be selected.

### Step 4: User selects a time slot

The shared fixed time slots are:

- `4:00 PM - 7:00 PM`
- `8:00 PM - 11:00 PM`
- `12:00 AM - 3:00 AM`

Each slot maps to a fixed start time:

- `16:00`
- `20:00`
- `00:00`

### Step 5: Capacity logic

The page calculates availability by comparing:

- selected `service_id`
- selected date + time
- existing booking `start_time`

Capacity is hardcoded by category:

- default max seats = `1`
- gym/fitness/entertainment/movie = `50`
- dining/catering = `20`

Then it computes:

- `available = maxSeats - bookedCount`

If availability is `0` or less:

- the slot button becomes disabled
- the slot is shown as fully booked

### Step 6: Confirm reservation

When the user confirms:

1. frontend checks if a token exists
2. if not, it redirects to login
3. if date/service/time are missing, it shows an alert
4. it builds:
   - `start_time`
   - `end_time` as exactly 3 hours later
5. it sends `POST /api/voyager/bookings`
6. if successful, it alerts and redirects to voyager dashboard

### Important behavior note

This is a request-and-approve workflow, not an instant confirmed reservation workflow.

The booking is initially created as:

- `Pending`

Only the admin can confirm it later.

## 16. Admin Dashboard In Detail

The admin dashboard lives in:

- `frontend/src/Admin/AdminDashboard.jsx`

It is the most complete admin-facing screen in the project.

### Initial data loading

On mount, it fetches in parallel:

- `GET /api/admin/stats`
- `GET /api/admin/bookings`
- `GET /api/admin/users`
- `GET /api/admin/facility-stats`
- `GET /api/public/cruises`

If the stats call returns `401` or `403`, it alerts that admin access is denied.

### Tabs

The dashboard has four tabs:

- `Overview`
- `Facilities & Locations`
- `Active Trips`
- `Registered Voyagers`

### Overview tab

Shows:

- count cards for users, cruises, and bookings
- a global reservations table

The reservations table displays:

- request ID
- reservation type
- facility/trip name
- voyager name
- requested time
- status
- action button

If a booking is `Pending`, the admin can click `Approve`.

That triggers:

- `PUT /api/admin/bookings/:id`

If successful, the page refreshes all dashboard data.

### Facilities & Locations tab

Shows a card per service using facility stats.

For each card the UI shows:

- total bookings
- confirmed count
- pending count
- remaining capacity
- progress bar

Important limitation:

The capacity number here is partly simulated in the frontend. The code assigns a mock `maxCapacity` based on category. So this screen is visually useful, but it is not backed by a real facility capacity model in the database.

### Active Trips tab

This tab has two responsibilities:

1. create new cruises
2. list existing cruises

The creation form collects:

- name
- route
- start date
- duration
- total seats
- price
- image name

Submitting it calls:

- `POST /api/admin/cruises`

Below that, the dashboard lists all active cruises in a table.

### Registered Voyagers tab

Shows voyager users in a table with:

- member ID
- full name
- contact email
- role
- registration date

Important issue:

The backend `User` model has `timestamps: false`, so `createdAt` is not available by default. The UI still tries to render:

- `new Date(u.createdAt).toLocaleDateString()`

That means the registration date column is unreliable and may render as `Invalid Date`.

## 17. Admin Inventory And Voyager Registration Pages

These pages exist, but they are not fully connected to backend persistence.

### Admin inventory page

Files:

- `frontend/src/Admin/Admin.jsx`
- `frontend/src/Admin/AddNewItem.jsx`
- `frontend/src/Admin/EditDeleteNewItem.jsx`

What happens:

- `Admin.jsx` keeps an `items` state
- `fetchItems()` currently just sets `items` to an empty array
- the add/edit/delete forms are mostly local placeholders
- alerts explicitly say persistence is not wired

Important conclusion:

Even though the backend supports real admin item CRUD for products and services, the current frontend inventory page is **not connected** to those APIs.

### Voyager registration page

File:

- `frontend/src/Admin/VoyagerRegistration.jsx`

What happens:

- it shows a form for username, email, and phone
- on submit, it only logs locally
- it shows an alert saying persistence is not wired
- it redirects to the home page

Important conclusion:

This page is a placeholder. Real voyager creation currently happens through the normal signup form, not through this admin registration screen.

## 18. Manager Pages

The manager pages are:

- `ViewBookedPartyHall.jsx`
- `ViewBookedBeautySalon.jsx`
- `ViewBookedResortandMovieTickets.jsx`
- `ViewBookedFitnessCentre.jsx`
- `ViewOrderedCateringItems.jsx`
- `ViewOrderedStationeryItems.jsx`

### What they do right now

Each page:

- creates local state
- runs a `useEffect`
- immediately sets the data list to `[]`
- turns loading off
- displays a `No ... found` message

There are no fetch calls and no backend integration.

So in the current codebase, these should be understood as:

- visual shells
- placeholders for future manager functionality

They do not participate in the live data flow of the app.

## 19. Database Schema Notes

The SQL schema dump in:

- `database/schema.sql`

shows additional tables like:

- `orders`
- `order_items`

This tells us the project likely intended to support:

- product ordering
- line-item based order tracking

However, the current Sequelize model layer and the connected frontend flows focus mostly on:

- users
- services
- cruises
- bookings
- products

There is currently a mismatch between:

- the schema's larger vision
- the actually wired application behavior

In other words, the database dump suggests the project was aiming for broader commerce functionality than the current running app exposes.

## 20. Seeding And Default Data

The seed script is:

- `backend/seed.js`

### What it inserts

If the relevant tables are empty, it creates:

- sample cruises
- sample services
- a default admin user

Default admin:

- email: `admin@cruise.com`
- password: `admin123`

### Seeded cruises

The sample cruises include:

- Mediterranean route
- Caribbean route
- Alaska route

### Seeded services

The sample services include:

- spa treatment
- fitness centre access
- party hall
- fine dining
- movie theater
- beauty salon

This seed data is what makes the dashboard and voyager experience feel populated during development.

## 21. What Is Actually Working Today

Here is the realistic current-state summary.

### Fully or mostly working

- landing page and navigation
- voyager signup
- login with JWT
- logout
- role-based redirect after login
- backend database connection
- Sequelize models and associations
- public cruise list API
- public services list API
- voyager booking creation
- voyager booking retrieval
- admin dashboard data loading
- admin booking approval
- admin cruise creation
- admin stats and facility metrics
- development-mode email preview on booking confirmation

### Partially working or presentational

- cruise cards on voyager dashboard
- facility capacity visualization in admin dashboard
- category-based booking pages
- public booking occupancy logic

These parts work visually, but some of the business logic is simplified or incomplete.

### Not wired or placeholder

- admin inventory page frontend
- admin-side voyager registration page
- all manager pages
- real product ordering flow
- order and order item management
- direct cruise reservation flow
- persisted manager role flow
- session restoration from local storage into top-level React auth state

## 22. End-To-End User Flows

### Flow A: New voyager joins and books a service

1. User opens `/`.
2. User clicks `Join`.
3. Signup form sends `POST /api/register`.
4. Backend creates a voyager-role user.
5. User logs in through `/admin/login`.
6. Login sends `POST /api/login`.
7. JWT token and user info are saved in `localStorage`.
8. User lands on `/voyager/dashboard`.
9. Dashboard fetches cruises, services, and personal bookings.
10. User selects a category page such as beauty or fitness.
11. Booking page fetches services and public booking occupancy.
12. User chooses a date.
13. User chooses a service and time slot.
14. Frontend posts to `POST /api/voyager/bookings`.
15. Backend creates a `Pending` booking.
16. User returns to the voyager dashboard and sees the request in personal itinerary.

### Flow B: Admin approves a booking

1. Admin logs in.
2. Admin lands on `/admin/dashboard`.
3. Dashboard fetches stats, bookings, users, facility stats, and cruises.
4. Admin opens the `Overview` tab.
5. Admin sees pending booking requests.
6. Admin clicks `Approve`.
7. Frontend sends `PUT /api/admin/bookings/:id` with `status = Confirmed`.
8. Backend updates the booking.
9. Backend attempts to send a test email to the voyager.
10. Frontend reloads dashboard data.
11. The voyager's booking status is now `Confirmed`.

### Flow C: Admin creates a new cruise

1. Admin opens the `Active Trips` tab.
2. Admin fills in trip details.
3. Frontend sends `POST /api/admin/cruises`.
4. Backend creates the cruise and sets `available_seats = total_seats`.
5. The trip appears in the admin cruise table.
6. The same trip later appears on the voyager dashboard via the public cruises API.

## 23. Important Technical Limitations And Gaps

These are useful to know if you are maintaining or extending the project.

### 1. Frontend auth state is not persistent

The app stores auth info in `localStorage`, but `loggedIn` is kept only in React state.

Effect:

- refresh can make the UI look logged out even when a valid token still exists

### 2. Cruise booking is presented but not truly implemented

Cruises are shown on the voyager dashboard, but the reserve button routes into the service reservation flow rather than creating a cruise booking.

### 3. Product ordering backend and frontend do not match

There is a `Product` model and product APIs, and the schema also contains orders-related tables. But the voyager-facing ordering screens are using `ServiceBookingTemplate`, not a cart/order flow.

### 4. Admin inventory UI is disconnected from backend CRUD

The backend supports item create/update/delete, but the frontend inventory pages still use placeholder local behavior.

### 5. Manager pages are not integrated

Routes exist, but there is no working manager data pipeline.

### 6. Admin user table expects `createdAt`, but timestamps are disabled

This makes the registration date display inaccurate.

### 7. Facility capacities are simulated in the frontend

The dashboard uses hardcoded category-based capacities instead of database-driven capacity records.

### 8. Public route duplication exists

`GET /api/public/bookings` is declared twice in the same route file.

### 9. Booking conflict prevention is lightweight

The frontend estimates slot occupancy by reading public bookings, but the backend does not enforce strong concurrency or conflict rules when creating a booking.

This means:

- two users could potentially submit the same slot near the same time
- the backend would still create both unless extra validation is added

## 24. Best Mental Model For Understanding The App

The easiest way to understand the whole system is this:

- the `frontend` is a role-based interface for browsing and requesting onboard experiences
- the `backend` is the source of truth for users, cruises, services, and bookings
- the most complete real workflow is `voyager requests booking -> admin confirms booking`
- several surrounding modules already exist as UI shells, but are not fully connected yet

So this is not yet a fully finished enterprise cruise management suite. It is better described as:

- a working reservation-oriented foundation
- plus several partially built admin and manager extensions

## 25. Suggested Next Improvements

If this app is going to be expanded, the most valuable next steps would be:

1. restore auth state from `localStorage` when the app loads
2. connect the admin inventory UI to the real admin CRUD endpoints
3. implement actual cruise reservation APIs and frontend flow
4. implement real product order flows using `orders` and `order_items`
5. add backend validation for booking conflicts and capacity
6. either complete the manager module or remove the placeholder routes
7. fix the admin voyager table's registration date column
8. remove duplicate route definitions in `public.js`

## 26. Short Summary

This app is a cruise reservation platform centered on voyagers and admins.

The main working journey is:

- voyager signs up
- voyager logs in
- voyager requests a service booking
- admin approves it
- backend updates status and sends a test notification email

Around that, the app also includes:

- public cruise and service browsing
- admin analytics
- cruise creation
- placeholder inventory and manager sections

That is the current reality of what the whole app is doing.
