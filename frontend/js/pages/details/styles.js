/**
 * Inicializa os estilos específicos para a página de detalhes
 */
export function initializeStyles() {
  addCommonDetailsStyles();
  addQRCodeDisplayStyles();
  addPromotionCardStyles();
  addAdminQRCodeListStyles();
}

/** Adiciona estilos gerais da página de detalhes (layout, header, seções) */
function addCommonDetailsStyles() {
  const styleId = 'common-details-styles';
  if (document.getElementById(styleId)) return;
  const styles = document.createElement('style');
  styles.id = styleId;
  // Mantém o mesmo conteúdo da versão anterior (com roxo e azul originais)
   styles.textContent = `
      /* Variáveis Globais (ORIGINAIS com roxo/azul) */
      :root {
        --details-bg-primary: #000;
        --details-bg-secondary: #1c1c1e;
        --details-bg-tertiary: #2c2c2e;
        --details-bg-quaternary: #3a3a3c;
        --details-text-primary: #ffffff;
        --details-text-secondary: #adb5bd; /* Cinza claro */
        --details-text-tertiary: #6c757d;  /* Cinza escuro */
        --details-accent-primary: #8000FF; /* Roxo */
        --details-accent-secondary: #439DFE; /* Azul */
        --details-border-color: #444;
        --details-danger-color: #e57373; /* Vermelho claro para texto/borda */
        --details-danger-bg: rgba(229, 115, 115, 0.1); /* Fundo vermelho suave */
        --details-danger-border: rgba(229, 115, 115, 0.4); /* Borda vermelha suave */
        --details-success-color: #4caf50;
        --details-warning-color: #ffc107;
        --details-border-radius: 10px;
        --details-padding-base: 15px;
        --details-padding-large: 20px;
      }

      /* Restante dos estilos gerais... (iguais à resposta anterior) */
      .event-details-page .app-container { max-width: 900px; margin: 0 auto; padding-bottom: 80px; background-color: var(--details-bg-primary); }
      .event-details-content { padding: 0; }
      .event-details-page .page-header { display: flex; align-items: center; padding: var(--details-padding-base); border-bottom: 1px solid var(--details-border-color); margin-bottom: 0; background-color: var(--details-bg-primary); }
      .event-details-page .page-header .back-button { background: none; border: none; color: var(--details-text-secondary); padding: 5px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; width: 34px; flex-shrink: 0; margin-right: 10px; }
      .event-details-page .page-header .back-button:hover { color: var(--details-text-primary); }
      .event-details-page .page-header .back-button svg { width: 24px; height: 24px; }
      .event-details-page .page-header h1 { flex-grow: 1; text-align: center; margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--details-text-primary); padding-right: 44px; }
      .event-image-container-detail { width: 100%; max-height: 400px; overflow: hidden; background-color: var(--details-bg-secondary); position: relative; }
      .event-image-detail { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 250px; }
      .content-section { padding: var(--details-padding-large) var(--details-padding-large); border-bottom: 1px solid var(--details-border-color); background-color: var(--details-bg-primary); }
      .content-section:last-of-type { border-bottom: none; }
      .section-title { font-size: 1rem; font-weight: 600; color: var(--details-text-primary); margin-bottom: 18px; padding-bottom: 8px; border-bottom: 1px solid var(--details-bg-quaternary); text-transform: uppercase; letter-spacing: 0.8px; }
      .event-key-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px 25px; align-items: center; background-color: var(--details-bg-secondary); border-radius: var(--details-border-radius); padding: var(--details-padding-large); margin: var(--details-padding-large); border: 1px solid var(--details-border-color); }
      .info-item { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; color: var(--details-text-secondary); line-height: 1.5; }
      .info-item svg { width: 20px; height: 20px; color: var(--details-accent-primary); /* Roxo */ flex-shrink: 0; }
      .info-item address { font-style: normal; }
      .like-container { display: flex; align-items: center; gap: 8px; justify-self: end; grid-column: -1 / -2; padding: 5px 10px; background-color: var(--details-bg-tertiary); border-radius: 20px; }
      @media (max-width: 768px) { .like-container { grid-column: auto; justify-self: start; margin-top: 10px; } }
      .like-button { background: none; border: none; width: 32px; height: 32px; padding: 0; cursor: pointer; display: inline-flex; justify-content: center; align-items: center; color: var(--details-text-secondary); transition: color 0.2s ease, transform 0.2s ease; }
      .like-button:hover:not(:disabled) { color: var(--details-text-primary); transform: scale(1.15); }
      .like-button.active { color: #ff4081; }
      .like-button.active .heart-icon path { fill: #ff4081; stroke: #ff4081; }
      .like-button:disabled { opacity: 0.5; cursor: not-allowed; }
      .like-count { font-size: 0.95rem; font-weight: 600; color: var(--details-text-primary); }
      .like-label { display: none; }
      .event-description p { font-size: 1rem; line-height: 1.7; color: var(--details-text-primary); white-space: pre-wrap; word-wrap: break-word; }
      .event-external-link a, .event-detail-link { color: var(--details-accent-secondary); text-decoration: none; word-break: break-all; font-size: 0.9rem; display: inline-block; margin-top: 5px; padding: 4px 8px; background-color: rgba(67, 157, 254, 0.1); border-radius: 4px; transition: background-color 0.2s ease; }
      .event-external-link a:hover, .event-detail-link:hover { text-decoration: underline; background-color: rgba(67, 157, 254, 0.2); }
      .creator-actions .creator-action-buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
      .creator-actions .btn-profile-action { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; background-color: var(--details-bg-secondary); color: var(--details-text-secondary); border: 1px solid var(--details-border-color); padding: 15px 20px; border-radius: var(--details-border-radius); font-size: 0.95rem; cursor: pointer; transition: background-color 0.2s ease, border-color 0.2s ease; font-weight: 500; }
      .creator-actions .btn-profile-action:hover { background-color: var(--details-bg-tertiary); border-color: #555; color: var(--details-text-primary); }
      .creator-actions .btn-profile-action svg { width: 18px; height: 18px; color: var(--details-accent-primary); /* Roxo */ flex-shrink: 0; }
      .video-grid { display: grid; gap: 25px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
      .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #111; box-shadow: 0 4px 10px rgba(0,0,0,0.25); }
      .video-wrapper iframe, .video-wrapper blockquote { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
      .no-videos { color: var(--details-text-secondary); font-style: italic; text-align: center; padding: 30px 0;}
      .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); align-items: center; justify-content: center; }
      .modal.active { display: flex; }
      .modal-content { background-color: var(--details-bg-secondary); border-radius: var(--details-border-radius); padding: var(--details-padding-large); width: 90%; max-width: 550px; position: relative; border: 1px solid var(--details-border-color); box-shadow: 0 8px 25px rgba(0,0,0,0.3); max-height: 85vh; display: flex; flex-direction: column; }
      .close-modal { position: absolute; top: 12px; right: 15px; font-size: 24px; font-weight: bold; cursor: pointer; color: var(--details-text-secondary); line-height: 1; }
      .close-modal:hover { color: var(--details-text-primary); }
      .modal-content h3 { margin-top: 0; margin-bottom: 20px; color: var(--details-text-primary); font-size: 1.3rem; text-align: center; border-bottom: 1px solid var(--details-border-color); padding-bottom: 15px; }
      .modal-buttons { display: flex; justify-content: flex-end; gap: 12px; margin-top: 25px; padding-top: 15px; border-top: 1px solid var(--details-border-color); }
      .modal-buttons .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95rem; font-weight: 500; transition: opacity 0.2s; }
      .modal-buttons .btn:hover { opacity: 0.9; }
      .modal-buttons .btn.secondary { background-color: var(--details-bg-quaternary); color: var(--details-text-secondary); }
      .modal-buttons .btn.secondary:hover { background-color: #555; color: var(--details-text-primary); }
      .modal-buttons .btn.danger { background-color: var(--details-danger-bg); color: var(--details-danger-color); border: 1px solid var(--details-danger-border); }
      .modal-buttons .btn.danger:hover { background-color: rgba(200, 60, 60, 0.3); border-color: var(--details-danger-color); }
      .modal-buttons .btn[style*="linear-gradient"] { color: white; } /* Botão Criar Promoção com gradiente */
      @media (max-width: 768px) { .event-key-info { grid-template-columns: 1fr; margin-left: var(--details-padding-base); margin-right: var(--details-padding-base); } .like-container { justify-self: start; margin-top: 10px; } .creator-actions .creator-action-buttons { grid-template-columns: 1fr; } .video-grid { grid-template-columns: 1fr; } }
      @media (max-width: 480px) { .content-section { padding: var(--details-padding-base); } .section-title { font-size: 0.95rem; } .event-key-info { padding: var(--details-padding-base); gap: 15px; } .info-item { font-size: 0.9rem; gap: 10px; } .event-description p { font-size: 0.95rem; } .creator-actions .btn-profile-action { padding: 12px 15px; font-size: 0.9rem; } .modal-content { padding: var(--details-padding-base); } .modal-content h3 { font-size: 1.15rem; margin-bottom: 15px; padding-bottom: 10px;} .modal-buttons { flex-direction: column; gap: 10px; } .modal-buttons .btn { width: 100%; } }
      .loading-message { text-align: center; padding: 40px; color: #aaa; font-style: italic; }
      .error-message { text-align: center; padding: 40px; color: var(--details-danger-color); font-weight: bold; }
  `;
  document.head.appendChild(styles);
}

