/* Local presentation only. No network, storage, hidden content or inferred claims. */
'use strict';
(()=>{
 if(!document.body.classList.contains('lotus-v2'))return;
 const art=document.querySelector('[data-service-art]');
 if(art){
  const group=art.querySelector('.v2-art-options'),title=art.querySelector('[data-art-title]'),detail=art.querySelector('[data-art-detail]');
  const copy={crew:['人の判断で、本番の一瞬につなぐ。','設営・リハーサル・本番・撤去。担当してほしい工程を、具体的な役割に分けます。'],equipment:['映したいことに、道具を合わせる。','画面の大きさ、素材、入力機器。目的から必要な機材の構成を考えます。'],both:['技術と機材がつながって、映像になる。','何を映すか。どこへ届けるか。人の役割と道具の構成を、一緒に整理します。']};
  if(group&&title&&detail){const buttons=[...group.querySelectorAll('[data-art-mode]')];buttons.forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.artMode;if(!Object.hasOwn(copy,key))return;art.dataset.serviceArt=key;buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));title.textContent=copy[key][0];detail.textContent=copy[key][1]}));group.hidden=false;}
 }
})();
/* Media is intentionally lazy: reduced motion and data saver do not fetch it. */
(()=>{
 const film=document.querySelector('[data-brand-film]'),toggle=document.querySelector('[data-film-toggle]');
 if(!film||!toggle)return;
 const source=film.querySelector('source'),label=toggle.querySelector('[data-film-label]'),icon=toggle.querySelector('[data-film-icon]'),status=document.querySelector('[data-film-status]');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let wanted=!reduced.matches&&!(navigator.connection&&navigator.connection.saveData),inView=true,loaded=false,failed=false;
 const update=()=>{const playing=!film.paused&&!film.ended;label.textContent=playing?'映像を停止':'映像を再生';icon.textContent=playing?'Ⅱ':'▷';toggle.setAttribute('aria-label',playing?'背景の3D映像を停止':'背景の3D映像を再生');};
 const run=()=>{
  if(!wanted||!inView||document.hidden||failed){film.pause();update();return;}
  if(!loaded){source.src=source.dataset.src;film.load();loaded=true;}
  const promise=film.play();
  if(promise&&typeof promise.catch==='function')promise.catch(()=>{wanted=false;update();});
 };
 toggle.addEventListener('click',()=>{wanted=film.paused;if(wanted&&status)status.textContent='';run();});
 ['play','pause','ended'].forEach(name=>film.addEventListener(name,update));
 film.addEventListener('error',()=>{failed=true;wanted=false;film.pause();toggle.disabled=true;label.textContent='静止画を表示中';icon.textContent='';if(status)status.textContent='映像を読み込めないため、静止画を表示しています。';});
 document.addEventListener('visibilitychange',run);
 if(reduced.addEventListener)reduced.addEventListener('change',()=>{if(reduced.matches){wanted=false;run();}});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;run();},{threshold:.05}).observe(film);
 toggle.hidden=false;update();run();
})();
/* Current chapter is a location cue; all links remain native without JS. */
(()=>{
 const nav=document.querySelector('[data-v2-chapters]');if(!nav||!('IntersectionObserver' in window))return;
 const links=[...nav.querySelectorAll('a[href^="#"]')],targets=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);
 const mark=id=>links.forEach(a=>{if(a.hash==='#'+id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 links.forEach(a=>a.addEventListener('click',()=>mark(a.hash.slice(1))));
 const observer=new IntersectionObserver(entries=>{const first=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(first)mark(first.target.id);},{rootMargin:'-5% 0px -65% 0px',threshold:0});
 targets.forEach(t=>observer.observe(t));
})();

/* Decorative homepage motion never depends on autoplay permission or media download. */
(()=>{
 const hero=document.querySelector('[data-gentle-hero]'),button=document.querySelector('[data-gentle-toggle]');if(!hero||!button)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=false,inView=true;
 const sync=()=>{const running=!paused&&!reduced.matches&&!document.hidden&&inView;hero.dataset.motion=running?'running':'paused';button.hidden=reduced.matches;button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'動きを戻す':'動きを止める';};
 button.addEventListener('click',()=>{paused=!paused;sync()});reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync()},{threshold:.01}).observe(hero);sync();
})();
