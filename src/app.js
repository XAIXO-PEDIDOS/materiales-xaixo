// XAIXO — comportamiento compartido de todas las páginas.

function initReveal() {
  const els = document.querySelectorAll('.rv');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 55}ms`;
    io.observe(el);
  });
}

function initMobileMenu() {
  const header = document.querySelector('header');
  const burger = document.querySelector('.burger');
  if (!header || !burger) return;
  burger.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  header.querySelectorAll('nav.movil a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

const COOKIE_KEY = 'xaixo-cookies';

function initCookieBar() {
  const bar = document.querySelector('.cookie-bar');
  if (!bar) return;
  let choice = null;
  try {
    choice = localStorage.getItem(COOKIE_KEY);
  } catch {
    /* almacenamiento no disponible (modo privado, etc.) */
  }
  if (!choice) bar.classList.add('show');

  bar.querySelectorAll('[data-cookie-choice]').forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        localStorage.setItem(COOKIE_KEY, btn.dataset.cookieChoice);
      } catch {
        /* ignorar si no hay almacenamiento disponible */
      }
      bar.classList.remove('show');
    });
  });
}

function initContactForm() {
  const form = document.querySelector('form[data-netlify="true"]');
  if (!form) return;
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      });
      form.hidden = true;
      if (status) {
        status.hidden = false;
        status.textContent = 'Gracias, hemos recibido tu mensaje. Te contestaremos en breve.';
      }
    } catch {
      if (status) {
        status.hidden = false;
        status.textContent = 'No hemos podido enviar el formulario. Escríbenos por WhatsApp o email.';
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initMobileMenu();
  initCookieBar();
  initContactForm();
});
