// Controles de acessibilidade
document.getElementById('increaseFont').addEventListener('click', function() {
  const root = document.documentElement;
  let currentSize = parseFloat(getComputedStyle(root).fontSize);
  root.style.fontSize = (currentSize + 1) + 'px';
});

document.getElementById('decreaseFont').addEventListener('click', function() {
  const root = document.documentElement;
  let currentSize = parseFloat(getComputedStyle(root).fontSize);
  if (currentSize > 14) {
    root.style.fontSize = (currentSize - 1) + 'px';
  }
});

document.getElementById('highContrast').addEventListener('click', function() {
  document.body.classList.toggle('high-contrast');
});

document.getElementById('resetAccessibility').addEventListener('click', function() {
  document.documentElement.style.fontSize = '16px';
  document.body.classList.remove('high-contrast');
});

// Foco visível para elementos interativos
document.addEventListener('keyup', function(e) {
  if (e.key === 'Tab') {
    const focusedElement = document.activeElement;
    if (focusedElement.classList.contains('tutorial-card')) {
      focusedElement.style.outline = '2px dashed var(--primary-color)';
    }
  }
});

// Adiciona aria-live para feedback de acessibilidade
const liveRegion = document.createElement('div');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.setAttribute('aria-atomic', 'true');
liveRegion.style.position = 'absolute';
liveRegion.style.left = '-9999px';
document.body.appendChild(liveRegion);

document.querySelectorAll('[id^="increaseFont"], [id^="decreaseFont"], [id^="highContrast"], [id^="resetAccessibility"]').forEach(button => {
  button.addEventListener('click', function() {
    const action = this.getAttribute('aria-label');
    liveRegion.textContent = `Ação executada: ${action}`;
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Verifica se estamos na página inicial
  const isHomePage = window.location.pathname.endsWith('index.html') || 
                     window.location.pathname === '/';
  
  // Seleciona o link de Tutoriais
  const tutoriaisLink = document.querySelector('.tutoriais-link');
  
  if (tutoriaisLink) {
    tutoriaisLink.addEventListener('click', function(e) {
      if (isHomePage) {
        // Comportamento na página inicial
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href').split('#')[1]);
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Atualiza a URL sem recarregar
          history.pushState(null, null, '#' + target.id);
        }
      }
      // Em outras páginas, o comportamento padrão (redirecionar) é mantido
    });
  }
  
  // Scroll suave para links âncora na página atual
  document.querySelectorAll('a[href^="#"]:not(.tutoriais-link)').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        history.pushState(null, null, '#' + target.id);
      }
    });
  });
});