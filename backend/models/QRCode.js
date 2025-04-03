const pool = require('../config/db');

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
}

module.exports = QRCode;