/*
  Arquivo: js/main.js
  Finalidade: melhorar a usabilidade e acessibilidade do portfólio
  Notas:
    - Atualizar o ano no rodapé (elemento com id="ano")
    - Calcular a idade automaticamente a partir de um atributo data (opcional)
      - Definir `data-birth="YYYY-MM-DD"` no elemento `.age` ou no `<body>`
    - Habilitar rolagem suave para âncoras internas (respeitar preferências do usuário)
    - Melhorar o comportamento do link "Pular para o conteúdo"
    - Permitir ativar cartões de projeto por teclado (Enter / Space)
*/

(function () {
  'use strict';

  // Respeitar usuários que preferem reduzir animações
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Atualizar o ano no rodapé se existir um elemento com id="ano" */
  function updateYear() {
    const anoEl = document.getElementById('ano');
    if (!anoEl) return;
    const year = new Date().getFullYear();
    anoEl.textContent = String(year);
  }

  /* Calcular idade com base em data de nascimento ISO (YYYY-MM-DD) */
  function calculateAgeFromISO(isoDate) {
    if (!isoDate) return null;
    const parts = isoDate.split('-').map(Number);
    if (parts.length < 3) return null;
    const [y, m, d] = parts;
    const today = new Date();
    let age = today.getFullYear() - y;
    const hasHadBirthday = (today.getMonth() + 1) > m || ((today.getMonth() + 1) === m && today.getDate() >= d);
    if (!hasHadBirthday) age -= 1;
    return age >= 0 ? age : null;
  }

  /* Definir a idade no elemento `.age` se houver um atributo data-birth (ou data-birthdate) */
  function initAge() {
    const ageEl = document.querySelector('.age');
    if (!ageEl) return;

    // Procura data no próprio elemento ou no body (flexibilidade)
    const iso = ageEl.dataset.birth || ageEl.dataset.birthdate || document.body.dataset.birth || document.body.dataset.birthdate;
    if (!iso) return;

    const age = calculateAgeFromISO(iso);
    if (age === null) return;

    ageEl.textContent = String(age);
    // Acessibilidade: fornecer descrição completa como tooltip e aria-label
    ageEl.setAttribute('title', `Nascimento: ${iso} — Idade: ${age}`);
    ageEl.setAttribute('aria-label', `Idade: ${age} anos`);
  }

  /* Habilitar rolagem suave para links internos (<a href="#...">) */
  function enableSmoothScroll() {
    if (prefersReducedMotion) return; // não aplicar animações se preferido pelo usuário

    document.addEventListener('click', function (ev) {
      const el = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!el) return;

      const href = el.getAttribute('href');
      if (!href || href === '#') return;

      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      // Somente interceptar links que apontam para o mesmo documento
      ev.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Garantir foco no destino para acessibilidade
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      // Remover tabindex depois da interação
      window.setTimeout(() => target.removeAttribute('tabindex'), 1000);
    });
  }

  /* Melhorar o comportamento do link "Pular para o conteúdo" */
  function enhanceSkipLink() {
    const skip = document.querySelector('.skip-link');
    const main = document.getElementById('main');
    if (!skip || !main) return;

    skip.addEventListener('click', function (ev) {
      ev.preventDefault();
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.scrollIntoView();
      window.setTimeout(() => main.removeAttribute('tabindex'), 1000);
    });
  }

  /* Permitir ativar o primeiro link de um cartão de projeto com Enter / Space */
  function enableProjectCardKeyboard() {
    const cards = Array.from(document.querySelectorAll('.itemProjetos'));
    if (!cards.length) return;

    cards.forEach(card => {
      // Tornar o cartão focável para navegação por teclado se ainda não for
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

      card.addEventListener('keydown', function (ev) {
        const isEnter = ev.key === 'Enter';
        const isSpace = ev.key === ' ' || ev.key === 'Spacebar';
        if (!isEnter && !isSpace) return;
        ev.preventDefault();
        const link = card.querySelector('a[href]');
        if (link) link.click();
      });
    });
  }

  /* Inicializar quando o DOM estiver pronto */
  function init() {
    updateYear();
    initAge();
    enableSmoothScroll();
    enhanceSkipLink();
    enableProjectCardKeyboard();
  }

  // Inicializar o mais cedo possível
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();