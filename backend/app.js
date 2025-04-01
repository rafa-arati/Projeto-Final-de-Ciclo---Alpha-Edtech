const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const configurePassport = require('./config/passportConfig');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const eventRoutes = require('./routes/eventRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const swaggerUi = require('swagger-ui-express');
const { readFileSync } = require('fs');
const YAML = require('yaml');

// 1. Carregar variáveis de ambiente PRIMEIRO
dotenv.config();

// 2. Inicializar o app Express
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Configurar middlewares básicos
app.use(express.json());
app.use(cookieParser());

// 4. Configurar sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000
  }
}));

// 5. Configurar Passport
const configuredPassport = configurePassport();
app.use(configuredPassport.initialize());
app.use(configuredPassport.session());

// 6. Configurar Swagger
const swaggerDocument = YAML.parse(
  readFileSync(path.join(__dirname, 'swagger', 'swagger.yaml'), 'utf8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 7. Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 8. Configurar rotas
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api', eventRoutes);
app.use('/api/password', passwordRoutes);

// 9. Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Rota Cultural Backend is running!' });
});

// 10. Arquivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// 11. Rota catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 12. Middleware de erro (DEVE ser o último)
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(500).json({
    message: 'Ocorreu um erro no servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 13. Iniciar servidor (no server.js)
module.exports = app;