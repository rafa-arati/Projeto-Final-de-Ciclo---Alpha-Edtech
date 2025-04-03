const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const QRCode = require('../models/QRCode');
const Event = require('../models/Event');

// Criar um novo QR Code para evento
const createQRCode = async (req, res) => {
    try {
        const {
            eventId,
            description,
            discountPercentage,
            benefitType,
            benefitDescription,
            validUntil
        } = req.body;

        // Verificar se o usuário está autenticado
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Verificar se o usuário é admin ou premium
        if (req.user.role !== 'admin' && req.user.role !== 'premium') {
            return res.status(403).json({
                message: 'Apenas administradores e usuários premium podem criar QR Codes'
            });
        }

        // Verificar se o evento existe
        const event = await Event.getEventById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Evento não encontrado' });
        }

        // Se for usuário premium, verificar se o evento é dele
        if (req.user.role === 'premium' && event.creator_id !== req.user.id) {
            return res.status(403).json({
                message: 'Você só pode criar QR Codes para seus próprios eventos'
            });
        }

        // Gerar um valor único para o QR Code
        const qrCodeValue = uuidv4();

        // Criar o registro do QR Code
        const newQRCode = await QRCode.createQRCode({
            eventId,
            creatorId: req.user.id,
            description,
            discountPercentage,
            benefitType,
            benefitDescription,
            qrCodeValue,
            validUntil: validUntil ? new Date(validUntil) : null
        });

        res.status(201).json({
            message: 'QR Code criado com sucesso',
            qrCode: newQRCode
        });
    } catch (error) {
        console.error('Erro ao criar QR Code:', error);
        res.status(500).json({ message: 'Erro ao criar QR Code', error: error.message });
    }
};

// Listar QR Codes de um evento
const getEventQRCodes = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Verificar se o usuário está autenticado
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Verificar se o evento existe
        const event = await Event.getEventById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Evento não encontrado' });
        }

        // Se for usuário premium, verificar se o evento é dele
        if (req.user.role === 'premium' && event.creator_id !== req.user.id) {
            return res.status(403).json({
                message: 'Você só pode ver QR Codes dos seus próprios eventos'
            });
        }

        const qrCodes = await QRCode.getQRCodesByEventId(eventId);

        res.status(200).json(qrCodes);
    } catch (error) {
        console.error('Erro ao listar QR Codes:', error);
        res.status(500).json({ message: 'Erro ao listar QR Codes', error: error.message });
    }
};

// Validar QR Code
const validateQRCode = async (req, res) => {
    try {
        const { qrCodeValue } = req.params;

        // Verificar se o código existe
        const qrCode = await QRCode.getQRCodeByValue(qrCodeValue);

        if (!qrCode) {
            return res.status(404).json({ message: 'QR Code não encontrado' });
        }

        // Verificar se o QR Code está expirado
        if (qrCode.valid_until && new Date(qrCode.valid_until) < new Date()) {
            return res.status(400).json({ message: 'QR Code expirado' });
        }

        // Verificar se o QR Code já foi usado
        if (qrCode.is_used) {
            return res.status(400).json({ message: 'QR Code já utilizado' });
        }

        // Obter informações do evento
        const event = await Event.getEventById(qrCode.event_id);

        // Retornar dados de benefício
        res.status(200).json({
            isValid: true,
            eventName: event.event_name,
            eventDate: event.event_date,
            benefit: {
                type: qrCode.benefit_type,
                description: qrCode.benefit_description,
                discountPercentage: qrCode.discount_percentage
            }
        });
    } catch (error) {
        console.error('Erro ao validar QR Code:', error);
        res.status(500).json({ message: 'Erro ao validar QR Code', error: error.message });
    }
};

// Marcar QR Code como utilizado
const useQRCode = async (req, res) => {
    try {
        const { qrCodeValue } = req.params;

        // Verificar se o usuário está autenticado
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Verificar se o QR Code existe e é válido
        const qrCode = await QRCode.getQRCodeByValue(qrCodeValue);

        if (!qrCode) {
            return res.status(404).json({ message: 'QR Code não encontrado' });
        }

        if (qrCode.is_used) {
            return res.status(400).json({ message: 'QR Code já foi utilizado' });
        }

        if (qrCode.valid_until && new Date(qrCode.valid_until) < new Date()) {
            return res.status(400).json({ message: 'QR Code expirado' });
        }

        // Marcar como utilizado
        const updatedQRCode = await QRCode.markQRCodeAsUsed(qrCodeValue, req.user.id);

        res.status(200).json({
            message: 'QR Code utilizado com sucesso',
            qrCode: updatedQRCode
        });
    } catch (error) {
        console.error('Erro ao utilizar QR Code:', error);
        res.status(500).json({ message: 'Erro ao utilizar QR Code', error: error.message });
    }
};

// Excluir QR Code
const deleteQRCode = async (req, res) => {
    try {
        const { qrCodeId } = req.params;

        // Verificar se o usuário está autenticado
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Obter o QR Code
        const qrCode = await QRCode.getQRCodeById(qrCodeId);

        if (!qrCode) {
            return res.status(404).json({ message: 'QR Code não encontrado' });
        }

        // Verificar se é o criador do QR Code ou um admin
        if (req.user.role !== 'admin' && qrCode.creator_id !== req.user.id) {
            return res.status(403).json({ message: 'Você não tem permissão para excluir este QR Code' });
        }

        // Excluir o QR Code
        await QRCode.deleteQRCode(qrCodeId);

        res.status(200).json({ message: 'QR Code excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir QR Code:', error);
        res.status(500).json({ message: 'Erro ao excluir QR Code', error: error.message });
    }
};

module.exports = {
    createQRCode,
    getEventQRCodes,
    validateQRCode,
    useQRCode,
    deleteQRCode
};