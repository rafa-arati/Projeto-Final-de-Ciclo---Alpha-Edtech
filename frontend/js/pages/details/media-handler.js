/**
 * Processa vídeos do evento e cria os embeds
 * @param {Object} event - Dados do evento
 */
export function processVideos(event) {
    const videoContainer = document.getElementById('video-container');
    if (!videoContainer) return;

    videoContainer.innerHTML = ''; // Limpar container

    let videoUrls = event.video_urls || [];

    // Converter string para array se necessário
    if (typeof videoUrls === 'string') {
        videoUrls = videoUrls.replace(/[{}"]/g, '').split(',').filter(url => url.trim() !== '');
    }

    if (videoUrls.length > 0) {
        videoUrls.forEach(url => {
            const videoWrapper = document.createElement('div');
            videoWrapper.className = 'video-wrapper';
            videoWrapper.innerHTML = createVideoEmbed(url);
            videoContainer.appendChild(videoWrapper);
        });

        // Carregar script do TikTok se necessário
        if (videoUrls.some(url => url.includes('tiktok')) && !window.tiktokScriptLoaded) {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            script.onload = () => {
                window.tiktokScriptLoaded = true;
                console.log('TikTok script carregado');
            };
            document.body.appendChild(script);
        }
    } else {
        videoContainer.innerHTML = '<p class="no-videos">Nenhum vídeo disponível para este evento</p>';
    }
}

/**
 * Cria o HTML para incorporar um vídeo
 * @param {string} url - URL do vídeo
 * @returns {string} HTML do embed do vídeo
 */
function createVideoEmbed(url) {
    try {
        const urlObj = new URL(url);
        const cleanedUrl = urlObj.href.replace(/\/$/, ''); // Remover barra final

        // YouTube
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            const videoId = getYouTubeId(cleanedUrl);
            if (!videoId) return '<p>ID do vídeo do YouTube não encontrado</p>';

            return `
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        `;
        }

        // TikTok
        if (url.includes('tiktok.com')) {
            return `
          <blockquote class="tiktok-embed"
            cite="${url}"
            data-video-id="${getTikTokId(url)}"
            style="max-width: 605px;min-width: 325px;">
            <section>
              <a target="_blank" href="${url}">Link original do TikTok</a>
            </section>
          </blockquote>
        `;
        }
        return '<p>Plataforma de vídeo não suportada</p>';

    } catch (error) {
        console.error('Erro ao criar embed:', error);
        return `<p>Link inválido: ${url}</p>`;
    }
}

/**
 * Extrai o ID de um vídeo do YouTube a partir da URL
 * @param {string} url - URL do YouTube
 * @returns {string|null} ID do vídeo ou null
 */
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Extrai o ID de um vídeo do TikTok a partir da URL
 * @param {string} url - URL do TikTok
 * @returns {string|null} ID do vídeo ou null
 */
function getTikTokId(url) {
    const regExp = /\/video\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}