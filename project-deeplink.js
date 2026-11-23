(() => {
  const requested = new URLSearchParams(location.search).get('open');
  const projects = new Set([
    'trozk-project', 'chaoneng-project', 'ad-project', 'ysl-project'
  ]);
  if (!projects.has(requested)) return;
  const project = document.getElementById(requested);
  const cover = project?.querySelector('.cover');
  if (!cover) return;
  project.scrollIntoView({behavior:'instant',block:'center'});
  cover.click();
})();
