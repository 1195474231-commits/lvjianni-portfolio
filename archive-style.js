(() => {
  const grid = document.querySelector('#works #grid');
  if (!grid) return;
  const index = document.createElement('aside');
  index.className = 'figure-index';
  index.setAttribute('aria-label','作品索引');
  const heading = document.createElement('strong');
  heading.textContent = 'FIGURE INDEX';
  index.append(heading);
  [...grid.querySelectorAll('.item')].forEach((item, i) => {
    item.id ||= 'mission-project';
    const number = 'FIG. ' + String(i + 1).padStart(2,'0');
    const label = document.createElement('span');
    label.className = 'fig-no';
    label.textContent = number;
    item.querySelector('.meta').prepend(label);
    const link = document.createElement('a');
    link.href = '#' + item.id;
    const id = document.createElement('span');
    id.textContent = number;
    const title = document.createElement('span');
    title.textContent = item.querySelector('h3').textContent;
    link.append(id,title);
    index.append(link);
    new MutationObserver(() => {link.hidden = item.hidden;}).observe(item,{attributes:true,attributeFilter:['hidden']});
  });
  grid.after(index);
})();
