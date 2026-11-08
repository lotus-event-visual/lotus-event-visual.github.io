(()=>{'use strict';
const keys=['conference','exhibition','stage'];
function keyFromHash(hash){const m=/^#scene-(conference|exhibition|stage)$/.exec(hash);return m?m[1]:null;}
if(typeof module!=='undefined'&&module.exports)module.exports={keyFromHash};
if(typeof document==='undefined')return;
const root=document.querySelector('#your-scene');if(!root)return;
const choices=root.querySelector('.journey-choices'),buttons=[...choices.querySelectorAll('button')],panels=[...root.querySelectorAll('.journey-panel')],pause=root.querySelector('.journey-pause');
function choose(key,update){if(!keys.includes(key))return;for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.journey===key));for(const p of panels)p.hidden=p.dataset.key!==key;if(update){history.replaceState(null,'','#scene-'+key);} }
choices.hidden=false;root.querySelector('.journey-tools').hidden=false;
const initial=keyFromHash(location.hash);choose(initial||'conference',false);
if(initial)requestAnimationFrame(()=>root.scrollIntoView({block:'start',behavior:'instant'}));
buttons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.journey,true)));
window.addEventListener('hashchange',()=>{const k=keyFromHash(location.hash);if(k){choose(k,false);root.scrollIntoView({block:'start',behavior:'instant'});}});
pause?.addEventListener('click',()=>{const paused=root.dataset.paused!=='true';root.dataset.paused=String(paused);pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'動きを再開する':'動きを止める';});
})();
