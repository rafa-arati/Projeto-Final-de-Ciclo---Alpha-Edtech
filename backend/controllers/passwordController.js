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

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000/';
    const resetLink = `${baseUrl}#reset-password?token=${token}`;

    const subject = 'Rota Cultural - Recuperação de Senha';
    const text = `Olá,
    
    Recebemos uma solicitação para redefinir sua senha no Rota Cultural. Se você não fez essa solicitação, ignore este email.

    Para redefinir sua senha, clique no link abaixo:
    ${resetLink}

    O link expira em ${process.env.TOKEN_EXPIRY_HOURS || 1} hora(s).

    Atenciosamente,
    Equipe Rota Cultural`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinição de Senha - Rota Cultural</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(45deg, #439DFE, #8000FF); padding: 30px 20px; text-align: center; color: white;">
                <div style="font-weight: bold; font-size: 32px; letter-spacing: 2px; margin-bottom: 10px;">
                    <span style="color: #fff;">R</span>OTA<span style="color: #8000FF;">CULTURAL</span>
                </div>
                <h1 style="margin: 10px 0; font-size: 24px;">Recuperação de Senha</h1>
            </div>

            <div style="padding: 30px;">
                <p>Olá,</p>
                <p>Recebemos uma solicitação para redefinir sua senha no <strong>Rota Cultural</strong>.</p>
                <p>Para continuar explorando os melhores eventos culturais da cidade, clique no botão abaixo para criar uma nova senha:</p>

                <div style="text-align: center; margin: 25px 0;">
                    <a href="${resetLink}" style="display: inline-block; background: linear-gradient(45deg, #439DFE, #8000FF); color: white; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold;">
                        REDEFINIR MINHA SENHA
                    </a>
                </div>
                
                <p>Ou use este link: <a href="${resetLink}" style="color: #439DFE; text-decoration: underline;">${resetLink}</a></p>
                
                <p>Este link expirará em ${process.env.TOKEN_EXPIRY_HOURS || 1} hora(s) por questões de segurança.</p>
                
                <p>Se você não solicitou esta redefinição, pode ignorar este email com segurança e sua senha permanecerá a mesma.</p>
                
                <p>Estamos ansiosos para te ajudar a descobrir os próximos eventos culturais da sua cidade!</p>
                
                <p>Atenciosamente,<br>
                Equipe Rota Cultural</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666666;">
                <p style="margin: 5px 0;">© ${new Date().getFullYear()} Rota Cultural - Todos os direitos reservados</p>
                <div style="margin: 15px 0;">
                    <span>Facebook</span> |
                    <span>Instagram</span> |
                    <span>Twitter</span>
                </div>
                <p style="margin: 5px 0;">Se precisar de ajuda, entre em contato: <a href="mailto:suporte@rotacultural.com" style="color: #439DFE;">suporte@rotacultural.com</a></p>
            </div>
        </div>
    </body>
    </html>`;

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