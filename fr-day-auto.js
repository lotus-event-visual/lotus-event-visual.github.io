/* 1日の流れ: 自動スライド (Friday 2026-11-09) */
(()=>{const s=document.querySelector('.fr-day-strip');if(!s)return;
const rm=matchMedia('(prefers-reduced-motion: reduce)');let hold=false,vis=false,resume=0;
const stop=()=>{hold=true;clearTimeout(resume)},go=(d)=>{clearTimeout(resume);resume=setTimeout(()=>{hold=false},d||0)};
s.addEventListener('mouseenter',stop);s.addEventListener('mouseleave',()=>go(800));
s.addEventListener('focusin',stop);s.addEventListener('focusout',()=>go(800));
s.addEventListener('touchstart',stop,{passive:true});s.addEventListener('touchend',()=>go(6000),{passive:true});
s.addEventListener('wheel',()=>{stop();go(6000)},{passive:true});
if('IntersectionObserver'in window)new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.3}).observe(s);else vis=true;
setInterval(()=>{if(hold||!vis||document.hidden||rm.matches)return;const c=s.querySelector('article');if(!c)return;
const step=c.getBoundingClientRect().width+parseFloat(getComputedStyle(s).columnGap||14);const max=s.scrollWidth-s.clientWidth;
if(s.scrollLeft>=max-4)s.scrollTo({left:0,behavior:'smooth'});else s.scrollBy({left:step,behavior:'smooth'})},3800)})();
