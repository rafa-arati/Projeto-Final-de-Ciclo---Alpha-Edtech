// QRCodeHelpers.js (frontend)

// Renderizar QR Code usando a biblioteca qrcode.js
const renderQRCode = (elementId, qrValue) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Use a biblioteca qrcode.js
  QRCode.toCanvas(element, qrValue, {
    width: 200,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  }, function (error) {
    if (error) console.error(error);
  });
};

// Formatar data de expiração
const formatExpirationDate = (dateString) => {
  if (!dateString) return 'Sem data de expiração';

  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Verificar se uma promoção está disponível
const isPromotionAvailable = (promotion) => {
  if (!promotion) return false;

  // Verificar prazo de geração
  if (promotion.generation_deadline) {
    const deadline = new Date(promotion.generation_deadline);
    if (deadline < new Date()) return false;
  }

  // Verificar se há códigos disponíveis (se houver limite)
  if (promotion.max_codes !== null) {
    if (promotion.remaining_codes <= 0) return false;
  }

  return true;
};

// Calcular tempo restante para expiração
const getRemainingTime = (dateString) => {
  if (!dateString) return null;

  const deadline = new Date(dateString);
  const now = new Date();

  if (deadline <= now) return 'Expirado';

  const diffMs = deadline - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays} dia(s) e ${diffHours} hora(s)`;
  } else {
    return `${diffHours} hora(s)`;
  }
};

export {
  renderQRCode,
  formatExpirationDate,
  isPromotionAvailable,
  getRemainingTime
};