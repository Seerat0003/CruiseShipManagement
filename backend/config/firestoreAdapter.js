const { db, isMock: firebaseIsMock } = require("./firebase");
const { Op } = require("sequelize");

// Determine if we are in Mock mode
const isMock = firebaseIsMock || process.env.NODE_ENV === "test";

// In-Memory Database store
const inMemoryStore = {
  users: [],
  voyagers: [],
  products: [],
  services: [],
  bookings: [],
  orders: [],
  order_items: [],
  cruises: []
};

// Relation association mappings
const associations = {};

// Helper to map Sequelize Model Name to table/collection name
function getCollectionName(modelName) {
  const mapping = {
    'User': 'users',
    'Voyager': 'voyagers',
    'Product': 'products',
    'Service': 'services',
    'Booking': 'bookings',
    'Order': 'orders',
    'OrderItem': 'order_items',
    'Cruise': 'cruises'
  };
  return mapping[modelName] || (modelName.toLowerCase() + 's');
}

// Preseed local in-memory store for interactive runs
function preseedInMemoryStore() {
  // Clear
  for (const key of Object.keys(inMemoryStore)) {
    inMemoryStore[key] = [];
  }

  // Cruises
  inMemoryStore.cruises = [
    { id: 1, name: "Mediterranean Voyage", route: "Rome -> Athens -> Istanbul", start_date: "2026-06-15", duration_days: 7, total_seats: 500, available_seats: 420, price: 1200, image_url: "med_cruise.png" },
    { id: 2, name: "Caribbean Sunset", route: "Miami -> Bahamas -> Jamaica", start_date: "2026-07-02", duration_days: 5, total_seats: 800, available_seats: 150, price: 950, image_url: "carib_cruise.png" },
    { id: 3, name: "Alaskan Glacier Explore", route: "Seattle -> Juneau -> Glacier Bay", start_date: "2026-08-10", duration_days: 10, total_seats: 300, available_seats: 50, price: 2100, image_url: "alaska_cruise.png" }
  ];

  // Services
  inMemoryStore.services = [
    { id: 1, name: "Luxury Spa Treatment", category: "Spa", price: 150 },
    { id: 2, name: "Fitness Centre Access", category: "Gym", price: 50 },
    { id: 3, name: "Grand Deck Party Hall", category: "Party", price: 500 },
    { id: 4, name: "Oceanview Fine Dining", category: "Dining", price: 90 },
    { id: 5, name: "Onboard Movie Theater", category: "Entertainment", price: 20 },
    { id: 6, name: "Premium Beauty Salon", category: "Beauty", price: 80 },
    { id: 7, name: "Elite Gift Boutique", category: "Gifts", price: 100 },
    { id: 8, name: "Premium Gear Rental Package", category: "Retail", price: 75 },
    { id: 9, name: "Luxury Brand Retail", category: "Retail", price: 300 },
    { id: 10, name: "In-Cabin Catering Service", category: "Catering", price: 50 }
  ];

  // Products
  inMemoryStore.products = [
    { id: 1, name: "Pan-Seared Wagyu Filet Mignon", category: "Dining", price: 120.00, stock: 50 },
    { id: 2, name: "Beluga Caviar & Blinis", category: "Catering", price: 250.00, stock: 25 },
    { id: 3, name: "Atlantic Lobster Tail with Garlic Butter", category: "Dining", price: 85.00, stock: 60 },
    { id: 4, name: "Valrhona Chocolate Soufflé", category: "Desserts", price: 25.00, stock: 100 },
    { id: 5, name: "Chilled Dom Pérignon Champagne", category: "Catering", price: 180.00, stock: 40 },
    { id: 6, name: "Truffle Mushroom Bruschetta", category: "Starter", price: 18.00, stock: 120 },
    { id: 7, name: "SOLAS Marine Certified Life Jacket", category: "Safety Equipment", price: 45.00, stock: 300 },
    { id: 8, name: "Emergency LED Marine Flare Kit", category: "Safety Equipment", price: 85.00, stock: 50 },
    { id: 9, name: "Luxury Teak Wood Poolside Deck Lounger", category: "Cabin Furniture", price: 280.00, stock: 40 },
    { id: 10, name: "Ergonomic Handcrafted Leather Lounge Armchair", category: "Cabin Furniture", price: 450.00, stock: 15 },
    { id: 11, name: "Bespoke Commercial Espresso Craft Machine", category: "Galley Gear", price: 1200.00, stock: 8 },
    { id: 12, name: "Dual-Zone Thermoelectric Wine Cellar Cooler", category: "Galley Gear", price: 650.00, stock: 12 },
    { id: 13, name: "High-Precision Maritime Deck Binoculars", category: "Recreation Gear", price: 180.00, stock: 25 },
    { id: 14, name: "Hydro-Premium Snorkeling Fin & Mask Kit", category: "Recreation Gear", price: 95.00, stock: 60 },
    { id: 15, name: "Ocean Serenity Heavy Yacht Canvas Tote Bag", category: "Boutique Merchandise", price: 55.00, stock: 120 }
  ];

  // Default Admin User
  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("admin123", salt);
  inMemoryStore.users = [
    { id: 1, name: "Super Admin", email: "admin@cruise.com", password: hashedPassword, role: "admin" }
  ];
}

