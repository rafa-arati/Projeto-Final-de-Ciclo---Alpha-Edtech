const User = require('../models/User');
const { generateToken, saveToken, verifyToken, removeToken } = require('../utils/tokenGenerator');
const { sendEmail } = require('../utils/emailSender');

/**
 * Controlador para solicitar recuperação de senha
 */
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório' });
  }

  try {
    const user = await User.findUserByEmail(email);

    if (!user) {
      return res.status(200).json({
        message: 'Se o email estiver cadastrado, você receberá um link de recuperação.'
      });
    }

    const token = generateToken();
    await saveToken(user.id, token);

    const baseUrl = process.env.FRONTEND_URL || 'http://seusite.com';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const subject = 'Recuperação de Senha';
    const text = `Olá,
    
    Recebemos uma solicitação para redefinir sua senha. Se você não fez essa solicitação, ignore este email.
    
    Para redefinir sua senha, clique no link abaixo:
    ${resetLink}
    
    O link expira em ${process.env.TOKEN_EXPIRY_HOURS || 1} hora(s).
    
    Atenciosamente,
    Equipe de Suporte`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Recuperação de Senha</h2>
      <p>Olá,</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Se você não fez essa solicitação, ignore este email.</p>
      <p>Para redefinir sua senha, clique no botão abaixo:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Redefinir Senha
        </a>
      </div>
      <p>Ou use este link: <a href="${resetLink}">${resetLink}</a></p>
      <p>O link expira em ${process.env.TOKEN_EXPIRY_HOURS || 1} hora(s).</p>
      <p>Atenciosamente,<br>Equipe de Suporte</p>
    </div>`;

    await sendEmail(email, subject, text, html);

    res.status(200).json({
      message: 'Se o email estiver cadastrado, você receberá um link de recuperação.'
    });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({ message: 'Erro ao processar a solicitação' });
  }
};

/**
 * Controlador para validar o token de recuperação
 */
const validateResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    const tokenData = await verifyToken(token);

    if (!tokenData) {
      return res.status(400).json({ valid: false, message: 'Token inválido ou expirado' });
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ valid: false, message: 'Erro ao processar a solicitação' });
  }
};

/**
 * Controlador para redefinir a senha
 */
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'A senha deve ter pelo menos 8 caracteres' });
  }

  try {
    const tokenData = await verifyToken(token);

    if (!tokenData) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    await User.updatePassword(tokenData.user_id, newPassword);
    await removeToken(tokenData.id);

    res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro ao processar a solicitação' });
  }
};

module.exports = {
  requestPasswordReset,
  validateResetToken,
  resetPassword,
};