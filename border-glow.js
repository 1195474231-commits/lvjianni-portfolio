(() => {
  const targets = document.querySelectorAll('.person-hero figure, #works .work-gallery .item .cover');
  for (const target of targets) {
    const edge = document.createElement('i');
    edge.className = 'border-glow-edge';
    edge.setAttribute('aria-hidden', 'true');
    target.classList.add('border-glow-target');
    target.append(edge);

    target.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const bounds = target.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const distance = Math.min(x, y, bounds.width - x, bounds.height - y);
      const opacity = Math.max(0, Math.min(1, 1 - distance / 72));
      target.style.setProperty('--edge-x', x + 'px');
      target.style.setProperty('--edge-y', y + 'px');
      target.style.setProperty('--edge-opacity', opacity);
    });
    target.addEventListener('pointerleave', () => target.style.removeProperty('--edge-opacity'));
  }
})();
