const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Verifique se as variáveis de ambiente estão sendo carregadas corretamente
// Se as variáveis de ambiente não estiverem definidas, use os valores padrão
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