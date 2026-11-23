(() => {
  const grid = document.querySelector('#works #grid');
  if (!grid) return;
  const items = [...grid.querySelectorAll('.item')];
  if (!items.length) return;
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  };
  const colors = [['#a1aa70','#191c12'],['#c57553','#20140c'],['#d1d894','#25291c'],['#6a7657','#fff'],['#64727e','#fff'],['#edc493','#362717'],['#9c594d','#fff'],['#d4ac68','#251707'],['#58685c','#fff'],['#d8a5ad','#291920'],['#494652','#fff']];
  const library = el('div','work-library');
  const shelf = el('div','work-shelf');
  shelf.setAttribute('role','group');
  shelf.setAttribute('aria-label','作品书架');
  const stage = el('div','work-stage');
  stage.setAttribute('aria-live','polite');
  library.append(shelf,stage);
  let active = -1;
  const setColor = (node,i) => {
    node.style.setProperty('--book',colors[i][0]);
    node.style.setProperty('--book-ink',colors[i][1]);
  };
  const spines = items.map((item,i) => {
    const title = item.querySelector('h3').textContent;
    const spine = el('button','work-spine');
    spine.type = 'button';
    spine.setAttribute('aria-label',title);
    spine.setAttribute('aria-pressed','false');
    spine.style.setProperty('--height', (182 + (i * 17) % 41) + 'px');
    setColor(spine,i);
    spine.append(el('span','',title),el('small','',String(i+1).padStart(2,'0')));
    spine.addEventListener('click',() => select(i,true));
    shelf.append(spine);
    return spine;
  });
  function select(i,animate) {
    if (i === active) return;
    active = i;
    spines.forEach((spine,j) => spine.setAttribute('aria-pressed',String(i===j)));
    const item = items[i], source = item.querySelector('.cover');
    const title = item.querySelector('h3').textContent;
    const book = el('button','work-book');
    book.type = 'button';
    book.setAttribute('aria-label','查看作品：'+title);
    book.setAttribute('aria-haspopup','dialog');
    setColor(book,i);
    const img = source.querySelector('img');
    book.append(img ? img.cloneNode(false) : el('span','work-book-art',source.querySelector('span')?.textContent || title),el('span','work-book-title',title));
    book.addEventListener('click',() => source.click());
    stage.replaceChildren(book,el('p','',item.querySelector('.meta').textContent),el('small','','点击封面查看作品 ↗'));
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const from = spines[i].getBoundingClientRect();
      const to = book.getBoundingClientRect();
      const x = from.left - to.left;
      const y = from.top - to.top;
      const scale = Math.min(1, from.height / to.height);
      book.animate([
        {transform:`translate3d(${x}px,${y}px,0) rotateY(-82deg) scale(${scale})`,opacity:.45},
        {transform:`translate3d(${x * .38}px,${y * .38 - 19}px,45px) rotateY(-45deg)`,opacity:1,offset:.42},
        {transform:'translate3d(0,0,0) rotateY(0deg)',opacity:1}
      ],{duration:650,easing:'cubic-bezier(.22,.75,.25,1)'});
    }
  }
  function sync() {
    spines.forEach((spine,i) => {spine.hidden = items[i].hidden;});
    if (active < 0 || items[active].hidden) {
      const next = items.findIndex(item => !item.hidden);
      if (next >= 0) select(next,active >= 0);
    }
  }
  grid.before(library);
  grid.classList.add('shelf-source');
  const observer = new MutationObserver(sync);
  observer.observe(grid,{subtree:true,attributes:true,attributeFilter:['hidden']});
  sync();
})();
