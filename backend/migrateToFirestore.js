const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let firestoreInitialized = false;

// 1. Initialize Firebase Admin SDK
try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firestoreInitialized = true;
    console.log("🔥 Firebase Admin SDK initialized successfully via serviceAccountKey.json");
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
    firestoreInitialized = true;
    console.log("🔥 Firebase Admin SDK initialized successfully via environment variables");
  } else {
    console.error("❌ Error: Firebase credentials not found at backend/serviceAccountKey.json or env variables.");
    console.log("👉 Please download your serviceAccountKey.json from your Firebase Console and place it in the backend/ directory.");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization failed:", error);
  process.exit(1);
}

const db = admin.firestore();

// 2. Connect to Source Database (SQLite or Postgres)
let sequelizeSource;
const sqlitePath = path.join(__dirname, 'database.sqlite');

if (fs.existsSync(sqlitePath)) {
  console.log("📂 Local SQLite database found at backend/database.sqlite. Running SQLite migration.");
  sequelizeSource = new Sequelize({
    dialect: 'sqlite',
    storage: sqlitePath,
    logging: false
  });
} else if (process.env.DB_HOST && process.env.DB_USER) {
  console.log("🐘 Postgres database configuration found in .env. Running Postgres migration.");
  sequelizeSource = new Sequelize(
    process.env.DB_NAME || "cruisemanagement",
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
      port: process.env.DB_PORT || 5432,
      logging: false,
    }
  );
} else {
  console.error("❌ Source database (SQLite or Postgres) not found or not configured!");
  console.log("👉 Please ensure backend/database.sqlite exists or DB config is set in backend/.env.");
  process.exit(1);
}

// 3. Define Source Sequelize Models
const User = sequelizeSource.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING },
  phone: DataTypes.STRING,
  password: DataTypes.TEXT,
  role: DataTypes.STRING,
}, { tableName: "users", timestamps: false });

const Voyager = sequelizeSource.define("Voyager", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  user_id: DataTypes.INTEGER,
  passport_number: DataTypes.STRING,
  room_number: DataTypes.STRING,
}, { tableName: "voyagers", timestamps: false });

const Product = sequelizeSource.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  category: DataTypes.STRING,
  price: DataTypes.DECIMAL,
  stock: DataTypes.INTEGER,
}, { tableName: "products", timestamps: false });

const Service = sequelizeSource.define("Service", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  category: DataTypes.STRING,
  price: DataTypes.DECIMAL,
}, { tableName: "services", timestamps: false });

const Cruise = sequelizeSource.define("Cruise", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  ship_name: DataTypes.STRING,
  departure_port: DataTypes.STRING,
  destination: DataTypes.STRING,
  route: DataTypes.STRING,
  start_date: DataTypes.DATE,
  duration_days: DataTypes.INTEGER,
  total_seats: DataTypes.INTEGER,
  available_seats: DataTypes.INTEGER,
  price: DataTypes.DECIMAL,
  image_url: DataTypes.STRING,
}, { tableName: "cruises", timestamps: false });

const Booking = sequelizeSource.define("Booking", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  user_id: { type: DataTypes.INTEGER },
  service_id: { type: DataTypes.INTEGER },
  cruise_id: { type: DataTypes.INTEGER },
  start_time: DataTypes.DATE,
  end_time: DataTypes.DATE,
  status: DataTypes.STRING,
  group_type: DataTypes.STRING,
  passengers: DataTypes.INTEGER,
  cabin_type: DataTypes.STRING,
  rooms: DataTypes.INTEGER,
  special_requests: DataTypes.TEXT,
  total_price: DataTypes.DECIMAL,
}, { tableName: "bookings", timestamps: false });

const Order = sequelizeSource.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  user_id: DataTypes.INTEGER,
  total: DataTypes.DECIMAL,
  created_at: DataTypes.DATE,
}, { tableName: "orders", timestamps: false });

const OrderItem = sequelizeSource.define("OrderItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  order_id: DataTypes.INTEGER,
  product_id: DataTypes.INTEGER,
  quantity: DataTypes.INTEGER,
}, { tableName: "order_items", timestamps: false });

// 4. Migration Helper function
async function migrateTable(model, collectionName) {
  try {
    const records = await model.findAll({ raw: true });
    console.log(`\n🚚 Found ${records.length} records in source table "${collectionName}"...`);
    
    let count = 0;
    for (const record of records) {
      const data = {};
      for (const key of Object.keys(record)) {
        if (record[key] !== null && record[key] !== undefined) {
          // Convert date values to proper JS Date before writing so Firestore turns it to Timestamp
          if (key === 'start_date' || key === 'start_time' || key === 'end_time' || key === 'created_at') {
            data[key] = new Date(record[key]);
          } else {
            data[key] = record[key];
          }
        }
      }
      
      // Write document using ID as document path
      await db.collection(collectionName).doc(String(record.id)).set(data);
      count++;
    }
    console.log(`✅ Migrated ${count}/${records.length} documents to Firestore collection "${collectionName}" successfully.`);
  } catch (error) {
    console.error(`❌ Migration failed for collection "${collectionName}":`, error.message);
  }
}

// 5. Run Migration for all tables
async function runMigration() {
  console.log("🚢 Starting Ocean Serenity Cloud Firestore Migration Process...");
  
  try {
    await sequelizeSource.authenticate();
    console.log("✅ Successfully connected to source local database!");
  } catch (err) {
    console.error("❌ Failed to connect to source local database:", err.message);
    process.exit(1);
  }

  // Migrate each database table
  await migrateTable(User, 'users');
  await migrateTable(Voyager, 'voyagers');
  await migrateTable(Product, 'products');
  await migrateTable(Service, 'services');
  await migrateTable(Cruise, 'cruises');
  await migrateTable(Booking, 'bookings');
  await migrateTable(Order, 'orders');
  await migrateTable(OrderItem, 'order_items');

  console.log("\n🎉 Ocean Serenity Firestore Cloud Migration fully complete!");
  process.exit(0);
}

runMigration();
