const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, email, password, gender, birth_date }) {
    // Verifica se a senha foi fornecida
    if (!password) {
      throw new Error('Senha é obrigatória');
    }

    // Gera o hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Query para inserir o usuário no banco de dados
    const query = `
      INSERT INTO users (name, email, password_hash, gender, birth_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, gender, birth_date, created_at;
    `;
    const values = [name, email, passwordHash, gender, birth_date];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }
}

module.exports = User;