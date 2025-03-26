const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { hashPassword } = require('../utils/passwordUtils');

class User {
  static async create({ name, email, password, gender, birth_date, username, google_id = null, photo_url = null }) {
    console.log("Criando usuário...");

    let passwordHash = null;

    // Se for um login normal (não Google), gera o hash da senha
    if (password) {
      console.log("Gerando hash da senha...");
      passwordHash = await bcrypt.hash(password, 10);
      console.log("Hash gerado com sucesso");
    }

    // Campos a serem inseridos
    const fields = ['name', 'email'];
    const values = [name, email];
    const placeholders = ['$1', '$2'];
    let paramCount = 2;

    // Adiciona password_hash se existir
    if (passwordHash) {
      fields.push('password_hash');
      values.push(passwordHash);
      placeholders.push(`$${++paramCount}`);
    }

    // Adiciona gender se existir
    if (gender) {
      fields.push('gender');
      values.push(gender);
      placeholders.push(`$${++paramCount}`);
    }

    // Adiciona birth_date se existir
    if (birth_date) {
      fields.push('birth_date');
      // Converte a data se estiver no formato DD-MM-YYYY
      if (birth_date.includes('-') && birth_date.split('-').length === 3) {
        const [day, month, year] = birth_date.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        values.push(formattedDate);
      } else {
        values.push(birth_date);
      }
      placeholders.push(`$${++paramCount}`);
    }

    // Adiciona username se existir
    if (username) {
      fields.push('username');
      values.push(username);
      placeholders.push(`$${++paramCount}`);
    }

    // Adiciona google_id se existir
    if (google_id) {
      fields.push('google_id');
      values.push(google_id);
      placeholders.push(`$${++paramCount}`);
    }

    // Adiciona photo_url se existir
    if (photo_url) {
      fields.push('photo_url');
      values.push(photo_url);
      placeholders.push(`$${++paramCount}`);
    }

    // Adiciona onboarding_completed
    fields.push('onboarding_completed');
    values.push(!!gender && !!birth_date); // true se ambos estiverem presentes
    placeholders.push(`$${++paramCount}`);

    // Cria a query dinâmica
    const query = `
      INSERT INTO users (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id, name, email, username, gender, birth_date, photo_url, onboarding_completed, created_at;
    `;

    console.log("Inserindo usuário no banco de dados");

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

  static async findByGoogleId(googleId) {
    console.log("Buscando usuário por Google ID:", googleId);
    const query = 'SELECT * FROM users WHERE google_id = $1';

    try {
      const { rows } = await pool.query(query, [googleId]);
      console.log("Resultado da busca por Google ID:", rows.length > 0 ? "Usuário encontrado" : "Usuário não encontrado");
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar por Google ID:", error.message);
      throw error;
    }
  }

  static async updateUser(userId, userData) {
    console.log("Atualizando usuário com ID:", userId);

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Constrói a query dinamicamente baseada nos campos fornecidos
    for (const [key, value] of Object.entries(userData)) {
      if (value !== undefined && value !== null) {
        // Se for birth_date no formato DD-MM-YYYY, converte para YYYY-MM-DD
        if (key === 'birth_date' && value.includes('-') && value.split('-').length === 3) {
          const [day, month, year] = value.split('-');
          updateFields.push(`${key} = $${++paramCount}`);
          values.push(`${year}-${month}-${day}`);
        } else {
          updateFields.push(`${key} = $${++paramCount}`);
          values.push(value);
        }
      }
    }

    // Se não há campos para atualizar, retorna
    if (updateFields.length === 0) {
      console.log("Nenhum campo para atualizar");
      return null;
    }

    // Adiciona updated_at
    updateFields.push(`updated_at = NOW()`);

    // Adiciona o ID do usuário como último parâmetro
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING id, name, email, username, gender, birth_date, photo_url, onboarding_completed;
    `;

    try {
      const { rows } = await pool.query(query, values);
      console.log("Usuário atualizado com sucesso:", rows[0].id);
      return rows[0];
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error.message);
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

  static async updatePassword(userId, newPassword) {
    console.log("Atualizando senha do usuário com ID:", userId);

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

  static async findUserByEmail(email) {
    return this.findByEmail(email);
  }

  static async completeOnboarding(userId, { gender, birth_date }) {
    console.log("Completando onboarding para usuário ID:", userId);

    // Converte a data se estiver no formato DD-MM-YYYY
    let formattedDate = birth_date;
    if (birth_date.includes('-') && birth_date.split('-').length === 3) {
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
      console.log("Onboarding completado com sucesso para usuário ID:", rows[0].id);
      return rows[0];
    } catch (error) {
      console.error("Erro ao completar onboarding:", error.message);
      throw error;
    }
  }
}

module.exports = User;