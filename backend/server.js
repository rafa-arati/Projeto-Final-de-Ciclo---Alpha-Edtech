const app = require('./app');
const http = require('http'); // Importa o módulo HTTP
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
require('dotenv').config();

dotenv.config();
const PORT = process.env.PORT || 3000;

// 1. Cria o servidor HTTP usando o app Express
const server = http.createServer(app);

// 2. Inicializa o Socket.IO anexado ao servidor HTTP
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://equipe01.alphaedtech.org.br", // Permite conexão do seu frontend
    methods: ["GET", "POST"]
  }
});

// 3. *** Lógica do Socket.IO (AGORA io está definido) ***
const userSockets = new Map(); // Mapeia userId para socketId

io.on('connection', (socket) => {
  console.log('Um usuário conectou via WebSocket:', socket.id);

  // Opcional: Autenticação do usuário no WebSocket
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usa o jwt importado
      const userId = decoded.id;
      userSockets.set(userId.toString(), socket.id); // Armazena a associação
      console.log(`Socket ${socket.id} autenticado para usuário ${userId}`);
      // Opcional: Colocar o socket em uma "sala" específica do usuário
      socket.join(userId.toString());
    } catch (error) {
      console.error('Falha na autenticação WebSocket:', error.message);
      socket.disconnect(); // Desconecta se o token for inválido
    }
  });


  socket.on('disconnect', () => {
    console.log('Usuário desconectou:', socket.id);
    // Remove o usuário do mapeamento ao desconectar
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`Removido mapeamento para usuário ${userId}`);
        break;
      }
    }
  });
});

// 4. Disponibiliza instâncias para os controllers (via app)
app.set('socketio', io);
app.set('userSockets', userSockets);

// 5. Inicia o servidor HTTP (que agora inclui o WebSocket)
server.listen(PORT, () => { // <<< IMPORTANTE: Usar server.listen, não app.listen
});