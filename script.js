  // idioma activo: preferencia guardada o detectada del navegador, limitado a 'es' / 'en'
  // (el motor de traducción completo vive al final de este archivo, junto al selector de idioma)
  function detectarIdiomaInicial(){
    try {
      const guardado = localStorage.getItem('lang-preference');
      if (guardado === 'es' || guardado === 'en') return guardado;
    } catch(e){}
    const idiomaNavegador = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
    return idiomaNavegador.indexOf('es') === 0 ? 'es' : 'en';
  }
  let idiomaActual = detectarIdiomaInicial();

  // nav mobile toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
  mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
  }));

  // active link on scroll
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = [...new Set([...navLinks].map(l => l.dataset.target))]
    .map(id => document.getElementById(id)).filter(Boolean);
  function setActive(){
    let current = sections[0] && sections[0].id;
    const y = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.target === current));
  }
  window.addEventListener('scroll', setActive, {passive:true});
  setActive();
  // respeta la preferencia de "reducir movimiento" del sistema
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // barra de progreso de scroll
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, {passive:true});
  updateScrollProgress();

  // botón "volver arriba"
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop(){
    backToTop.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', toggleBackToTop, {passive:true});
  backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior: prefersReducedMotion ? 'auto' : 'smooth'}));
  toggleBackToTop();

  // barra de contacto fija en móvil (aparece al hacer scroll, se oculta en el propio Contacto)
  const stickyCta = document.getElementById('stickyCta');
  const contactoSection = document.getElementById('contacto');
  function toggleStickyCta(){
    const pastHero = window.scrollY > window.innerHeight * 0.6;
    const enContacto = contactoSection && contactoSection.getBoundingClientRect().top < window.innerHeight * 0.5;
    stickyCta.classList.toggle('show', pastHero && !enContacto);
  }
  if (stickyCta) {
    window.addEventListener('scroll', toggleStickyCta, {passive:true});
    toggleStickyCta();
  }

  // efecto de escritura tipo terminal en el rol del hero
  // (el texto se pasa desde el selector de idioma, más abajo, y se relanza al cambiar de idioma)
  const heroRoleText = document.getElementById('heroRoleText');
  let heroTypingTimeoutId = null;
  function escribirRolHero(texto){
    if (!heroRoleText) return;
    if (heroTypingTimeoutId) { clearTimeout(heroTypingTimeoutId); heroTypingTimeoutId = null; }
    if (prefersReducedMotion) {
      heroRoleText.textContent = texto;
    } else {
      let i = 0;
      (function typeChar(){
        heroRoleText.textContent = texto.slice(0, i);
        i++;
        if (i <= texto.length) heroTypingTimeoutId = setTimeout(typeChar, 28);
      })();
    }
  }

  // contadores animados en "En cifras"
  // el locale de formato numérico sigue al idioma activo (ver selector de idioma, más abajo)
  function localeNumeros(){ return idiomaActual === 'en' ? 'en-US' : 'es-ES'; }
  const counters = document.querySelectorAll('.cifra .num[data-count]');
  function animateCount(el, target, suffix, duration){
    const start = performance.now();
    function step(now){
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString(localeNumeros()) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else { el.textContent = target.toLocaleString(localeNumeros()) + suffix; el.dataset.counted = '1'; }
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach(el => { el.textContent = parseInt(el.dataset.count, 10).toLocaleString(localeNumeros()) + (el.dataset.suffix || ''); el.dataset.counted = '1'; });
    } else {
      const counterIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            animateCount(el, parseInt(el.dataset.count, 10), el.dataset.suffix || '', 1400);
            counterIO.unobserve(el);
          }
        });
      }, {threshold:0.4});
      counters.forEach(el => counterIO.observe(el));
    }
  }

  // animación de aparición al hacer scroll
  if ('IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll(
      '.heading-center, .heading-left, .skill-card, .formacion-card, .t-item, .about-stat, .cifras-band, .contact-item, .social-row, .thanks-line'
    );
    revealTargets.forEach((el, i) => {
      el.classList.add('reveal-init');
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
    });
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
    revealTargets.forEach(el => revealIO.observe(el));
  }

  // selector de tema: claro / oscuro / sistema
  (function initSelectorTema(){
    const CLAVE_TEMA = 'theme-preference';
    const raiz = document.documentElement;
    const botonesTema = document.querySelectorAll('.theme-btn');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const coloresPorTema = { dark: '#21242b', light: '#faf8f3' };
    const prefiereOscuroMQ = window.matchMedia('(prefers-color-scheme: dark)');

    function obtenerPreferencia(){
      try { return localStorage.getItem(CLAVE_TEMA) || 'system'; }
      catch(e){ return 'system'; }
    }

    function temaEfectivo(preferencia){
      return preferencia === 'system' ? (prefiereOscuroMQ.matches ? 'dark' : 'light') : preferencia;
    }

    function aplicarTema(preferencia){
      const efectivo = temaEfectivo(preferencia);
      raiz.setAttribute('data-theme', efectivo);
      if (metaThemeColor) metaThemeColor.setAttribute('content', coloresPorTema[efectivo]);
      botonesTema.forEach(boton => {
        const activo = boton.dataset.themeChoice === preferencia;
        boton.classList.toggle('active', activo);
        boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
      });
    }

    function guardarPreferencia(preferencia){
      try { localStorage.setItem(CLAVE_TEMA, preferencia); } catch(e){}
      aplicarTema(preferencia);
    }

    botonesTema.forEach(boton => {
      boton.addEventListener('click', () => guardarPreferencia(boton.dataset.themeChoice));
    });

    // si está en modo "sistema", sigue en vivo los cambios de preferencia del SO
    prefiereOscuroMQ.addEventListener('change', () => {
      if (obtenerPreferencia() === 'system') aplicarTema('system');
    });

    aplicarTema(obtenerPreferencia());
  })();

  // selector de idioma: español / inglés
  // (idiomaActual, escribirRolHero, counters y localeNumeros están declarados al principio del archivo)
  (function initSelectorIdioma(){
    const CLAVE_IDIOMA = 'lang-preference';
    const raiz = document.documentElement;
    const botonesIdioma = document.querySelectorAll('.lang-btn');

    const TRADUCCIONES = {
      es: {
        meta: {
          title: 'Miguel De La Torre — Auxiliar Administrativo · Sistemas Microinformáticos',
          description: 'Miguel De La Torre — Auxiliar Administrativo y Técnico en Sistemas Microinformáticos en Las Palmas de Gran Canaria. Formación práctica en gestión administrativa, redes y mantenimiento de equipos, con disponibilidad inmediata.'
        },
        nav: { inicio:'Inicio', sobreMi:'Sobre mí', habilidades:'Habilidades', formacion:'Formación', experiencia:'Experiencia', contacto:'Contacto', openMenu:'Abrir menú' },
        lang: { groupLabel: 'Seleccionar idioma' },
        theme: { groupLabel:'Seleccionar tema', lightAria:'Tema claro', lightTitle:'Claro', darkAria:'Tema oscuro', darkTitle:'Oscuro', systemAria:'Tema del sistema', systemTitle:'Sistema' },
        hero: {
          greet:'Hola, soy',
          role:'Auxiliar Administrativo y Técnico en Sistemas Microinformáticos',
          contactBtn:'Contáctame',
          downloadBtn:'Descargar CV',
          ariaWebsite:'Sitio web',
          ariaEmail:'Enviar correo',
          ariaCall:'Llamar',
          photoAlt:'Foto de Miguel De La Torre'
        },
        about: {
          title:'Sobre mí',
          textHtml:'Soy una persona con muchas ganas de trabajar y <span class="accent-text">en formación constante</span> en sistemas microinformáticos y en gestión administrativa. Gracias a esta formación práctica —siempre con casos reales de bases de datos, tesorería, nóminas, montaje de equipos y atención al cliente— he ido adquiriendo las habilidades necesarias para introducirme con garantías en el mercado laboral.',
          tag1:'Trabajo en equipo', tag2:'Capacidad de análisis', tag3:'Habilidades comunicativas', tag4:'Atención al cliente',
          stat1Label:'de formación acumulada', stat2Label:'certificados de profesionalidad', stat3Label:'ubicación'
        },
        skills: {
          title:'Mis Habilidades',
          subtitle:'Conocimientos técnicos aplicados en casos prácticos reales durante mi formación.',
          levelHigh:'NIVEL ALTO', levelLow:'NIVEL BAJO', levelMedium:'NIVEL MEDIO',
          redesLocales:'Redes Locales', ofimatica:'Ofimática'
        },
        formacion: {
          title:'Formación',
          subtitle:'Certificados de profesionalidad reglados, con casos prácticos reales en cada uno.',
          card1Title:'Actividades de Gestión Administrativa',
          card2Title:'Sistemas Microinformáticos',
          card3Title:'Reparación de Móviles',
          card4Title:'Montaje y Mantenimiento de Sistemas Microinformáticos',
          card5Title:'Servicios Administrativos y Generales',
          card6Title:'Grabación y Tratamiento de Datos y Documentos',
          level1:'Nivel 1', level2:'Nivel 2'
        },
        experiencia: {
          title:'Experiencia',
          subtitle:'Prácticas de empresa realizadas durante mi formación.',
          t1Role:'Instalación de Sistemas Microinformáticos',
          t1Desc:'Diagnóstico e instalación de ordenadores.',
          t2Year:'DIC 2023',
          t2Role:'Reparación y Mantenimiento de Sistemas Microinformáticos',
          t2Desc:'Diagnóstico, reparación y mantenimiento de hardware y software en ordenadores y PC; configuración de sistemas operativos y recuperación de datos.',
          t3Role:'Auxiliar Administrativo / Atención Telefónica',
          t3Desc:'Gestión y archivo de documentación administrativa y digitalización de expedientes.',
          t4Role:'Auxiliar Administrativo / Atención Telefónica',
          t4Desc:'Atención al cliente telefónica, filtro de llamadas y resolución de incidencias.'
        },
        cifras: {
          stat3Value:'Inmediata', stat3Label:'disponibilidad para trabajar',
          tag1:'Inscrito en Garantía Juvenil', tag2:'Programa Certifícate'
        },
        contacto: {
          title:'Contacto',
          lead:'¿Hablamos? Cuéntame en qué puedo ayudarte.',
          address:'Las Palmas de Gran Canaria, España',
          ariaEmail:'Correo', ariaPhone:'Teléfono',
          thanks:'Gracias por leer hasta el final ✨'
        },
        footer: { text:'Miguel De La Torre — Auxiliar Administrativo · Las Palmas de Gran Canaria' },
        backToTop: { label:'Volver arriba' }
      },
      en: {
        meta: {
          title: 'Miguel De La Torre — Administrative Assistant · Microcomputer Systems',
          description: 'Miguel De La Torre — Administrative Assistant and Microcomputer Systems Technician in Las Palmas de Gran Canaria. Hands-on training in administrative management, networking and equipment maintenance, available immediately.'
        },
        nav: { inicio:'Home', sobreMi:'About', habilidades:'Skills', formacion:'Training', experiencia:'Experience', contacto:'Contact', openMenu:'Open menu' },
        lang: { groupLabel: 'Select language' },
        theme: { groupLabel:'Select theme', lightAria:'Light theme', lightTitle:'Light', darkAria:'Dark theme', darkTitle:'Dark', systemAria:'System theme', systemTitle:'System' },
        hero: {
          greet:"Hi, I'm",
          role:'Administrative Assistant and Microcomputer Systems Technician',
          contactBtn:'Contact me',
          downloadBtn:'Download CV',
          ariaWebsite:'Website',
          ariaEmail:'Send email',
          ariaCall:'Call',
          photoAlt:'Photo of Miguel De La Torre'
        },
        about: {
          title:'About me',
          textHtml:'I\'m someone eager to work and <span class="accent-text">constantly training</span> in microcomputer systems and administrative management. Thanks to this hands-on training — always working with real cases in databases, treasury, payroll, equipment assembly and customer service — I\'ve been building the skills I need to enter the job market with confidence.',
          tag1:'Teamwork', tag2:'Analytical skills', tag3:'Communication skills', tag4:'Customer service',
          stat1Label:'of accumulated training', stat2Label:'professional certificates', stat3Label:'location'
        },
        skills: {
          title:'My Skills',
          subtitle:'Technical knowledge applied to real practical cases during my training.',
          levelHigh:'HIGH LEVEL', levelLow:'LOW LEVEL', levelMedium:'MEDIUM LEVEL',
          redesLocales:'Local Networks', ofimatica:'Office Suite'
        },
        formacion: {
          title:'Training',
          subtitle:'Official professional certificates, each with real hands-on cases.',
          card1Title:'Administrative Management Activities',
          card2Title:'Microcomputer Systems',
          card3Title:'Mobile Phone Repair',
          card4Title:'Assembly and Maintenance of Microcomputer Systems',
          card5Title:'General Administrative Services',
          card6Title:'Data and Document Recording and Processing',
          level1:'Level 1', level2:'Level 2'
        },
        experiencia: {
          title:'Experience',
          subtitle:'Company internships completed during my training.',
          t1Role:'Microcomputer Systems Installation',
          t1Desc:'Computer diagnostics and installation.',
          t2Year:'DEC 2023',
          t2Role:'Microcomputer Systems Repair and Maintenance',
          t2Desc:'Hardware and software diagnostics, repair and maintenance on computers and PCs; operating system setup and data recovery.',
          t3Role:'Administrative Assistant / Phone Support',
          t3Desc:'Management and filing of administrative documentation and digitization of records.',
          t4Role:'Administrative Assistant / Phone Support',
          t4Desc:'Telephone customer service, call screening and issue resolution.'
        },
        cifras: {
          stat3Value:'Immediate', stat3Label:'availability to work',
          tag1:'Enrolled in Youth Guarantee', tag2:'Certifícate Program'
        },
        contacto: {
          title:'Contact',
          lead:'Let\'s talk? Tell me how I can help.',
          address:'Las Palmas de Gran Canaria, Spain',
          ariaEmail:'Email', ariaPhone:'Phone',
          thanks:'Thanks for reading all the way to the end ✨'
        },
        footer: { text:'Miguel De La Torre — Administrative Assistant · Las Palmas de Gran Canaria' },
        backToTop: { label:'Back to top' }
      }
    };

    function obtenerTraduccion(idioma, clave){
      return clave.split('.').reduce((obj, parte) => (obj && obj[parte] !== undefined) ? obj[parte] : undefined, TRADUCCIONES[idioma]);
    }

    function aplicarIdioma(idioma){
      idiomaActual = idioma;
      raiz.setAttribute('lang', idioma);

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const valor = obtenerTraduccion(idioma, el.dataset.i18n);
        if (valor !== undefined) el.textContent = valor;
      });

      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const valor = obtenerTraduccion(idioma, el.dataset.i18nHtml);
        if (valor !== undefined) el.innerHTML = valor;
      });

      document.querySelectorAll('[data-i18n-attrs]').forEach(el => {
        let mapa;
        try { mapa = JSON.parse(el.dataset.i18nAttrs); } catch(e){ return; }
        Object.keys(mapa).forEach(atributo => {
          const valor = obtenerTraduccion(idioma, mapa[atributo]);
          if (valor !== undefined) el.setAttribute(atributo, valor);
        });
      });

      botonesIdioma.forEach(boton => {
        const activo = boton.dataset.langChoice === idioma;
        boton.classList.toggle('active', activo);
        boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
      });

      // relanza el efecto de escritura del rol con el texto del idioma activo
      escribirRolHero(obtenerTraduccion(idioma, 'hero.role'));

      // reformatea los contadores que ya se mostraron, con el separador de miles del nuevo idioma
      counters.forEach(el => {
        if (el.dataset.counted === '1') {
          const objetivo = parseInt(el.dataset.count, 10);
          el.textContent = objetivo.toLocaleString(localeNumeros()) + (el.dataset.suffix || '');
        }
      });
    }

    function guardarIdioma(idioma){
      try { localStorage.setItem(CLAVE_IDIOMA, idioma); } catch(e){}
      aplicarIdioma(idioma);
    }

    botonesIdioma.forEach(boton => {
      boton.addEventListener('click', () => guardarIdioma(boton.dataset.langChoice));
    });

    aplicarIdioma(idiomaActual);
  })();
