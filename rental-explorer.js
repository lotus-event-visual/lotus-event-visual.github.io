(() => {
  const buttons = [...document.querySelectorAll('[data-rental-scene]')];
  const panels = [...document.querySelectorAll('.rental-scene')];
  if (!buttons.length) return;
  function select(key) {
    panels.forEach(panel => { panel.hidden = panel.id !== `rental-scene-${key}`; });
    buttons.forEach(button => { const active = button.dataset.rentalScene === key; button.setAttribute('aria-pressed', String(active)); button.querySelector('.rental-choice-action').textContent = active ? '選択中 ✓' : '選ぶ ↓'; });
  }
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.rentalScene)));
  document.querySelectorAll('.rental-scene-brief').forEach(brief => { brief.hidden = true; });
  select(buttons[0].dataset.rentalScene);
  document.querySelector('.rental-scene-choices').hidden = false;
  function reveal(hash, scroll) {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    const brief = target.closest('.rental-scene-brief');
    if (brief) brief.hidden = false;
    const scene = target.closest('.rental-scene');
    if (scene) select(scene.id.replace('rental-scene-', ''));
    let parent = target.parentElement;
    while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({block:'start', behavior:'instant'}));
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link) reveal(link.getAttribute('href'), true);
  });
  window.addEventListener('hashchange', () => reveal(location.hash, true));
  if (location.hash) reveal(location.hash, true);
})();
