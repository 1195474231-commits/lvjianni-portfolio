(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return;
  const easing = 'cubic-bezier(.16,1,.3,1)';
  const animations = new Set();
  function animate(element, frames, delay = 0, duration = 1450) {
    if (!element) return;
    const animation = element.animate(frames, {duration, delay, easing, fill:'backwards'});
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
  }
  if (scrollY < 20 && (!location.hash || location.hash === '#top')) {
    const curtain = document.createElement('div');
    curtain.className = 'opening-curtain';
    curtain.setAttribute('aria-hidden','true');
    document.body.append(curtain);
    const reveal = curtain.animate([
      {clipPath:'inset(0 0 0 0)'},
      {clipPath:'inset(0 0 100% 0)'}
    ], {duration:1550, delay:120, easing, fill:'forwards'});
    reveal.onfinish = () => curtain.remove();
    animate(document.querySelector('.hero-art'), [
      {transform:'translateY(100px) scale(.78,.57)',clipPath:'inset(100% 0 0 0)'},
      {transform:'translateY(0) scale(1)',clipPath:'inset(0 0 0 0)'}
    ],400,1900);
    animate(document.querySelector('.top-nav nav'),[{transform:'translateY(-55px)'},{transform:'none'}],700,1200);
    document.querySelectorAll('.brick-hero > p,.brick-hero .hero-link,.brick-hero .archive-note').forEach((element,index) => {
      animate(element,[{transform:'translateY(38px)',clipPath:'inset(100% 0 0)'},{transform:'none',clipPath:'inset(0 0 0)'}],1100+index*140,1300);
    });
    animate(document.querySelector('.brick-pit'),[{transform:'scale(1.22)',opacity:0},{transform:'scale(1)',opacity:1}],800,1800);
  }
  const targets = document.querySelectorAll('.person-copy,.person-hero figure,#works .sectionline,#works .item,.archive-outro');
  const observer = new IntersectionObserver(entries => {
    let stagger = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      const element = entry.target;
      const heading = element.matches('.sectionline') ? element.querySelector('h2') : element.querySelector('h1');
      if (heading) {
        animate(heading,[
          {transform:'translateY(110px) scaleY(.68)',clipPath:'inset(100% 0 0)'},
          {transform:'none',clipPath:'inset(0 0 0)'}
        ],0,1600);
        [...element.children].filter(child => child !== heading).forEach((child,index) => {
          if (child.contains(heading)) return;
          animate(child,[{transform:'translateY(35px)',opacity:0},{transform:'none',opacity:1}],350+index*110,1250);
        });
      } else if (element.matches('.item')) {
        const delay = 160 + stagger++ * 180;
        animate(element,[
          {transform:'translateY(95px)'},
          {transform:'none'}
        ],delay,1550);
        animate(element.querySelector('.cover'),[
          {clipPath:'inset(0 0 100% 0 round 14px)'},
          {clipPath:'inset(0 0 0 0 round 14px)'}
        ],delay,1650);
        animate(element.querySelector('.project-copy'),[
          {transform:'translateY(25px)',opacity:0},
          {transform:'none',opacity:1}
        ],delay+350,1300);
      } else {
        animate(element,[
          {clipPath:'inset(0 0 100% 0 round 16px)',transform:'translateY(60px) scale(.96)'},
          {clipPath:'inset(0 0 0 0 round 16px)',transform:'none'}
        ],180,1600);
      }
    }
  },{threshold:.08});
  targets.forEach(element=>observer.observe(element));

  // Only visible still-image covers participate in the scroll update.
  const visible = new Set();
  const photos = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    schedule();
  });
  document.querySelectorAll('#works .photo-cover').forEach(cover=>photos.observe(cover));
  let frame = 0;
  function update() {
    frame = 0;
    if (preference.matches) return;
    for (const cover of visible) {
      const image = cover.querySelector('img');
      if (!image) continue;
      const rect = cover.getBoundingClientRect();
      const offset = Math.max(-1,Math.min(1,(rect.top+rect.height/2-innerHeight/2)/innerHeight));
      image.style.translate = '0 '+(-offset*12)+'px';
    }
  }
  function schedule() {
    if (!frame) frame=requestAnimationFrame(update);
  }
  window.addEventListener('scroll',schedule,{passive:true});
  preference.addEventListener('change',()=>{
    if (!preference.matches) return;
    observer.disconnect();
    photos.disconnect();
    animations.forEach(animation=>animation.cancel());
    document.querySelector('.opening-curtain')?.remove();
    document.querySelectorAll('#works .photo-cover img').forEach(image=>image.style.removeProperty('translate'));
  });
})();
