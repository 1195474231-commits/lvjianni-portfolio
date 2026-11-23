(() => {
  const header = document.querySelector('.top-nav');
  const toggle = header?.querySelector('.bubble-toggle');
  const nav = header?.querySelector('#bubble-navigation');
  if (!toggle || !nav) return;
  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.hidden = !open;
  }
  header.classList.add('bubble-ready');
  setOpen(false);
  toggle.hidden = false;
  toggle.addEventListener('click', () => setOpen(nav.hidden));
  nav.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    setOpen(false);
    toggle.focus({preventScroll:true});
  });
  document.addEventListener('pointerdown', event => {
    if (!nav.hidden && !header.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || nav.hidden) return;
    setOpen(false);
    toggle.focus();
  });
})();
