// Conteúdo de accessibility-scripts.js

// Controles de acessibilidade
const increaseFontBtn = document.getElementById('increaseFont');
const decreaseFontBtn = document.getElementById('decreaseFont');
const highContrastBtn = document.getElementById('highContrast');
const resetAccessibilityBtn = document.getElementById('resetAccessibility');
const root = document.documentElement;
const body = document.body;

if (increaseFontBtn) {
  increaseFontBtn.addEventListener('click', function() {
    let currentSize = parseFloat(getComputedStyle(root).fontSize);
    root.style.fontSize = (currentSize + 1) + 'px';
  });
}

if (decreaseFontBtn) {
  decreaseFontBtn.addEventListener('click', function() {
    let currentSize = parseFloat(getComputedStyle(root).fontSize);
    if (currentSize > 14) { // Limite mínimo para não ficar ilegível
      root.style.fontSize = (currentSize - 1) + 'px';
    }
  });
}

if (highContrastBtn) {
  highContrastBtn.addEventListener('click', function() {
    body.classList.toggle('high-contrast');
  });
}

if (resetAccessibilityBtn) {
  resetAccessibilityBtn.addEventListener('click', function() {
    root.style.fontSize = '16px'; // Reset para o valor padrão
    body.classList.remove('high-contrast');
  });
}

// Foco visível para elementos interativos
document.addEventListener('keyup', function(e) {
  if (e.key === 'Tab') {
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.classList.contains('related-card')) {
      focusedElement.style.outline = '2px dashed var(--primary-color)';
    }
  }
});

document.addEventListener('blur', function(e) {
  const targetElement = e.target;
  if (targetElement && typeof targetElement.classList !== 'undefined' && targetElement.classList.contains('related-card')) {
    targetElement.style.outline = 'none';
  }
}, true);


// Adiciona aria-live para feedback de acessibilidade
const liveRegion = document.createElement('div');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.setAttribute('aria-atomic', 'true');
liveRegion.style.position = 'absolute';
liveRegion.style.width = '1px'; // Para evitar que ocupe espaço visualmente
liveRegion.style.height = '1px';
liveRegion.style.margin = '-1px';
liveRegion.style.padding = '0';
liveRegion.style.overflow = 'hidden';
liveRegion.style.clip = 'rect(0, 0, 0, 0)';
liveRegion.style.border = '0';
// liveRegion.style.left = '-9999px'; // Forma antiga, a combinação acima é mais robusta
body.appendChild(liveRegion);

const accessibilityButtons = document.querySelectorAll('.accessibility-btn');
if (accessibilityButtons.length > 0) { // Verifica se os botões existem
    accessibilityButtons.forEach(button => {
    button.addEventListener('click', function() {
        const action = this.getAttribute('aria-label');
        if (action) { // Verifica se o atributo aria-label existe
            liveRegion.textContent = `Ação executada: ${action}`;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1500); //
        }
    });
    });
}


const videoIframe = document.querySelector('.video-container iframe');
if (videoIframe && !videoIframe.hasAttribute('title')) {
  // Se o iframe não tiver um título, adiciona um genérico.
  videoIframe.setAttribute('title', 'Player de vídeo tutorial');
}