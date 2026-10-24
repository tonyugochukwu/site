/* ========================================
   ELECTRIC CYAN PORTFOLIO – Shared JS
   Cinematic canvas + interactions
======================================== */

(() => {
  'use strict';

  // ---------- Welcome Chime on page load ----------
  function playWelcome() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      [523.25, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1);
      });
    } catch (e) { 
      console.log("Audio blocked by browser"); 
    }
  }

  // Trigger it right after the page loads
  window.addEventListener('load', () => {
    setTimeout(playWelcome, 1500); // 1.5s delay so the visual content loads first
  });

  // ---------- Mobile Menu ----------
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  menuToggle?.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu?.classList.toggle('open');
    document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu?.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle?.classList.remove('active');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ---------- Year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- Counter ----------
  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';
    const target = parseInt(el.dataset.count, 10);
    const duration = 1700;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  document.querySelectorAll('[data-count]').forEach(el => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounter(el);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  // ---------- Contact form (Formspree) ----------
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        contactForm.reset();
        if (formStatus) {
          formStatus.textContent = 'Message sent! I will get back to you soon.';
          formStatus.className = 'form-status success';
        }
        setTimeout(() => {
          if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
          }
        }, 5000);
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      if (formStatus) {
        formStatus.textContent = 'Oops! Something went wrong. Please try again.';
        formStatus.className = 'form-status error';
      }
    }
  });

  // ---------- CINEMATIC CANVAS (only on home) ----------
  const canvas = document.getElementById('cinematicCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let planes = [];
  let silhouettes = [];
  let techLines = [];

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  // Particles
  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * width;
      this.y = init ? Math.random() * height : height + 20;
      this.size = Math.random() * 1.6 + 0.3;
      this.speedY = Math.random() * 0.4 + 0.1;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.15;
      this.color = Math.random() > 0.7 ? '255, 45, 155' : '0, 240, 255';
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -20 || this.x < -20 || this.x > width + 20) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Planes (simple geometric)
  class Plane {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = init ? Math.random() * width : -80;
      this.y = Math.random() * height * 0.55 + 40;
      this.speed = Math.random() * 1.2 + 0.6;
      this.size = Math.random() * 18 + 14;
      this.opacity = Math.random() * 0.35 + 0.15;
      this.wingAngle = 0;
    }
    update() {
      this.x += this.speed;
      this.wingAngle += 0.15;
      if (this.x > width + 100) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#00f0ff';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.2;

      // body
      ctx.beginPath();
      ctx.moveTo(this.size, 0);
      ctx.lineTo(-this.size * 0.6, -this.size * 0.25);
      ctx.lineTo(-this.size * 0.4, 0);
      ctx.lineTo(-this.size * 0.6, this.size * 0.25);
      ctx.closePath();
      ctx.fill();

      // wings
      const wingFlap = Math.sin(this.wingAngle) * 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-this.size * 0.3, -this.size * 0.7 - wingFlap);
      ctx.lineTo(this.size * 0.2, 0);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-this.size * 0.3, this.size * 0.7 + wingFlap);
      ctx.lineTo(this.size * 0.2, 0);
      ctx.closePath();
      ctx.fill();

      // trail
      ctx.strokeStyle = `rgba(0, 240, 255, ${this.opacity * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(-this.size * 0.6, 0);
      ctx.lineTo(-this.size * 2.5, 0);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Walking silhouettes (people passing)
  class Silhouette {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.fromLeft = Math.random() > 0.5;
      this.x = init ? Math.random() * width : (this.fromLeft ? -40 : width + 40);
      this.y = height * 0.72 + Math.random() * height * 0.18;
      this.speed = (Math.random() * 0.7 + 0.35) * (this.fromLeft ? 1 : -1);
      this.scale = Math.random() * 0.4 + 0.55;
      this.opacity = Math.random() * 0.25 + 0.12;
      this.legPhase = Math.random() * Math.PI * 2;
      this.armPhase = this.legPhase + Math.PI;
    }
    update() {
      this.x += this.speed;
      this.legPhase += 0.12;
      this.armPhase += 0.12;
      if ((this.fromLeft && this.x > width + 50) || (!this.fromLeft && this.x < -50)) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale * (this.fromLeft ? 1 : -1), this.scale);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#00f0ff';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      // head
      ctx.beginPath();
      ctx.arc(0, -28, 7, 0, Math.PI * 2);
      ctx.fill();

      // body
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(0, 5);
      ctx.stroke();

      // arms
      const armSwing = Math.sin(this.armPhase) * 12;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(-10, armSwing);
      ctx.moveTo(0, -12);
      ctx.lineTo(10, -armSwing);
      ctx.stroke();

      // legs
      const legSwing = Math.sin(this.legPhase) * 14;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(-8, 28 + legSwing * 0.3);
      ctx.moveTo(0, 5);
      ctx.lineTo(8, 28 - legSwing * 0.3);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Tech floating lines / data streams
  class TechLine {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * width;
      this.y = init ? Math.random() * height : height + 30;
      this.length = Math.random() * 60 + 30;
      this.speed = Math.random() * 0.8 + 0.3;
      this.opacity = Math.random() * 0.3 + 0.1;
      this.color = Math.random() > 0.5 ? '0, 240, 255' : '139, 92, 246';
    }
    update() {
      this.y -= this.speed;
      if (this.y < -this.length) this.reset();
    }
    draw() {
      const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.length);
      grad.addColorStop(0, `rgba(${this.color}, 0)`);
      grad.addColorStop(0.5, `rgba(${this.color}, ${this.opacity})`);
      grad.addColorStop(1, `rgba(${this.color}, 0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y + this.length);
      ctx.stroke();
    }
  }

  function init() {
    particles = [];
    planes = [];
    silhouettes = [];
    techLines = [];

    for (let i = 0; i < 70; i++) particles.push(new Particle());
    for (let i = 0; i < 4; i++) planes.push(new Plane());
    for (let i = 0; i < 7; i++) silhouettes.push(new Silhouette());
    for (let i = 0; i < 18; i++) techLines.push(new TechLine());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // tech lines first (background)
    techLines.forEach(t => { t.update(); t.draw(); });

    // particles
    particles.forEach(p => { p.update(); p.draw(); });

    // connections between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.07 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // planes
    planes.forEach(p => { p.update(); p.draw(); });

    // people walking
    silhouettes.forEach(s => { s.update(); s.draw(); });

    requestAnimationFrame(animate);
  }

  resize();
  init();
  animate();

  window.addEventListener('resize', () => {
    resize();
    init();
  });
})();