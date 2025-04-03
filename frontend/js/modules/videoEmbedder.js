export const renderVideoEmbeds = (videoUrls, containerId) => {
    const container = document.getElementById(containerId);
    if (!container || !videoUrls) return;

    container.innerHTML = videoUrls.map(url => createVideoEmbed(url)).join('');

    loadTikTokScript(videoUrls);
};

const createVideoEmbed = (url) => {
    try {
        const urlObj = new URL(url);
        const isYouTube = urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
        const isTikTok = urlObj.hostname.includes('tiktok.com');

        if (isYouTube) {
            const videoId = getYouTubeId(url);
            return `
                <div class="video-wrapper">
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>`;
        }

        if (isTikTok) {
            return `
                <div class="video-wrapper tiktok-video">
                    <blockquote 
                        class="tiktok-embed"
                        cite="${url}"
                        data-video-id="${getTikTokId(url)}"
                        style="max-width: 605px;min-width: 325px;">
                    </blockquote>
                </div>`;
        }

        return '';
    } catch (error) {
        console.error('Invalid URL:', url);
        return '';
    }
};

const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getTikTokId = (url) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
};

const loadTikTokScript = (urls) => {
    if (urls.some(url => url.includes('tiktok')) && !window.tiktokScriptLoaded) {
        const script = document.createElement('script');
        script.src = "https://www.tiktok.com/embed.js";
        script.async = true;
        script.onload = () => window.tiktokScriptLoaded = true;
        document.head.appendChild(script);
    }
};