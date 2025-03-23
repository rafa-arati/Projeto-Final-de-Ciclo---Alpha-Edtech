const db = require('../config/db');
const { security } = require('../config/envConfig');

const resetPasswordLimiter = async (req, res, next) => {
  const ipAddress = req.ip;

  try {
    const result = await db.query(
      'SELECT * FROM reset_attempts WHERE ip_address = $1',
      [ipAddress]
    );

    const now = new Date();

    if (result.rows.length > 0) {
      const attempt = result.rows[0];
      const lastAttempt = new Date(attempt.last_attempt);
      const timeDiff = now - lastAttempt;

      if (timeDiff > security.resetRateLimitWindowMs) {
        await db.query(
          'UPDATE reset_attempts SET attempt_count = 1, last_attempt = NOW() WHERE ip_address = $1',
          [ipAddress]
        );
        return next();
      }

      if (attempt.attempt_count >= security.resetRateLimitMax) {
        const minutesRemaining = Math.ceil((security.resetRateLimitWindowMs - timeDiff) / 60000);
        return res.status(429).json({
          message: `Muitas requisições. Tente novamente em ${minutesRemaining} minutos.`
        });
      }

      await db.query(
        'UPDATE reset_attempts SET attempt_count = attempt_count + 1, last_attempt = NOW() WHERE ip_address = $1',
        [ipAddress]
      );
    } else {
      await db.query(
        'INSERT INTO reset_attempts (ip_address) VALUES ($1)',
        [ipAddress]
      );
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de requisições:', error);
    next();
  }
};

module.exports = { resetPasswordLimiter };