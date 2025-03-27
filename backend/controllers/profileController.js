const User = require('../models/User');

const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.updateProfile(req.user.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
};

module.exports = { updateProfile };