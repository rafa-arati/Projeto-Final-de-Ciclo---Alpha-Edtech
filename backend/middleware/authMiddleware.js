const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware para verificar o token JWT
const authenticate = (req, res, next) => {
    // Pegar o token do cookie
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado: Nenhum token fornecido' });
    }

    try {
        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adicionar o objeto do usuário à requisição para uso posterior
        req.user = decoded;

        next(); // Continue para o próximo middleware/controller
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return res.status(401).json({ message: 'Não autorizado: Token inválido' });
    }
};

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Continue para o próximo middleware/controller
    } else {
        return res.status(403).json({ message: 'Acesso negado: Requer permissão de administrador' });
    }
};

module.exports = { authenticate, isAdmin };