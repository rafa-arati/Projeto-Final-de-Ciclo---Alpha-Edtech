const Like = require('../models/Likes');

const toggleLike = async (req, res) => {
    const eventId = parseInt(req.params.eventId, 10);
    const userId = req.user.id; // Vem do middleware authenticate

    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'ID do evento inválido' });
    }

    try {
        const userHasLiked = await Like.checkUserLike(userId, eventId);
        let newStatus;

        if (userHasLiked) {
            await Like.removeLike(userId, eventId);
            newStatus = false;
            console.log(`Usuário ${userId} descurtiu evento ${eventId}`);
        } else {
            await Like.addLike(userId, eventId);
            newStatus = true;
            console.log(`Usuário ${userId} curtiu evento ${eventId}`);
        }

        const newLikeCount = await Like.getLikeCount(eventId);

        res.status(200).json({ 
            success: true, 
            message: `Like ${newStatus ? 'adicionado' : 'removido'}`,
            likeCount: newLikeCount,
            userHasLiked: newStatus 
        });

    } catch (error) {
        console.error('Erro ao alternar like:', error);
        // Verifica se os headers já foram enviados
        if (!res.headersSent) { 
            res.status(500).json({ success: false, message: 'Erro no servidor ao processar like' });
        }
        return;
    }
};

module.exports = {
    toggleLike
};
