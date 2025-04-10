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

    /* const formatarData = (data) => {
      if (data.includes('-')) {
        const [day, month, year] = data.split('-');
        adicionarCampo('birth_date', `${year}-${month}-${day}`);
      } else {
        adicionarCampo('birth_date', data);
      }
    }; */

    if (passwordHash) adicionarCampo('password_hash', passwordHash);
    if (gender) adicionarCampo('gender', gender);
    if (birth_date) adicionarCampo('birth_date', birth_date);
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
      RETURNING id, name, email, username, gender, birth_date, photo_url, onboarding_completed, created_at, role;
    `;

    console.log("Inserindo usuário no banco de dados");

    try {
      const { rows } = await pool.query(query, queryValues);
      return rows[0];
    } catch (error) {
      console.error("Erro ao criar usuário:", error.message);
      throw error;
    }
  }

  // Atualiza um usuário
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
      RETURNING id, name, email, username, gender, birth_date, photo_url, onboarding_completed, role, subscription_expiry;
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

  // Atualiza usuário para premium
  static async upgradeUserToPremium(userId, expiryDate) {
    console.log("Atualizando usuário para premium, ID:", userId);

    const query = `
      UPDATE users
      SET role = 'premium', 
          subscription_expiry = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, role, subscription_expiry;
    `;

    try {
      const { rows } = await pool.query(query, [expiryDate, userId]);
      if (rows.length === 0) {
        return null; // Usuário não encontrado
      }
      console.log("Usuário atualizado para premium:", rows[0].id);
      return rows[0];
    } catch (error) {
      console.error("Erro ao atualizar para premium:", error.message);
      throw error;
    }
  }

  // Rebaixa usuário de premium para comum
  static async downgradeFromPremium(userId) {
    console.log("Rebaixando usuário de premium, ID:", userId);

    const query = `
      UPDATE users
      SET role = 'user', 
          subscription_expiry = NULL,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, role;
    `;

    try {
      const { rows } = await pool.query(query, [userId]);
      if (rows.length === 0) {
        return null; // Usuário não encontrado
      }
      console.log("Usuário rebaixado de premium:", rows[0].id);
      return rows[0];
    } catch (error) {
      console.error("Erro ao rebaixar de premium:", error.message);
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

  // Busca por username
  static async findByUsername(username) {
    console.log("Buscando usuário por username:", username);
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
  // Dentro da classe User em backend/models/User.js

  static async updateProfile(userId, updates) {
    // Log para ver o que chegou do frontend
    console.log(`[BACKEND User.js] updateProfile - Recebido para User ID ${userId}:`, updates); 

    // Lista de campos que permitimos atualizar por esta rota
    const allowedFields = ['name', 'phone', 'birth_date']; 
    const updateFields = []; // Array para guardar partes da query SET (ex: "name = $1")
    const values = []; // Array para guardar os valores correspondentes aos placeholders ($1, $2...)
    let paramCount = 0; // Contador para os placeholders ($1, $2...)

    // Itera sobre os campos permitidos
    for (const field of allowedFields) {
        // Verifica se o campo foi enviado pelo frontend (updates.hasOwnProperty)
        if (updates.hasOwnProperty(field)) { 
            let value = updates[field]; // Pega o valor enviado
            console.log(`[BACKEND User.js] Processando campo: '${field}', Valor recebido: '${value}'`);

            // Limpa o telefone (remove não-dígitos)
            if (field === 'phone') {
                value = value?.replace(/\D/g, '') || null; // Define como null se vazio ou inválido
                // Validação básica de tamanho (opcional, mas boa ideia)
                if (value && (value.length < 10 || value.length > 11)) {
                    console.warn(`[BACKEND User.js] Telefone inválido ('${updates[field]}') será ignorado.`);
                    continue; // Pula este campo e vai para o próximo
                }
            }
            
            // Limpa a data de nascimento (define como null se vazia)
            if (field === 'birth_date') {
                 if (value === '' || value === null) {
                     value = null; 
                 } 
                 // Validação opcional de formato (o DB pode rejeitar formato errado)
                 else if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) { 
                    console.warn(`[BACKEND User.js] Formato de data inválido ('${value}') para birth_date será ignorado.`);
                    continue; // Pula este campo
                 }
            }

            // Adiciona a parte da query SET e o valor correspondente
            updateFields.push(`${field} = $${++paramCount}`); // ex: "name = $1", "birth_date = $2"
            values.push(value); // ex: ["Novo Nome", "1990-01-01"]
        }
    }

    // Se nenhum campo válido foi enviado para atualização
    if (updateFields.length === 0) {
        console.log("[BACKEND User.js] Nenhum campo válido para atualização.");
        const currentUser = await this.findById(userId); // Retorna dados atuais como fallback
        return currentUser;
    }

    // Adiciona a atualização automática do campo updated_at
    updateFields.push(`updated_at = NOW()`);

    // Adiciona o userId ao final do array de valores para a cláusula WHERE
    values.push(userId); 
    const whereParamIndex = ++paramCount; // Guarda o índice do placeholder do ID (ex: $3)

    // Campos que queremos que o banco de dados retorne após atualizar
    const returningFields = 'id, name, email, username, gender, birth_date, phone, photo_url, onboarding_completed, role, subscription_expiry'; 

    // Monta a query SQL final
    const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}  -- Junta os "campo = $X" com vírgulas
        WHERE id = $${whereParamIndex}   -- Condição para atualizar o usuário correto
        RETURNING ${returningFields}     -- Pede ao DB para retornar os dados atualizados
    `;

    // Log da query final e dos valores (útil para debug)
    console.log("[BACKEND User.js] Executando Query:", query); 
    console.log("[BACKEND User.js] Valores:", values); 

    try {
        // Executa a query
        const { rows } = await pool.query(query, values);
        
        // Verifica se alguma linha foi atualizada (se o usuário existe)
        if (rows.length === 0) {
             console.warn("[BACKEND User.js] Nenhum usuário encontrado com ID:", userId);
             return null; 
        }

        // Log de sucesso
        console.log("[BACKEND User.js] Perfil atualizado com sucesso no DB:", rows[0]);
        return rows[0]; // Retorna o objeto do usuário com os dados atualizados

    } catch (error) {
        // Log do erro do banco de dados
        console.error('[BACKEND User.js] Erro ao executar query UPDATE:', error); 
        // Lança o erro para ser tratado pelo controller
        throw new Error(`Erro no banco de dados ao atualizar perfil: ${error.message}`); 
    }
  }

  // ... (resto da classe User, como findById, create, etc.) ...

  // Atualiza senha
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

  // Completa onboarding
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