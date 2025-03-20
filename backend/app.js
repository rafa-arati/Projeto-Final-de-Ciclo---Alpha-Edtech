const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path'); // Adicione este módulo para lidar com caminhos
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o Express
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
app.use('/api/auth', authRoutes); // Rotas de autenticação
app.use('/api', eventRoutes); // Registra as rotas de eventos

// Rota de teste para a API
app.get('/api/test', (req, res) => {
  res.json({ message: 'Rota Cultural Backend is running!' });
});

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota "catch-all" para o SPA (Single Page Application)
// Redireciona qualquer requisição não tratada pelas rotas acima para o index.html
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

// Exporta o app para ser usado no server.js
module.exports = app;