const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const configurePassport = require('./config/passportConfig');
const db = require('./config/db');

// Routes imports
const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const eventRoutes = require('./routes/eventRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const qrCodeRoutes = require('./routes/qrCodeRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing of JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 // 1 hour
  }
}));

// Initialize and configure Passport
const configuredPassport = configurePassport();
app.use(configuredPassport.initialize());
app.use(configuredPassport.session());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api', eventRoutes);
app.use('/api', categoryRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/qrcode', qrCodeRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Rota Cultural Backend is running!' });
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// SPA catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Application error:', err.stack);
  res.status(500).json({
    message: 'Server error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

module.exports = app;