/** Adiciona estilos para a exibição do QR Code DENTRO do card de promoção */
function addQRCodeDisplayStyles() {
  const styleId = 'qrcode-display-styles';
  if (document.getElementById(styleId)) { // Limpa estilo antigo se existir
      document.getElementById(styleId).remove();
  }
  const styles = document.createElement('style');
  styles.id = styleId;
  styles.textContent = `
      .qr-code-display-container {
          padding: 15px 10px 10px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          border-radius: 6px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
      }

      .generated-qr-image {
          display: block;
          width: 100%;
          max-width: 140px;
          height: auto;
          border-radius: 6px;
          background-color: #ffffff;
          padding: 8px;
          box-sizing: border-box;
          margin-bottom: 5px;
          border: 1px solid var(--details-border-color);
      }

      /* <<< UUID AINDA MENOR E MENOS VISÍVEL >>> */
      .qr-code-value-text {
          font-size: 0.5rem;  /* Ainda menor (aprox 8px) */
          color: #ffff;       /* Cinza bem escuro, quase some */
          word-break: break-all;
          line-height: 1.0;   /* Linha mais junta */
          text-align: center;
          max-width: 95%;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
          display: block;     /* Visível */
          opacity: 0.4;       /* Mais transparente ainda */
          font-family: monospace;
          letter-spacing: -0.5px;
      }
  `;
  document.head.appendChild(styles);
}

