(() => {
  const choices = [['.yiwu-cover','yiwu'],['.chaoneng','chaoneng'],['.micro','micro'],['.mission','mission']];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();
  function sync() {
    const allowed = !document.hidden && !document.querySelector('dialog[open]') && !reduced.matches;
    states.forEach(state => {
      if (allowed && state.visible) state.video.play().catch(() => {});
      else state.video.pause();
    });
  }
  const warmup = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting}) => {
      if (!isIntersecting) return;
      const state = states.get(target);
      if (!reduced.matches) { state.video.preload = 'auto'; state.video.load(); }
      warmup.unobserve(target);
    });
  }, {rootMargin:'500px 0px'});
  const visible = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting,intersectionRatio}) => {
      states.get(target).visible = isIntersecting && intersectionRatio >= .05;
    });
    sync();
  }, {threshold:[0,.05,.25]});
  choices.forEach(([selector,key]) => {
    const cover = document.querySelector('.work-gallery ' + selector);
    if (!cover) return;
    const poster = document.createElement('img');
    poster.src = 'assets/previews/' + key + '.jpg';
    poster.alt = '';
    poster.loading = 'lazy';
    poster.decoding = 'async';
    if (!cover.querySelector('img')) cover.prepend(poster);
    const video = document.createElement('video');
    video.className = 'motion-preview';
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted','');
    video.playsInline = true;
    video.setAttribute('playsinline','');
    video.loop = true;
    video.autoplay = true;
    video.preload = 'none';
    video.poster = poster.src;
    video.setAttribute('aria-hidden','true');
    video.setAttribute('disablepictureinpicture','');
    cover.classList.add('has-still','still-ready');
    cover.querySelector('img').after(video);
    video.src = 'assets/previews/' + key + '.mp4';
    states.set(cover,{video,visible:false});
    warmup.observe(cover);
    visible.observe(cover);
  });
  const dialogs = new MutationObserver(sync);
  document.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog,{attributes:true,attributeFilter:['open']}));
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  document.addEventListener('pointerdown',sync,{once:true,passive:true});
})();
