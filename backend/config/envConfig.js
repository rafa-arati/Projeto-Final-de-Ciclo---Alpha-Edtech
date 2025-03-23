require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },
  security: {
    tokenExpiryHours: parseInt(process.env.TOKEN_EXPIRY_HOURS) || 1,
    resetRateLimitWindowMs: parseInt(process.env.RESET_RATE_LIMIT_WINDOW_MS) || 3600000, // 1 hora
    resetRateLimitMax: parseInt(process.env.RESET_RATE_LIMIT_MAX) || 5,
    passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10,
  },
};