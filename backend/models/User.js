const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { hashPassword } = require('../utils/passwordUtils');

class User {
  // Cria novo usuário
  static async create(userData) {
    console.log("Criando usuário...");
    const { name, email, password, gender, birth_date, username, google_id = null, photo_url = null } = userData;

    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Configura campos dinâmicos
    const fields = ['name', 'email'];
    const queryValues = [name, email];
    const placeholders = ['$1', '$2'];
    let paramCount = 2;


    const adicionarCampo = (nome, valor) => {
      fields.push(nome);
      queryValues.push(valor);
      placeholders.push(`$${++paramCount}`);
    };

    const formatarData = (data) => {
      if (data.includes('-')) {
        const [day, month, year] = data.split('-');
        adicionarCampo('birth_date', `${year}-${month}-${day}`);
      } else {
        adicionarCampo('birth_date', data);
      }
    };

    if (passwordHash) adicionarCampo('password_hash', passwordHash);
    if (gender) adicionarCampo('gender', gender);
    if (birth_date) formatarData(birth_date);
    if (username) adicionarCampo('username', username);
    if (google_id) adicionarCampo('google_id', google_id);
    if (photo_url) adicionarCampo('photo_url', photo_url);

    // Finaliza campos
    fields.push('onboarding_completed');
    queryValues.push(!!gender && !!birth_date);
    placeholders.push(`$${++paramCount}`);

    // Executa query
    const query = `
      INSERT INTO users (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id, name, email, username, gender, birth_date, photo_url, onboarding_completed, created_at;
    `;

    try {
      const { rows } = await pool.query(query, queryValues);
      return rows[0];
    } catch (error) {
      console.error("Erro ao criar usuário:", error.message);
      throw error;
    }
  }

  // Rest of the methods remain the same as in the previous implementation
  static async updateUser(userId, userData) {
    const updateFields = [];
    const queryValues = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(userData)) {
      if (value !== undefined && value !== null) {
        if (key === 'birth_date' && value.includes('-')) {
          const [day, month, year] = value.split('-');
          updateFields.push(`${key} = $${++paramCount}`);
          queryValues.push(`${year}-${month}-${day}`);
        } else {
          updateFields.push(`${key} = $${++paramCount}`);
          queryValues.push(value);
        }
      }
    }

    if (updateFields.length === 0) return null;

    updateFields.push('updated_at = NOW()');
    queryValues.push(userId);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING id, name, email, username, gender, birth_date, photo_url, onboarding_completed;
    `;

    try {
      const { rows } = await pool.query(query, queryValues);
      return rows[0];
    } catch (error) {
      console.error("Erro na atualização:", error.message);
      throw error;
    }
  }
  // Busca por email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    try {
      const { rows } = await pool.query(query, [email]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar por email:", error.message);
      throw error;
    }
  }

  // Busca por Google ID
  static async findByGoogleId(googleId) {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    try {
      const { rows } = await pool.query(query, [googleId]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar por Google ID:", error.message);
      throw error;
    }
  }

  // Busca por username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    try {
      const { rows } = await pool.query(query, [username]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar por username:", error.message);
      throw error;
    }
  }

  // Busca por ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    try {
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar por ID:", error.message);
      throw error;
    }
  }

  // Atualiza perfil básico
  static async updateProfile(userId, updates) {
    const { name, phone } = updates;
    const cleanPhone = phone?.replace(/\D/g, '') || null;

    if (cleanPhone && cleanPhone.length < 10) {
      throw new Error('Número inválido');
    }

    const query = `
      UPDATE users 
      SET name = $1, phone = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, email, phone, created_at, updated_at
    `;

    try {
      const { rows } = await pool.query(query, [name, cleanPhone, userId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.message);
      throw error;
    }
  }

  // Atualiza senha
  static async updatePassword(userId, newPassword) {
    const hashedPassword = await hashPassword(newPassword);
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      RETURNING id;
    `;

    try {
      const { rows } = await pool.query(query, [hashedPassword, userId]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao atualizar senha:", error.message);
      throw error;
    }
  }

  // Completa onboarding
  static async completeOnboarding(userId, { gender, birth_date }) {
    let formattedDate = birth_date;
    if (birth_date.includes('-')) {
      const [day, month, year] = birth_date.split('-');
      formattedDate = `${year}-${month}-${day}`;
    }

    const query = `
      UPDATE users
      SET gender = $1, birth_date = $2, onboarding_completed = TRUE, updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, email, username, gender, birth_date, photo_url, onboarding_completed;
    `;

    try {
      const { rows } = await pool.query(query, [gender, formattedDate, userId]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao completar onboarding:", error.message);
      throw error;
    }
  }
}

module.exports = User;