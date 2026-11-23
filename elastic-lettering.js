(() => {
  const title = document.querySelector('#works .sectionline h2');
  if (!title) return;
  title.setAttribute('aria-label','我的项目');
  title.textContent = '';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  for (const character of '我的项目') {
    const letter = document.createElement('span');
    letter.textContent = character;
    letter.setAttribute('aria-hidden','true');
    letter.className = 'elastic-letter';
    title.append(letter);
    let drag, animation;
    letter.addEventListener('pointerdown', event => {
      if (reduced.matches || !event.isPrimary || event.button !== 0) return;
      animation?.cancel();
      drag = {id:event.pointerId,x:event.clientX,y:event.clientY};
      letter.setPointerCapture(event.pointerId);
    });
    letter.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      const x = 70 * Math.tanh(dx / 90), y = 70 * Math.tanh(dy / 90);
      const tension = Math.min(1,Math.hypot(dx,dy)/100);
      letter.style.transform = `translate(${x}px,${y}px) rotate(${x*.13}deg) scale(${1+tension*.18},${1+tension*.35})`;
      letter.style.color = 'color-mix(in srgb, currentColor '+ (100-tension*100) +'%, #618c3e)';
    });
    function release(event) {
      if (drag?.id !== event.pointerId) return;
      drag = null;
      const transform = letter.style.transform || 'none';
      letter.style.transform = '';
      letter.style.color = '';
      animation = letter.animate([
        {transform},
        {transform:'translateY(-8px) scale(1.04,.94)',offset:.4},
        {transform:'translateY(3px) scale(.99,1.025)',offset:.7},
        {transform:'none'}
      ],{duration:700,easing:'ease-out'});
    }
    letter.addEventListener('pointerup',release);
    letter.addEventListener('pointercancel',release);
    letter.addEventListener('lostpointercapture',release);
  }
})();
