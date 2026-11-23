(() => {
  const nav = document.querySelector('#works .sectionline > .filters');
  if (!nav) return;
  const buttons = [...nav.querySelectorAll('[data-filter]')];
  const pill = document.createElement('i');
  pill.className = 'filter-pill';
  pill.setAttribute('aria-hidden','true');
  nav.prepend(pill);
  const selected = () => buttons.find(button => button.getAttribute('aria-pressed') === 'true') || buttons[0];
  function move(button, hovering = false) {
    pill.style.setProperty('--pill-width',button.offsetWidth+'px');
    pill.style.setProperty('--pill-x',button.offsetLeft+'px');
    buttons.forEach(item => item.classList.toggle('pill-hover',item === button));
  }
  for (const button of buttons) {
    button.addEventListener('pointerenter',event => {
      if (event.pointerType === 'mouse') move(button);
    });
    button.addEventListener('focus',() => move(button));
    button.addEventListener('click',() => move(button));
  }
  nav.addEventListener('pointerleave',() => move(selected()));
  nav.addEventListener('focusout',event => {
    if (!nav.contains(event.relatedTarget)) move(selected());
  });
  new ResizeObserver(() => move(selected())).observe(nav);
  move(selected());
  nav.classList.add('pill-ready');
})();
