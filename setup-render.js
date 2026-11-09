/* 設営イメージ — selections → in-browser render (Friday 2026-11-09). No network, no storage. */
(()=>{'use strict';
const root=document.getElementById('setup-render');if(!root)return;
const cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
const $=id=>document.getElementById(id);
const venueSel=root.querySelector('[name=sr-venue]'),modeBtns=[...root.querySelectorAll('[data-sr-mode]')];
const cap=root.querySelector('.sr-cap'),save=root.querySelector('.sr-save'),toPrint=root.querySelector('.sr-print');
let mode='setup',seed=7,last='',sides=null;
const LAY={
 arena:[{t:'おすすめ',c:[24,12],inst:'hanging',side:[7,12],note:'センター 12×6m を吊り、左右に 3.5×6m。後ろの席まで顔が届く大きさです。'},{t:'ひかえめ',c:[16,9],inst:'hanging',side:null,note:'センター 8×4.5m を 1 面。ステージ全体を見せたいときに。'}],
 dome:[{t:'おすすめ',c:[40,20],inst:'hanging',side:[12,20],note:'センター 20×10m、左右に 6×10m。スタンドの最上段からも表情が見える規模です。'},{t:'ひかえめ',c:[32,18],inst:'hanging',side:null,note:'センター 16×9m を 1 面。'}],
 hall:[{t:'おすすめ',c:[12,6],inst:'stacking',side:[3,6],note:'センター 6×3m、左右に 1.5×3m。1,000〜2,000 席のホールで舞台を包む構成です。'},{t:'ひかえめ',c:[8,5],inst:'stacking',side:null,note:'センター 4×2.5m を 1 面。講演・式典に。'}],
 messe:[{t:'おすすめ',c:[8,5],inst:'stacking',side:[3,5],note:'ブース正面に 4×2.5m、横に 1.5×2.5m の柱。通路の遠くから目に入る高さです。'},{t:'ひかえめ',c:[6,4],inst:'stacking',side:null,note:'3×2m を 1 面。小間のブースに。'}],
 ballroom:[{t:'おすすめ',c:[10,6],inst:'stacking',side:null,note:'正面に 5×3m。宴会・発表会で、どの円卓からも見やすい大きさです。'},{t:'ひかえめ',c:[8,4],inst:'stacking',side:null,note:'4×2m を 1 面。'}],
 conf:[{t:'おすすめ',c:[8,5],inst:'stacking',side:null,note:'正面に 4×2.5m。スライドの文字が後ろの列まで読める大きさです。'},{t:'ひかえめ',c:[6,3],inst:'stacking',side:null,note:'3×1.5m を 1 面。'}],
 outdoor:[{t:'おすすめ',c:[12,7],inst:'stacking',side:null,note:'6×3.5m を自立で。広場の後方からも見える規模です。風・雨の条件は下見で確認します。'},{t:'ひかえめ',c:[8,5],inst:'stacking',side:null,note:'4×2.5m を 1 面。'}]};
const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
function state(){
 const n=(id,d)=>{const v=parseFloat(($(id)||{}).value);return isFinite(v)&&v>0?v:d};
 const type=($('screen-type')||{}).value||'led';
 const model=$('stage-model');
 let cols=Math.round(n('stage-cols',12)),rows=Math.round(n('stage-rows',6));
 let w=n('stage-width',cols*.5),h=n('stage-height',rows*.5);
 if(type==='led'){w=cols*.5;h=rows*.5}
 return{type,w:Math.min(Math.max(w,1),20),h:Math.min(Math.max(h,.5),10),cols:Math.min(cols,40),rows:Math.min(rows,20),
  model:model&&model.selectedOptions[0]?model.selectedOptions[0].text:'',place:($('stage-placement')||{}).value||'center',
  inst:($('stage-installation')||{}).value||'undecided',sides:($('screen-type')||{}).value==='led'||!($('screen-type')||{}).value?sides:null,name:((root.querySelector('[name=sr-name]')||{}).value||($('project-name')||{}).value||'').trim().slice(0,40),venue:venueSel.value,mode};
}
let S,cam;
function setupCam(s){
 const span=s.w+(s.sides?2*(s.sides[0]*.5+1.6):0);const MINW={arena:36,dome:50,hall:18,messe:15,ballroom:16,conf:14,outdoor:24}[s.venue]||15,MINH={arena:15,dome:22,hall:10,messe:9,ballroom:6,conf:4.5,outdoor:9}[s.venue]||7;
 const W=Math.max(span+8,MINW),H=Math.max(s.h+(s.inst==='hanging'?4.6:3.4),MINH);
 const cw=cv.width,ch=cv.height,f=cw*.92,cz=f*W/(.78*cw);
 cam={W,H,f,cz,cy:1.75,cx:cw/2,hy:ch*.56};
}
function P(x,y,z){const d=cam.cz-z;return[cam.cx+cam.f*x/d,cam.hy-cam.f*(y-cam.cy)/d,cam.f/d]}
function poly(pts,fill,stroke){ctx.beginPath();pts.forEach((p,i)=>{const q=P(...p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function line(a,b,c,w){const p=P(...a),q=P(...b);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.strokeStyle=c;ctx.lineWidth=w||1;ctx.stroke();ctx.lineWidth=1}
const PAL={arena:{wall:'#15171c',floor:'#25262a',ceil:'#0c0d10',side:'#111216'},dome:{wall:'#101217',floor:'#2b3a2e',ceil:'#0a0b0e',side:'#0e1014'},messe:{wall:'#e3e6e9',floor:'#a3a8ad',ceil:'#f1f2f3',side:'#d9dde0'},hall:{wall:'#1b1d24',floor:'#2a2622',ceil:'#121318',side:'#16181e'},conf:{wall:'#d9d4cb',floor:'#6d6a66',ceil:'#ebe8e2',side:'#cbc5bb'},ballroom:{wall:'#3a2e27',floor:'#4a3a33',ceil:'#2a221d',side:'#33281f'},outdoor:{wall:'#8fb6d9',floor:'#7b7b78',ceil:null,side:null}};
function room(s){
 const {W,H}=cam,D=cam.cz-3,p=PAL[s.venue],x0=-W/2,x1=W/2,show=s.mode==='show';
 if(s.venue==='outdoor'){
  const g=ctx.createLinearGradient(0,0,0,cam.hy);
  if(show){g.addColorStop(0,'#0b1430');g.addColorStop(1,'#3b2c4f')}else{g.addColorStop(0,'#7fb3e3');g.addColorStop(1,'#d8e6ef')}
  ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cam.hy+2);
  ctx.fillStyle=show?'#151a24':'#9aa7ae';for(let i=0;i<9;i++){const bx=i*cv.width/9,bh=40+((i*53)%90);ctx.fillRect(bx,cam.hy-bh-cam.f*(0-cam.cy)/(cam.cz+30)*0,cv.width/9-6,bh)}
  ctx.fillStyle=show?'#232326':'#86868a';ctx.fillRect(0,cam.hy,cv.width,cv.height-cam.hy);
  for(let z=-6;z<D;z+=1.5)line([-60,0,z],[60,0,z],show?'#2c2c30':'#7a7a7e',1);
  return}
 poly([[x0,0,0],[x1,0,0],[x1,H,0],[x0,H,0]],show?shade(p.wall,.55):p.wall);
 poly([[x0,0,0],[x0,0,D],[x0,H,D],[x0,H,0]],show?shade(p.side,.5):p.side);
 poly([[x1,0,0],[x1,0,D],[x1,H,D],[x1,H,0]],show?shade(p.side,.5):p.side);
 poly([[x0,H,0],[x1,H,0],[x1,H,D],[x0,H,D]],show?shade(p.ceil,.5):p.ceil);
 poly([[x0,0,0],[x1,0,0],[x1,0,D],[x0,0,D]],show?shade(p.floor,.6):p.floor);
 ctx.globalAlpha=.18;for(let z=1;z<D;z+=1.2)line([x0,0,z],[x1,0,z],'#000',1);for(let x=Math.ceil(x0);x<x1;x+=1.2)line([x,0,0],[x,0,D],'#000',1);ctx.globalAlpha=1;
 if(s.venue==='conf'||s.venue==='ballroom'){for(let z=2;z<D;z+=3){const a=P(-2,H,z),b=P(2,H,z);ctx.fillStyle=s.venue==='ballroom'?'#f6d9a3':'#ffffff';ctx.globalAlpha=show?.35:.9;ctx.fillRect(a[0],a[1]-2,b[0]-a[0],3);ctx.globalAlpha=1}}
 if(s.venue==='hall'){ // stage deck
  poly([[x0,0,0],[x1,0,0],[x1,0,4.2],[x0,0,4.2]],null);
 }
}
function shade(hex,k){const n=parseInt(hex.slice(1),16);return'rgb('+[(n>>16)&255,(n>>8)&255,n&255].map(v=>Math.round(v*k)).join(',')+')'}
function screenRect(s){
 const off=s.place==='left'?-(cam.W/2-s.w/2-1.2):s.place==='right'?(cam.W/2-s.w/2-1.2):0;
 const y0=s.inst==='hanging'?Math.max(.6,Math.min({arena:3,dome:4}[s.venue]||1.8,cam.H-s.h-1.6)):(s.type==='led'?.6:1.1);
 return{x0:off-s.w/2,x1:off+s.w/2,y0,y1:y0+s.h,z:.9}
}
function content(r,lit,s){
 const a=P(r.x0,r.y1,r.z),b=P(r.x1,r.y0,r.z),wpx=b[0]-a[0],hpx=b[1]-a[1];
 const g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);
 g.addColorStop(0,'#1aa0ef');g.addColorStop(.5,'#6a4dff');g.addColorStop(1,'#ff5a8a');
 ctx.save();ctx.beginPath();ctx.rect(a[0],a[1],wpx,hpx);ctx.clip();ctx.fillStyle=g;ctx.fillRect(a[0],a[1],wpx,hpx);
 ctx.globalAlpha=.25;ctx.fillStyle='#fff';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(a[0]+wpx*(.15+i*.18),a[1]+hpx*(.3+(i%2)*.4),hpx*.5,0,7);ctx.fill()}
 ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';
 if(s.side){ctx.restore();return}const t=s.name||'LOTUS';let fs=Math.min(hpx*.22,wpx/Math.max(t.length,4)*1.5);ctx.font='700 '+fs+'px "Hiragino Sans","Noto Sans JP",sans-serif';ctx.fillText(t,a[0]+wpx/2,a[1]+hpx/2);
 ctx.restore();
}
function led(s,rr){
 const r=rr||screenRect(s),show=s.mode==='show';
 if(!rr&&s.sides){const sc=s.sides[0],sr=s.sides[1],sw=sc*.5,sh=sr*.5,c=screenRect(s);for(const d of[-1,1]){const cx=d<0?c.x0-1.6-sw/2:c.x1+1.6+sw/2;const y0=Math.max(c.y0,c.y0+(s.h-sh)/2);led(Object.assign({},s,{cols:sc,rows:sr,w:sw,h:sh,sides:null,name:'',side:true}),{x0:cx-sw/2,x1:cx+sw/2,y0,y1:y0+sh,z:c.z+.6})}}
 // structure
 if(s.inst==='hanging'){
  const ty=Math.min(r.y1+.9,cam.H-.35);
  truss([r.x0-.6,ty,r.z],[r.x1+.6,ty,r.z]);
  const n=Math.max(2,Math.ceil(s.w/2.5));for(let i=0;i<=n;i++){const x=r.x0+(r.x1-r.x0)*i/n;line([x,ty,r.z],[x,r.y1,r.z],'#888',1.2);const m=P(x,ty-.25,r.z);ctx.fillStyle='#202020';ctx.fillRect(m[0]-4*m[2]/40,m[1],8*m[2]/40,10*m[2]/40);line([x,cam.H,r.z-.3],[x,ty,r.z],'#555',1)}
 }else{
  poly([[r.x0-.25,0,r.z+.9],[r.x1+.25,0,r.z+.9],[r.x1+.25,.12,r.z+.9],[r.x0-.25,.12,r.z+.9]],'#2b2b2b');
  for(let x=r.x0;x<=r.x1+.01;x+=1.5)line([x,.1,r.z+.85],[x,r.y0+.2,r.z],'#3a3a3a',2);
  if(r.y0>.2)poly([[r.x0,0,r.z],[r.x1,0,r.z],[r.x1,r.y0,r.z],[r.x0,r.y0,r.z]],'#1d1d1d');
 }
 // panels
 const cols=s.type==='led'?s.cols:1,rows=s.type==='led'?s.rows:1;
 const built=show?cols*rows:Math.floor(cols*rows*.62);
 // backing dark
 poly([[r.x0,r.y0,r.z],[r.x1,r.y0,r.z],[r.x1,r.y1,r.z],[r.x0,r.y1,r.z]],'#0e0f11');
 if(show||s.type!=='led'){content(r,1,s)}else{
  ctx.save();const a=P(r.x0,r.y1,r.z),b=P(r.x1,r.y0,r.z);ctx.beginPath();
  let k=0;for(let rr=rows-1;rr>=0;rr--)for(let c=0;c<cols;c++){ // build from bottom
   const idx=(rows-1-rr)*cols+c;if(idx>=built)continue;
   const x=a[0]+(b[0]-a[0])*c/cols,y=a[1]+(b[1]-a[1])*rr/rows;ctx.rect(x,y,(b[0]-a[0])/cols,(b[1]-a[1])/rows)}
  ctx.clip();content(r,1,s);ctx.restore();
  // unlit built tiles look: dim overlay
  ctx.fillStyle='rgba(10,10,12,.55)';const a2=P(r.x0,r.y1,r.z),b2=P(r.x1,r.y0,r.z);ctx.fillRect(a2[0],a2[1],b2[0]-a2[0],b2[1]-a2[1]);
 }
 if(s.type==='led'){ // seams
  const a=P(r.x0,r.y1,r.z),b=P(r.x1,r.y0,r.z);ctx.strokeStyle=show?'rgba(0,0,0,.12)':'rgba(0,0,0,.6)';ctx.lineWidth=1;
  for(let c=1;c<cols;c++){const x=a[0]+(b[0]-a[0])*c/cols;ctx.beginPath();ctx.moveTo(x,a[1]);ctx.lineTo(x,b[1]);ctx.stroke()}
  for(let q=1;q<rows;q++){const y=a[1]+(b[1]-a[1])*q/rows;ctx.beginPath();ctx.moveTo(a[0],y);ctx.lineTo(b[0],y);ctx.stroke()}
 }
 if(show){const a=P(r.x0,r.y1,r.z),b=P(r.x1,r.y0,r.z);const g=ctx.createRadialGradient((a[0]+b[0])/2,b[1],10,(a[0]+b[0])/2,b[1],(b[0]-a[0]));g.addColorStop(0,'rgba(120,110,255,.28)');g.addColorStop(1,'rgba(120,110,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height)}
 return r;
}
function truss(a,b){const s=.3;for(const dy of[0,-s])line([a[0],a[1]+dy,a[2]],[b[0],b[1]+dy,b[2]],'#b9bcc0',2);const L=b[0]-a[0];for(let x=0;x<L;x+=.5){line([a[0]+x,a[1],a[2]],[a[0]+x+.25,a[1]-s,a[2]],'#9a9da1',1);line([a[0]+x+.25,a[1]-s,a[2]],[a[0]+x+.5,a[1],a[2]],'#9a9da1',1)}}
function projector(s){
 const r=screenRect(s);r.y0=Math.max(r.y0,.9);r.y1=r.y0+s.h;
 poly([[r.x0-.1,r.y0-.1,r.z],[r.x1+.1,r.y0-.1,r.z],[r.x1+.1,r.y1+.1,r.z],[r.x0-.1,r.y1+.1,r.z]],'#111');
 poly([[r.x0,r.y0,r.z],[r.x1,r.y0,r.z],[r.x1,r.y1,r.z],[r.x0,r.y1,r.z]],'#e9eaec');
 line([r.x0,0,r.z+.3],[r.x0,r.y0,r.z],'#333',2);line([r.x1,0,r.z+.3],[r.x1,r.y0,r.z],'#333',2);
 if(s.mode==='show'){ctx.save();ctx.globalAlpha=.92;content(r,1,s);ctx.restore()}
 const pz=Math.min(cam.cz-5,s.w*1.6+2),pj=[(r.x0+r.x1)/2,1.3,pz];
 box(pj[0]-.35,1.1,pz-.3,.7,.35,.6,'#2d2f33');line([pj[0],0,pz],[pj[0],1.1,pz],'#444',3);
 if(s.mode==='show'){ctx.globalAlpha=.08;poly([[pj[0],1.3,pz-.3],[r.x0,r.y1,r.z],[r.x1,r.y1,r.z]],'#fff');poly([[pj[0],1.3,pz-.3],[r.x0,r.y0,r.z],[r.x1,r.y0,r.z]],'#fff');ctx.globalAlpha=1}
 return r;
}
function monitors(s){
 const n=Math.max(1,Math.min(4,Math.round(s.w/2))),mw=Math.min(2.2,s.w/n),mh=mw*.5625,res=[];
 for(let i=0;i<n;i++){const x=-((n-1)*(mw+.8))/2+i*(mw+.8);const r={x0:x-mw/2,x1:x+mw/2,y0:1.2,y1:1.2+mh,z:2};
  line([x,0,2.1],[x,1.2,2],'#333',4);poly([[x-.45,0,2.4],[x+.45,0,2.4],[x+.45,.05,2.4],[x-.45,.05,2.4]],'#222');
  poly([[r.x0-.04,r.y0-.04,r.z],[r.x1+.04,r.y0-.04,r.z],[r.x1+.04,r.y1+.04,r.z],[r.x0-.04,r.y1+.04,r.z]],'#0b0b0b');
  if(s.mode==='show'||i<n-1)content(r,1,s);else poly([[r.x0,r.y0,r.z],[r.x1,r.y0,r.z],[r.x1,r.y1,r.z],[r.x0,r.y1,r.z]],'#1a1a1c');res.push(r)}
 return res[0];
}
function box(x,y,z,w,h,d,c){poly([[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]],c);poly([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],shade2(c,1.25))}
function shade2(c,k){if(c[0]!=='#')return c;const n=parseInt(c.slice(1),16);return'rgb('+[(n>>16)&255,(n>>8)&255,n&255].map(v=>Math.min(255,Math.round(v*k))).join(',')+')'}
function person(x,z,o){
 o=o||{};const hgt=o.h||1.72,[px,py,k]=P(x,0,z),u=k*hgt/1.72; // u ~ px per meter
 const col=o.col||'#1f3b57',crew=o.crew!==false;
 ctx.save();ctx.translate(px,py);
 ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,0,u*.32,u*.06,0,0,7);ctx.fill();
 ctx.fillStyle=crew?'#23272d':'#16171a';ctx.fillRect(-u*.15,-u*.85,u*.13,u*.85);ctx.fillRect(u*.02,-u*.85,u*.13,u*.85);
 ctx.fillStyle=crew?col:'#1c1d22';roundRect(-u*.23,-u*1.45,u*.46,u*.65,u*.08);
 if(crew){ctx.fillStyle='#c8ff3a';ctx.fillRect(-u*.23,-u*1.18,u*.46,u*.05)}
 ctx.fillStyle=crew?col:'#1c1d22';
 if(o.arms==='up'){ctx.fillRect(-u*.3,-u*1.95,u*.1,u*.55);ctx.fillRect(u*.2,-u*1.95,u*.1,u*.55)}
 else{ctx.fillRect(-u*.31,-u*1.42,u*.09,u*.55);ctx.fillRect(u*.22,-u*1.42,u*.09,u*.55)}
 ctx.fillStyle=crew?'#e8c3a0':'#121214';ctx.beginPath();ctx.arc(0,-u*1.58,u*.12,0,7);ctx.fill();
 if(crew){ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(0,-u*1.6,u*.135,Math.PI,0);ctx.fill();ctx.fillRect(-u*.16,-u*1.61,u*.32,u*.035);ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=Math.max(1,u*.01);ctx.beginPath();ctx.arc(0,-u*1.6,u*.135,Math.PI,0);ctx.stroke()}
 if(o.panel){ctx.fillStyle='#2b2d31';ctx.fillRect(-u*.25,-u*2.05,u*.5,u*.5);ctx.strokeStyle='#555';ctx.strokeRect(-u*.25,-u*2.05,u*.5,u*.5)}
 ctx.restore();
}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fill()}
function lift(x,z,top){ // scissor-type aerial work platform, generic
 const h=Math.max(1.2,top);box(x-.4,0,z,.8,.35,1.2,'#d8d8d8');
 for(let y=.35;y<h-.1;y+=.45){line([x-.38,y,z+.6],[x+.38,y+.45,z+.6],'#9a9a9a',2);line([x+.38,y,z+.6],[x-.38,y+.45,z+.6],'#9a9a9a',2)}
 box(x-.45,h,z+.1,.9,.08,1,'#c9c9c9');line([x-.45,h+1,z+1.1],[x+.45,h+1,z+1.1],'#c9c9c9',2);line([x-.45,h,z+1.1],[x-.45,h+1,z+1.1],'#c9c9c9',2);line([x+.45,h,z+1.1],[x+.45,h+1,z+1.1],'#c9c9c9',2);
 return h;
}
function cases(x,z,n){for(let i=0;i<n;i++)box(x+i*.75,0,z+(i%2)*.3,.65,.75,.55,i%3?'#1e1f22':'#26282c')}
function render(){
 const s=state();S=s;
 if(window.SR3D&&window.SR3D.ready&&!window.SR3D.failed){try{window.SR3D.update(s)}catch(e){console.warn(e);window.SR3D.failed=true;cv.parentNode.classList.remove('is-3d');return render()}const lb=root.querySelector('.sr-label');if(lb)lb.textContent=describe(s);cap.textContent=describe(s)+'。人物は身長 1.7m。ドラッグで視点を動かせます。';if(toPrint&&toPrint.checked)syncPrint();return}seed=11+s.cols*7+s.rows*3+(s.name.length*13);setupCam(s);
 const cw=cv.width,ch=cv.height;ctx.clearRect(0,0,cw,ch);ctx.fillStyle='#111';ctx.fillRect(0,0,cw,ch);
 room(s);
 let r;if(s.type==='projector')r=projector(s);else if(s.type==='monitor')r=monitors(s);else if(s.type==='none')r=null;else r=led(s);
 const D=cam.cz-3,show=s.mode==='show';
 if(!show){
  if(r){const mid=(r.x0+r.x1)/2;
   if(s.inst==='hanging'&&s.type==='led'){const h=lift(r.x1+1.1,1.4,Math.min(r.y1-1.2,cam.H-2.6));person(r.x1+1.1,2,{arms:'up'})}
   person(r.x0+s.w*.3,1.9,{panel:true,arms:'up'});person(r.x0+s.w*.6,2.2,{});person(mid-.6,3.2,{col:'#2b4a32'});
   cases(r.x0-.2,3.6,Math.min(6,2+Math.round(s.w/3)));person(r.x1-.3,4.3,{panel:true,arms:'up'});
   // cable run
   ctx.strokeStyle='#0a0a0a';ctx.lineWidth=2;ctx.beginPath();const c0=P(mid,0,r.z+.4),c1=P(mid+1.5,0,D*.6),c2=P(1.2,0,D-1);ctx.moveTo(c0[0],c0[1]);ctx.quadraticCurveTo(c1[0],c1[1],c2[0],c2[1]);ctx.stroke()
  }else{cases(-2,2.5,6);person(-1,3.6,{});person(1.4,3,{panel:true,arms:'up'})}
  // FOH desk being set
  const fz=Math.min(D-2,cam.cz-9);box(.4,0,fz-1,2.2,.8,.8,'#2a2c30');person(1.5,fz,{});
 }else{
  if(s.venue!=='outdoor'){ // beams
   ctx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const x=-cam.W/2+1+i*(cam.W-2)/5;const a=P(x,cam.H-.2,1.5),b=P(x+(i%2?2:-2),0,4.5),c=P(x+(i%2?3:-1),0,4.5);ctx.fillStyle='rgba(140,120,255,.06)';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.fill()}ctx.globalCompositeOperation='source-over'}
  // audience rows (from behind)
  const rows=s.venue==='conf'?4:6;
  for(let q=rows-1;q>=0;q--){const z=5+q*1.15;if(z>D-1.5)continue;const n=Math.floor(cam.W/.75);for(let i=0;i<n;i++){if(rnd()<.12)continue;person(-cam.W/2+.5+i*.75+(q%2)*.35+rnd()*.12,z,{crew:false,h:1.2+rnd()*.12})}}
  const fz=Math.min(D-2,cam.cz-9);box(-.2,0,fz-1,2.4,.85,.8,'#1b1c1f');const k=P(1,1,fz-.6);ctx.fillStyle='#3cf';ctx.fillRect(k[0]-30*k[2]/60,k[1]-6,60*k[2]/60,4);
  person(.5,fz+.4,{});person(1.6,fz+.4,{col:'#2b4a32'});
 }
 // label strip
 ctx.fillStyle='rgba(10,11,13,.82)';ctx.fillRect(0,ch-62,cw,62);ctx.fillStyle='#c9a35a';ctx.font='600 15px "Helvetica Neue",Arial,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
 ctx.fillText('LOTUS VISUAL  SETUP VIEW',26,ch-31);
 ctx.fillStyle='#eee9df';ctx.font='500 17px "Hiragino Sans","Noto Sans JP",sans-serif';
 ctx.fillText(describe(s),220,ch-31);
 cap.textContent=describe(s)+'。人物は身長 1.7m で描いています。';
 if(toPrint&&toPrint.checked)syncPrint();
}
const VEN={arena:'アリーナ',dome:'ドーム',hall:'ホール・劇場',messe:'展示会場',ballroom:'宴会場・ホテル',conf:'会議室',outdoor:'屋外・広場'};
const INST={hanging:'吊り',stacking:'自立',undecided:'設置方法は相談'};
function describe(s){
 const head=s.name?'「'+s.name+'」 ':'';
 const scr=s.type==='led'?`LED ${s.w.toFixed(1)}×${s.h.toFixed(1)}m(${s.cols}×${s.rows}枚${s.model?'・'+s.model:''})${s.sides?' ＋ 左右 '+(s.sides[0]*.5)+'×'+(s.sides[1]*.5)+'m':''}・${INST[s.inst]}`:s.type==='projector'?`スクリーン ${s.w.toFixed(1)}×${s.h.toFixed(1)}m・プロジェクター`:s.type==='monitor'?'モニター':'画面なし';
 return head+VEN[s.venue]+' ／ '+scr+' ／ '+(s.mode==='show'?'本番':'設営中');
}
function syncPrint(){
 let host=document.getElementById('setup-render-print');const sheet=document.querySelector('#estimate-sheet .project-sheet-heading');if(!sheet)return;
 if(!host){host=document.createElement('figure');host.id='setup-render-print';host.className='setup-render-print';sheet.after(host)}
 host.innerHTML='';const im=new Image();im.alt='設営の様子を描いた図：'+describe(S);im.src=(window.SR3D?window.SR3D.snapshot(describe(S)):cv).toDataURL('image/jpeg',.86);host.append(im);host.hidden=false;
}
modeBtns.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.srMode;modeBtns.forEach(x=>x.setAttribute('aria-pressed',x===b));render()}));
const sug=root.querySelector('.sr-suggest'),nm=root.querySelector('[name=sr-name]'),pn=$('project-name');
if(nm&&pn){nm.addEventListener('input',()=>{pn.value=nm.value;pn.dispatchEvent(new Event('input',{bubbles:true}))});pn.addEventListener('input',()=>{if(document.activeElement!==nm)nm.value=pn.value})}
function suggest(){const L=LAY[venueSel.value]||[];sug.replaceChildren();L.forEach((l,i)=>{const b=document.createElement('button');b.type='button';b.className='sr-sug';b.innerHTML='<small>'+l.t+'</small><b>'+(l.c[0]*.5)+'×'+(l.c[1]*.5)+'m'+(l.side?' ＋ 左右 '+(l.side[0]*.5)+'×'+(l.side[1]*.5)+'m':'')+'</b><span>'+l.note+'</span><em>この規模で組む →</em>';b.addEventListener('click',()=>apply(l));sug.append(b)})}
function setv(id,v,ev){const e=$(id);if(!e)return;e.value=String(v);e.dispatchEvent(new Event(ev||'input',{bubbles:true}))}
function apply(l){const btn=document.querySelector('[data-screen-type="led"]');if(($('screen-type')||{}).value!=='led'&&btn)btn.click();const cm=document.querySelector('[data-quantity-mode="size"]');if(cm&&cm.getAttribute('aria-pressed')!=='true')cm.click();setv('stage-installation',l.inst,'change');setv('stage-cols',l.c[0]);setv('stage-rows',l.c[1]);setv('stage-cols',l.c[0],'change');sides=l.side;const note=$('estimate-note');if(note){const line='設営イメージ：'+VEN[venueSel.value]+'・'+(l.c[0]*.5)+'×'+(l.c[1]*.5)+'m'+(l.side?'＋左右'+(l.side[0]*.5)+'×'+(l.side[1]*.5)+'m（サイドは別途相談）':'');note.value=note.value.replace(/^設営イメージ：.*$/m,'').trim();note.value=(note.value?note.value+'\n':'')+line;note.dispatchEvent(new Event('input',{bubbles:true}))}last='';render();root.querySelector('.sr-frame').scrollIntoView({behavior:'smooth',block:'center'})}
venueSel.addEventListener('change',()=>{sides=null;suggest();render()});suggest();
root.querySelector('.sr-draw').addEventListener('click',()=>{render();cv.scrollIntoView({behavior:'smooth',block:'nearest'})});
save.addEventListener('click',()=>{const a=document.createElement('a');a.download='LOTUS-setup'+(S&&S.name?'-'+S.name.replace(/[\\/:*?"<>|\s]+/g,'_'):'')+'.png';a.href=(window.SR3D?window.SR3D.snapshot(describe(S)):cv).toDataURL('image/png');a.click()});
if(toPrint)toPrint.addEventListener('change',()=>{if(toPrint.checked)syncPrint();else{const h=document.getElementById('setup-render-print');if(h)h.remove()}});
setInterval(()=>{const s=JSON.stringify(state());if(s!==last){last=s;render()}},700);
window.addEventListener('sr3d-ready',()=>{last='';render()});
render();
})();
