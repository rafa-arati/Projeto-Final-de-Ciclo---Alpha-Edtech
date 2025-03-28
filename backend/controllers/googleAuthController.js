const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

// Função para lidar com o callback do Google após autenticação bem-sucedida
const googleAuthCallback = async (req, res) => {
  try {
    // Verifica se o usuário foi autenticado pelo Passport
    if (!req.user) {
      return res.redirect('/#login?error=auth_failed');
    }

    // Gera o token JWT para o usuário
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Configuração do cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    // Verifica se o usuário já completou o onboarding
    if (!req.user.onboarding_completed) {
      // Redireciona para a página de onboarding com ID do usuário
      return res.redirect(`/#onboarding?userId=${req.user.id}`);
    }

    // Redireciona para a events
    res.redirect('/#events');
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    res.redirect('/#login?error=server_error');
  }
};

// Função para completar o onboarding do usuário (preencher informações adicionais)
const completeOnboarding = async (req, res) => {
  const { userId, gender, birth_date } = req.body;

  // Validações básicas
  if (!userId || !gender || !birth_date) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  try {
    // Atualiza as informações do usuário e marca onboarding como completo
    const updatedUser = await User.completeOnboarding(userId, {
      gender,
      birth_date
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Retorna sucesso com dados do usuário
    res.status(200).json({
      message: 'Cadastro completo com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        photo_url: updatedUser.photo_url,
        onboarding_completed: updatedUser.onboarding_completed
      }
    });
  } catch (error) {
    console.error('Erro ao completar onboarding:', error);
    res.status(500).json({ message: 'Erro ao processar a solicitação' });
  }
};

module.exports = {
  googleAuthCallback,
  completeOnboarding
};