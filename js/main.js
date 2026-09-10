/* ============================================
   FURILAN Inc. — Interactions
   ============================================ */

// ---------- ナビゲーション ----------
(() => {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');
  if (!nav || !burger || !links) return;

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

// ---------- ショーリール: 画面内に入った動画だけ再生 ----------
(() => {
  const videos = document.querySelectorAll('.showreel video');
  if (!videos.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    },
    { threshold: 0.4 }
  );
  videos.forEach((v) => observer.observe(v));
})();

// ---------- CTAクリックの計測(GA4) ----------
// お問い合わせフォームは外部ドメイン(Googleフォーム)のため送信自体は計測できない。
// クリックをイベントとして送り、CVの手前の指標として計測する。
(() => {
  // 資料請求フォームのID(問い合わせフォームと区別してイベントを分ける)
  const DOWNLOAD_FORM = '1FAIpQLSc8oTcN9Q8BlKpBVxqOdA-l9BjEAh98WkcHto-DU-ijRxd4_g';

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="docs.google.com/forms"]');
    if (!link || typeof window.gtag !== 'function') return;
    const isDownload = link.href.includes(DOWNLOAD_FORM);
    window.gtag('event', isDownload ? 'download_cta_click' : 'contact_cta_click', {
      link_url: link.href,
      page_path: location.pathname,
      link_text: (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
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
