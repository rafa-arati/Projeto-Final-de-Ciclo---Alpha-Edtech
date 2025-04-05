/**
 * Inicializa os estilos específicos para a página de detalhes
 */
export function initializeStyles() {
    addQRCodeStyles();
    addPromotionStyles();
}

/**
 * Adiciona estilos específicos para QR Codes
 */
function addQRCodeStyles() {
    // Verificar se já existe um estilo para QR Codes
    if (!document.getElementById('qrcode-styles')) {
        const styles = document.createElement('style');
        styles.id = 'qrcode-styles';
        styles.textContent = `
        .qr-codes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        
        .qr-code-card {
          background-color: #222;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #333;
          position: relative;
        }
        
        .qr-code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background-color: #1a1a1a;
        }
        
        .qr-code-status {
          font-size: 12px;
          font-weight: bold;
          padding: 3px 8px;
          border-radius: 10px;
        }
        
        .status-active {
          background-color: rgba(0, 255, 0, 0.2);
          color: #4caf50;
        }
        
        .status-used {
          background-color: rgba(255, 255, 0, 0.2);
          color: #ffc107;
        }
        
        .status-expired {
          background-color: rgba(255, 0, 0, 0.2);
          color: #f44336;
        }
        
        .delete-qr-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #333;
          color: white;
          border: none;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .qr-code-img {
          padding: 10px;
          display: flex;
          justify-content: center;
          background-color: white;
        }
        
        .qr-code-img img {
          max-width: 100%;
          height: auto;
        }
        
        .qr-code-info {
          padding: 15px;
        }
        
        .qr-code-description {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .qr-code-benefit {
          font-size: 14px;
          margin-bottom: 5px;
          color: #bbb;
        }
        
        .qr-code-expiry {
          font-size: 12px;
          color: #999;
        }
        
        /* Estilo para o formulário de QR Code */
        #qrcode-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
  
        #qrcode-form .form-group {
          margin-bottom: 15px;
        }
  
        #qrcode-form label {
          display: block;
          margin-bottom: 8px;
          color: #8000FF;
          font-size: 14px;
          font-weight: 500;
        }
  
        #qrcode-form input[type="text"],
        #qrcode-form input[type="number"],
        #qrcode-form input[type="datetime-local"],
        #qrcode-form select,
        #qrcode-form textarea {
          width: 100%;
          padding: 12px 15px;
          background-color: #222;
          border: 1px solid #333;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          transition: border-color 0.3s;
        }
  
        #qrcode-form input:focus,
        #qrcode-form select:focus,
        #qrcode-form textarea:focus {
          border-color: #8000FF;
          outline: none;
        }
  
        #qrcode-form select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238000FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 36px;
        }
  
        #qrcode-form textarea {
          min-height: 80px;
          resize: vertical;
        }
  
        #qrcode-form input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `;
        document.head.appendChild(styles);
    }
}

/**
 * Adiciona estilos específicos para Promoções
 */
function addPromotionStyles() {
    // Verificar se já existe um estilo para Promoções
    if (!document.getElementById('promotion-styles')) {
        const styles = document.createElement('style');
        styles.id = 'promotion-styles';
        styles.textContent = `
        .promotions-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .promotion-card {
          background-color: #222;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #333;
          display: flex;
          flex-direction: column;
        }
        
        .promotion-header {
          padding: 15px;
          background: linear-gradient(45deg, #3a3a3a, #2a2a2a);
          border-bottom: 1px solid #333;
        }
        
        .promotion-header h3 {
          margin: 0;
          font-size: 18px;
          color: #fff;
        }
        
        .promotion-time {
          display: block;
          font-size: 12px;
          color: #aaa;
          margin-top: 5px;
        }
        
        .promotion-details {
          padding: 15px;
          flex-grow: 1;
        }
        
        .promotion-limit {
          display: inline-block;
          background-color: rgba(0, 255, 0, 0.1);
          color: #4caf50;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin: 8px 0;
        }
        
        .promotion-expiry {
          font-size: 12px;
          color: #999;
          margin-top: 10px;
        }
        
        .promotion-action {
          padding: 15px;
          border-top: 1px solid #333;
          text-align: center;
        }
        
        .btn.disabled {
          background-color: #444 !important;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .generate-qrcode-btn {
          background: linear-gradient(45deg, #439DFE, #8000FF);
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .generate-qrcode-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .user-qrcodes {
          margin-top: 30px;
        }
      `;
        document.head.appendChild(styles);
    }
}