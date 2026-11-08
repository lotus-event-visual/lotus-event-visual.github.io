(() => {
  'use strict';
  const root = document.querySelector('.lotus-process');
  if (!root) return;
  const bar = root.querySelector('.process-controls');
  if (!bar) return;
  const buttons = [...bar.querySelectorAll('[data-process]')];
  const panels = [...root.querySelectorAll('.process-panel')];
  if (!buttons.length || buttons.length !== panels.length) return;
  const hint = root.querySelector('.process-interaction-hint');
  const position = root.querySelector('.process-position');
  function select(index) {
    buttons.forEach((button, i) => {
      const selected = i === index;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      const action = button.querySelector('.process-action span');
      if (action) action.textContent = selected ? '表示中' : '詳しく見る';
    });
    panels.forEach((panel, i) => {
      panel.setAttribute('role', 'tabpanel');
      panel.tabIndex = 0;
      panel.hidden = i !== index;
    });
    if (position) position.textContent = `${String(index + 1).padStart(2, '0')} / 04`;
  }
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', event => {
      let next;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (i + 1) % buttons.length;
      else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (i + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      select(next);
      buttons[next].focus();
    });
  });
  select(0);
  bar.hidden = false;
  if (hint) hint.hidden = false;
})();