// Initial preseed for local runs (unless testing which clears database setup anyway)
if (process.env.NODE_ENV !== "test") {
  preseedInMemoryStore();
}

// Match function to emulate Sequelize's where filtering
function matchesWhere(item, where) {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const filterVal = where[key];
    if (filterVal && typeof filterVal === 'object' && !Array.isArray(filterVal)) {
      // Check for Op symbols like [Op.ne] or [Op.like] etc
      const symbols = Object.getOwnPropertySymbols(filterVal);
      if (symbols.length > 0) {
        for (const sym of symbols) {
          if (sym.toString().includes('ne')) {
            if (item[key] === filterVal[sym]) return false;
          }
        }
      } else {
        if (item[key] !== filterVal) return false;
      }
    } else {
      if (item[key] != filterVal) return false;
    }
  }
  return true;
}

// Custom Model class emulating a Sequelize model
class CustomModel {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  // Save changes to DB
  async save() {
    const collectionName = getCollectionName(this.constructor.modelName);
    
    // Normalize data object fields
    const data = { ...this };
    delete data.constructor;
    
    // Remote association fields should not be saved in DB
    const assocs = associations[this.constructor.modelName] || [];
    for (const assoc of assocs) {
      delete data[assoc.targetName];
      delete data[assoc.targetName + 's'];
    }

    if (isMock) {
      const list = inMemoryStore[collectionName];
      const index = list.findIndex(item => item.id === this.id);
      if (index !== -1) {
        list[index] = data;
      } else {
        list.push(data);
      }
    } else {
      await db.collection(collectionName).doc(String(this.id)).set(data);
    }
    return this;
  }

  // Update specific fields
  async update(newData = {}) {
    Object.assign(this, newData);
    return this.save();
  }

  // Delete this record
  async destroy() {
    const collectionName = getCollectionName(this.constructor.modelName);
    if (isMock) {
      const list = inMemoryStore[collectionName];
      const index = list.findIndex(item => item.id === this.id);
      if (index !== -1) {
        list.splice(index, 1);
      }
    } else {
      await db.collection(collectionName).doc(String(this.id)).delete();
    }
    return this;
  }

  // Static relation bindings
  static hasOne(targetModel, options = {}) {
    const sourceName = this.modelName;
    const targetName = targetModel.modelName;
    associations[sourceName] = associations[sourceName] || [];
    associations[sourceName].push({
      type: 'hasOne',
      targetModel,
      targetName,
      foreignKey: options.foreignKey || (sourceName.toLowerCase() + '_id')
    });
  }

  static belongsTo(targetModel, options = {}) {
    const sourceName = this.modelName;
    const targetName = targetModel.modelName;
    associations[sourceName] = associations[sourceName] || [];
    associations[sourceName].push({
      type: 'belongsTo',
      targetModel,
      targetName,
      foreignKey: options.foreignKey || (targetName.toLowerCase() + '_id')
    });
  }

  static hasMany(targetModel, options = {}) {
    const sourceName = this.modelName;
    const targetName = targetModel.modelName;
    associations[sourceName] = associations[sourceName] || [];
    associations[sourceName].push({
      type: 'hasMany',
      targetModel,
      targetName,
      foreignKey: options.foreignKey || (sourceName.toLowerCase() + '_id')
    });
  }

  // Static sync
  static async sync() {
    return Promise.resolve();
  }

  // Create single record
  static async create(data = {}) {
    const collectionName = getCollectionName(this.modelName);
    let nextId = 1;

    if (isMock) {
      const list = inMemoryStore[collectionName];
      if (list.length > 0) {
        const ids = list.map(item => Number(item.id)).filter(id => !isNaN(id));
        if (ids.length > 0) {
          nextId = Math.max(...ids) + 1;
        }
      }
    } else {
      const snapshot = await db.collection(collectionName).get();
      let maxId = 0;
      snapshot.forEach(doc => {
        const id = parseInt(doc.id, 10);
        if (!isNaN(id) && id > maxId) {
          maxId = id;
        }
      });
      nextId = maxId + 1;
    }

    const item = { id: nextId, ...data };
    const instance = new this(item);
    await instance.save();
    return instance;
  }

