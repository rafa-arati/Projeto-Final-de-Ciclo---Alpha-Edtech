const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db'); // Certifique-se que o pool de conexão está sendo importado corretamente
const QRCode = require('../models/QRCode');
const Event = require('../models/Event');

// Criar uma nova promoção para evento
const createPromotion = async (req, res) => {
  try {
    const {
      eventId,
      description,
      discountPercentage,
      benefitType,
      benefitDescription,
      maxCodes,
      generationDeadline, // Vem como string ex: "2025-04-10T18:00"
      usageDeadline       // Vem como string ex: "2025-04-09T23:59"
    } = req.body;

    // --- Validações de permissão e existência do evento ---
    if (!req.user) { return res.status(401).json({ message: 'Usuário não autenticado' }); }
    if (req.user.role !== 'admin' && req.user.role !== 'premium') { return res.status(403).json({ message: 'Apenas administradores e usuários premium podem criar promoções' }); }
    const event = await Event.getEventById(eventId);
    if (!event) { return res.status(404).json({ message: 'Evento não encontrado' }); }
    // Correção: Comparar IDs como string ou número consistentemente
    if (req.user.role === 'premium' && String(event.creator_id) !== String(req.user.id)) { 
         return res.status(403).json({ message: 'Você só pode criar promoções para seus próprios eventos' }); 
    }
    // --- Fim das validações ---

    // ----- VALIDAÇÃO DAS DATAS -----
    let generationDate = null;
    let usageDate = null;

    if (generationDeadline) {
      generationDate = new Date(generationDeadline);
      if (isNaN(generationDate.getTime())) {
        return res.status(400).json({ message: 'Formato inválido para "Data limite para gerar". Use AAAA-MM-DDTHH:MM.' });
      }
    }

    if (usageDeadline) {
      usageDate = new Date(usageDeadline);
      if (isNaN(usageDate.getTime())) {
        return res.status(400).json({ message: 'Formato inválido para "Data limite para usar". Use AAAA-MM-DDTHH:MM.' });
      }
    }

    if (generationDate && usageDate) {
        if (usageDate < generationDate) {
            return res.status(400).json({
                message: 'Erro: A data limite para usar o QR Code não pode ser anterior à data limite para gerá-lo.'
            });
        }
    }
    // ----- FIM VALIDAÇÃO DATAS -----

    // Criar a promoção usando o Model
    const newPromotion = await QRCode.createPromotion({
      eventId,
      creatorId: req.user.id,
      description,
      discountPercentage,
      benefitType,
      benefitDescription,
      maxCodes: maxCodes || null,
      // Passa a string ou null, o Model deve tratar a conversão se necessário
      generationDeadline: generationDeadline || null, 
      usageDeadline: usageDeadline || null
    });

    res.status(201).json({
      message: 'Promoção criada com sucesso',
      promotion: newPromotion
    });
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    res.status(500).json({ message: 'Erro ao criar promoção', error: error.message });
  }
};

// Listar promoções disponíveis para um evento (para usuários finais verem)
const getEventPromotions = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // Usa o método do Model para buscar promoções disponíveis
    const promotions = await QRCode.getAvailablePromotions(eventId);

    res.status(200).json(promotions);
  } catch (error) {
    console.error('Erro ao listar promoções:', error);
    res.status(500).json({ message: 'Erro ao listar promoções', error: error.message });
  }
};

