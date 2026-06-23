/* ============================================
   FURILAN Inc. — Interactions
   ============================================ */

// ---------- ローディング ----------
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 700);
});

// ---------- パーティクル(ニューラルネットワーク風) ----------
(() => {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, particles;
  const mouse = { x: null, y: null };
  const LINK_DIST = 140;
  const MOUSE_DIST = 200;

  // テーマで切り替わるパーティクルの配色
  let palette = { dots: ['79, 124, 255', '0, 224, 198'], link: '120, 150, 255' };
  window.__furilanSetParticlePalette = (p) => {
    palette = p;
    if (reduced) drawStatic();
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const count = Math.min(Math.floor((width * height) / 14000), 110);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.6,
      tone: Math.random() < 0.5 ? 0 : 1,
    }));
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${palette.dots[p.tone]}, 0.7)`;
      ctx.fill();
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // マウスに緩やかに引き寄せられる
      if (mouse.x !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST && dist > 0.001) {
          p.x += (dx / dist) * 0.35;
          p.y += (dy / dist) * 0.35;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${palette.dots[p.tone]}, 0.7)`;
      ctx.fill();
    }

    // ノード間のリンク
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${palette.link}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  resize();
  if (reduced) {
    drawStatic();
  } else {
    step();
  }
})();

// ---------- カーソルグロー ----------
(() => {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  document.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
})();

// ---------- ナビゲーション ----------
(() => {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      links.classList.remove('open');
    })
  );
})();

// ---------- スクロールリビール ----------
(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();

// ---------- カウントアップ ----------
(() => {
  const counters = document.querySelectorAll('.counter');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1600;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => observer.observe(el));
})();

// ---------- 事例アコーディオン ----------
(() => {
  document.querySelectorAll('.case-toggle').forEach((btn) => {
    const panel = btn.nextElementSibling;
    const label = btn.querySelector('.case-toggle-label');
    if (!panel) return;

    btn.addEventListener('click', () => {
      const willOpen = !panel.classList.contains('open');
      panel.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
      if (label) label.textContent = willOpen ? 'close' : 'case';
    });
  });
})();

// ---------- カードの3Dチルト&グロー ----------
(() => {
  const cards = document.querySelectorAll('.tilt');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;

  cards.forEach((card) => {
    const glowEl = card.querySelector('.service-card-glow');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -8;
      const ry = ((x / rect.width) - 0.5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      if (glowEl) {
        card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ---------- 事業内容カルーセル: 三角矢印で横移動 ----------
(() => {
  const track = document.querySelector('.service-cards-4');
  const prev = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  if (!track || !prev || !next) return;

  const stepSize = () => {
    const card = track.querySelector('.service-card');
    return card ? card.offsetWidth + 24 : 354;
  };

  function update() {
    const max = track.scrollWidth - track.clientWidth;
    prev.classList.toggle('is-hidden', track.scrollLeft <= 4);
    next.classList.toggle('is-hidden', track.scrollLeft >= max - 4 || max <= 0);
  }

  prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ---------- 隠しギミック: ヒーローをダブルクリックで世界観チェンジ ----------
(() => {
  const hero = document.getElementById('top');
  if (!hero) return;

  const SKINS = [
    { name: 'FUTURE',    skin: null,         dots: ['79, 124, 255', '0, 224, 198'], link: '120, 150, 255' },
    { name: 'TERMINAL',  skin: 'terminal',   dots: ['57, 255, 122', '170, 255, 0'], link: '60, 220, 120' },
    { name: 'EDITORIAL', skin: 'editorial',  dots: ['180, 83, 47', '31, 111, 86'],  link: '120, 110, 100' },
  ];
  let idx = 0;

  const toast = document.createElement('div');
  toast.className = 'theme-toast';
  toast.setAttribute('aria-live', 'polite');
  const flash = document.createElement('div');
  flash.className = 'theme-flash';
  document.body.appendChild(flash);
  document.body.appendChild(toast);

  let toastTimer;
  function apply(i) {
    const t = SKINS[i];
    if (t.skin) document.body.setAttribute('data-skin', t.skin);
    else document.body.removeAttribute('data-skin');

    if (window.__furilanSetParticlePalette) {
      window.__furilanSetParticlePalette({ dots: t.dots, link: t.link });
    }

    toast.innerHTML = '<span>WORLD</span><b>' + t.name + '</b>';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);

    flash.classList.remove('flash-anim');
    void flash.offsetWidth;
    flash.classList.add('flash-anim');
  }

  hero.addEventListener('dblclick', () => {
    const sel = window.getSelection && window.getSelection();
    if (sel) sel.removeAllRanges();
    idx = (idx + 1) % SKINS.length;
    apply(idx);
  });
})();
