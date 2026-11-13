/* 1日の流れ: スライダー(矢印・ドット・自動送り) */
(()=>{const s=document.querySelector('.fr-day-strip');if(!s)return;
const st=document.createElement('style');st.id='fr-day-slider';
st.textContent='.fr-day-strip{scrollbar-width:none!important;-ms-overflow-style:none!important;scroll-behavior:smooth!important}.fr-day-strip::-webkit-scrollbar{display:none!important;height:0!important}.fr-day-nav{display:flex!important;align-items:center!important;justify-content:center!important;gap:18px!important;padding:4px 16px 8px!important}html body#top .fr-day-nav button.fr-day-arrow{box-sizing:border-box!important;width:46px!important;height:46px!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.28)!important;background:rgba(255,255,255,.06)!important;color:#f3efe8!important;font-size:20px!important;line-height:1!important;cursor:pointer!important;display:grid!important;place-items:center!important;transition:background .2s,opacity .2s!important;padding:0!important}html body#top .fr-day-nav button.fr-day-arrow:hover{background:rgba(255,255,255,.16)!important}html body#top .fr-day-nav button.fr-day-arrow:disabled{opacity:.3!important;cursor:default!important}.fr-day-dots{display:flex!important;gap:8px!important;flex-wrap:wrap!important;justify-content:center!important;max-width:60vw!important}html body#top .fr-day-dots button{box-sizing:border-box!important;width:8px!important;height:8px!important;border-radius:999px!important;background:rgba(255,255,255,.3)!important;cursor:pointer!important;transition:width .25s,background .25s!important}html body#top .fr-day-dots button[aria-current=\"true\"]{width:26px!important;background:var(--accent,#c9a46b)!important}.fr-day-strip{scroll-padding-inline:max(16px,calc((100% - 1180px)/2))!important}html body#top .fr-day-nav button.fr-day-arrow:focus-visible{outline:2px solid #c9a46b!important;outline-offset:3px}';
document.head.appendChild(st);
s.setAttribute('aria-label','1日の流れ(左右の矢印で切り替え)');
const cards=[...s.querySelectorAll('article')];if(!cards.length)return;
const nav=document.createElement('div');nav.className='fr-day-nav';
const prev=document.createElement('button');prev.type='button';prev.className='fr-day-arrow';prev.setAttribute('aria-label','前へ');prev.textContent='←';
const next=document.createElement('button');next.type='button';next.className='fr-day-arrow';next.setAttribute('aria-label','次へ');next.textContent='→';
const dots=document.createElement('div');dots.className='fr-day-dots';
cards.forEach((c,i)=>{const b=document.createElement('button');b.type='button';const t=c.querySelector('h3');b.setAttribute('aria-label',(i+1)+'枚目'+(t?':'+t.textContent:''));b.addEventListener('click',()=>{user();to(i)});dots.appendChild(b)});
nav.append(prev,dots,next);s.after(nav);
const pad=()=>cards[0].offsetLeft;
const idx=()=>{const x=s.scrollLeft;let best=0,d=1e9;cards.forEach((c,i)=>{const k=Math.abs(c.offsetLeft-pad()-x);if(k<d){d=k;best=i}});return best};
const max=()=>s.scrollWidth-s.clientWidth;
const to=i=>{i=Math.max(0,Math.min(cards.length-1,i));s.scrollTo({left:Math.min(max(),cards[i].offsetLeft-pad()),behavior:'smooth'})};
const sync=()=>{const i=idx(),end=s.scrollLeft>=max()-4;[...dots.children].forEach((b,k)=>b.setAttribute('aria-current',k===i?'true':'false'));prev.disabled=s.scrollLeft<=4;next.disabled=end};
let raf=0;s.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(sync)},{passive:true});addEventListener('resize',sync);
prev.addEventListener('click',()=>{user();to(idx()-1)});
next.addEventListener('click',()=>{user();const i=idx();if(s.scrollLeft>=max()-4)to(0);else to(i+1)});
s.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();user();to(idx()+1)}if(e.key==='ArrowLeft'){e.preventDefault();user();to(idx()-1)}});
const rm=matchMedia('(prefers-reduced-motion: reduce)');let hold=false,vis=false,resume=0;
function user(){hold=true;clearTimeout(resume);resume=setTimeout(()=>{hold=false},9000)}
s.addEventListener('mouseenter',()=>{hold=true;clearTimeout(resume)});s.addEventListener('mouseleave',()=>{clearTimeout(resume);resume=setTimeout(()=>{hold=false},800)});
s.addEventListener('touchstart',user,{passive:true});
if('IntersectionObserver'in window)new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.3}).observe(s);else vis=true;
setInterval(()=>{if(hold||!vis||document.hidden||rm.matches)return;if(s.scrollLeft>=max()-4)to(0);else to(idx()+1)},4200);
sync()})();
