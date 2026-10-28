const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farm_produce_db';

  try {
    // First, try connecting to the configured URI (local or Atlas)
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`[MongoDB] Connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
    return;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to "${mongoUri}": ${err.message}`);
  }

  // Fallback: Use embedded in-memory MongoDB server (no install needed)
  try {
    console.log('[MongoDB] Starting embedded MongoDB server (mongodb-memory-server)...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = new MongoMemoryServer({
      instance: { dbName: 'farm_produce_db' },
    });
    await mongod.start();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log(`[MongoDB] Embedded server running at ${memUri}`);
    console.log('[MongoDB] Note: Data lives in memory. It resets when the server stops.');
    return;
  } catch (memErr) {
    console.error('[MongoDB] Embedded server also failed:', memErr.message);
    console.error('[MongoDB] Please install MongoDB Community Server: https://www.mongodb.com/try/download/community');
    process.exit(1);
  }
}

module.exports = { connectDB };
