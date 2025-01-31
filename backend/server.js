const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');

require('dotenv').config();

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for logging
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'app.log'),
  { flags: 'a' }
);

// Middleware
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Console logging

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

// Test database connection and sync models
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await db.sequelize.sync({ force: false });
    console.log('Database synced successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to connect to the database or sync models:', err);
    process.exit(1);
  }
};

startServer();
