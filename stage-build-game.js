/* LOTUS stage build game. Canvas 1200x675, metres -> px via S. */
(()=>{'use strict';
const cv=document.getElementById('sbg-canvas');if(!cv)return;const g=cv.getContext('2d');if(!g)return;
const $=id=>document.getElementById(id);
const W=1200,H=675,FLOOR=560,RACKX=1035;
const mq=matchMedia('(prefers-reduced-motion: reduce)');
const BG=new Image();BG.src='assets/brand/lotus-space-four-rows-poster.jpg';BG.onload=()=>{if(!st.playing)draw()};
const st={show:0,showT:0,strike:false,missions:{},w:4,mode:'hang',t:0,playing:false,done:false,last:0,input:'HDMI',pattern:'gradient',bright:80,black:false,shown:false};
const PH=[['準備',0,1.2],['組み上げ',1.2,7.2],['配線',7.2,8.3],['仕上げ',8.3,9.1],['点灯',9.1,10]];
const LINES={hang:['トラス、水平OK？','ハンギングバー、ロック確認','1段目から下へつなげて','締め付け、声かけて','信号線、上から順に','画面を上げます、離れて','点灯いきます'],
 strike:['撤去はじめます、足元注意','信号線、外していきます','上の段から下ろして','パネル、ケースに戻して','数量、声に出して','忘れ物なし、最後のケース'],
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
function person(x,y,s,o){ // low-poly crew (flat-shaded facets). metres: top 0, feet 1.7
 g.save();g.translate(x,y-1.7*s);g.scale(s,s);if(o.flip)g.scale(-1,1);
 const t=performance.now()/1000,bob=o.walk?Math.abs(Math.sin(o.walk))*.04:Math.sin(t*2+x)*.012;g.translate(0,-bob);
 const P=(c,pts)=>{g.fillStyle=c;g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();g.fill()};
 g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(0,1.7+bob,.3,.04,0,0,7);g.fill();
 const sw=o.walk?Math.sin(o.walk)*.1:0;
 // legs (two-tone quads) + wedge shoes
 P('#2f343c',[-.16+sw*.3,1.26,-.04+sw*.3,1.26,-.05+sw*.3,1.6,-.15+sw*.3,1.6]);P('#24282f',[-.1+sw*.3,1.26,-.04+sw*.3,1.26,-.05+sw*.3,1.6,-.1+sw*.3,1.6]);
 P('#2f343c',[.04-sw*.3,1.26,.16-sw*.3,1.26,.15-sw*.3,1.6,.05-sw*.3,1.6]);P('#24282f',[.1-sw*.3,1.26,.16-sw*.3,1.26,.15-sw*.3,1.6,.1-sw*.3,1.6]);
 P('#4a3424',[-.24+sw,1.69,-.2+sw,1.58,-.02+sw,1.58,.0+sw,1.69]);P('#5e4330',[-.2+sw,1.58,-.02+sw,1.58,-.06+sw,1.63,-.2+sw,1.63]);
 P('#4a3424',[.0-sw,1.69,.02-sw,1.58,.2-sw,1.58,.24-sw,1.69]);P('#5e4330',[.02-sw,1.58,.2-sw,1.58,.2-sw,1.63,.06-sw,1.63]);
 // faceted torso: 3 facets (lit / mid / shadow)
 P('#3a414b',[-.3,.82,-.12,.72,-.06,1.26,-.27,1.22]);P('#2c3239',[-.12,.72,.12,.72,.08,1.26,-.06,1.26]);P('#1d2126',[.12,.72,.3,.82,.27,1.22,.08,1.26]);
 P('#c9a35a',[-.1,.7,0,.81,.1,.7,.05,.69,0,.76,-.05,.69]);P('#a8843f',[0,.76,.05,.69,.1,.7,0,.81]);
 P('#f5f5f0',[.11,.88,.17,.88,.17,.93,.11,.93]);P('#c9a35a',[.15,.91,.17,.91,.17,.93,.15,.93]);
 // belt
 P('#6b4a2b',[-.27,1.16,.27,1.16,.27,1.22,-.27,1.22]);P('#d6b467',[-.035,1.155,.035,1.155,.035,1.225,-.035,1.225]);
 // arms: quad sleeve + diamond hand
 const hand=(ax,ay,hx,hy)=>{const dx=hx-ax,dy=hy-ay,l=Math.hypot(dx,dy)||1,nx=-dy/l*.055,ny=dx/l*.055;P('#2c3239',[ax+nx,ay+ny,hx+nx,hy+ny,hx-nx,hy-ny,ax-nx,ay-ny]);P('#3a414b',[ax+nx,ay+ny,hx+nx,hy+ny,hx,hy,ax,ay]);P('#e9e4da',[hx,hy-.075,hx+.07,hy,hx,hy+.075,hx-.07,hy]);P('#fbf8f2',[hx,hy-.075,hx+.07,hy,hx,hy,hx-.07,hy])};
 if(o.carry){hand(-.24,.9,-.26,1.0);hand(.24,.9,.26,1.0)}else if(o.cheer){const w=Math.sin(t*6+x)*.05;hand(-.24,.86,-.4,.55+w);hand(.24,.86,.4,.55-w)}else if(o.point){hand(-.26,.92,-.32,1.12);hand(.24,.86,.46,.62)}else{hand(-.27,.92,-.33,1.13);hand(.27,.92,.33,1.13)}
 // octagon head, split into lit/shadow facets
 const hy=.43,R=.28,oc=[];for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;oc.push(Math.cos(a)*R,hy+Math.sin(a)*R)}
 P('#f0c39e',oc);P('#e3ae86',[0,hy,oc[0],oc[1],oc[2],oc[3],oc[14],oc[15]]);P('#f8d5b6',[0,hy,oc[6],oc[7],oc[8],oc[9],oc[10],oc[11]]);P('#ebb893',[0,hy,oc[2],oc[3],oc[4],oc[5],oc[6],oc[7]]);
 P('rgba(255,120,110,.5)',[-.2,.5,-.12,.48,-.12,.53,-.2,.55]);P('rgba(255,120,110,.5)',[.12,.48,.2,.5,.2,.55,.12,.53]);
 const blink=(Math.sin(t*1.3+x*.01)>.97);
 if(blink){P('#1d1b1a',[-.12,.43,-.06,.43,-.06,.45,-.12,.45]);P('#1d1b1a',[.06,.43,.12,.43,.12,.45,.06,.45])}
 else{P('#1d1b1a',[-.12,.39,-.06,.39,-.06,.47,-.12,.47]);P('#1d1b1a',[.06,.39,.12,.39,.12,.47,.06,.47]);P('#fff',[-.105,.4,-.085,.4,-.085,.42,-.105,.42]);P('#fff',[.075,.4,.095,.4,.095,.42,.075,.42])}
 P('#8a3f2c',[-.06,.53,.06,.53,.03,.57,-.03,.57]);
 // faceted helmet dome (half-hexagon) + brim + gold ridge
 const hc=o.helmet||'#f2f2ec',hs=o.helmet?'#d9b100':'#cfcfc6',hl=o.helmet?'#ffe45c':'#ffffff';
 P(hc,[-.31,.37,-.27,.2,-.13,.09,.13,.09,.27,.2,.31,.37]);P(hs,[.13,.09,.27,.2,.31,.37,.1,.37]);P(hl,[-.27,.2,-.13,.09,-.05,.09,-.18,.3]);
 P(hc,[-.38,.37,.38,.37,.34,.41,-.34,.41]);P(hs,[0,.37,.38,.37,.34,.41,0,.41]);
 P('#c9a35a',[-.035,.08,.035,.08,.04,.37,-.04,.37]);P('#a8843f',[0,.08,.035,.08,.04,.37,0,.37]);
 if(o.headset){P('#15171a',[-.33,.36,-.25,.36,-.25,.52,-.33,.52]);P('#15171a',[.25,.36,.33,.36,.33,.52,.25,.52]);g.strokeStyle='#15171a';g.lineWidth=.022;g.beginPath();g.moveTo(.3,.5);g.lineTo(.26,.6);g.lineTo(.1,.6);g.stroke()}
 if(o.board){g.save();g.translate(-.34,1.05);g.rotate(-.25);P('#8a6a43',[-.1,-.13,.1,-.13,.1,.13,-.1,.13]);P('#fffaf0',[-.08,-.1,.08,-.1,.08,.11,-.08,.11]);P('#c9c2b2',[-.06,-.05,.06,-.05,.06,-.04,-.06,-.04]);g.restore()}
 if(o.carry){P('#07090c',[-.3,.78,.3,.78,.3,1.24,-.3,1.24]);g.strokeStyle='#4a535c';g.lineWidth=.012;g.strokeRect(-.3,.78,.6,.46);g.fillStyle='rgba(120,200,255,.18)';for(let k=1;k<6;k++)g.fillRect(-.3+k*.1,.8,.006,.42)}
 g.restore()}
function crowd(k,T){const n=26;g.save();for(let r=0;r<2;r++){for(let i=0;i<n;i++){const x=(i+.5)*W/n+(r?W/n/2:0),y=H-6-r*26+Math.sin(T*6+i)*(st.show===2?4:0)*k;g.fillStyle=r?'#0d1116':'#05070a';g.beginPath();g.arc(x,y-34,13,0,7);g.fill();g.fillRect(x-17,y-22,34,40);
 if(st.show===2&&(i+r)%2===0){const c=['#ff4fa3','#4fd8ff','#ffd84a','#8a6bff'][(i+r)%4];const a=Math.sin(T*5+i)*.5;g.strokeStyle=c;g.lineWidth=5;g.shadowColor=c;g.shadowBlur=14;g.beginPath();g.moveTo(x+8,y-30);g.lineTo(x+8+Math.sin(a)*34,y-30-Math.cos(a)*34);g.stroke();g.shadowBlur=0}}}g.restore()}
function bubble(x,y,text){g.font='17px "DotGothic16",system-ui';const tw=g.measureText(text).width+28;const bx=Math.min(W-tw-10,Math.max(10,x-20)),by=y-58;
 g.fillStyle='#fffdf6';rr(bx,by,tw,38,10);g.fill();g.beginPath();g.moveTo(x,by+38);g.lineTo(x+12,by+38);g.lineTo(x+4,by+50);g.fill();g.fillStyle='#14212a';g.textAlign='left';g.fillText(text,bx+14,by+25)}
const CM=['assets/video/lv-cm-v2.mp4'];let cmI=0;const vid=document.createElement('video');vid.muted=true;vid.loop=false;vid.playsInline=true;vid.setAttribute('playsinline','');vid.preload='none';vid.src=CM[0];vid.addEventListener('ended',()=>{cmI=(cmI+1)%CM.length;vid.src=CM[cmI];const p=vid.play();if(p&&p.catch)p.catch(()=>{})});
function vidOn(){if(vid.paused&&!document.hidden){const p=vid.play();if(p&&p.catch)p.catch(()=>{})}}
function screenFace(x,y,w,h,mode,t){
 if(st.black){g.fillStyle='#020304';g.fillRect(x,y,w,h);return}
 g.save();g.beginPath();g.rect(x,y,w,h);g.clip();const b=st.bright/100;
 if(mode==='bars'){const c=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'],bw=w/7,off=(t*w*.12)%w;for(let r=-1;r<7;r++){c.forEach((k,i)=>{const bx=x+off+(i+r*7)*bw;if(bx>x+w||bx+bw<x)return;g.fillStyle=k;g.fillRect(bx,y,bw+1,h)})}}
 else if(mode==='grid'){g.fillStyle='#000';g.fillRect(x,y,w,h);g.strokeStyle='#fff';g.lineWidth=1;const d=dims(),cw=w/d.cols,go=(t*cw*.8)%cw;for(let i=-1;i<=d.cols;i++){const lx=x+go+i*cw;if(lx<x||lx>x+w)continue;g.beginPath();g.moveTo(lx,y);g.lineTo(lx,y+h);g.stroke()}for(let j=0;j<=d.rows;j++){g.beginPath();g.moveTo(x,y+j*h/d.rows);g.lineTo(x+w,y+j*h/d.rows);g.stroke()}g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y+h);g.moveTo(x+w,y);g.lineTo(x,y+h);g.stroke()}
 else if(mode==='gradient'&&(vidOn(),vid.readyState>=2)){const vw=vid.videoWidth||16,vh=vid.videoHeight||9,k=Math.max(w/vw,h/vh);g.fillStyle='#000';g.fillRect(x,y,w,h);g.drawImage(vid,x+(w-vw*k)/2,y+(h-vh*k)/2,vw*k,vh*k)}
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
 const L=st.strike?LINES.strike:LINES[st.mode];const pi=st.strike?Math.min(L.length-1,Math.floor((10-T)/10*L.length)):Math.min(L.length-1,Math.floor(T/10*L.length));if(st.playing||!st.done)bubble(dx+10,FLOOR-1.75*S,L[pi]);else if(st.show===2)bubble(dx+10,FLOOR-1.75*S,'本番、いい画です');
 if(st.show){const k=st.show>=2?1:cl(st.showT/2);crowd(k,T)}
 if(st.show===1){const n=Math.ceil(5-st.showT);if(n>0){g.save();g.fillStyle='#000000aa';g.fillRect(0,0,W,H);g.fillStyle='#ffd84a';g.font='120px "DotGothic16",system-ui';g.textAlign='center';g.fillText(String(n),W/2,H/2+40);g.font='22px "DotGothic16",system-ui';g.fillStyle='#fff';g.fillText('本番まで',W/2,H/2-70);g.restore()}}
 // HUD
 g.fillStyle='#000000aa';rr(18,16,300,34,8);g.fill();g.fillStyle='#fff';g.font='600 15px system-ui';g.textAlign='left';
 const cur=PH.find(p=>T>=p[1]&&T<p[2])||PH[PH.length-1];g.fillText((st.playing?(st.strike?"◀◀ 撤去中  ":"▶▶ 早送り  "):"")+(st.show===2?"本番中":st.done?"設営完了":st.strike?"撤去":cur[0]),32,39);
 g.fillStyle='#ffffff33';g.fillRect(18,56,300,4);g.fillStyle='#c9a35a';g.fillRect(18,56,300*cl(T/10),4);
 g.fillStyle='#000000aa';rr(W-300,16,282,34,8);g.fill();g.fillStyle='#fff';g.textAlign='right';g.fillText(`${d.w.toFixed(1)}m × ${d.h.toFixed(1)}m ・ ${hang?'吊り':'自立'}`,W-32,39);
 // scale person label
 cv.setAttribute('aria-label',`${hang?'吊り':'自立'}で幅${d.w}m・高さ${d.h}mのLED画面を設営する早送りアニメーション。${st.done?'設営完了。':''}`)}
function info(){const d=dims(),n=d.cols*d.rows;$('sbg-out').textContent=`${d.w.toFixed(1)} m × ${d.h.toFixed(1)} m`;
 $('sbg-stats').textContent=`50cm 角パネル 横 ${d.cols} × 縦 ${d.rows} = ${n} 枚 ／ 2.6mm ピッチなら ${(d.cols*192).toLocaleString()} × ${(d.rows*192).toLocaleString()} = 約 ${Math.round(n*36864/10000).toLocaleString()} 万画素`;
 document.querySelectorAll('[data-sbg-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sbgMode===st.mode)));
 document.querySelectorAll('[data-sbg-w]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.sbgW===st.w)));
 $('sbg-proc').toggleAttribute('data-ready',st.done);$('sbg-proc-hint').textContent=st.done?'プロセッサーを操作して、画面を変えてみてください。':'設営が終わると、ここで画面を操作できます。'}
function loop(ts){if(!st.playing)return;if(!st.last)st.last=ts;const dt=(ts-st.last)/1000;st.last=ts;
 if(st.strike){st.t=Math.max(0,st.t-dt*1.4);if(st.t<=0){st.playing=false;st.strike=false;st.done=false;mission('strike');info();draw();return}}
 else{st.t=Math.min(10,st.t+dt);if(st.t>=10){st.playing=false;st.done=true;mission(st.mode);if(st.w>=6)mission('big');info()}}
 draw();if(st.playing)requestAnimationFrame(loop);else idle()}
function mission(m){st.missions[m]=1;document.querySelectorAll('#sbg-missions [data-m]').forEach(li=>li.classList.toggle('ok',!!st.missions[li.dataset.m]));const all=['hang','stack','big','bars','show','strike'].every(k=>st.missions[k]);const c=document.getElementById('sbg-clear');if(c)c.hidden=!all}
let showRaf=0;function showLoop(ts){if(!st.show)return;if(!st.showLast)st.showLast=ts;st.showT+=(ts-st.showLast)/1000;st.showLast=ts;if(st.show===1&&st.showT>=5){st.show=2;st.showT=0;st.pattern='gradient';document.querySelectorAll('[data-sbg-pat]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.sbgPat==='gradient')));mission('show')}st.t=10+(ts/1000%60);draw();st.t=10;showRaf=requestAnimationFrame(showLoop)}
let idleRaf=0;function idle(){cancelAnimationFrame(idleRaf);if(mq.matches){draw();return}const f=ts=>{if(st.playing)return;st.t=10+(ts/1000%60);draw();st.t=10;idleRaf=requestAnimationFrame(f)};idleRaf=requestAnimationFrame(f)}
function start(){cancelAnimationFrame(idleRaf);cancelAnimationFrame(showRaf);st.show=0;st.strike=false;st.done=false;st.t=0;st.last=0;info();if(mq.matches){st.t=10;st.done=true;info();draw();return}st.playing=true;requestAnimationFrame(loop)}
function reset(){cancelAnimationFrame(showRaf);st.show=0;st.strike=false;st.playing=false;st.done=false;st.t=0;info();cancelAnimationFrame(idleRaf);draw()}
$('sbg-start').addEventListener('click',start);
$('sbg-show')&&$('sbg-show').addEventListener('click',()=>{if(!st.done)return;cancelAnimationFrame(idleRaf);st.show=1;st.showT=0;st.showLast=0;st.black=false;if(mq.matches){st.show=2;mission('show');draw();return}showRaf=requestAnimationFrame(showLoop)});
$('sbg-strike')&&$('sbg-strike').addEventListener('click',()=>{if(!st.done)return;cancelAnimationFrame(idleRaf);cancelAnimationFrame(showRaf);st.show=0;st.strike=true;st.done=false;st.last=0;st.t=10;info();if(mq.matches){st.t=0;st.strike=false;mission('strike');info();draw();return}st.playing=true;requestAnimationFrame(loop)});
document.querySelectorAll('[data-sbg-mode]').forEach(b=>b.addEventListener('click',()=>{st.mode=b.dataset.sbgMode;reset()}));
document.querySelectorAll('[data-sbg-w]').forEach(b=>b.addEventListener('click',()=>{st.w=+b.dataset.sbgW;$('sbg-range').value=st.w;reset()}));
$('sbg-range').addEventListener('input',e=>{st.w=+e.target.value;reset()});
document.querySelectorAll('[data-sbg-in]').forEach(b=>b.addEventListener('click',()=>{st.input=b.dataset.sbgIn;document.querySelectorAll('[data-sbg-in]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(st.done)idle()}));
document.querySelectorAll('[data-sbg-pat]').forEach(b=>b.addEventListener('click',()=>{st.pattern=b.dataset.sbgPat;if(st.done&&st.pattern==='bars')mission('bars');if(st.pattern!=='gradient')vid.pause();document.querySelectorAll('[data-sbg-pat]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(st.done)idle()}));
$('sbg-bright').addEventListener('input',e=>{st.bright=+e.target.value;$('sbg-bright-out').textContent=st.bright+'%';if(st.done)idle()});
$('sbg-black').addEventListener('click',e=>{st.black=!st.black;e.currentTarget.setAttribute('aria-pressed',String(st.black));if(st.done)idle()});
info();draw();
// autoplay once when scrolled into view
if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)&&!st.shown){st.shown=true;start();io.disconnect()}},{threshold:.4});io.observe(cv)}
})();
