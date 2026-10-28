const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { connectDB } = require('./config/db');
const { seedDatabase } = require('./config/seed');
const Produce = require('./models/Produce');

const authRoutes = require('./routes/authRoutes');
const produceRoutes = require('./routes/produceRoutes');
const salesRoutes = require('./routes/salesRoutes');
const produceController = require('./controllers/produceController');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS for development (React dev server on port 3000)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (!req.path.match(/\.(js|css|woff|woff2|ico|png|svg)$/)) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
    }
  });
  next();
});

// Serve React production build (from frontend/dist)
const reactBuildDir = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(reactBuildDir));

// ===================== API Routes =====================
// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const count = await Produce.countDocuments();
    return res.status(200).json({
      status: 'healthy',
      database: 'MongoDB connected',
      dbName: require('mongoose').connection.name,
      produce_count: count,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/sales', salesRoutes);
app.get('/api/categories', produceController.getAllCategories);

// Catch-all for unknown API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint ${req.method} ${req.originalUrl} not found.` });
});

// For React Router: serve index.html for any non-API route
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(reactBuildDir, 'index.html'));
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ===================== Start Server =====================
async function startServer() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Seed initial data if database is empty
  await seedDatabase();

  // 3. Start Express
  app.listen(PORT, () => {
    console.log('');
    console.log('==============================================');
    console.log('  🌱 FarmHub MERN Stack Server Running!');
    console.log('==============================================');
    console.log(`  Web App:     http://localhost:${PORT}`);
    console.log(`  Health API:  http://localhost:${PORT}/api/health`);
    console.log(`  Produce API: http://localhost:${PORT}/api/produce`);
    console.log(`  Sales API:   http://localhost:${PORT}/api/sales`);
    console.log('==============================================');
    console.log('  Tech Stack: React + Bootstrap | Express | MongoDB');
    console.log('==============================================');
    console.log('');
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

module.exports = app;
