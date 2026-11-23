(() => {
  for (const section of document.querySelectorAll('.scroll-expand')) {
  const scroller = section.closest('dialog') || window;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  function update() {
    scheduled = false;
    if (reduced.matches || (scroller !== window && !scroller.open)) return;
    const stage = section.firstElementChild;
    const distance = section.offsetHeight - stage.offsetHeight;
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const origin = scroller === window ? 0 : scroller.getBoundingClientRect().top + scroller.clientTop;
    const progress = Math.max(0,Math.min(1,(origin+top-section.getBoundingClientRect().top)/Math.max(1,distance*.85)));
    const eased = progress * progress * (3 - 2 * progress);
    section.style.setProperty('--expand-width',62+38*eased+'%');
    section.style.setProperty('--expand-height',62+38*eased+'%');
    section.style.setProperty('--expand-radius',24*(1-eased)+'px');
    section.style.setProperty('--expand-zoom',1.18-.18*eased);
    section.style.setProperty('--expand-opacity',Math.max(0,(progress-.45)/.55));
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }
  scroller.addEventListener('scroll',schedule,{passive:true});
  if (scroller !== window) new MutationObserver(schedule).observe(scroller,{attributes:true,attributeFilter:['open']});
  window.addEventListener('resize',schedule);
  reduced.addEventListener('change',schedule);
  update();
  }
})();
