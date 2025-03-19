const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Verifique se as variáveis de ambiente estão sendo carregadas corretamente
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("User:", process.env.DB_USER);
console.log("Password:", process.env.DB_PASSWORD ? "[DEFINIDO]" : "undefined"); // Não mostre a senha completa
console.log("Database:", process.env.DB_NAME);

// Se as variáveis de ambiente não estiverem definidas, use os valores padrão
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Verificação adicional de segurança
if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  console.error("ERRO: Variáveis de ambiente de banco de dados não configuradas corretamente!");
  console.error("Verifique se o arquivo .env existe e está configurado.");
}

const pool = new Pool(dbConfig);

// Teste de conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
  }
});

module.exports = pool;