/* Original illustration loops; human figures and physical scenery are stationary. */
(()=>{'use strict';for(const video of document.querySelectorAll('[data-scene-video]')){
 const parent=video.closest('.process-panel,.journey-panel'),source=video.querySelector('source'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=false,loaded=false,failed=false,blocked=false,userPaused=false,attempt=0;
 video.autoplay=true;video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;
 function sync(){const id=++attempt;if(failed||blocked||parent.hidden||!visible||document.hidden||reduced.matches||navigator.connection?.saveData||userPaused){video.pause();if(reduced.matches||failed)video.hidden=true;return;}if(!loaded){source.src=source.dataset.src;video.load();loaded=true;}video.play()?.catch(e=>{if(id===attempt&&e.name!=='AbortError'){blocked=true;video.hidden=false;}});}
 function toggle(){if(blocked){blocked=false;userPaused=false;}else userPaused=!userPaused;video.setAttribute('aria-pressed',String(userPaused));sync();}
 video.addEventListener('click',toggle);video.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle();}});
 video.addEventListener('playing',()=>{blocked=false;video.hidden=false;video.setAttribute('aria-pressed','false');});video.addEventListener('error',()=>{failed=true;video.hidden=true;video.pause();});
 const retry=event=>{if(event.target===video||!blocked||failed)return;blocked=false;sync();};for(const event of ['touchstart','scroll','click'])document.addEventListener(event,retry,{passive:true});navigator.connection?.addEventListener?.('change',sync);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);new MutationObserver(sync).observe(parent,{attributes:true,attributeFilter:['hidden']});
 if('IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{threshold:.05}).observe(video.parentElement);else{visible=true;sync();}
}})();