// Gerar QR Code personalizado para o usuário atual
const generateUserQRCode = async (req, res) => {
  try {
    const { promotionId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Model verifica se já gerou e se a promoção é válida/disponível
    const userQRCode = await QRCode.generateUserQRCode(promotionId, req.user.id);

    // A verificação de 'hasGenerated' é feita dentro do Model agora
    // Se chegou aqui, a geração foi bem-sucedida

    res.status(201).json({
      message: 'QR Code gerado com sucesso',
      qrCode: userQRCode
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    // Trata erros específicos vindos do Model (ex: já gerou, promoção indisponível)
    if (error.message.includes('já gerou') || error.message.includes('expirou') || error.message.includes('atingido')) {
        return res.status(400).json({ message: error.message });
    }
    // Erro genérico
    res.status(500).json({ message: 'Erro interno ao gerar QR Code', error: error.message });
  }
};

// ==========================================================
// <<< FUNÇÃO CORRIGIDA: Listar QR Codes gerados pelo usuário >>>
// ==========================================================
const getUserQRCodes = async (req, res) => {
  try {
    // Verificar se o usuário está autenticado (req.user vem do middleware authenticate)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuário não autenticado ou ID inválido' });
    }

    // Chama o método do Model para buscar os QR codes pelo ID do usuário
    // (O Model foi corrigido para buscar todos os status: 'gerado', 'usado', etc.)
    const userQRCodes = await QRCode.getUserGeneratedQRCodes(req.user.id);

    // Retorna a lista de QR codes encontrados (pode ser vazia)
    res.status(200).json(userQRCodes);

  } catch (error) {
    // Log do erro no console do servidor
    console.error('Erro ao listar QR Codes do usuário:', error);
    // Retorna uma resposta de erro genérica para o cliente
    res.status(500).json({ message: 'Erro interno ao listar seus QR Codes', error: error.message });
  }
};
// ==========================================================
// <<< FIM DA FUNÇÃO CORRIGIDA >>>
// ==========================================================

// Validar QR Code (checa status, não marca como usado)
const validateQRCode = async (req, res) => {
  try {
    const { qrCodeValue } = req.params;

    const qrCode = await QRCode.getQRCodeByValue(qrCodeValue);

    if (!qrCode) {
      return res.status(404).json({ isValid: false, message: 'QR Code não encontrado' });
    }
    // Se é o registro da promoção mestre, não é um código de usuário válido
    if (qrCode.qr_code_value === qrCode.promotion_id.toString()) {
         return res.status(400).json({ isValid: false, message: 'Código inválido (código da promoção principal)' });
    }
    if (qrCode.status === 'usado') {
      return res.status(400).json({ isValid: false, message: 'QR Code já utilizado' });
    }
    if (qrCode.usage_deadline && new Date(qrCode.usage_deadline) < new Date()) {
      return res.status(400).json({ isValid: false, message: 'QR Code expirado' });
    }

    // Busca dados do evento e do usuário
    const event = await Event.getEventById(qrCode.event_id);
    let userData = null;
    if (qrCode.generator_user_id) {
         const userQuery = `SELECT id, name, birth_date FROM users WHERE id = $1`;
         const { rows: userRows } = await pool.query(userQuery, [qrCode.generator_user_id]);
         userData = userRows[0];
    }


    res.status(200).json({
      isValid: true,
      eventId: qrCode.event_id, // << Adicionado ID do evento
      eventName: event?.event_name || 'Evento não encontrado', // Usa optional chaining
      eventDate: event?.event_date || null,
      benefit: {
        type: qrCode.benefit_type,
        description: qrCode.benefit_description,
        discountPercentage: qrCode.discount_percentage
      },
      user: userData ? { // Inclui usuário apenas se encontrado
        id: userData.id,
        name: userData.name,
        birthDate: userData.birth_date // Formatação será feita no frontend
      } : null // Retorna null se não houver usuário associado
    });

  } catch (error) {
    console.error('Erro ao validar QR Code:', error);
    res.status(500).json({ isValid: false, message: 'Erro interno ao validar QR Code', error: error.message });
  }
};

// Marcar QR Code como utilizado (Admin/Criador do Evento)
const useQRCode = async (req, res) => {
  try {
    const { qrCodeValue } = req.params; // Valor do QR Code a ser usado

    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado para validar' });
    }

    // 1. Busca o QR Code pelo valor
    const qrCode = await QRCode.getQRCodeByValue(qrCodeValue);
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code não encontrado' });
    }
    // Se é o registro da promoção mestre, não pode ser usado
    if (qrCode.qr_code_value === qrCode.promotion_id.toString()) {
       return res.status(400).json({ message: 'Código inválido (código da promoção principal)' });
    }
    if (qrCode.status === 'usado') {
      return res.status(400).json({ message: 'QR Code já foi utilizado' });
    }
    if (qrCode.usage_deadline && new Date(qrCode.usage_deadline) < new Date()) {
      return res.status(400).json({ message: 'QR Code expirado' });
    }

    // 2. Verifica permissão para USAR o QR Code
    const event = await Event.getEventById(qrCode.event_id);
    if (!event) {
         // Isso não deveria acontecer se o QR code existe, mas é uma segurança extra
         return res.status(404).json({ message: 'Evento associado ao QR Code não encontrado.' });
     }
    const hasPermission =
      req.user.role === 'admin' ||
      (req.user.role === 'premium' && String(event.creator_id) === String(req.user.id)); // Compara como string

    if (!hasPermission) {
      return res.status(403).json({
        message: 'Você não tem permissão para validar QR Codes deste evento'
      });
    }

    // 3. Marcar como utilizado no Banco de Dados
    const query = `
            UPDATE event_qr_codes
            SET status = 'usado',
                used_at = NOW(),
                used_by = $1,
                is_used = TRUE
            WHERE qr_code_value = $2 AND status = 'gerado'
            RETURNING *, generator_user_id; -- Retorna o ID do gerador
        `;
    const { rows } = await pool.query(query, [req.user.id, qrCodeValue]);

    if (rows.length === 0) {
      // Se não atualizou, pode ser que o status não era 'gerado' (talvez já 'usado')
      return res.status(400).json({ message: 'Não foi possível marcar o QR Code como utilizado (verifique se já foi usado ou se é válido)' });
    }

    const updatedQRCode = rows[0];
    const targetUserId = updatedQRCode.generator_user_id; // ID do usuário que GEROU o QR code

    // --- EMITIR EVENTO WEBSOCKET para o usuário que gerou ---
    if (targetUserId) {
      const io = req.app.get('socketio'); // Pega instância do Socket.IO
      const userSockets = req.app.get('userSockets'); // Pega o Map de sockets

      // Emitir para a sala do usuário (método preferido se usar .join())
      io.to(targetUserId.toString()).emit('qrCodeStatusUpdate', {
          qrCodeValue: updatedQRCode.qr_code_value,
          status: updatedQRCode.status,
          promotionId: updatedQRCode.promotion_id // Importante para o frontend encontrar o card
      });
       console.log(`[useQRCode] Emitido 'qrCodeStatusUpdate' para usuário ${targetUserId} (Promo ID: ${updatedQRCode.promotion_id}) via sala`);

      // Alternativa: Emitir diretamente se usar o Map userSockets
      // const targetSocketId = userSockets.get(targetUserId.toString());
      // if (targetSocketId) {
      //     io.to(targetSocketId).emit('qrCodeStatusUpdate', { /* ... dados ... */ });
      //     console.log(`[useQRCode] Emitido 'qrCodeStatusUpdate' para socket ${targetSocketId}`);
      // } else {
      //     console.log(`[useQRCode] Usuário ${targetUserId} não conectado via WebSocket no momento.`);
      // }
    }
    // --- FIM WEBSOCKET ---

    // Resposta de sucesso
    res.status(200).json({
      message: 'QR Code utilizado com sucesso',
      qrCode: updatedQRCode // Retorna os dados atualizados
    });

  } catch (error) {
    console.error('Erro ao utilizar QR Code:', error);
    res.status(500).json({ message: 'Erro interno ao utilizar QR Code', error: error.message });
  }
};

