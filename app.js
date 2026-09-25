(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-site-nav]');
  const chapterNav = document.querySelector('[data-chapter-nav]');
  const menuButton = document.querySelector('[data-menu-button]');
  const progress = document.querySelector('[data-progress]');
  const heroRe = document.querySelector('[data-hero-re]');
  const heroImage = document.querySelector('[data-parallax="image"] img');
  const softParallax = Array.from(document.querySelectorAll('[data-parallax="soft"] img'));
  const driftLeft = Array.from(document.querySelectorAll('[data-drift="left"] img'));
  const driftRight = Array.from(document.querySelectorAll('[data-drift="right"] img'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const syncScroll = () => {
    const y = window.scrollY || 0;
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (progress) progress.style.transform = `scaleX(${clamp(y / maxScroll, 0, 1)})`;
    if (reducedMotion) return;

    if (heroRe) heroRe.style.transform = `translate3d(0, ${Math.min(48, y * 0.055)}px, 0)`;
    if (heroImage && y < window.innerHeight * 1.25) {
      heroImage.style.transform = `translate3d(0, ${-4 + y * 0.018}%, 0) scale(1.015)`;
    }

    const vh = window.innerHeight;
    softParallax.forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - vh / 2;
      img.style.setProperty('--parallax-y', `${clamp(-center * 0.018, -18, 18)}px`);
    });
    [...driftLeft, ...driftRight].forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      const ratio = clamp((vh - rect.top) / (vh + rect.height), 0, 1) - .5;
      const sign = driftRight.includes(img) ? -1 : 1;
      img.style.setProperty('--drift-x', `${ratio * 22 * sign}px`);
    });
  };
  syncScroll();
  window.addEventListener('scroll', syncScroll, { passive: true });
  window.addEventListener('resize', syncScroll, { passive: true });

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const target = chapterNav || nav;
      const open = target.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      (chapterNav || nav).classList.remove('is-open');
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const navLinks = Array.from(document.querySelectorAll('[data-nav-section]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    const sections = navLinks.map(link => document.getElementById(link.dataset.navSection)).filter(Boolean);
    const setActive = id => {
      navLinks.forEach(link => link.classList.toggle('is-active', link.dataset.navSection === id));
    };
    const spy = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-28% 0px -56% 0px', threshold: [0, .12, .3, .55] });
    sections.forEach(section => spy.observe(section));
  }

  const exteriorImage = document.querySelector('[data-exterior-image]');
  const exteriorWrap = exteriorImage?.closest('.architecture-visual');
  document.querySelectorAll('[data-exterior-src]').forEach(button => {
    button.addEventListener('click', () => {
      if (!exteriorImage || button.classList.contains('is-active')) return;
      document.querySelectorAll('[data-exterior-src]').forEach(btn => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      exteriorWrap?.classList.add('is-switching');
      const next = new Image();
      next.onload = () => {
        exteriorImage.src = button.dataset.exteriorSrc;
        if (button.dataset.alt) exteriorImage.alt = button.dataset.alt;
        requestAnimationFrame(() => exteriorWrap?.classList.remove('is-switching'));
      };
      next.src = button.dataset.exteriorSrc;
    });
  });

  const planViewer = document.querySelector('[data-plan-viewer]');
  if (planViewer) {
    const tabs = Array.from(planViewer.querySelectorAll('[data-plan-tab]'));
    const panels = Array.from(planViewer.querySelectorAll('[data-plan-panel]'));
    const activatePlan = key => {
      tabs.forEach(tab => {
        const active = tab.dataset.planTab === key;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      panels.forEach(panel => {
        const active = panel.dataset.planPanel === key;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      });
    };
    tabs.forEach(tab => tab.addEventListener('click', () => activatePlan(tab.dataset.planTab)));
    activatePlan('site');
  }

  const revealItems = document.querySelectorAll('[data-reveal]');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  const processSequence = document.querySelector('[data-process-sequence]');
  if (processSequence && 'IntersectionObserver' in window) {
    const processObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          processSequence.classList.add('is-sequence-visible');
          processObserver.disconnect();
        }
      });
    }, { threshold: .16 });
    processObserver.observe(processSequence);
  } else if (processSequence) {
    processSequence.classList.add('is-sequence-visible');
  }

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