/** Adiciona estilos para os cards de promoção */
function addPromotionCardStyles() {
  const styleId = 'promotion-card-styles';
   if (document.getElementById(styleId)) { // Limpa estilo antigo se existir
      document.getElementById(styleId).remove();
  }
  const styles = document.createElement('style');
  styles.id = styleId;
  styles.textContent = `
      .promotions-container { /* Container do grid */
        display: grid;
        /* Tenta encaixar 3 colunas */
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-top: 10px;
      }

      /* Força 3 colunas em telas largas */
      @media (min-width: 900px) {
          .promotions-container { grid-template-columns: repeat(3, 1fr); }
      }
      /* Força 2 colunas em telas médias */
       @media (min-width: 600px) and (max-width: 899px) {
           .promotions-container { grid-template-columns: repeat(2, 1fr); }
       }

      .promotion-card {
        background-color: var(--details-bg-secondary);
        border-radius: var(--details-border-radius);
        border: 1px solid var(--details-border-color);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        min-height: 380px;
      }
      .promotion-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
      }

      .promotion-header {
        padding: 12px var(--details-padding-base);
        background-color: var(--details-bg-tertiary);
        border-bottom: 1px solid var(--details-border-color);
        text-align: center; /* <<< CENTRALIZA CABEÇALHO >>> */
      }
      .promotion-header h3 { margin: 0 0 4px 0; font-size: 1.1rem; color: var(--details-text-primary); font-weight: 600; }
      .promotion-time { display: block; font-size: 0.75rem; color: var(--details-accent-secondary); } /* Azul */

      .promotion-details {
        padding: var(--details-padding-base);
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 10px;
        font-size: 0.9rem;
        color: var(--details-text-secondary);
        text-align: center;
        line-height: 1.5;
      }
      .promotion-details p { margin: 0; }
      .promotion-limit {
          display: inline-block;
          background-color: rgba(9, 255, 25, 0.22);
          color: rgba(9, 255, 25, 0.87);
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 500;
          margin: 5px auto;
          border: 1px solid rgba(9, 255, 25, 0.87);
      }
       /* <<< ESTILO VERMELHO PARA ESGOTADO >>> */
      .promotion-limit.limit-exhausted {
          background-color: var(--details-danger-bg) !important; /* Fundo vermelho suave */
          color: var(--details-danger-color) !important; /* Texto vermelho */
          border-color: var(--details-danger-border) !important; /* Borda vermelha */
      }
      .promotion-expiry { font-size: 0.8rem; color: var(--details-text-tertiary); margin-top: auto; padding-top: 10px; }

      .promotion-action {
        padding: var(--details-padding-base);
        border-top: 1px solid var(--details-border-color);
        background-color: var(--details-bg-tertiary);
        text-align: center;
        min-height: 190px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      /* Botão Gerar com gradiente original */
      .generate-qrcode-btn {
        background: linear-gradient(45deg, var(--details-accent-secondary), var(--details-accent-primary));
        color: white; border: none; padding: 10px 20px; border-radius: 6px;
        cursor: pointer; font-weight: 500; transition: opacity 0.2s, transform 0.1s;
        font-size: 0.9rem;
      }
      .generate-qrcode-btn:hover { opacity: 0.9; }
      .generate-qrcode-btn:active { transform: scale(0.98); }
      .generate-qrcode-btn:disabled { background: var(--details-bg-quaternary); cursor: not-allowed; opacity: 0.6; }

      /* Botão Desabilitado Genérico */
       .btn.disabled {
           background: var(--details-bg-quaternary) !important;
           color: var(--details-text-tertiary) !important;
           cursor: not-allowed;
           opacity: 0.7;
           padding: 10px 15px;
           border-radius: 6px;
           font-weight: 500;
           border: none;
           font-size: 0.9rem;
           width: auto;
           display: inline-block;
           text-align: center;
       }

       .no-promotions-message {
           color: var(--details-text-secondary);
           text-align: center;
           padding: 20px;
           font-style: italic;
           grid-column: 1 / -1;
       }

       /* Ajustes responsivos */
       @media (max-width: 480px) {
           .promotions-container { grid-template-columns: 1fr; }
           .promotion-card { border-radius: 8px; min-height: 260px; }
           .promotion-header { padding: 10px var(--details-padding-base); }
           .promotion-header h3 { font-size: 1rem; }
           .promotion-details { padding: var(--details-padding-base); font-size: 0.85rem; }
           .promotion-action { padding: var(--details-padding-base); min-height: 170px; }
           .generate-qrcode-btn { padding: 8px 16px; font-size: 0.85rem;}
           .generated-qr-image { max-width: 120px; }
           .qr-code-value-text { font-size: 0.5rem; } /* Ainda menor em mobile */
       }
  `;
  document.head.appendChild(styles);
}

