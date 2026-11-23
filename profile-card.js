(() => {
  const card = document.querySelector('.profile-card');
  if (!card) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const properties = ['rx','ry','x','y','mx','my','light'];
  card.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reduced.matches) return;
    const rect = card.getBoundingClientRect();
    const x = Math.max(0,Math.min(1,(event.clientX - rect.left) / rect.width));
    const y = Math.max(0,Math.min(1,(event.clientY - rect.top) / rect.height));
    const values = [(0.5-y)*18+'deg',(x-.5)*22+'deg',(x-.5)*7+'px',(y-.5)*7+'px',x*100+'%',y*100+'%',.65];
    properties.forEach((key,index) => card.style.setProperty('--profile-'+key,values[index]));
  });
  const reset = () => properties.forEach(key => card.style.removeProperty('--profile-'+key));
  card.addEventListener('pointerleave',reset);
  reduced.addEventListener('change',reset);
})();
