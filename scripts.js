// Desplazamiento suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(anchor.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});


let lastScroll = 0;
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > lastScroll && currentScroll > 60) {
    header.style.top = '-100px'; // Oculta
  } else {
    header.style.top = '0'; // Muestra
  }
  lastScroll = currentScroll;
});


// --- Imagenes de servicios: cambiar a GIF al hover y restaurar al salir ---
// Lógica:
// - Cada imagen .servicio-img debe tener data-static (ya agregado en HTML)
// - Si existe un GIF correspondiente, lo detectamos probando src con extensión .gif
// - Al entrar con el mouse se reemplaza src por el GIF (con cache-bust para reiniciar la animación)
// - Al salir se restaura data-static

function detectGifForImage(img, callback) {
  const staticSrc = img.dataset.static || img.src;
  // Construir candidato cambiando extensión a .gif
  const candidate = staticSrc.replace(/\.[^.]+$/, '.gif');
  const tester = new Image();
  tester.onload = () => callback(candidate);
  tester.onerror = () => callback(null);
  tester.src = candidate;
}

function setupServicioGifHover() {
  const servicios = document.querySelectorAll('.servicio');
  servicios.forEach(serv => {
    const img = serv.querySelector('.servicio-img');
    if (!img) return;
    // Asegurar data-static
    if (!img.dataset.static) img.dataset.static = img.src;

    // Detectar gif si no fue proporcionado por el HTML
    if (!img.dataset.gif) {
      detectGifForImage(img, (foundGif) => {
        if (foundGif) img.dataset.gif = foundGif;
      });
    }

    // Listeners de hover y foco (soporte teclado con focus/blur)
    const enter = () => {
      const gif = img.dataset.gif;
      if (gif) {
        // Añadir un query param para reiniciar la animación
        img.src = gif + '?_=' + Date.now();
      } else if ((img.dataset.static || img.src).toLowerCase().endsWith('.gif')) {
        // Si la imagen estática ya es un gif, reload para reiniciar
        img.src = (img.dataset.static || img.src) + '?_=' + Date.now();
      }
    };

    const leave = () => {
      const original = img.dataset.static || img.src;
      // Forzar reset completo del GIF
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      setTimeout(() => {
        img.src = original;
      }, 0);
    };

    serv.addEventListener('mouseenter', enter);
    serv.addEventListener('mouseleave', leave);
    serv.addEventListener('focusin', enter);
    serv.addEventListener('focusout', leave);
  });
}

// Ejecutar al cargar DOM
document.addEventListener('DOMContentLoaded', setupServicioGifHover);

// === Animaciones de entrada por scroll (fade-in cuando la sección entra en viewport)
function setupScrollAnimations() {
  // Selección por defecto: observa las etiquetas <section> y otros contenedores comunes.
  const selectors = [
    'section',
    '.hero-dividido',
    '.nosotros',
    '#contacto',
    '.servicios-container',
    '.portafolio-grid',
    '.equipo-container',
    'footer'
  ];

  const els = document.querySelectorAll(selectors.join(','));
  if (!els.length) return;

  els.forEach(el => {
    // No sobreescribir si el autor ya añadió la clase manualmente
    if (!el.classList.contains('fade-on-scroll')) el.classList.add('fade-on-scroll');
    // Si el contenedor quiere stagger por defecto puede usar el atributo data-stagger
    if (el.dataset.stagger !== undefined) {
      // marcar hijos directos para animar
      Array.from(el.children).forEach(child => child.classList.add('fade-child'));
    }
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      const target = entry.target;
      if (entry.isIntersecting) {
        // Añadir clase que dispara la transición
        target.classList.add('in-view');

        // Si hay hijos directos marcados para stagger, añadir delays y activarlos
        const staggerChildren = Array.from(target.querySelectorAll(':scope > .fade-child'));
        if (staggerChildren.length) {
          staggerChildren.forEach((child, i) => {
            // Delay incremental (ajustable)
            child.style.transitionDelay = `${i * 90}ms`;
            // activar (añadir clase para navegadores que dependan de ello)
            child.classList.add('in-view');
          });
        }

        // Si quieres que la animación se repita cuando sales/entras, comentar la siguiente línea
        obs.unobserve(target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  });

  els.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', setupScrollAnimations);

document.addEventListener("DOMContentLoaded", function() {
  const menuBtn = document.querySelector(".menu-btn");
  const dropdownMenu = document.getElementById("dropdown-menu");

  menuBtn.addEventListener("click", function(e) {
    e.stopPropagation(); // evita que el click se propague y cierre el menú inmediatamente
    dropdownMenu.classList.toggle("show");
  });

  // Cerrar el menú si se hace click fuera
  document.addEventListener("click", function() {
    if (dropdownMenu.classList.contains("show")) {
      dropdownMenu.classList.remove("show");
    }
  });
});
