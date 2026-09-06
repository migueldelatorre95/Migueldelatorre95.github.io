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
  const heroRoleText = document.getElementById('heroRoleText');
  const fullRoleText = 'Auxiliar Administrativo y Técnico en Sistemas Microinformáticos';
  if (heroRoleText) {
    if (prefersReducedMotion) {
      heroRoleText.textContent = fullRoleText;
    } else {
      let i = 0;
      (function typeChar(){
        heroRoleText.textContent = fullRoleText.slice(0, i);
        i++;
        if (i <= fullRoleText.length) setTimeout(typeChar, 28);
      })();
    }
  }

  // contadores animados en "En cifras"
  const counters = document.querySelectorAll('.cifra .num[data-count]');
  function animateCount(el, target, suffix, duration){
    const start = performance.now();
    function step(now){
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString('es-ES') + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('es-ES') + suffix;
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach(el => { el.textContent = parseInt(el.dataset.count, 10).toLocaleString('es-ES') + (el.dataset.suffix || ''); });
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
