(()=>{'use strict';
/** Original LOTUS stage illustration. Pure geometry has no DOM/network/storage. */
let sequence=0;
const format=n=>Number(n.toFixed(2)).toString();
function stageGeometry(state={}) {
  const kind=['led','projector','monitor','none','unselected'].includes(state.kind)?state.kind:'led';
  if(kind==='none'||kind==='unselected') return {kind,empty:true};
  const width=Number(state.width),height=Number(state.height);
  if((kind==='projector'||kind==='monitor')&&(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0))return {kind,unsized:true};
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||width>100||height>100) throw new RangeError('画面の幅・高さを確認してください。');
  const cols=Number(state.cols),rows=Number(state.rows);
  if(kind==='led'&&(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<1||rows<1||cols>200||rows>200)) throw new RangeError('LEDの横・縦の枚数を確認してください。');
  const scale=Math.min(105,780/(Math.max(width,6)+.85),360/Math.max(height,3));
  const groupWidth=(width+.85)*scale;
  const x=state.placement==='left'?100:state.placement==='right'?900-groupWidth:(1000-groupWidth)/2, floor=450;
  return {kind,width,height,cols,rows,scale,x,y:floor-height*scale,floor,screenWidth:width*scale,screenHeight:height*scale,personHeight:1.7*scale,personX:x+(width+.43)*scale,panels:kind==='led'?cols*rows:null};
}
function quantitySVG(count,id='lotus-quantity') {
  if(!/^[a-zA-Z][\w-]*$/.test(id))throw new TypeError('Invalid SVG id');
  const valid=Number.isInteger(count)&&count>=1&&count<=1000;
  const cols=valid?Math.min(40,Math.ceil(Math.sqrt(count*1.8))):1, rows=valid?Math.ceil(count/cols):1;
  const cell=Math.min(76,820/cols,340/rows), width=cols*cell, x=(1000-width)/2, y=(420-rows*cell)/2+35;
  let tiles='';for(let i=0;i<(valid?count:1);i++)tiles+=`<rect x="${x+(i%cols)*cell}" y="${y+Math.floor(i/cols)*cell}" width="${cell-3}" height="${cell-3}" rx="2"/>`;
  return `<svg viewBox="0 0 1000 580" role="img" aria-labelledby="${id}-title" xmlns="http://www.w3.org/2000/svg"><title id="${id}-title">LED ${valid?count+'枚':'数量未定'}。枚数の図。配置・実寸は未指定。</title><defs><linearGradient id="${id}-tiles"><stop stop-color="#39ddd7"/><stop offset="1" stop-color="#a38aff"/></linearGradient></defs><rect width="1000" height="580" fill="#10151e"/><g class="ls-quantity-tiles" fill="url(#${id}-tiles)">${tiles}</g><text x="500" y="475" fill="#eee8dc" font-size="38" text-anchor="middle">${valid?count+' 枚':'枚数を入力してください'}</text><text x="500" y="525" fill="#bac0ca" font-size="23" text-anchor="middle">枚数の図 · 配置・実寸は未指定</text></svg>`;
}
function stageSVG(state,id='lotus-stage') {
  if(!/^[a-zA-Z][\w-]*$/.test(id))throw new TypeError('Invalid SVG id');
  const g=stageGeometry(state);
  if(g.empty){const prompt=g.kind==='unselected'?'どんな画面で、届けますか。':'必要な機材から、構成をつくる。';const sub=g.kind==='unselected'?'LED・プロジェクター・モニターから選ぶ':'画面なし';return `<svg viewBox="0 0 1000 580" role="img" aria-label="${prompt}" xmlns="http://www.w3.org/2000/svg"><rect width="1000" height="580" fill="#10151e"/><path d="M80 450H920" stroke="#657080"/><text x="500" y="280" text-anchor="middle" fill="#eee8dc" font-size="34">${prompt}</text><text x="500" y="330" text-anchor="middle" fill="#bac0ca" font-size="24">${sub}</text></svg>`;}
  if(g.unsized){const projector=g.kind==='projector';const title=projector?'プロジェクター':'モニター';return `<svg viewBox="0 0 1000 580" role="img" aria-label="${title}の役割イメージ。画面サイズは未選択" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}-concept"><stop stop-color="#42d6db"/><stop offset="1" stop-color="#9a7fe5"/></linearGradient></defs><rect width="1000" height="580" fill="#141c2a"/>
  <g fill="none" stroke="#94a4bd" stroke-width="2">${projector?'<path d="M178 314H324L346 336V374H176Z"/><circle cx="306" cy="344" r="17"/><path d="M546 110H858V342H546Z"/>':'<rect x="215" y="100" width="570" height="320" rx="7"/><path d="M485 420V464H417M515 420V464H583"/>'}</g>
  ${projector?`<g class="ls-ribbons"><path d="M324 330L551 117V335Z" fill="url(#${id}-concept)" opacity=".13"/><path d="M324 330L551 117M324 330L551 335" fill="none" stroke="url(#${id}-concept)" opacity=".5"/></g>`:''}
  <g class="ls-ribbons" fill="none" stroke="url(#${id}-concept)" stroke-width="5"><path d="${projector?'M562 258C642 120 732 340 844 166':'M240 313C410 100 525 430 760 186'}"/></g>
  <text x="500" y="520" fill="#eae7e1" font-size="29" text-anchor="middle">${title}</text></svg>`;}

  const {x,y,screenWidth:w,screenHeight:h,scale:s}=g;
  const line=(a,b,c,d)=>`<path d="M${a} ${b}L${c} ${d}"/>`;
  let grid='';if(g.kind==='led'){for(let i=1;i<g.cols;i++)grid+=line(x+w*i/g.cols,y,x+w*i/g.cols,450);for(let i=1;i<g.rows;i++)grid+=line(x,y+h*i/g.rows,x+w, y+h*i/g.rows);}
  const title=`${format(g.width)}m × ${format(g.height)}m${g.panels?'・'+g.panels+'枚':''}。人の身長1.7mとの比較。`;
  return `<svg viewBox="0 0 1000 580" role="img" aria-labelledby="${id}-title" xmlns="http://www.w3.org/2000/svg">
<title id="${id}-title">${title}</title><defs>
<linearGradient id="${id}-room" x2="0" y2="1"><stop stop-color="#111721"/><stop offset="1" stop-color="#202631"/></linearGradient>
<linearGradient id="${id}-image" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#342875"/><stop offset=".38" stop-color="#176481"/><stop offset=".7" stop-color="#102b49"/><stop offset="1" stop-color="#111a35"/></linearGradient>
<linearGradient id="${id}-ribbon"><stop stop-color="#39ddd7"/><stop offset=".45" stop-color="#a0cff8"/><stop offset=".72" stop-color="#a38aff"/><stop offset="1" stop-color="#f0aa88"/></linearGradient>
<linearGradient id="${id}-person" x2="1" y2="0"><stop stop-color="#a4adb8"/><stop offset=".55" stop-color="#e6e0d4"/><stop offset="1" stop-color="#88929f"/></linearGradient>
<clipPath id="${id}-clip"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
<linearGradient id="${id}-dim" x2="0" y2="1"><stop stop-color="#05070b" stop-opacity=".78"/><stop offset=".72" stop-color="#05070b" stop-opacity=".62"/><stop offset="1" stop-color="#05070b" stop-opacity=".9"/></linearGradient><linearGradient id="${id}-skin" x2="1" y2="0"><stop stop-color="#0c1016"/><stop offset=".6" stop-color="#161c24"/><stop offset="1" stop-color="#232b35"/></linearGradient><linearGradient id="${id}-refl" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="${id}-topfade" x2="0" y2="1"><stop stop-color="#fff"/><stop offset=".2" stop-color="#fff" stop-opacity=".85"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${id}-topmask"><rect width="1000" height="580" fill="url(#${id}-topfade)"/></mask><mask id="${id}-rmask"><rect x="0" y="450" width="1000" height="130" fill="url(#${id}-refl)"/></mask></defs><rect width="1000" height="580" fill="url(#${id}-room)"/><image href="assets/brand/lotus-space-four-rows-poster.jpg" x="0" y="-40" width="1000" height="560" preserveAspectRatio="xMidYMin slice" opacity=".95" mask="url(#${id}-topmask)"/><rect x="0" y="450" width="1000" height="130" fill="#07090d"/><rect width="1000" height="580" fill="url(#${id}-dim)"/><path d="M0 450H1000" stroke="#c9d6e6" stroke-opacity=".18"/>
<rect x="${x-3}" y="${y-3}" width="${w+6}" height="${h+6}" fill="#0b1019" stroke="#738397" stroke-width="1"/>
<g clip-path="url(#${id}-clip)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-image)"/>
<g transform="translate(${x} ${y}) scale(${w/800} ${h/400})"><g class="ls-ribbons" fill="none" stroke="url(#${id}-ribbon)">
<path d="M-180 330C100 440 190 20 400 150S680 400 980 40" stroke-width="86" opacity=".12"/>
<path d="M-180 310C100 420 190 0 400 130S680 380 980 20" stroke-width="34" opacity=".24"/>
<path d="M-180 298C100 408 190 -12 400 118S680 368 980 8" stroke-width="5" opacity=".95"/>
<path d="M-120 342C100 452 190 32 400 162S680 412 980 52" stroke-width="1.5" opacity=".8"/>
<path d="M-100 100C190 -100 310 430 560 210S800 50 990 190" stroke-width="2" opacity=".6"/>
</g></g></g>
<g fill="none" stroke="#e1ebff" stroke-width=".65" stroke-opacity=".2">${grid}</g><g mask="url(#${id}-rmask)" opacity=".55"><g transform="translate(0 900) scale(1 -1)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-image)"/></g></g><ellipse cx="${x+w/2}" cy="452" rx="${w*.55}" ry="10" fill="#9ab8ff" opacity=".08"/>
<g transform="translate(${g.personX+.17*s} ${450-g.personHeight}) scale(${s})">
<ellipse cx="0" cy="1.7" rx=".32" ry=".035" fill="#000" opacity=".6"/>
<g fill="#b8dcff" opacity=".55" transform="translate(-.012 0)"><ellipse cx="0" cy=".115" rx=".085" ry=".108"/><path d="M-.19 .31Q-.2 .27 -.12 .25L-.045 .225Q0 .25 .045 .225L.12 .25Q.2 .27 .19 .31L.17 .62Q.16 .8 .155 .96L-.155 .96Q-.16 .8 -.17 .62Z"/><path d="M-.15 .94L-.135 1.67L-.03 1.67L-.01 1.0L.01 1.0L.03 1.67L.135 1.67L.15 .94Z"/></g>
<g fill="url(#${id}-skin)">
<path d="M-.15 .94L-.135 1.665L-.03 1.665L-.01 1.0L.01 1.0L.03 1.665L.135 1.665L.15 .94Z"/>
<ellipse cx="-.085" cy="1.685" rx=".075" ry=".026"/><ellipse cx=".085" cy="1.685" rx=".075" ry=".026"/>
<path d="M-.19 .31Q-.2 .27 -.12 .25L-.045 .225Q0 .25 .045 .225L.12 .25Q.2 .27 .19 .31L.17 .62Q.16 .8 .155 .96L-.155 .96Q-.16 .8 -.17 .62Z"/>
<rect x="-.035" y=".19" width=".07" height=".06" rx=".02"/>
<ellipse cx="0" cy=".115" rx=".083" ry=".106"/>
</g>
<g fill="none" stroke="url(#${id}-skin)" stroke-linecap="round" stroke-width=".072"><path d="M-.18 .32Q-.235 .5 -.225 .64L-.215 .84"/><path d="M.18 .32Q.235 .5 .225 .64L.215 .84"/></g>
<path d="M-.18 .32Q-.235 .5 -.225 .64L-.215 .84" fill="none" stroke="#b8dcff" stroke-opacity=".35" stroke-width=".012" transform="translate(-.034 0)" stroke-linecap="round"/>
<g fill="#151b22"><circle cx="-.215" cy=".865" r=".038"/><circle cx=".215" cy=".865" r=".038"/></g>
<path d="M-.083 .1Q-.08 .005 0 .005Q.08 .005 .083 .1Q.06 .045 0 .045Q-.06 .045 -.083 .1Z" fill="#07090c"/>
</g>
<g stroke="#b1baca" stroke-width="1" fill="none">${line(x,487,x+w,487)}${line(x,479,x,495)}${line(x+w,479,x+w,495)}${line(x-27,y,x-27,450)}${line(x-33,y,x-21,y)}${line(x-33,450,x-21,450)}</g>
<g fill="#eae7e1" font-family="system-ui,sans-serif" font-size="27" text-anchor="middle"><text x="${x+w/2}" y="524">${format(g.width)} m</text><text transform="translate(${x-43} ${y+h/2}) rotate(-90)">${format(g.height)} m</text></g>
<text x="${g.personX+.17*s}" y="489" fill="#b7bfca" font-family="system-ui,sans-serif" font-size="23" text-anchor="middle">1.7 m</text>
<text x="50" y="550" fill="#9ca8ba" font-family="system-ui,sans-serif" font-size="19" letter-spacing="2">LOTUS / STAGE STUDY</text></svg>`;
}
/** Host should be a new empty element, not the legacy stage-visual children. */
/** Estimate-only video surface. Geometry and quantity accounting remain pure. */
function mountEstimateStage(host,initialState){
 const doc=host.ownerDocument,win=doc.defaultView,id=`lotus-estimate-${++sequence}`;
 const root=doc.createElement('section');root.className='ls-stage ls-estimate-live';
 const art=doc.createElement('div');art.className='ls-stage-art';
 const footer=doc.createElement('div');footer.className='ls-stage-footer';
 const info=doc.createElement('p');footer.append(info);root.append(art,footer);host.append(root);
 const motion=win.matchMedia('(prefers-reduced-motion: reduce)');
 let video=null,inView=!win.IntersectionObserver,printing=false,destroyed=false;
 function sync(){
  if(!video)return;
  const current=video,allowed=inView&&!doc.hidden&&!motion.matches&&!printing&&!destroyed;
  if(!allowed){current.pause();current.style.opacity='0';return;}
  if(!current.getAttribute('src'))current.setAttribute('src','/assets/brand/estimate-live-loop.mp4');
  const playing=current.play();if(playing&&playing.catch)playing.catch(()=>{current.style.opacity='0';});
 }
 function update(state){
  if(video){video.pause();video.removeAttribute('src');video.load();video=null;}
  const g=stageGeometry(state);art.innerHTML=stageSVG(state,id);
  info.textContent=g.empty?(g.kind==='unselected'?'画面の種類を選ぶ':'画面なし'):g.unsized?'画面の機種・サイズを選んで相談':`${format(g.width)} × ${format(g.height)} m${g.panels?' ・ '+g.panels+'枚':''}`;
  if(g.kind==='led'&&!g.empty&&!g.unsized){
   video=doc.createElement('video');const current=video;
   current.className='ls-estimate-video';current.muted=true;current.defaultMuted=true;current.loop=true;current.playsInline=true;current.preload='none';
   current.setAttribute('muted','');current.setAttribute('playsinline','');current.setAttribute('aria-hidden','true');current.setAttribute('tabindex','-1');
   Object.assign(current.style,{left:`${g.x/10}%`,top:`${g.y/5.8}%`,width:`${g.screenWidth/10}%`,height:`${g.screenHeight/5.8}%`,opacity:'0'});
   current.addEventListener('playing',()=>{if(current===video&&inView&&!doc.hidden&&!motion.matches&&!printing)current.style.opacity='1';else current.pause();});
   current.addEventListener('error',()=>{current.style.opacity='0';});art.append(current);
  }
  sync();
 }
 const visibility=()=>sync(),reduce=()=>sync(),before=()=>{printing=true;sync();},after=()=>{printing=false;sync();};
 const observer=win.IntersectionObserver?new win.IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);sync();},{threshold:.05}):null;
 if(observer)observer.observe(root);
 doc.addEventListener('visibilitychange',visibility);motion.addEventListener('change',reduce);win.addEventListener('beforeprint',before);win.addEventListener('afterprint',after);update(initialState);
 return {update,refresh:update,play:sync,stop(){if(video)video.pause();},destroy(){destroyed=true;if(observer)observer.disconnect();if(video){video.pause();video.removeAttribute('src');video.load();}doc.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',reduce);win.removeEventListener('beforeprint',before);win.removeEventListener('afterprint',after);root.remove();}};
}

function mountStage(host,initialState) {
  if(host.id==='stage-canvas')return mountEstimateStage(host,initialState);
  const doc=host.ownerDocument, win=doc.defaultView,id=`lotus-stage-${++sequence}`;
  const root=doc.createElement('section');root.className='ls-stage';
  const art=doc.createElement('div');art.className='ls-stage-art';
  const footer=doc.createElement('div');footer.className='ls-stage-footer';
  const info=doc.createElement('p');info.textContent='画面プレビュー';
  const button=doc.createElement('button');button.type='button';button.className='lotus-control lotus-control--compact';button.textContent='演出を見る';button.setAttribute('aria-pressed','false');
  const status=doc.createElement('span');status.className='ls-stage-status';status.setAttribute('role','status');
  footer.append(info,button,status);root.append(art,footer);host.append(root);
  let timer=null,running=false;const motion=win.matchMedia('(prefers-reduced-motion: reduce)');
  function stop(){win.clearTimeout(timer);timer=null;running=false;root.classList.remove('is-playing');button.textContent='演出を見る';button.setAttribute('aria-pressed','false');}
  function update(state){const g=stageGeometry(state);stop();art.innerHTML=stageSVG(state,id);button.hidden=g.empty===true;info.textContent=g.empty?(g.kind==='unselected'?'画面の種類を選ぶ':'画面なし'):g.unsized?'画面の機種・サイズを選んで相談':`${format(g.width)} × ${format(g.height)} m${g.panels?' ・ '+g.panels+'枚':''} ／ イメージ`;status.textContent='';}
  function play(){if(running){stop();status.textContent='停止しました';return;}if(motion.matches){status.textContent='動きを抑える設定で表示しています';return;}if(doc.hidden)return;running=true;root.classList.add('is-playing');button.textContent='停止';button.setAttribute('aria-pressed','true');status.textContent='映像の流れをプレビュー中';timer=win.setTimeout(()=>{stop();status.textContent='プレビューが終了しました';},4800);}
  const visibility=()=>{if(doc.hidden)stop();};const reduce=()=>{if(motion.matches)stop();};
  button.addEventListener('click',play);doc.addEventListener('visibilitychange',visibility);motion.addEventListener('change',reduce);win.addEventListener('beforeprint',stop);update(initialState);
  return {update,refresh:update,play(){if(!running)play();},stop,destroy(){stop();button.removeEventListener('click',play);doc.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',reduce);win.removeEventListener('beforeprint',stop);root.remove();}};
}

const mounts=new WeakMap();
function render(container,state){let instance=mounts.get(container);if(instance){instance.update(state);return instance;}instance=mountStage(container,state);const destroy=instance.destroy;instance.destroy=()=>{destroy();mounts.delete(container);};mounts.set(container,instance);return instance;}

window.LotusStageVisual={render,stageGeometry,stageSVG,quantitySVG};
})();
