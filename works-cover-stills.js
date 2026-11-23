(() => {
  const choices = [
    ['.yiwu-cover', 'assets/yiwu/adorn.mp4', .52, '动态海报'],
    ['.chaoneng', 'assets/films/chaoneng-web.mp4', .68, '品牌短片'],
    ['.micro', 'assets/films/micro-web.mp4', .43, '产品短片'],
    ['.mission', 'assets/films/mission-web.mp4', .72, '悬疑短片']
  ];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const previews = new Map();
  function syncPreview(state) {
    const canPlay = state.ratio >= .25 && !document.hidden && !document.querySelector('dialog[open]') && !reducedMotion.matches;
    if (canPlay) state.video.play().catch(() => {});
    else state.video.pause();
  }
  function mount(cover, path, fraction, label) {
    const video = document.createElement('video');
    video.className = 'motion-preview';
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute('disablepictureinpicture','');
    video.preload = 'none';
    video.setAttribute('aria-hidden','true');
    const hasPoster = Boolean(cover.querySelector('img'));
    if (!hasPoster) {
      cover.querySelector('small').textContent = label;
      cover.classList.add('has-still');
      const icon = document.createElement('i');
      icon.className = 'cover-kind';
      icon.textContent = '▶';
      icon.setAttribute('aria-hidden','true');
      cover.append(icon);
    }
    video.addEventListener('loadedmetadata', () => {
      if (cover.matches('.yiwu-cover') && video.videoWidth && video.videoHeight) {
        cover.style.setProperty('--cover-ratio', video.videoWidth + '/' + video.videoHeight);
      }
      if (!hasPoster) cover.classList.add('still-ready');
    }, {once:true});
    if (!hasPoster) video.addEventListener('seeked', () => cover.classList.add('still-ready'), {once:true});
    video.addEventListener('playing', () => cover.classList.add('is-previewing'));
    video.addEventListener('pause', () => {
      if (hasPoster) cover.classList.remove('is-previewing');
    });
    const state = {video, ratio:0};
    previews.set(cover,state);
    cover.prepend(video);
    if (hasPoster) cover.querySelector('img').after(video);
    video.src = path;
    return state;
  }
  const observer = new IntersectionObserver(entries => {
    for (const {target, isIntersecting, intersectionRatio} of entries) {
      const visible = isIntersecting && intersectionRatio >= .25;
      let state = previews.get(target);
      if (!state && visible) {
        const [,path,fraction,label] = choices.find(([selector]) => target.matches(selector));
        state = mount(target,path,fraction,label);
      }
      if (state) {
        state.ratio = visible ? intersectionRatio : 0;
      }
    }
    syncAll();
  }, {threshold:[.25,.35,.45,.55,.65,.75,.85,.95,1]});
  for (const [selector] of choices) {
    const cover = document.querySelector('.work-gallery ' + selector);
    if (cover) observer.observe(cover);
  }
  function syncAll() {
    previews.forEach(state => syncPreview(state));
  }
  const dialogs = new MutationObserver(syncAll);
  document.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog,{attributes:true,attributeFilter:['open']}));
  document.addEventListener('visibilitychange',syncAll);
  reducedMotion.addEventListener('change',syncAll);
})();
