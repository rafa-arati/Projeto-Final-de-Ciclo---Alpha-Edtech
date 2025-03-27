const app = require('./app');
const dotenv = require('dotenv');
require('dotenv').config();

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});