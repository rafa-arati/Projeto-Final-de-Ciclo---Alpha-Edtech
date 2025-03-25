const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const passwordRoutes = require('./routes/passwordRoutes'); // Importe as novas rotas de recuperação de senha

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing de JSON e cookies
app.use(express.json()); // Equivalente ao body-parser.json()
app.use(cookieParser());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rotas da API
app.use('/api/auth', authRoutes); // Rotas de autenticação
app.use('/api', eventRoutes); // Rotas de eventos
app.use('/api/password', passwordRoutes); // Rotas de recuperação de senha

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

module.exports = app;