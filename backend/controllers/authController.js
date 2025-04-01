const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Função para registrar um novo usuário
const register = async (req, res) => {
  const { name, email, password, gender, birth_date, username } = req.body;

  console.log("Recebida solicitação de registro:", {
    name,
    email,
    passwordProvided: !!password,
    gender,
    birth_date,
    username
  });

  try {
    // Verifica se o usuário já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log("Email já cadastrado:", email);
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Verifica se o username já existe (se fornecido)
    if (username) {
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        console.log("Username já cadastrado:", username);
        return res.status(400).json({ message: 'Nome de usuário já cadastrado' });
      }
    }

    // Converte a data de DD-MM-YYYY para YYYY-MM-DD
    const [day, month, year] = birth_date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    console.log("Data formatada:", formattedDate);

    // Cria o usuário com a data formatada
    const newUser = await User.create({
      name,
      email,
      password, // Passa a senha diretamente (não o hash)
      gender,
      birth_date: formattedDate, // Usa a data formatada
      username
    });

    console.log("Usuário criado com sucesso:", {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário: ' + error.message });
  }
};

// Função para fazer login
const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Tentativa de login:", {
    identifier: email,
    isEmail: email && email.includes('@'),
    passwordProvided: !!password
  });

  try {
    // Verifica se é email ou username
    const isEmail = email && email.includes('@');

    // Busca o usuário pelo email ou username
    let user;
    if (isEmail) {
      user = await User.findByEmail(email);
    } else {
      // Se não parece ser email, tenta buscar como username
      user = await User.findByUsername(email);

      // Se não encontrou como username, tenta como email mesmo
      // (para compatibilidade, caso o usuário insira um email sem @)
      if (!user) {
        console.log("Usuário não encontrado por username, tentando como email");
        user = await User.findByEmail(email);
      }
    }

    if (!user) {
      console.log("Usuário não encontrado");
      return res.status(400).json({ message: 'Email/Usuário ou senha incorretos' });
    }

    console.log("Usuário encontrado:", {
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Verifica se a senha está correta
    console.log("Verificando senha...");
    console.log("Hash armazenado:", user.password_hash ? "Hash existe" : "Hash não existe");

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log("Verificação de senha:", isPasswordValid ? "Senha correta" : "Senha incorreta");

    if (!isPasswordValid) {
      console.log("Senha incorreta");
      return res.status(400).json({ message: 'Email/Usuário ou senha incorretos' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    // Envia o token como um cookie seguro
    res.cookie('token', token, {
      httpOnly: true, // O cookie só pode ser acessado pelo servidor
      secure: process.env.NODE_ENV === 'production', // Cookie só é enviado em HTTPS em produção
      sameSite: 'strict', // Protege contra ataques CSRF
      maxAge: 3600000, // Expira em 1 hora (em milissegundos)
    });

    console.log("Login bem-sucedido, token gerado");

    // Resposta de sucesso
    res.status(200).json({
      message: 'Login bem-sucedido',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

// Função para fazer logout
const logout = (req, res) => {
  // Limpa o cookie do token
  res.clearCookie('token');
  console.log("Logout realizado");
  res.status(200).json({ message: 'Logout bem-sucedido' });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // req.user.id vem do JWT
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      birth_date: user.birth_date,
      // outros campos necessários...
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
  }
};

module.exports = { register, login, logout, getCurrentUser };