// Excluir uma promoção (e QR codes associados) ou um QR Code individual
const deleteQRCode = async (req, res) => {
  try {
    const { qrCodeId } = req.params; // ID da promoção ou do QR code específico

    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // O Model QRCode.deleteQRCode agora lida com a lógica de
    // encontrar o item, verificar permissão (precisa do creator_id lá)
    // e excluir promoção + filhos ou apenas um filho.
    // Passamos o ID do item e o ID do usuário atual para verificação de permissão no Model.
    const result = await QRCode.deleteQRCode(qrCodeId, req.user.id, req.user.role);

    if (!result) {
         // Se o Model retorna null, pode ser que o item não foi encontrado ou o usuário não tem permissão
         // O Model deveria lançar um erro específico, mas por segurança:
         return res.status(404).json({ message: 'Item não encontrado ou você não tem permissão para excluir' });
     }

    // Mensagem de sucesso baseada no que foi excluído (informação vinda do Model)
    if (result.isPromotion && result.deletedRelated > 0) {
      console.log(`Excluída promoção ${qrCodeId} e ${result.deletedRelated} QR Code(s) relacionado(s)`);
      res.status(200).json({
        message: `Promoção e ${result.deletedRelated} QR Code(s) relacionado(s) excluídos com sucesso.`
      });
    } else if (result.isPromotion) {
       res.status(200).json({ message: 'Promoção excluída com sucesso (não havia QR Codes gerados).' });
    } else {
      res.status(200).json({ message: 'QR Code individual excluído com sucesso.' });
    }
  } catch (error) {
    console.error('Erro ao excluir QR Code/Promoção:', error);
    // Tratar erros específicos que podem vir do Model (ex: permissão negada)
    if (error.message.includes('permissão')) {
         return res.status(403).json({ message: error.message });
     }
    res.status(500).json({ message: 'Erro interno ao excluir item', error: error.message });
  }
};


module.exports = {
  createPromotion,
  getEventPromotions,
  generateUserQRCode,
  getUserQRCodes, // <<< Exporta a versão corrigida
  validateQRCode,
  useQRCode,      // <<< Exporta a versão com a lógica de emissão WebSocket
  deleteQRCode
};