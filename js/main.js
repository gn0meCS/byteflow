/**
 * ByteFlow Landing Page - Main JavaScript
 * Mobile nav, smooth scroll, scroll reveal, Telegram CTA URLs.
 */

/** @type {string} Replace YOUR_BOT_USERNAME with your Telegram bot handle */
const TELEGRAM_URL = 'https://t.me/bytefl0wbot';

const HEADER_OFFSET = 72;

/**
 * Wire all Telegram CTAs from a single source of truth.
 */
function initTelegramLinks() {
  document.querySelectorAll('[data-cta="telegram"]').forEach((el) => {
    el.setAttribute('href', TELEGRAM_URL);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });
}

/**
 * Toggle mobile navigation drawer and backdrop.
 */
function initMobileNav() {
  const menuBtn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  const closeBtn = document.getElementById('menu-close');

  if (!menuBtn || !menu || !backdrop) return;

  const openMenu = () => {
    menu.classList.add('is-open');
    backdrop.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  menuBtn.addEventListener('click', () => {
    const isOpen = menu.classList.contains('is-open');
    if (isOpen) closeMenu();
    else openMenu();
  });

  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });
  backdrop.addEventListener('click', closeMenu);

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });
}

/**
 * Smooth scroll for in-page anchor links with header offset.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/**
 * Add shadow to navbar after scrolling past threshold.
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Scroll progress bar at top of viewport.
 */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

/**
 * Floating mobile CTA and scroll-to-top button visibility.
 */
function initFloatingUI() {
  const floatingCta = document.getElementById('floating-cta');
  const scrollTopBtn = document.getElementById('scroll-top');
  const hero = document.getElementById('hero');
  const audit = document.getElementById('audit');

  if (!floatingCta && !scrollTopBtn) return;

  const onScroll = () => {
    const y = window.scrollY;
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight * 0.6 : 400;
    const auditTop = audit ? audit.offsetTop - window.innerHeight * 0.5 : Infinity;

    if (floatingCta) {
      const showCta = y > heroBottom && y < auditTop;
      floatingCta.classList.toggle('is-visible', showCta);
      floatingCta.setAttribute('aria-hidden', showCta ? 'false' : 'true');
    }

    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('is-visible', y > 500);
    }
  };

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Animate stat counters when visible.
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const value = target * eased;
      el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/**
 * Highlight active nav link based on scroll position.
 */
function initActiveNav() {
  const sections = ['services', 'pain', 'process', 'audit']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const links = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const onScroll = () => {
    const y = window.scrollY + HEADER_OFFSET + 40;
    let current = '';

    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section.id;
    });

    links.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('is-active', href === `#${current}`);
    });
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Interactive pain-point tabs (sidebar buttons + detail panels).
 */
function initPainTabs() {
  const tabs = document.querySelectorAll('[data-pain-tab]');
  const panels = document.querySelectorAll('.pain-panel');

  if (!tabs.length || !panels.length) return;

  const activate = (id) => {
    tabs.forEach((tab) => {
      const isActive = tab.getAttribute('data-pain-tab') === id;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      const panelId = panel.id.replace('pain-panel-', '');
      const isActive = panelId === id;
      panel.classList.toggle('is-active', isActive);
      if (isActive) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activate(tab.getAttribute('data-pain-tab'));
    });
  });
}

/**
 * Reveal elements on scroll using Intersection Observer.
 */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initTelegramLinks();
  initMobileNav();
  initSmoothScroll();
  initHeaderScroll();
  initScrollProgress();
  initFloatingUI();
  initCounters();
  initActiveNav();
  initPainTabs();
  initScrollReveal();
});
