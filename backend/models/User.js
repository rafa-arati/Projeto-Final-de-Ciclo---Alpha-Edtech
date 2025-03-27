const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { hashPassword } = require('../utils/passwordUtils');

class User {
  static async create({ name, email, password, gender, birthDate, username }) {
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
      birth_date: birthDate, // Altere para birthDate, que é o parâmetro correto
      username,
      passwordHashExists: !!passwordHash
    });

    const values = [name, email, passwordHash, gender, birthDate, username];

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

  static async updateProfile(userId, updates) {
    const { name, phone } = updates;
    
    const cleanPhone = phone ? phone.replace(/\D/g, '') : null;
    
    if (phone && cleanPhone.length < 10) {
      throw new Error('Número deve ter pelo menos 10 dígitos');
    }
  
    const query = `
      UPDATE users 
      SET name = $1, 
          phone = $2, 
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, email, phone, created_at, updated_at
    `;
  
    try {
      const { rows } = await pool.query(query, [
        name,
        cleanPhone || null, // Salva NULL se não houver telefone
        userId
      ]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao atualizar perfil:', {
        error: error.message,
        userId,
        updates
      });
      throw new Error('Erro no servidor ao atualizar perfil');
    }
  }

  // Método para atualizar a senha do usuário
  static async updatePassword(userId, newPassword) {
    console.log("Atualizando senha do usuário com ID:", userId);

    // Gera o hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      RETURNING id;
    `;

    try {
      const { rows } = await pool.query(query, [hashedPassword, userId]);
      console.log("Senha atualizada com sucesso para o usuário com ID:", rows[0].id);
      return rows[0];
    } catch (error) {
      console.error("Erro ao atualizar a senha:", error.message);
      throw error;
    }
  }

  // Método para buscar um usuário por email (já existe, mas pode ser usado para recuperação de senha)
  static async findUserByEmail(email) {
    return this.findByEmail(email);
  }
}

module.exports = User;