window.F8Live = {
  init(root) {
    if (!root || root.__f8live) return;
    root.__f8live = true;
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const below = el => el.getBoundingClientRect().top > innerHeight * 0.9;
    const once = (el, fn, thr) => {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold: thr });
      io.observe(el);
    };

    // 1. Blocks appear on scroll
    root.querySelectorAll('section').forEach(sec => {
      if (sec.id === 'top' || sec.querySelector('[data-bubble]')) return;
      [...sec.children].filter(below).forEach((k, i) => {
        Object.assign(k.style, { opacity: '0', transform: 'translateY(16px)', transition: 'opacity .5s ease-out, transform .5s ease-out', transitionDelay: (Math.min(i, 3) * 80) + 'ms' });
        once(k, () => { k.style.opacity = ''; k.style.transform = ''; }, 0.12);
      });
    });

    // 2. Data-source chain lights up
    const chain = [...root.querySelectorAll('[data-chain]')];
    if (chain.length && below(chain[0])) {
      chain.forEach(el => {
        el.style.transition = 'color .3s linear, background-color .4s linear';
        el.__bg = el.style.backgroundColor; el.__fg = el.style.color;
        el.style.color = '#a3a3a3';
        if (el.dataset.chain === 'ai') el.style.backgroundColor = '#e5e5e5';
      });
      once(chain[0].parentElement, () => chain.forEach((el, i) => setTimeout(() => { el.style.color = el.__fg; el.style.backgroundColor = el.__bg; }, 500 + i * 380)), 0.6);
    }

    // 4. Counters
    root.querySelectorAll('[data-count]').forEach(el => {
      if (!below(el)) return;
      const to = Number(el.dataset.count), fmt = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      el.textContent = fmt(0);
      once(el, () => {
        const t0 = performance.now(), dur = 1400;
        const step = now => { const p = Math.min(1, (now - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }, 0.6);
    });

    // 3. Digest arrives in the phone
    root.querySelectorAll('[data-dg-phone]').forEach(ph => {
      if (!below(ph)) return;
      const typing = ph.querySelector('[data-dg="typing"]'), msg = ph.querySelector('[data-dg="msg"]'),
        cards = [...ph.querySelectorAll('[data-dg="card"]')], btns = ph.querySelector('[data-dg="btns"]');
      if (!typing || !msg) return;
      const hide = el => el && Object.assign(el.style, { opacity: '0', transform: 'translateY(8px)', transition: 'opacity .35s ease-out, transform .35s ease-out' });
      const show = el => { if (el) { el.style.opacity = ''; el.style.transform = ''; } };
      [msg, ...cards, btns].forEach(hide);
      Object.assign(typing.style, { display: 'flex', opacity: '0', transition: 'opacity .25s linear' });
      typing.querySelectorAll('[data-dot]').forEach((d, i) => d.animate && d.animate([{ opacity: .25 }, { opacity: 1 }, { opacity: .25 }], { duration: 1000, iterations: Infinity, delay: i * 160 }));
      once(ph, () => {
        const T = (ms, f) => setTimeout(f, ms);
        T(300, () => { typing.style.opacity = '1'; });
        T(1900, () => { typing.style.display = 'none'; show(msg); show(cards[0]); });
        T(2600, () => show(cards[1]));
        T(3300, () => show(cards[2]));
        T(3900, () => show(btns));
      }, 0.55);
    });
  }
};
