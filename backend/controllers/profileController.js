const User = require('../models/User');

const updateProfile = async (req, res) => {
  // Validação básica dos dados de entrada
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Nenhum dado fornecido para atualização'
    });
  }

  // Filtra apenas os campos permitidos para atualização
  const allowedUpdates = ['name', 'phone'];
  const updates = {};

  for (const field in req.body) {
    if (allowedUpdates.includes(field)) {
      updates[field] = req.body[field];
    }
  }

  // Verifica se sobrou algum campo válido após filtrar
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Nenhum campo válido para atualização'
    });
  }

  try {
    const updatedUser = await User.updateProfile(req.user.id, updates);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: 'Perfil atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);

    // Mensagem mais específica para o cliente
    const errorMessage = error.message.includes('Número inválido')
      ? error.message
      : 'Erro ao atualizar perfil';

    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

module.exports = { updateProfile };