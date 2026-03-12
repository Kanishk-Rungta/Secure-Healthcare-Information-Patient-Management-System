const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Using NodeJS below')) return;
    originalWarn(...args);
};
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Pre-load all models to avoid lazy-loading issues and buffering timeouts in middleware
require('../models/User');
require('../models/Patient');
require('../models/AuditLog');
require('../models/MedicalRecord');
require('../models/Consent');
require('../models/Complaint');

let mongoServer;

// Increase timeout for MongoDB Memory Server download/startup
jest.setTimeout(60000);

beforeAll(async () => {
    // Prevent mongoose from leaking memory
    mongoose.set('strictQuery', true);

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clear all data between tests
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
});
