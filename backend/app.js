const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite requisições de diferentes origens (CORS)
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Rotas
app.use('/api/auth', authRoutes); // Rotas de autenticação

// Rota de teste
app.get('/', (req, res) => {
  res.send('Rota Cultural Backend is running!');
});

// Exporta o app para ser usado no server.js
module.exports = app;