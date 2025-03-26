const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing de JSON e cookies
app.use(express.json());
app.use(cookieParser());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api', eventRoutes);

// Rota de teste para a API
app.get('/api/test', (req, res) => {
  res.json({ message: 'Rota Cultural Backend is running!' });
});

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota "catch-all" para o SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(500).json({
    message: 'Ocorreu um erro no servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = app;