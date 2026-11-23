(() => {
  const wheel = document.querySelector('#works .filters');
  if (!wheel) return;
  const buttons = [...wheel.querySelectorAll('button[data-filter]')];
  if (!buttons.length) return;
  let selected = Math.max(0, buttons.findIndex(b => b.getAttribute('aria-pressed') === 'true'));
  let drag, suppressClick = false, lastScroll = 0;
  wheel.classList.add('works-wheel');
  const step = parseFloat(getComputedStyle(wheel).getPropertyValue('--step')) || 52;
  const clamp = n => Math.max(0, Math.min(buttons.length - 1, n));
  function paint(position) {
    buttons.forEach((button, i) => {
      const d = i - position, a = Math.abs(d);
      button.style.setProperty('--y', (Math.sign(d) * (Math.min(a, 2) * step - Math.min(a, 2) ** 2 * 2 + Math.max(0, a - 2) * (step - 6))) + 'px');
      button.style.setProperty('--x', Math.min(a * a * 4, 28) + 'px');
      button.style.setProperty('--tilt', Math.max(-64, Math.min(64, -d * 23)) + 'deg');
      button.style.setProperty('--opacity', Math.max(0, 1 - a * .31));
      button.style.setProperty('--blur', Math.min(a * .40, 1.5) + 'px');
      button.style.pointerEvents = a > 2.5 ? 'none' : '';
      button.style.zIndex = String(10 - Math.round(a));
      button.tabIndex = i === selected ? 0 : -1;
    });
  }
  function choose(n, focus = false) {
    buttons[clamp(n)].click();
    if (focus) buttons[selected].focus({preventScroll:true});
  }
  wheel.addEventListener('click', e => {
    if (suppressClick && e.isTrusted) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const index = buttons.indexOf(e.target.closest('button'));
    if (index >= 0) { selected = index; paint(index); }
  }, true);
  wheel.addEventListener('keydown', e => {
    const n = {ArrowUp: selected - 1, ArrowDown: selected + 1, Home: 0, End: buttons.length - 1}[e.key];
    if (n === undefined) return;
    e.preventDefault();
    choose(n, true);
  });
  wheel.addEventListener('wheel', e => {
    if (!e.deltaY || e.ctrlKey || drag || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const n = selected + Math.sign(e.deltaY);
    if (n !== clamp(n)) return;
    e.preventDefault();
    if (performance.now() - lastScroll < 125) return;
    lastScroll = performance.now();
    choose(n, wheel.contains(document.activeElement));
  }, {passive:false});
  wheel.addEventListener('pointerdown', e => {
    if (!e.isPrimary || e.button !== 0) return;
    suppressClick = false;
    drag = { id:e.pointerId, y:e.clientY, position:selected, active:false };
  });
  window.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const delta = drag.y - e.clientY;
    if (!drag.active && Math.abs(delta) < 5) return;
    if (!drag.active) {
      drag.active = true;
      wheel.setPointerCapture(e.pointerId);
      wheel.classList.add('is-dragging');
    }
    drag.position = clamp(selected + delta / step);
    paint(drag.position);
  });
  function finish(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const {active, position} = drag;
    drag = null;
    if (!active) return;
    wheel.classList.remove('is-dragging');
    choose(e.type === 'pointercancel' ? selected : Math.round(position), wheel.contains(document.activeElement));
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
  }
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
  wheel.setAttribute('role', 'group');
  paint(selected);
})();
