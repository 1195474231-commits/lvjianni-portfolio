(() => {
  const track = document.querySelector('#works #grid');
  if (!track) return;
  const items = [...track.querySelectorAll('.item')];
  if (!items.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const make = (tag, css, value) => {
    const node = document.createElement(tag);
    node.className = css;
    if (value) node.textContent = value;
    return node;
  };
  const carousel = make('div', 'works-carousel');
  const bar = make('div', 'carousel-bar');
  const nav = make('div', 'carousel-nav');
  const prev = make('button', '', '←');
  const next = make('button', '', '→');
  prev.type = next.type = 'button';
  prev.setAttribute('aria-label', '上一件作品');
  next.setAttribute('aria-label', '下一件作品');
  nav.append(prev, next);
  bar.append(make('span', '', '横向拖动浏览作品'), nav);
  track.before(carousel);
  carousel.append(bar, track);
  track.classList.add('carousel-track');
  track.tabIndex = 0;
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', '作品轮播');
  const update = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };
  function move(direction) {
    const first = items.find(item => !item.hidden);
    if (!first) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({left: direction * (first.offsetWidth + gap), behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    move(e.key === 'ArrowLeft' ? -1 : 1);
  });
  track.addEventListener('scroll', update, {passive:true});
  new ResizeObserver(update).observe(track);
  new MutationObserver(() => {
    track.scrollTo({left:0, behavior:'instant'});
    update();
  }).observe(track, {subtree:true, attributes:true, attributeFilter:['hidden']});
  let drag, ignoreClick = false;
  track.addEventListener('dragstart', e => e.preventDefault());
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !e.isPrimary) return;
    ignoreClick = false;
    drag = {id:e.pointerId, x:e.clientX, left:track.scrollLeft, moved:false};
  });
  window.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 7) return;
      drag.moved = true;
      track.setPointerCapture(e.pointerId);
      track.classList.add('is-dragging');
      track.querySelectorAll('.is-tilted').forEach(reset);
    }
    track.scrollLeft = drag.left - dx;
  });
  function finish(e) {
    if (!drag || e.pointerId !== drag.id) return;
    ignoreClick = drag.moved;
    drag = null;
    track.classList.remove('is-dragging');
    setTimeout(() => {ignoreClick = false;}, 0);
  }
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
  track.addEventListener('click', e => {
    if (!ignoreClick) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
  function reset(cover) {
    cover.classList.remove('is-tilted');
    ['--rx','--ry','--mx','--my'].forEach(key => cover.style.removeProperty(key));
  }
  items.forEach(item => {
    const cover = item.querySelector('.cover');
    if (!cover) return;
    item.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || e.buttons || reduced.matches) return;
      const r = item.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const y = Math.max(0, Math.min(1, (e.clientY - r.top) / cover.offsetHeight));
      cover.style.setProperty('--rx', (0.5 - y) * 16 + 'deg');
      cover.style.setProperty('--ry', (x - 0.5) * 20 + 'deg');
      cover.style.setProperty('--mx', x * 100 + '%');
      cover.style.setProperty('--my', y * 100 + '%');
      cover.classList.add('is-tilted');
    });
    item.addEventListener('pointerleave', () => reset(cover));
  });
  update();
})();
