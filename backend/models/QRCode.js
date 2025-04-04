const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class QRCode {
  // Criar um novo QR Code
  static async createQRCode({
    eventId,
    creatorId,
    description,
    discountPercentage,
    benefitType,
    benefitDescription,
    qrCodeValue,
    validUntil
  }) {
    try {
      const query = `
        INSERT INTO event_qr_codes (
          event_id, creator_id, description, discount_percentage, 
          benefit_type, benefit_description, qr_code_value, valid_until
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        eventId,
        creatorId,
        description || null,
        discountPercentage || null,
        benefitType || null,
        benefitDescription || null,
        qrCodeValue,
        validUntil || null
      ];

      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Erro ao criar QR Code:", error);
      throw error;
    }
  }

  // Obter QR Codes por ID do evento
  static async getQRCodesByEventId(eventId) {
    try {
      const query = `
        SELECT qr.*, u.name as creator_name, 
               used.name as used_by_name
        FROM event_qr_codes qr
        LEFT JOIN users u ON qr.creator_id = u.id
        LEFT JOIN users used ON qr.used_by = used.id
        WHERE qr.event_id = $1
        ORDER BY qr.created_at DESC
      `;

      const { rows } = await pool.query(query, [eventId]);
      return rows;
    } catch (error) {
      console.error("Erro ao buscar QR Codes do evento:", error);
      throw error;
    }
  }

  // Obter QR Code por ID
  static async getQRCodeById(qrCodeId) {
    try {
      const query = `
        SELECT qr.*, u.name as creator_name, 
               used.name as used_by_name,
               e.event_name, e.event_date
        FROM event_qr_codes qr
        LEFT JOIN users u ON qr.creator_id = u.id
        LEFT JOIN users used ON qr.used_by = used.id
        LEFT JOIN events e ON qr.event_id = e.id
        WHERE qr.id = $1
      `;

      const { rows } = await pool.query(query, [qrCodeId]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar QR Code por ID:", error);
      throw error;
    }
  }

  // Obter QR Code por valor do código
  static async getQRCodeByValue(qrCodeValue) {
    try {
      const query = `
        SELECT *
        FROM event_qr_codes
        WHERE qr_code_value = $1
      `;

      const { rows } = await pool.query(query, [qrCodeValue]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao buscar QR Code por valor:", error);
      throw error;
    }
  }

  // Marcar QR Code como utilizado
  static async markQRCodeAsUsed(qrCodeValue, userId) {
    try {
      const query = `
        UPDATE event_qr_codes
        SET is_used = TRUE, 
            used_at = NOW(),
            used_by = $1
        WHERE qr_code_value = $2 AND NOT is_used
        RETURNING *
      `;

      const { rows } = await pool.query(query, [userId, qrCodeValue]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao marcar QR Code como utilizado:", error);
      throw error;
    }
  }

  // Excluir QR Code
  static async deleteQRCode(qrCodeId) {
    try {
      const query = `
        DELETE FROM event_qr_codes
        WHERE id = $1
        RETURNING id
      `;

      const { rows } = await pool.query(query, [qrCodeId]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao excluir QR Code:", error);
      throw error;
    }
  }

  // Estatísticas de QR Codes por evento
  static async getQRCodeStats(eventId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_qrcodes,
          SUM(CASE WHEN is_used THEN 1 ELSE 0 END) as used_qrcodes,
          SUM(CASE WHEN NOT is_used AND (valid_until IS NULL OR valid_until > NOW()) THEN 1 ELSE 0 END) as active_qrcodes,
          SUM(CASE WHEN NOT is_used AND valid_until < NOW() THEN 1 ELSE 0 END) as expired_qrcodes
        FROM event_qr_codes
        WHERE event_id = $1
      `;

      const { rows } = await pool.query(query, [eventId]);
      return rows[0];
    } catch (error) {
      console.error("Erro ao obter estatísticas de QR Codes:", error);
      throw error;
    }
  }

  // Obter QR Codes criados por um usuário
  static async getQRCodesByCreator(userId) {
    try {
      const query = `
        SELECT qr.*, e.event_name, e.event_date
        FROM event_qr_codes qr
        JOIN events e ON qr.event_id = e.id
        WHERE qr.creator_id = $1
        ORDER BY qr.created_at DESC
      `;

      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error("Erro ao buscar QR Codes do criador:", error);
      throw error;
    }
  }

  // Novos métodos a serem adicionados ao QRCode.js

  // Criar uma promoção (admin/premium)
  static async createPromotion({
    eventId,
    creatorId,
    description,
    discountPercentage,
    benefitType,
    benefitDescription,
    maxCodes,
    generationDeadline,
    usageDeadline
  }) {
    const promotionId = uuidv4(); // Gerar ID único para a promoção

    try {
      const query = `
            INSERT INTO event_qr_codes (
                event_id, creator_id, description, discount_percentage, 
                benefit_type, benefit_description, qr_code_value, 
                promotion_id, status, max_codes, 
                generation_deadline, usage_deadline, remaining_codes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

      const values = [
        eventId,
        creatorId,
        description || null,
        discountPercentage || null,
        benefitType || null,
        benefitDescription || null,
        promotionId, // Usamos o promotionId como qr_code_value para o registro "principal"
        promotionId,
        'disponivel',
        maxCodes,
        generationDeadline,
        usageDeadline,
        maxCodes // inicialmente, remaining_codes = max_codes
      ];

      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Erro ao criar promoção:", error);
      throw error;
    }
  }

  // Gerar QR Code personalizado para um usuário
  static async generateUserQRCode(promotionId, userId) {
    try {
      // Primeiro, verificar se o usuário já gerou um QR Code para esta promoção
      const existingCheck = `
          SELECT * FROM event_qr_codes 
          WHERE promotion_id::uuid = $1::uuid AND generator_user_id = $2
        `;
      const { rows: existing } = await pool.query(existingCheck, [promotionId, userId]);

      if (existing.length > 0) {
        throw new Error('Usuário já gerou um QR Code para esta promoção');
      }

      // Verificar se a promoção existe e está disponível
      const promotionQuery = `
          SELECT * FROM event_qr_codes 
          WHERE promotion_id::uuid = $1::uuid AND qr_code_value::uuid = $1::uuid
        `;
      const { rows: promotions } = await pool.query(promotionQuery, [promotionId]);

      if (promotions.length === 0) {
        throw new Error('Promoção não encontrada');
      }

      const promotion = promotions[0];

      // Verificar se a promoção ainda está no período de geração
      if (promotion.generation_deadline && new Date(promotion.generation_deadline) < new Date()) {
        throw new Error('O período para geração de códigos desta promoção expirou');
      }

      // Verificar se ainda há códigos disponíveis (se houver limite)
      if (promotion.max_codes !== null) {
        const countQuery = `
                SELECT COUNT(*) as used_codes FROM event_qr_codes 
                WHERE promotion_id = $1 AND status != 'disponivel'
            `;
        const { rows: countResult } = await pool.query(countQuery, [promotionId]);

        if (parseInt(countResult[0].used_codes) >= promotion.max_codes) {
          throw new Error('O limite de códigos para esta promoção foi atingido');
        }
      }

      // Gerar um código único para o usuário
      const userQRCodeValue = uuidv4();

      // Inserir o novo QR Code personalizado
      const insertQuery = `
            INSERT INTO event_qr_codes (
                event_id, creator_id, description, discount_percentage, 
                benefit_type, benefit_description, qr_code_value, 
                promotion_id, status, generator_user_id, generation_time,
                valid_until
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
            RETURNING *
        `;

      const values = [
        promotion.event_id,
        promotion.creator_id,
        promotion.description,
        promotion.discount_percentage,
        promotion.benefit_type,
        promotion.benefit_description,
        userQRCodeValue,
        promotionId,
        'gerado',
        userId,
        promotion.usage_deadline
      ];

      const { rows } = await pool.query(insertQuery, values);
      return rows[0];
    } catch (error) {
      console.error("Erro ao gerar QR Code personalizado:", error);
      throw error;
    }
  }

  // Listar promoções disponíveis para um evento
  static async getAvailablePromotions(eventId) {
    try {
      const query = `
      SELECT DISTINCT ON (promotion_id) 
          id, event_id, creator_id, description, discount_percentage,
          benefit_type, benefit_description, promotion_id,
          generation_deadline, usage_deadline, max_codes, remaining_codes,
          (SELECT COUNT(*) FROM event_qr_codes WHERE promotion_id = e.promotion_id AND status != 'disponivel') as generated_codes
      FROM event_qr_codes e
      WHERE event_id = $1 
      AND qr_code_value::uuid = promotion_id::uuid
      AND (generation_deadline IS NULL OR generation_deadline > NOW())
      ORDER BY promotion_id
    `;

      const { rows } = await pool.query(query, [eventId]);
      return rows;
    } catch (error) {
      console.error("Erro ao buscar promoções disponíveis:", error);
      throw error;
    }
  }

  // Verificar se um usuário já gerou um código para determinada promoção
  static async hasUserGeneratedCode(promotionId, userId) {
    try {
      const query = `
            SELECT * FROM event_qr_codes
            WHERE promotion_id = $1 AND generator_user_id = $2
        `;

      const { rows } = await pool.query(query, [promotionId, userId]);
      return rows.length > 0;
    } catch (error) {
      console.error("Erro ao verificar código do usuário:", error);
      throw error;
    }
  }

  // Obter QR Codes gerados por um usuário
  static async getUserGeneratedQRCodes(userId) {
    try {
      const query = `
            SELECT qr.*, e.event_name, e.event_date
            FROM event_qr_codes qr
            JOIN events e ON qr.event_id = e.id
            WHERE qr.generator_user_id = $1 AND qr.status = 'gerado'
            ORDER BY qr.generation_time DESC
        `;

      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error("Erro ao buscar QR Codes gerados pelo usuário:", error);
      throw error;
    }
  }
}

module.exports = QRCode;