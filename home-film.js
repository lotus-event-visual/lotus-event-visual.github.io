/* Approved concept still animated as a silent film, never presented as event footage. */
(() => {
 'use strict';
 const hero=document.querySelector('[data-home-film]');
 if(!hero)return;
 const video=hero.querySelector('[data-home-video]');
 if(!video)return;
 const still=hero.querySelector('img');if(!video.poster&&still?.src)video.poster=still.src;
 const source=video.querySelector('source');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let wanted=true,blocked=false;
 let visible=true,loaded=false,failed=false,attempt=0;
 video.autoplay=true;video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;
 const sync=()=>{
  const id=++attempt;
  if(!wanted||!visible||document.hidden||failed||blocked||reduced.matches||navigator.connection?.saveData){video.pause();return;}
  if(!loaded){source.src=source.dataset.src;video.load();loaded=true;}
  const play=video.play();
  if(play&&play.catch)play.catch(error=>{
   if(id!==attempt||error.name==='AbortError')return;
   blocked=true;video.hidden=false;
  });
 };
 video.addEventListener('playing',()=>{blocked=false;video.hidden=false;});
 video.addEventListener('error',()=>{failed=true;wanted=false;video.hidden=true;sync();});
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',sync);
 navigator.connection?.addEventListener?.('change',sync);
 const retry=()=>{if(!blocked||failed)return;blocked=false;sync();};
 for(const event of ['touchstart','scroll','click'])document.addEventListener(event,retry,{passive:true});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.01}).observe(hero);
 sync();
})();
