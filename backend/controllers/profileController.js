// backend/controllers/profileController.js
const User = require('../models/User');

const updateProfile = async (req, res) => {
  // Log inicial para ver o que chega na rota
  console.log('[CONTROLLER LOG] Rota /api/auth/profile recebeu req.body:', req.body);

  // Validação básica se o corpo está vazio
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ success: false, message: 'Nenhum dado fornecido para atualização' });
  }

  // ----- CORREÇÃO PRINCIPAL -----
  // Adicione 'birth_date' à lista de campos permitidos!
  const allowedUpdates = ['name', 'phone', 'birth_date']; 
  const updates = {};

  // Filtra o req.body para conter apenas os campos permitidos
  for (const field in req.body) {
    // Verifica se o campo está na lista permitida E se foi enviado no body
    // Usamos req.body.hasOwnProperty(field) para garantir que o campo realmente veio na requisição
    if (allowedUpdates.includes(field) && req.body.hasOwnProperty(field)) { 
      updates[field] = req.body[field]; // Adiciona ao objeto 'updates'
    }
  }
  // ----- FIM DA CORREÇÃO -----

  // Verifica se sobrou algum campo válido após filtrar
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'Nenhum campo válido para atualização fornecido (verifique nomes dos campos)' });
  }

  // Log para ver o que será ENVIADO para o Model
  console.log('[CONTROLLER LOG] Objeto "updates" filtrado (enviando para User.updateProfile):', updates); 

  try {
    // Chama o método do Model passando o ID do usuário autenticado (req.user.id vindo do middleware)
    // e o objeto 'updates' que agora *inclui* birth_date se ele foi enviado e é permitido
    const updatedUser = await User.updateProfile(req.user.id, updates); 

    // Verifica se o Model retornou um usuário (pode retornar null se usuário não for encontrado)
    if (!updatedUser) {
      console.warn('[CONTROLLER LOG] User.updateProfile retornou null ou undefined.');
      return res.status(404).json({ success: false, message: 'Usuário não encontrado ou nenhum dado precisou ser alterado' });
    }

    // Sucesso! Retorna os dados atualizados
    res.json({
      success: true,
      data: updatedUser, // Retorna os dados completos atualizados pelo Model (que inclui birth_date)
      message: 'Perfil atualizado com sucesso'
    });

  } catch (error) {
    // Captura erros vindos do Model (ex: erro de DB, validação no Model como telefone inválido)
    console.error('[CONTROLLER LOG] Erro vindo do User.updateProfile:', error);
    // Retorna a mensagem de erro vinda do Model ou uma genérica
    res.status(500).json({ success: false, message: error.message || 'Erro interno ao atualizar perfil' });
  }
};

module.exports = { updateProfile };