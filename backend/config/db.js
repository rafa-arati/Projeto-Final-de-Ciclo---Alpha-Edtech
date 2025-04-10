const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();


// Se as variáveis de ambiente não estiverem definidas, use os valores padrão
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
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