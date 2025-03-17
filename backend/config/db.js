const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Verifique se as variáveis de ambiente estão sendo carregadas corretamente
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("User:", process.env.DB_USER);
console.log("Password:", process.env.DB_PASSWORD); // Verifique a senha aqui
console.log("Database:", process.env.DB_NAME);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;