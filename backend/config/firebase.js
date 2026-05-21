const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;
let isMock = false;

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log("🔥 Firebase Admin SDK initialized successfully via serviceAccountKey.json");
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
    db = admin.firestore();
    console.log("🔥 Firebase Admin SDK initialized successfully via environment variables");
  } else {
    console.warn("⚠️ Firebase service account key not found at backend/serviceAccountKey.json. Activating in-memory Mock Firestore Database for testing.");
    isMock = true;
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK. Activating Mock Firestore Database for testing.", error);
  isMock = true;
}

module.exports = {
  db,
  isMock,
  admin
};
