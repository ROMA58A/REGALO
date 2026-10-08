document.addEventListener('DOMContentLoaded', () => {
  const revealItems = document.querySelectorAll(
    '.hero-copy > *, .hero-art, .steps-strip, .section-heading, .form-card, .preview-column, .letter-card, .coupon-card, .letter-actions, .site-footer'
  );

  revealItems.forEach((item, index) => {
    item.classList.add('reveal-on-scroll');
    item.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
  });
  document.body.classList.add('has-reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const progressBar = document.getElementById('scroll-progress-bar');
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Volver arriba');
  backToTop.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
  document.body.append(backToTop);
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  let scrollTicking = false;
  const updateScrollEffects = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      revealItems.forEach((item) => {
        const bounds = item.getBoundingClientRect();
        if (bounds.top < window.innerHeight - 30 && bounds.bottom > 30) {
          item.classList.add('is-visible');
        }
      });
      if (progressBar) {
        progressBar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
      }
      backToTop.classList.toggle('is-visible', window.scrollY > 450);
      scrollTicking = false;
    });
  };
  window.addEventListener('scroll', updateScrollEffects, { passive: true });
  window.addEventListener('resize', updateScrollEffects);
  updateScrollEffects();

  const burstHearts = (x, y, amount = 14) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const symbols = ['♥', '♡', '✦', '✿'];
    for (let index = 0; index < amount; index += 1) {
      const particle = document.createElement('span');
      particle.className = 'heart-particle';
      particle.setAttribute('aria-hidden', 'true');
      particle.textContent = symbols[index % symbols.length];
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--particle-x', `${(Math.random() - 0.5) * 240}px`);
      particle.style.setProperty('--particle-y', `${-55 - Math.random() * 180}px`);
      particle.style.setProperty('--particle-rotate', `${(Math.random() - 0.5) * 100}deg`);
      particle.style.setProperty('--particle-delay', `${Math.random() * 160}ms`);
      document.body.append(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    }
  };

  document.getElementById('send-heart')?.addEventListener('click', (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    burstHearts(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 24);
    event.currentTarget.classList.remove('heart-pulse');
    void event.currentTarget.offsetWidth;
    event.currentTarget.classList.add('heart-pulse');
  });
  document.addEventListener('cartitas:celebrate', () => {
    burstHearts(window.innerWidth / 2, window.innerHeight * 0.55, 28);
  });
});
