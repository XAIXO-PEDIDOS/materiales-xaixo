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

// Normaliza texto para el buscador del catálogo: minúsculas y sin acentos.
function normalizeSearch(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function initCatalog() {
  const items = Array.from(document.querySelectorAll('.acc .item'));
  if (!items.length) return;

  const heads = items.map((item) => item.querySelector('.hd'));

  function setOpen(item, hd, open) {
    item.classList.toggle('open', open);
    hd.setAttribute('aria-expanded', String(open));
  }

  heads.forEach((hd, i) => {
    hd.addEventListener('click', () => {
      const item = items[i];
      setOpen(item, hd, !item.classList.contains('open'));
    });
  });

  const openAllBtn = document.getElementById('cat-open-all');
  const closeAllBtn = document.getElementById('cat-close-all');
  openAllBtn?.addEventListener('click', () => {
    items.forEach((item, i) => {
      if (!item.classList.contains('hide')) setOpen(item, heads[i], true);
    });
  });
  closeAllBtn?.addEventListener('click', () => {
    items.forEach((item, i) => setOpen(item, heads[i], false));
  });

  const searchable = items.map((item) => {
    const title = item.querySelector('.hd h3')?.textContent || '';
    const subs = Array.from(item.querySelectorAll('.sub'))
      .map((s) => s.textContent)
      .join(' ');
    return normalizeSearch(`${title} ${subs}`);
  });

  const input = document.getElementById('cat-q');
  const count = document.getElementById('cat-count');
  const total = items.length;

  function updateCount(n, filtering) {
    if (!count) return;
    count.textContent = filtering ? `${n} ${n === 1 ? 'familia' : 'familias'}` : `${total} familias`;
  }
  updateCount(total, false);

  input?.addEventListener('input', () => {
    const q = normalizeSearch(input.value);
    let n = 0;
    items.forEach((item, i) => {
      const hit = !q || searchable[i].includes(q);
      item.classList.toggle('hide', !hit);
      if (hit) {
        n++;
        if (q) setOpen(item, heads[i], true);
      }
    });
    updateCount(n, Boolean(q));
  });

  // Enlaces de WhatsApp con el nombre de la familia precargado en el texto.
  document.querySelectorAll('.ask[data-familia]').forEach((a) => {
    const text = `Hola, quiero información sobre ${a.dataset.familia}`;
    a.href = `https://wa.me/34689248559?text=${encodeURIComponent(text)}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initMobileMenu();
  initCookieBar();
  initContactForm();
  initCatalog();
});
