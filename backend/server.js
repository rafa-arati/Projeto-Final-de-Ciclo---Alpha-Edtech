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

// No início do seu arquivo server.js ou app.js
console.log('Variáveis de ambiente AWS:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Definido' : 'Não definido');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Definido' : 'Não definido');