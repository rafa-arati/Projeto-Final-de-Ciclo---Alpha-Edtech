const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, email, password, gender, birth_date, username }) {
    // Verifica se a senha foi fornecida
    if (!password) {
      throw new Error('Senha é obrigatória');
    }

    console.log("Gerando hash da senha...");
    // Gera o hash da senha
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("Hash gerado com sucesso");

    // Query para inserir o usuário no banco de dados
    const query = `
      INSERT INTO users (name, email, password_hash, gender, birth_date, username)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, username, gender, birth_date, created_at;
    `;

    console.log("Inserindo usuário no banco de dados com valores:", {
      name,
      email,
      gender,
      birth_date,
      username,
      passwordHashExists: !!passwordHash
    });

    const values = [name, email, passwordHash, gender, birth_date, username];

    try {
      const { rows } = await pool.query(query, values);
      console.log("Usuário inserido com sucesso, ID:", rows[0].id);
      return rows[0];
    } catch (error) {
      console.error("Erro ao inserir usuário:", error.message);
      throw error;
    }
  }

  static async findByEmail(email) {
    console.log("Buscando usuário por email:", email);
    const query = 'SELECT * FROM users WHERE email = $1';

    try {
      const { rows } = await pool.query(query, [email]);
      console.log("Resultado da busca por email:", rows.length > 0 ? "Usuário encontrado" : "Usuário não encontrado");
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar por email:", error.message);
      throw error;
    }
  }

  static async findByUsername(username) {
    console.log("Buscando usuário por username:", username);
    const query = 'SELECT * FROM users WHERE username = $1';

    try {
      const { rows } = await pool.query(query, [username]);
      console.log("Resultado da busca por username:", rows.length > 0 ? "Usuário encontrado" : "Usuário não encontrado");
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar por username:", error.message);
      throw error;
    }
  }

  static async findById(id) {
    console.log("Buscando usuário por ID:", id);
    const query = 'SELECT * FROM users WHERE id = $1';

    try {
      const { rows } = await pool.query(query, [id]);
      console.log("Resultado da busca por ID:", rows.length > 0 ? "Usuário encontrado" : "Usuário não encontrado");
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar por ID:", error.message);
      throw error;
    }
  }
}

module.exports = User;