  // Bulk create records
  static async bulkCreate(records = []) {
    const instances = [];
    for (const record of records) {
      const instance = await this.create(record);
      instances.push(instance);
    }
    return instances;
  }

  // Find all records matching criteria
  static async findAll(options = {}) {
    const collectionName = getCollectionName(this.modelName);
    let rawData = [];

    if (isMock) {
      rawData = JSON.parse(JSON.stringify(inMemoryStore[collectionName]));
    } else {
      const snapshot = await db.collection(collectionName).get();
      snapshot.forEach(doc => {
        const docData = doc.data();
        // Convert timestamp dates if any
        for (const k of Object.keys(docData)) {
          if (docData[k] && typeof docData[k] === 'object' && docData[k]._seconds !== undefined) {
            docData[k] = new Date(docData[k]._seconds * 1000);
          }
        }
        rawData.push({ id: Number(doc.id) || doc.id, ...docData });
      });
    }

    // Filter
    let filtered = rawData.filter(item => matchesWhere(item, options.where));

    // Sort order
    if (options.order) {
      for (const [key, dir] of options.order) {
        filtered.sort((a, b) => {
          let valA = a[key];
          let valB = b[key];
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          if (typeof valA === 'string') {
            return dir.toUpperCase() === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
          return dir.toUpperCase() === 'ASC' ? valA - valB : valB - valA;
        });
      }
    }

    // Offset/Limit
    if (options.offset) {
      filtered = filtered.slice(options.offset);
    }
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    // Wrap in Model instances
    let instances = filtered.map(item => new this(item));

    // Filter attributes if specified (e.g. options.attributes)
    if (options.attributes && Array.isArray(options.attributes)) {
      for (const instance of instances) {
        for (const key of Object.keys(instance)) {
          if (!options.attributes.includes(key)) {
            delete instance[key];
          }
        }
      }
    }

    // Resolve inclusions
    if (options.include) {
      for (const instance of instances) {
        for (const incl of options.include) {
          const targetModel = incl.model || incl;
          const targetName = targetModel.modelName;
          const assoc = (associations[this.modelName] || []).find(a => a.targetName === targetName);
          
          if (assoc) {
            if (assoc.type === 'belongsTo') {
              const fkValue = instance[assoc.foreignKey];
              if (fkValue) {
                instance[targetName] = await targetModel.findByPk(fkValue);
              } else {
                instance[targetName] = null;
              }
            } else if (assoc.type === 'hasOne') {
              const related = await targetModel.findOne({ where: { [assoc.foreignKey]: instance.id } });
              instance[targetName] = related;
            } else if (assoc.type === 'hasMany') {
              const relateds = await targetModel.findAll({ where: { [assoc.foreignKey]: instance.id } });
              instance[targetName + 's'] = relateds;
            }
          }
        }
      }
    }

    return instances;
  }

  // Find one record
  static async findOne(options = {}) {
    const list = await this.findAll(options);
    return list[0] || null;
  }

  // Find record by primary key (id)
  static async findByPk(id, options = {}) {
    if (id === null || id === undefined) return null;
    const where = { id: Number(id) || id };
    const list = await this.findAll({ ...options, where });
    return list[0] || null;
  }

  // Count records matching criteria
  static async count(options = {}) {
    const list = await this.findAll(options);
    return list.length;
  }

  // Destroy multiple records matching criteria
  static async destroy(options = {}) {
    const list = await this.findAll(options);
    for (const inst of list) {
      await inst.destroy();
    }
    return list.length;
  }
}

// Sequelize compatibility mock instance
const sequelizeMock = {
  define(modelName, attributes, options = {}) {
    const ModelSubclass = class extends CustomModel {};
    ModelSubclass.modelName = modelName;
    ModelSubclass.attributes = attributes;
    ModelSubclass.options = options;
    return ModelSubclass;
  },

  async authenticate() {
    console.log(isMock ? "🕶️ Mock in-memory database connected" : "🔥 Cloud Firestore connected");
    return Promise.resolve();
  },

  async sync(options = {}) {
    if (options.force) {
      console.log("♻️ Force syncing database: Resetting mock in-memory collections");
      for (const key of Object.keys(inMemoryStore)) {
        inMemoryStore[key] = [];
      }
    }
    return Promise.resolve();
  },

  async close() {
    return Promise.resolve();
  }
};

module.exports = {
  sequelizeMock,
  isMock,
  inMemoryStore,
  preseedInMemoryStore
};