/** Adiciona estilos para a lista de QR Codes/Promoções no modal admin */
function addAdminQRCodeListStyles() {
  const styleId = 'admin-qrcode-list-styles';
  if (document.getElementById(styleId)) {
      document.getElementById(styleId).remove(); // Garante a remoção do estilo antigo
  }
  const styles = document.createElement('style');
  styles.id = styleId;
  styles.textContent = `
      #view-qrcodes-modal .modal-content {
           max-width: 750px;
           width: 90%;
       }

      .admin-promotions-list {
        max-height: 65vh; overflow-y: auto; padding: 15px 5px 15px 15px;
        margin-top: 15px; border-top: 1px solid var(--details-border-color);
        display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      /* Estilos Scrollbar ... */
      .admin-promotions-list::-webkit-scrollbar { width: 8px; }
      .admin-promotions-list::-webkit-scrollbar-track { background: var(--details-bg-tertiary); border-radius: 4px; }
      .admin-promotions-list::-webkit-scrollbar-thumb { background-color: #555; border-radius: 4px; }
      .admin-promotions-list::-webkit-scrollbar-thumb:hover { background-color: #777; }

      /* Card Admin */
      .promotion-admin-card {
          background-color: var(--details-bg-tertiary);
          border: 1px solid var(--details-border-color);
          border-radius: var(--details-border-radius);
          overflow: hidden;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          justify-content: space-between; /* <<< Tenta distribuir espaço */
          transition: box-shadow 0.2s ease, transform 0.2s ease;
      }
      .promotion-admin-card:hover { box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); transform: translateY(-2px); }

      /* Header Card Admin */
      .promo-card-header { display: flex; justify-content: space-between; align-items: center; background-color: var(--details-bg-quaternary); padding: 12px var(--details-padding-base); border-bottom: 1px solid var(--details-border-color); flex-shrink: 0; }
      .promo-card-title { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--details-text-primary); flex-grow: 1; margin-right: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .promo-card-status { padding: 5px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: bold; color: white; white-space: nowrap; flex-shrink: 0; border: 1px solid transparent; }

      /* Body Card Admin */
      .promo-card-body {
          padding: 12px var(--details-padding-base);
          font-size: 0.9rem;
          color: var(--details-text-secondary);
          line-height: 1.5;
          flex-grow: 1; /* Permite que o corpo cresça se precisar */
          overflow-y: auto; /* Adiciona scroll se o corpo for muito grande */
      }
      .promo-card-body p { margin: 0 0 8px 0; }
      .promo-card-body p:last-child { margin-bottom: 0; }
      .promo-card-body strong { color: var(--details-text-primary); font-weight: 500; margin-right: 5px; }
      .promo-card-benefit { font-style: italic; }
      .promo-card-stats { font-size: 0.85em; color: #b0b0b0; }
      .promo-card-deadline { font-size: 0.8em; color: #a0a0a0; }

      /* --- Actions Card Admin - Simplificado e Garantido --- */
      .promo-card-actions {
          padding: 10px var(--details-padding-base);
          background-color: var(--details-bg-tertiary);
          border-top: 1px solid var(--details-border-color);
          flex-shrink: 0; /* Não encolhe */
          display: block; /* Garante que a div exista como bloco */
          text-align: right; /* Alinha o botão (inline-flex) à direita */
          min-height: initial; /* Remove min-height anterior */
          overflow: visible; /* Garante que o botão não seja cortado */
      }

      .delete-item-btn {
          /* Estilos básicos do botão */
          background-color: var(--details-danger-bg);
          color: var(--details-danger-color);
          border: 1px solid var(--details-danger-border);
          padding: 7px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
          display: inline-flex; /* Permite alinhar texto e svg */
          align-items: center;
          gap: 6px;
          /* Reset/Garantias */
          opacity: 1;
          visibility: visible;
          position: relative;
          transform: none;
          height: auto;
          width: auto;
      }
      .delete-item-btn:hover { background-color: rgba(200, 60, 60, 0.3); color: #ff5252; border-color: var(--details-danger-color); }
      .delete-item-btn svg { vertical-align: middle; /* Alinha melhor o SVG com o texto */ width: 14px; height: 14px;}
      /* --- FIM DOS AJUSTES --- */

      /* Mensagem 'Nenhum item' Admin */
      .admin-promotions-list .no-items-message { grid-column: 1 / -1; text-align: center; color: var(--details-text-secondary); padding: 40px 10px; font-style: italic; }

       /* Modal Excluir */
      #delete-qrcode-modal .modal-content { max-width: 450px; text-align: center; }
      #delete-qrcode-modal p { color: var(--details-text-secondary); line-height: 1.6; margin-bottom: 20px; font-size: 0.95rem; }

       /* Ajustes responsivos */
       @media (max-width: 768px) { .admin-promotions-list { grid-template-columns: 1fr; } }
       @media (max-width: 480px) { .admin-promotions-list { gap: 15px; padding: 10px; } .promotion-admin-card { border-radius: 8px; } .promo-card-header { padding: 10px 15px; } .promo-card-title { font-size: 1rem; } .promo-card-body { padding: 12px; font-size: 0.9rem; line-height: 1.4; } .promo-card-actions { padding: 10px 15px; } .delete-item-btn { padding: 6px 12px; font-size: 0.8rem; gap: 5px;} }
  `;
  document.head.appendChild(styles);
}