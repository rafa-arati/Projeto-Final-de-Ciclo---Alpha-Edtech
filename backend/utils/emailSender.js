const nodemailer = require('nodemailer');
const { email } = require('../config/envConfig');

const transporter = nodemailer.createTransport({
  host: email.host,
  port: email.port,
  secure: email.port === 465, // true para 465, false para outros portas
  auth: {
    user: email.user,
    pass: email.pass,
  },
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"Recuperação de Senha" <${email.from}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email enviado: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

module.exports = { sendEmail };