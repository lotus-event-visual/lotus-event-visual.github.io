(() => {
  'use strict';
  const root = document.querySelector('[data-lotus-switching]');
  if (!root) return;
  const controls = root.querySelector('[data-switch-controls]');
  const cut = root.querySelector('[data-switch-cut]');
  const reset = root.querySelector('[data-switch-reset]');
  const status = root.querySelector('[data-switch-status]');
  const buttons = [...root.querySelectorAll('[data-switch-source]')];
  const labels = Object.freeze({ slides: '資料', camera: 'カメラ', video: 'VTR' });
  const keys = Object.keys(labels);
  const views = ['cue', 'live'].map(mode => {
    const node = root.querySelector('[data-switch-view="' + mode + '"]');
    return node && { node, label: node.querySelector('[data-switch-label]'), scenes: [...node.querySelectorAll('[data-switch-scene]')] };
  });
  // Keep the static explanation intact when markup is incomplete.
  if (!controls || !cut || !reset || !status || buttons.length !== keys.length ||
      !keys.every(key => buttons.filter(b => b.getAttribute('data-switch-source') === key).length === 1) ||
      views.some(view => !view || !view.label || view.scenes.length !== keys.length ||
        !keys.every(key => view.scenes.filter(scene => scene.getAttribute('data-switch-scene') === key).length === 1))) return;
  let cue = 'camera';
  let live = 'slides';
  const render = () => {
    [cue, live].forEach((key, i) => {
      views[i].label.textContent = labels[key];
      views[i].scenes.forEach(scene => { scene.hidden = scene.getAttribute('data-switch-scene') !== key; });
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.getAttribute('data-switch-source') === cue)));
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    const key = button.getAttribute('data-switch-source');
    if (!keys.includes(key)) return;
    cue = key;
    render();
    status.textContent = '次に出す映像は「' + labels[cue] + '」。会場の表示は「' + labels[live] + '」のままです。';
  }));
  cut.addEventListener('click', () => {
    if (cue === live) {
      status.textContent = '会場には、すでに「' + labels[live] + '」を表示しています。別の映像を選ぶと、違いを試せます。';
      return;
    }
    live = cue;
    render();
    status.textContent = '会場の表示を「' + labels[live] + '」に切り替えました。';
  });
  reset.addEventListener('click', () => {
    cue = 'camera';
    live = 'slides';
    render();
    status.textContent = '最初に戻しました。会場は「資料」、次に出す映像は「カメラ」です。';
  });
  render();
  controls.hidden = false;
})();
