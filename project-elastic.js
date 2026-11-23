(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  for (const cover of document.querySelectorAll('#works .work-gallery .cover')) {
    let drag;
    let release;
    let suppressClick = false;
    cover.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || reducedMotion.matches) return;
      release?.cancel();
      suppressClick = false;
      drag = {id:event.pointerId, x:event.clientX, y:event.clientY, moved:false};
      cover.style.transform = '';
      cover.setPointerCapture(event.pointerId);
    });
    cover.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      const x = event.clientX - drag.x;
      const y = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(x,y) < 6) return;
      drag.moved = true;
      const stretch = Math.min(Math.hypot(x,y) / 650,.17);
      const dx = 24 * Math.tanh(x / 90);
      const dy = 24 * Math.tanh(y / 90);
      const angle = Math.atan2(y,x) * 180 / Math.PI;
      cover.style.transform = `translate(${dx}px,${dy}px) rotate(${angle}deg) scale(${1 + stretch},${1 - stretch * .48}) rotate(${-angle}deg)`;
    });
    function finish(event) {
      if (drag?.id !== event.pointerId) return;
      suppressClick = drag.moved;
      drag = undefined;
      const start = cover.style.transform;
      cover.style.transform = '';
      if (!start) return;
      release = cover.animate([
        {transform:start},
        {transform:'scale(.97,1.035)',offset:.42},
        {transform:'scale(1.018,.988)',offset:.67},
        {transform:'none'}
      ], {duration:560,easing:'ease-out'});
    }
    cover.addEventListener('pointerup',finish);
    cover.addEventListener('pointercancel',finish);
    cover.addEventListener('lostpointercapture',finish);
    cover.addEventListener('dragstart',event => event.preventDefault());
    cover.addEventListener('click',event => {
      if (!suppressClick || !event.isTrusted || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    },true);
  }
})();
