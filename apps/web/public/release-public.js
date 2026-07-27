(() => {
  const header = document.querySelector('.launch-nav');
  const nav = header?.querySelector('.launch-links');
  if (!header || !nav || header.querySelector('[data-public-menu-trigger]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'public-menu-trigger';
  button.dataset.publicMenuTrigger = 'true';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Open public navigation');
  button.textContent = 'Menu';
  button.addEventListener('click', () => {
    const open = header.classList.toggle('public-menu-open');
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Close' : 'Menu';
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    header.classList.remove('public-menu-open');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Menu';
  }));
  header.appendChild(button);
})();
