// Controle de carrosséis

/**
 * Configura navegação dos carrosséis
 */
export function setupCarouselControls() {
    // Configurar navegação automática do carrossel (opcional)
    setupAutoScroll();

    // Detectar quando novos carrosséis são adicionados
    observeNewCarousels();
}

/**
 * Configura scroll automático para carrosséis (opcional)
 */
function setupAutoScroll() {
    // Esta função é opcional e pode ser implementada posteriormente
    // Exemplo: fazer carrosséis rolarem automaticamente a cada X segundos
}

/**
 * Observa a adição de novos carrosséis para configurá-los
 */
function observeNewCarousels() {
    // Usar MutationObserver para detectar quando novos carrosséis são adicionados
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                // Buscar novos elementos de carrossel adicionados
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Elemento
                        const carousels = node.querySelectorAll('.carousel');
                        if (carousels.length) {
                            carousels.forEach(setupCarouselSwipe);
                        }
                    }
                });
            }
        });
    });

    // Observar o container de categorias para novos carrosséis
    const categoriasContainer = document.getElementById("categorias-container");
    if (categoriasContainer) {
        observer.observe(categoriasContainer, {
            childList: true,
            subtree: true,
        });
    }

    // Configurar carrosséis existentes
    const allCarousels = document.querySelectorAll('.carousel');
    allCarousels.forEach(setupCarouselSwipe);
}

/**
 * Adiciona suporte a swipe touch para carrosséis (melhor experiência em mobile)
 */
function setupCarouselSwipe(carousel) {
    let startX;
    let scrollLeft;
    let isDown = false;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Velocidade do scroll
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Suporte a eventos de toque para dispositivos móveis
    carousel.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    }, { passive: true });

    carousel.addEventListener('touchend', () => {
        isDown = false;
    }, { passive: true });

    carousel.addEventListener('touchcancel', () => {
        isDown = false;
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    }, { passive: true });
}

/**
 * Configura controles de navegação para um carrossel específico
 */
export function setupCarouselNavigation(carouselId, leftButtonId, rightButtonId) {
    const carousel = document.getElementById(carouselId);
    const leftButton = document.getElementById(leftButtonId);
    const rightButton = document.getElementById(rightButtonId);

    if (!carousel || !leftButton || !rightButton) return;

    leftButton.addEventListener('click', () => {
        carousel.scrollBy({ left: -300, behavior: 'smooth' });
    });

    rightButton.addEventListener('click', () => {
        carousel.scrollBy({ left: 300, behavior: 'smooth' });
    });
}