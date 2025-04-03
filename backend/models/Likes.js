const pool = require('../config/db');

class Like {
    // Adiciona um like
    static async addLike(userId, eventId) {
        const query = `
            INSERT INTO event_likes (user_id, event_id) 
            VALUES ($1, $2) 
            ON CONFLICT (user_id, event_id) DO NOTHING 
            RETURNING id; 
        `; // ON CONFLICT evita erro se já curtiu
        try {
            const result = await pool.query(query, [userId, eventId]);
            return result.rows[0];
        } catch (error) {
            console.error("Erro ao adicionar like:", error);
            throw error;
        }
    }

    // Remove um like
    static async removeLike(userId, eventId) {
        const query = 'DELETE FROM event_likes WHERE user_id = $1 AND event_id = $2 RETURNING id;';
        try {
            const result = await pool.query(query, [userId, eventId]);
            return result.rows[0];
        } catch (error) {
            console.error("Erro ao remover like:", error);
            throw error;
        }
    }

    // Conta quantos likes um evento tem
    static async getLikeCount(eventId) {
        const query = 'SELECT COUNT(*) FROM event_likes WHERE event_id = $1;';
        try {
            const result = await pool.query(query, [eventId]);
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Erro ao contar likes:", error);
            return 0; // Retorna 0 em caso de erro
        }
    }

    // Verifica se um usuário específico curtiu um evento
    static async checkUserLike(userId, eventId) {
        if (!userId) return false; // Se não há usuário logado, não curtiu
        const query = 'SELECT 1 FROM event_likes WHERE user_id = $1 AND event_id = $2 LIMIT 1;';
        try {
            const result = await pool.query(query, [userId, eventId]);
            return result.rows.length > 0;
        } catch (error) {
            console.error("Erro ao verificar like do usuário:", error);
            return false;
        }
    }
}

module.exports = Like;
