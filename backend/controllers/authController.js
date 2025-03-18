const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Função para registrar um novo usuário
const register = async (req, res) => {
  const { name, email, password, gender, birth_date } = req.body;

  try {
    // Verifica se o usuário já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Converte a data de DD-MM-YYYY para YYYY-MM-DD
    const [day, month, year] = birth_date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    // Cria o usuário com a data formatada
    const newUser = await User.create({
      name,
      email,
      password, // Passa a senha diretamente (não o hash)
      gender,
      birth_date: formattedDate,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
};

// Função para fazer login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Email ou senha incorretos' });
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Email ou senha incorretos' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
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

    // Resposta de sucesso
    res.status(200).json({ message: 'Login bem-sucedido', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

// Função para fazer logout
const logout = (req, res) => {
  // Limpa o cookie do token
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout bem-sucedido' });
};

module.exports = { register, login, logout };