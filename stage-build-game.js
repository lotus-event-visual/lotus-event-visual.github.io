/* LOTUS stage build game (Friday 2026-11-09). Canvas 1200x675, metres -> px via S. */
(()=>{'use strict';
const cv=document.getElementById('sbg-canvas');if(!cv)return;const g=cv.getContext('2d');if(!g)return;
const $=id=>document.getElementById(id);
const W=1200,H=675,FLOOR=560,RACKX=1035;
const mq=matchMedia('(prefers-reduced-motion: reduce)');
const BG=new Image();BG.src='assets/brand/lotus-space-four-rows-poster.jpg';BG.onload=()=>{if(!st.playing)draw()};
const st={w:4,mode:'hang',t:0,playing:false,done:false,last:0,input:'HDMI',pattern:'gradient',bright:80,black:false,shown:false};
const PH=[['準備',0,1.2],['組み上げ',1.2,7.2],['配線',7.2,8.3],['仕上げ',8.3,9.1],['点灯',9.1,10]];
const LINES={hang:['トラス、水平OK？','ハンギングバー、ロック確認','1段目から下へつなげて','締め付け、声かけて','信号線、上から順に','画面を上げます、離れて','点灯いきます'],
 stack:['ベースバー、水平出して','後ろの支え、固定確認','下の段から積んで','締め付け、声かけて','信号線、下から順に','支えをもう一度確認','点灯いきます']};
function dims(){const w=st.w,cols=Math.round(w/.5),rows=Math.max(2,Math.round(w*9/16/.5));return{cols,rows,w:cols*.5,h:rows*.5}}
function scale(d){return Math.min(105,860/(d.w+3.2),390/(d.h+1.3))}
const lerp=(a,b,t)=>a+(b-a)*t,cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function grad(x0,y0,x1,y1,s){const q=g.createLinearGradient(x0,y0,x1,y1);s.forEach(([o,c])=>q.addColorStop(o,c));return q}
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function hall(t){
 g.fillStyle=grad(0,0,0,H,[[0,'#06090d'],[.6,'#121a22'],[1,'#05080b']]);g.fillRect(0,0,W,H);
 // back wall panels
 for(let x=0;x<W;x+=120){g.fillStyle=x%240?'#0c1218':'#0e151c';g.fillRect(x,40,118,FLOOR-40)}
 if(BG.complete&&BG.naturalWidth){const ih=W*BG.naturalHeight/BG.naturalWidth;g.save();g.globalAlpha=.85;g.drawImage(BG,0,-30,W,ih);g.restore();const f=g.createLinearGradient(0,0,0,FLOOR);f.addColorStop(0,'rgba(6,9,13,.15)');f.addColorStop(.32,'rgba(6,9,13,.55)');f.addColorStop(.5,'rgba(6,9,13,1)');f.addColorStop(1,'rgba(6,9,13,1)');g.fillStyle=f;g.fillRect(0,0,W,FLOOR)}
 // truss
 g.fillStyle='#2a2f35';g.fillRect(40,56,W-80,10);g.fillRect(40,84,W-80,6);
 g.strokeStyle='#3c434a';g.lineWidth=2;for(let x=40;x<W-40;x+=28){g.beginPath();g.moveTo(x,66);g.lineTo(x+14,84);g.lineTo(x+28,66);g.stroke()}
 // moving-light beams
 const cols=['#ff3d7f','#ffb03d','#3dd8ff','#7d5bff','#41ff9b','#ff6b3d'];
 g.save();g.globalCompositeOperation='lighter';
 for(let i=0;i<6;i++){const bx=120+i*190,a=Math.sin(t*.7+i)*.35+(i%2?.25:-.25),len=520;
  const ex=bx+Math.sin(a)*len,ey=90+Math.cos(a)*len;const q=g.createLinearGradient(bx,90,ex,ey);q.addColorStop(0,cols[i]+'66');q.addColorStop(1,cols[i]+'00');
  g.fillStyle=q;g.beginPath();g.moveTo(bx-4,90);g.lineTo(ex-46,ey);g.lineTo(ex+46,ey);g.lineTo(bx+4,90);g.closePath();g.fill();
  g.fillStyle=cols[i];g.beginPath();g.arc(bx,92,4,0,7);g.fill()}
 g.restore();
 // floor
 g.fillStyle=grad(0,FLOOR,0,H,[[0,'#1a2128'],[1,'#07090c']]);g.fillRect(0,FLOOR,W,H-FLOOR);
 g.strokeStyle='#ffffff0d';g.lineWidth=1;for(let i=1;i<8;i++){const y=FLOOR+i*i*2.1;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
 for(let x=-600;x<W+600;x+=80){g.beginPath();g.moveTo(W/2+(x-W/2)*.35,FLOOR);g.lineTo(x,H);g.stroke()}
}
function person(x,y,s,o){ // chibi crew, original design. metres: top 0, feet 1.7
 g.save();g.translate(x,y-1.7*s);g.scale(s,s);if(o.flip)g.scale(-1,1);
 const t=performance.now()/1000,bob=o.walk?Math.abs(Math.sin(o.walk))*.04:Math.sin(t*2+x)*.012;g.translate(0,-bob);
 g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(0,1.7+bob,.3,.04,0,0,7);g.fill();
 const sw=o.walk?Math.sin(o.walk)*.1:0;
 // legs + big shoes
 g.fillStyle='#2b2f36';g.fillRect(-.15+sw*.3,1.28,.12,.3);g.fillRect(.03-sw*.3,1.28,.12,.3);
 g.fillStyle='#3a2a20';g.beginPath();g.ellipse(-.1+sw,1.63,.13,.07,0,0,7);g.fill();g.beginPath();g.ellipse(.1-sw,1.63,.13,.07,0,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(-.13+sw,1.6,.04,.02,0,0,7);g.fill();g.beginPath();g.ellipse(.07-sw,1.6,.04,.02,0,0,7);g.fill();
 // round body (black polo) with gold collar
 const bodyG=g.createLinearGradient(-.3,0,.3,0);bodyG.addColorStop(0,'#23272e');bodyG.addColorStop(.5,'#2f353d');bodyG.addColorStop(1,'#1a1d22');
 g.fillStyle=bodyG;g.beginPath();g.ellipse(0,1.0,.3,.34,0,0,7);g.fill();
 g.fillStyle='#c9a35a';g.beginPath();g.moveTo(-.09,.7);g.lineTo(0,.8);g.lineTo(.09,.7);g.lineTo(.05,.69);g.lineTo(0,.75);g.lineTo(-.05,.69);g.closePath();g.fill();
 g.fillStyle='#fff';g.beginPath();g.arc(.13,.9,.035,0,7);g.fill();g.fillStyle='#c9a35a';g.fillRect(.155,.915,.018,.018);
 // tool belt
 g.fillStyle='#6b4a2b';g.fillRect(-.27,1.17,.54,.06);g.fillStyle='#c9a35a';g.fillRect(-.03,1.165,.06,.07);
 // arms (stubby, round hands)
 const hand=(ax,ay,hx,hy)=>{g.strokeStyle='#2a2f36';g.lineWidth=.11;g.lineCap='round';g.beginPath();g.moveTo(ax,ay);g.lineTo(hx,hy);g.stroke();g.fillStyle='#f6f2ea';g.beginPath();g.arc(hx,hy,.07,0,7);g.fill()};
 if(o.carry){hand(-.24,.9,-.26,1.0);hand(.24,.9,.26,1.0)}else if(o.cheer){const w=Math.sin(t*6+x)*.05;hand(-.24,.86,-.4,.55+w);hand(.24,.86,.4,.55-w)}else if(o.point){hand(-.26,.92,-.32,1.12);hand(.24,.86,.46,.62)}else{hand(-.27,.92,-.33,1.13);hand(.27,.92,.33,1.13)}
 // big head
 g.fillStyle='#f3c9a6';g.beginPath();g.arc(0,.42,.28,0,7);g.fill();
 g.fillStyle='rgba(255,140,120,.45)';g.beginPath();g.ellipse(-.15,.5,.055,.035,0,0,7);g.fill();g.beginPath();g.ellipse(.15,.5,.055,.035,0,0,7);g.fill();
 // eyes (blink)
 const blink=(Math.sin(t*1.3+x*.01)>.97)?.012:.055;
 g.fillStyle='#1d1b1a';g.beginPath();g.ellipse(-.09,.42,.035,blink,0,0,7);g.fill();g.beginPath();g.ellipse(.09,.42,.035,blink,0,0,7);g.fill();
 if(blink>.02){g.fillStyle='#fff';g.beginPath();g.arc(-.08,.4,.012,0,7);g.fill();g.beginPath();g.arc(.1,.4,.012,0,7);g.fill()}
 g.strokeStyle='#7a3b2a';g.lineWidth=.022;g.lineCap='round';g.beginPath();g.arc(0,.5,.07,.2*Math.PI,.8*Math.PI);g.stroke();
 // helmet with brim + gold stripe
 const hc=o.helmet||'#f4f4ef';g.fillStyle=hc;g.beginPath();g.arc(0,.36,.3,Math.PI,0);g.fill();g.beginPath();g.ellipse(0,.36,.36,.045,0,0,7);g.fill();
 g.fillStyle='#c9a35a';g.fillRect(-.03,.07,.06,.29);
 g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-.13,.18,.07,.035,-.5,0,7);g.fill();
 if(o.headset){g.strokeStyle='#15171a';g.lineWidth=.03;g.beginPath();g.arc(0,.42,.3,Math.PI*1.05,Math.PI*1.95);g.stroke();g.fillStyle='#15171a';g.beginPath();g.ellipse(-.29,.44,.05,.07,0,0,7);g.fill();g.beginPath();g.ellipse(.29,.44,.05,.07,0,0,7);g.fill();g.strokeStyle='#15171a';g.lineWidth=.018;g.beginPath();g.moveTo(.3,.48);g.quadraticCurveTo(.25,.6,.1,.58);g.stroke()}
 if(o.board){g.save();g.translate(-.34,1.05);g.rotate(-.25);g.fillStyle='#8a6a43';g.fillRect(-.1,-.13,.2,.26);g.fillStyle='#fffaf0';g.fillRect(-.08,-.1,.16,.21);g.restore()}
 if(o.carry){g.fillStyle='#07090c';g.fillRect(-.3,.78,.6,.46);g.strokeStyle='#4a535c';g.lineWidth=.012;g.strokeRect(-.3,.78,.6,.46);g.fillStyle='rgba(120,200,255,.18)';for(let k=1;k<6;k++)g.fillRect(-.3+k*.1,.8,.006,.42)}
 g.restore()}
function bubble(x,y,text){g.font='600 17px system-ui';const tw=g.measureText(text).width+28;const bx=Math.min(W-tw-10,Math.max(10,x-20)),by=y-58;
 g.fillStyle='#fffdf6';rr(bx,by,tw,38,10);g.fill();g.beginPath();g.moveTo(x,by+38);g.lineTo(x+12,by+38);g.lineTo(x+4,by+50);g.fill();g.fillStyle='#14212a';g.textAlign='left';g.fillText(text,bx+14,by+25)}
function screenFace(x,y,w,h,mode,t){
 if(st.black){g.fillStyle='#020304';g.fillRect(x,y,w,h);return}
 g.save();g.beginPath();g.rect(x,y,w,h);g.clip();const b=st.bright/100;
 if(mode==='bars'){const c=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'];c.forEach((k,i)=>{g.fillStyle=k;g.fillRect(x+i*w/7,y,w/7+1,h)})}
 else if(mode==='grid'){g.fillStyle='#000';g.fillRect(x,y,w,h);g.strokeStyle='#fff';g.lineWidth=1;const d=dims();for(let i=0;i<=d.cols;i++){g.beginPath();g.moveTo(x+i*w/d.cols,y);g.lineTo(x+i*w/d.cols,y+h);g.stroke()}for(let j=0;j<=d.rows;j++){g.beginPath();g.moveTo(x,y+j*h/d.rows);g.lineTo(x+w,y+j*h/d.rows);g.stroke()}g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y+h);g.moveTo(x+w,y);g.lineTo(x,y+h);g.stroke()}
 else{const s=(Math.sin(t*.6)+1)/2;g.fillStyle=grad(x,y,x+w,y+h,[[0,`hsl(${220+s*40},80%,45%)`],[.5,`hsl(${300+s*20},75%,55%)`],[1,`hsl(${25+s*15},90%,58%)`]]);g.fillRect(x,y,w,h);
  if(mode==='logo'){g.fillStyle='#fff';g.font=`700 ${Math.max(14,h*.2)}px system-ui`;g.textAlign='center';g.textBaseline='middle';g.fillText('LOTUS',x+w/2-h*.04,y+h/2);g.fillStyle='#c9a35a';const tw=g.measureText('LOTUS').width;g.fillRect(x+w/2+tw/2-h*.02,y+h/2+h*.04,h*.045,h*.045);g.textBaseline='alphabetic'}}
 g.fillStyle=`rgba(0,0,0,${1-b})`;g.fillRect(x,y,w,h);
 if(st.done){g.fillStyle='#ffffffcc';g.font='600 12px system-ui';g.textAlign='left';g.fillText('IN: '+st.input,x+8,y+18)}
 g.restore()}
function draw(){
 const T=st.t,d=dims(),S=scale(d),pw=d.w*S,ph=d.h*S,cx=W*.47,sx=cx-pw/2;
 const hang=st.mode==='hang';const lift=hang?lerp(.35,1.0,ease(cl((T-8.3)/.8))):.35;
 const sy=FLOOR-(lift+d.h)*S;
 hall(T);
 // supports
 if(hang){const hookY=96;g.strokeStyle='#8a9096';g.lineWidth=3;[sx+pw*.12,sx+pw*.88].forEach(x=>{g.beginPath();g.moveTo(x,hookY);g.lineTo(x,sy-8);g.stroke();g.fillStyle='#d4a52a';g.fillRect(x-7,hookY,14,18)});
  if(T>.4){g.fillStyle='#9aa0a6';g.fillRect(sx-6,sy-10,pw+12,8)}}
 else{if(T>.3){g.fillStyle='#8f969c';g.fillRect(sx-8,FLOOR-.35*S,pw+16,.35*S*.35);
   g.strokeStyle='#5f666c';g.lineWidth=3;for(let i=0;i<=d.cols;i+=Math.max(1,Math.round(d.cols/4))){const x=sx+i*pw/d.cols;g.beginPath();g.moveTo(x,FLOOR-.3*S);g.lineTo(x+S*.5,FLOOR);g.stroke()}}}
 // panels
 const total=d.cols*d.rows,pt=cl((T-1.2)/6),placed=Math.floor(pt*total+1e-6);
 for(let k=0;k<placed;k++){const row=hang?Math.floor(k/d.cols):d.rows-1-Math.floor(k/d.cols),col=Math.floor(k/d.cols)%2?d.cols-1-k%d.cols:k%d.cols;
  const x=sx+col*S*.5,y=sy+row*S*.5;g.fillStyle='#0b0e12';g.fillRect(x,y,S*.5,S*.5);g.strokeStyle='#2a3038';g.lineWidth=1;g.strokeRect(x+.5,y+.5,S*.5-1,S*.5-1);
  g.fillStyle='#ffffff10';for(let i=1;i<6;i++)g.fillRect(x+i*S*.5/6,y+2,1,S*.5-4);
  if(k===placed-1&&T<7.2){g.fillStyle='#9fe8ff66';g.fillRect(x,y,S*.5,S*.5)}}
 const lit=T>=9.1;if(lit){const on=cl((T-9.1)/.4);g.globalAlpha=on;screenFace(sx,sy,pw,ph,st.done?st.pattern:(T<9.5?'grid':'gradient'),T);g.globalAlpha=1;
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=grad(0,FLOOR,0,H,[[0,'#ff5aa033'],[1,'#ff5aa000']]);g.fillRect(sx,FLOOR,pw,H-FLOOR);g.restore()}
 // rack
 const rx=RACKX,rh=1.25*S,ry=FLOOR-rh;g.fillStyle='#0a0c0f';rr(rx,ry,1.0*S*.62,rh,6);g.fill();g.strokeStyle='#2c3238';g.stroke();
 g.fillStyle='#1b2026';g.fillRect(rx+6,ry+rh*.25,S*.62-12,rh*.14);g.fillStyle=T>8.6?'#4fd2ff':'#22343d';g.fillRect(rx+12,ry+rh*.28,S*.15,rh*.08);
 g.fillStyle=T>8.6?'#59ff8a':'#1e3326';g.beginPath();g.arc(rx+S*.5,ry+rh*.32,3,0,7);g.fill();
 g.fillStyle='#20262c';g.fillRect(rx-8,ry-14,S*.62+16,10);g.fillStyle=lit?grad(rx,ry-60,rx+80,ry-14,[[0,'#3b6bff'],[1,'#ff6aa8']]):'#111';g.fillRect(rx+4,ry-54,S*.62-8,38);
 // cables
 const cab=cl((T-7.2)/1.1);if(cab>0){g.strokeStyle='#ffb347';g.lineWidth=2.5;g.setLineDash([10,8]);g.lineDashOffset=-T*60;g.beginPath();g.moveTo(sx+pw,sy+ph);g.lineTo(lerp(sx+pw,rx,cab),lerp(sy+ph,FLOOR-6,cab));if(cab>=1)g.lineTo(rx+10,FLOOR-6);g.stroke();
  g.strokeStyle='#5ad1ff';g.beginPath();g.moveTo(sx+pw*.9,sy+ph);g.lineTo(lerp(sx+pw*.9,rx,cab),lerp(sy+ph,FLOOR-14,cab));g.stroke();g.setLineDash([])}
 // crew
 const busy=T>.2&&T<8.4;for(let i=0;i<3;i++){const ph2=(T*1.1+i*.7)%2,go=ph2<1,u=go?ease(ph2):ease(2-ph2);
  const target=sx+(i+.5)*pw/3,from=busy?sx-1.2*S:Math.max(150,sx-1.6*S)+i*.8*S;const x=busy?lerp(from,target,u):from;
  person(x,FLOOR,S,{walk:busy?T*9+i:0,carry:busy&&go&&T>1.2&&T<7.2,flip:busy&&!go,cheer:T>=9.4})}
 // director + operator
 const dx=Math.max(60,sx-2.7*S);person(dx,FLOOR,S,{headset:true,board:true,point:true,helmet:'#ffd84a'});
 person(rx+S*.75,FLOOR,S,{flip:true});
 const pi=Math.min(LINES[st.mode].length-1,Math.floor(T/10*LINES[st.mode].length));if(st.playing||!st.done)bubble(dx+10,FLOOR-1.75*S,LINES[st.mode][pi]);
 // HUD
 g.fillStyle='#000000aa';rr(18,16,300,34,8);g.fill();g.fillStyle='#fff';g.font='600 15px system-ui';g.textAlign='left';
 const cur=PH.find(p=>T>=p[1]&&T<p[2])||PH[PH.length-1];g.fillText((st.playing?"▶▶ 早送り  ":"")+(st.done?"設営完了":cur[0]),32,39);
 g.fillStyle='#ffffff33';g.fillRect(18,56,300,4);g.fillStyle='#c9a35a';g.fillRect(18,56,300*cl(T/10),4);
 g.fillStyle='#000000aa';rr(W-300,16,282,34,8);g.fill();g.fillStyle='#fff';g.textAlign='right';g.fillText(`${d.w.toFixed(1)}m × ${d.h.toFixed(1)}m ・ ${hang?'吊り':'自立'}`,W-32,39);
 // scale person label
 cv.setAttribute('aria-label',`${hang?'吊り':'自立'}で幅${d.w}m・高さ${d.h}mのLED画面を設営する早送りアニメーション。${st.done?'設営完了。':''}`)}
function info(){const d=dims(),n=d.cols*d.rows;$('sbg-out').textContent=`${d.w.toFixed(1)} m × ${d.h.toFixed(1)} m`;
 $('sbg-stats').textContent=`50cm 角パネル 横 ${d.cols} × 縦 ${d.rows} = ${n} 枚 ／ 2.6mm ピッチなら ${(d.cols*192).toLocaleString()} × ${(d.rows*192).toLocaleString()} = 約 ${Math.round(n*36864/10000).toLocaleString()} 万画素`;
 document.querySelectorAll('[data-sbg-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sbgMode===st.mode)));
 document.querySelectorAll('[data-sbg-w]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.sbgW===st.w)));
 $('sbg-proc').toggleAttribute('data-ready',st.done);$('sbg-proc-hint').textContent=st.done?'プロセッサーを操作して、画面を変えてみてください。':'設営が終わると、ここで画面を操作できます。'}
function loop(ts){if(!st.playing)return;if(!st.last)st.last=ts;st.t=Math.min(10,st.t+(ts-st.last)/1000);st.last=ts;if(st.t>=10){st.playing=false;st.done=true;info()}draw();if(st.playing)requestAnimationFrame(loop);else idle()}
let idleRaf=0;function idle(){cancelAnimationFrame(idleRaf);if(mq.matches){draw();return}const f=ts=>{if(st.playing)return;st.t=10+(ts/1000%60);draw();st.t=10;idleRaf=requestAnimationFrame(f)};idleRaf=requestAnimationFrame(f)}
function start(){cancelAnimationFrame(idleRaf);st.done=false;st.t=0;st.last=0;info();if(mq.matches){st.t=10;st.done=true;info();draw();return}st.playing=true;requestAnimationFrame(loop)}
function reset(){st.playing=false;st.done=false;st.t=0;info();cancelAnimationFrame(idleRaf);draw()}
$('sbg-start').addEventListener('click',start);
document.querySelectorAll('[data-sbg-mode]').forEach(b=>b.addEventListener('click',()=>{st.mode=b.dataset.sbgMode;reset()}));
document.querySelectorAll('[data-sbg-w]').forEach(b=>b.addEventListener('click',()=>{st.w=+b.dataset.sbgW;$('sbg-range').value=st.w;reset()}));
$('sbg-range').addEventListener('input',e=>{st.w=+e.target.value;reset()});
document.querySelectorAll('[data-sbg-in]').forEach(b=>b.addEventListener('click',()=>{st.input=b.dataset.sbgIn;document.querySelectorAll('[data-sbg-in]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(st.done)idle()}));
document.querySelectorAll('[data-sbg-pat]').forEach(b=>b.addEventListener('click',()=>{st.pattern=b.dataset.sbgPat;document.querySelectorAll('[data-sbg-pat]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(st.done)idle()}));
$('sbg-bright').addEventListener('input',e=>{st.bright=+e.target.value;$('sbg-bright-out').textContent=st.bright+'%';if(st.done)idle()});
$('sbg-black').addEventListener('click',e=>{st.black=!st.black;e.currentTarget.setAttribute('aria-pressed',String(st.black));if(st.done)idle()});
info();draw();
// autoplay once when scrolled into view
if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)&&!st.shown){st.shown=true;start();io.disconnect()}},{threshold:.4});io.observe(cv)}
})();
