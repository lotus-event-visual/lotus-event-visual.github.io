(()=>{'use strict';
 const root=document.querySelector('[data-lotus-aspect]');
 if(!root)return;
 const controls=root.querySelector('.lotus-aspect-controls');
 const status=root.querySelector('.lotus-aspect-status');
 const buttons=controls?[...controls.querySelectorAll('[data-aspect-mode]')]:[];
 const panels=[...root.querySelectorAll('[data-aspect-panel]')];
 const modes=['fit','fill'];
 // Keep both static explanations if the complete interaction is not available.
 if(!controls||!status||buttons.length!==2||panels.length!==2||modes.some(mode=>buttons.filter(b=>b.dataset.aspectMode===mode).length!==1||panels.filter(p=>p.dataset.aspectPanel===mode).length!==1))return;
 const descriptions={fit:'素材全体を表示。上下に余白が残り、左右の端まで見えます。',fill:'画面全体に表示。上下は埋まりますが、素材の左右の端が切れます。'};
 const select=mode=>{
  if(!modes.includes(mode))return;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.aspectMode===mode)));
  panels.forEach(p=>{p.hidden=p.dataset.aspectPanel!==mode;});
  status.textContent=descriptions[mode];
 };
 buttons.forEach(b=>b.addEventListener('click',()=>select(b.dataset.aspectMode)));
 select('fit');controls.hidden=false;status.hidden=false;
})();
