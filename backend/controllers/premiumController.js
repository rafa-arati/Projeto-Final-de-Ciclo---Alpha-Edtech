const User = require('../models/User');

// Solicitar upgrade para conta premium
const upgradeToPremium = async (req, res) => {
    try {
        // Verificar se o usuário está autenticado
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Verificar se o usuário já é premium ou admin
        if (req.user.role === 'premium' || req.user.role === 'admin') {
            return res.status(400).json({
                message: 'Este usuário já possui privilégios premium ou superiores'
            });
        }

        // Definir período de expiração (por exemplo, 30 dias a partir de agora)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Atualizar usuário para premium
        const updatedUser = await User.upgradeUserToPremium(req.user.id, expiryDate);

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Retornar informações atualizadas do usuário
        res.status(200).json({
            message: 'Upgrade para premium realizado com sucesso!',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                subscription_expiry: updatedUser.subscription_expiry
            }
        });
    } catch (error) {
        console.error('Erro ao fazer upgrade para premium:', error);
        res.status(500).json({ message: 'Erro ao processar a solicitação', error: error.message });
    }
};

// Verificar status premium
const checkPremiumStatus = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verificar se o usuário é premium e se a assinatura está válida
        const isPremium = user.role === 'premium';
        const isAdmin = user.role === 'admin';
        const hasValidSubscription = isPremium && new Date(user.subscription_expiry) > new Date();

        res.status(200).json({
            isPremium: isAdmin || (isPremium && hasValidSubscription),
            subscription: {
                status: isAdmin ? 'admin' :
                    (isPremium && hasValidSubscription) ? 'active' :
                        isPremium ? 'expired' : 'none',
                expiryDate: user.subscription_expiry
            }
        });
    } catch (error) {
        console.error('Erro ao verificar status premium:', error);
        res.status(500).json({ message: 'Erro ao processar a solicitação', error: error.message });
    }
};

// Cancelar assinatura premium
const cancelPremium = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        if (req.user.role !== 'premium') {
            return res.status(400).json({ message: 'O usuário não possui uma assinatura premium ativa' });
        }

        // Rebaixar o usuário para o papel comum
        const updatedUser = await User.downgradeFromPremium(req.user.id);

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json({
            message: 'Assinatura premium cancelada com sucesso',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Erro ao cancelar assinatura premium:', error);
        res.status(500).json({ message: 'Erro ao processar a solicitação', error: error.message });
    }
};

module.exports = {
    upgradeToPremium,
    checkPremiumStatus,
    cancelPremium
};