/* Approved concept still animated as a silent film, never presented as event footage. */
(() => {
 'use strict';
 const hero=document.querySelector('[data-home-film]');
 if(!hero)return;
 const video=hero.querySelector('[data-home-video]');
 if(!video)return;
 const source=video.querySelector('source');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let wanted=!reduced.matches&&!(navigator.connection&&navigator.connection.saveData);
 let visible=true,loaded=false,failed=false,attempt=0;
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;
 const sync=()=>{
  const id=++attempt;
  if(!wanted||!visible||document.hidden||failed){video.pause();return;}
  if(!loaded){source.src=source.dataset.src;video.load();loaded=true;}
  const play=video.play();
  if(play&&play.catch)play.catch(error=>{
   if(id!==attempt||error.name==='AbortError')return;
   wanted=false;video.hidden=true;
  });
 };
 video.addEventListener('playing',()=>{video.hidden=false;});
 video.addEventListener('error',()=>{failed=true;wanted=false;video.hidden=true;sync();});
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{if(reduced.matches)wanted=false;sync();});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.01}).observe(hero);
 sync();
})();
