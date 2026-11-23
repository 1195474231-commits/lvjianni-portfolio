(() => {
  const header = document.querySelector('.top-nav');
  const nav = header.querySelector('nav');
  const links = [...nav.querySelectorAll('a')];
  const defaultLink = nav.querySelector('[aria-current]');
  const sections = ['works', 'contact'].flatMap(id => {
    const section = document.getElementById(id);
    const link = links.find(candidate => candidate.getAttribute('href') === '#' + id);
    return section && link ? [{section, link}] : [];
  });
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.prepend(indicator);
  let active = defaultLink;

  function positionIndicator() {
    indicator.style.setProperty('--indicator-width', active.offsetWidth + 'px');
    indicator.style.setProperty('--indicator-x', active.offsetLeft + 'px');
  }

  function update() {
    header.classList.toggle('is-compact', window.scrollY > 48);
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    const marker = Math.max(header.offsetHeight + 20, window.innerHeight * .33);
    active = defaultLink;
    for (const {section, link} of sections) {
      const bounds = section.getBoundingClientRect();
      if (bounds.top <= marker || (atBottom && bounds.top < window.innerHeight)) active = link;
    }
    for (const link of links) {
      if (link === active) link.setAttribute('aria-current', link === defaultLink ? 'page' : 'location');
      else link.removeAttribute('aria-current');
    }
    positionIndicator();
  }

  let scrollFrame = 0; window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; update(); }); }, {passive:true});
  window.addEventListener('resize', update);
  new ResizeObserver(positionIndicator).observe(nav);
  update();
  requestAnimationFrame(() => { nav.dataset.indicatorReady = ''; });
})();
