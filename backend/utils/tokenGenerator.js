const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { security } = require('../config/envConfig');

const generateToken = () => {
  return uuidv4();
};

const saveToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + security.tokenExpiryHours);

  await db.query(
    'DELETE FROM password_reset_tokens WHERE user_id = $1',
    [userId]
  );

  const query = `
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  return await db.query(query, [userId, token, expiresAt]);
};

const verifyToken = async (token) => {
  const result = await db.query(
    'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
    [token]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

const removeToken = async (tokenId) => {
  await db.query('DELETE FROM password_reset_tokens WHERE id = $1', [tokenId]);
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  removeToken,
};