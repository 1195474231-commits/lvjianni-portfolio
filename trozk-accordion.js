(() => {
  const panels = [...document.querySelectorAll('#trozk .trozk-panel')];
  function expand(panel) {
    for (const item of panels) {
      item.setAttribute('aria-pressed', String(item === panel));
    }
  }
  for (const panel of panels) {
    panel.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') expand(panel);
    });
    panel.addEventListener('focus', () => expand(panel));
    panel.addEventListener('click', () => expand(panel));
  }
})();
