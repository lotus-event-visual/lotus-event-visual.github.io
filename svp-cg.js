/* Orthographic CG study. All comparison geometry uses metres and S=80 px/m. */
(()=>{'use strict';const canvas=document.getElementById('svp-cg');if(!canvas)return;const ctx=canvas.getContext('2d'),range=document.getElementById('svp-range'),out=document.getElementById('svp-out'),panels=document.getElementById('svp-panels'),mq=matchMedia('(prefers-reduced-motion: reduce)');if(!ctx)return;
const S=80,F=520,C=560;let current=4,target=4,raf=0,last=0;const p=(x,y,z=0)=>[C+x*S+z*32,F-y*S-z*20];
function poly(points,fill,stroke){ctx.beginPath();points.forEach((v,i)=>{let a=p(...v);i?ctx.lineTo(...a):ctx.moveTo(...a)});ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function line(a,b,color,width=1){ctx.beginPath();ctx.moveTo(...p(...a));ctx.lineTo(...p(...b));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function gradient(x1,y1,x2,y2,stops){let g=ctx.createLinearGradient(x1,y1,x2,y2);stops.forEach(([s,c])=>g.addColorStop(s,c));return g}
function ellipse(x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
function box(x,y,z,w,h,d,front){poly([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],front);poly([[x+w,y,z],[x+w,y,z+d],[x+w,y+h,z+d],[x+w,y+h,z]],'#121b21','#46515a');poly([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],'#5c6970','#7d8a90')}
function draw(w){ctx.clearRect(0,0,1100,620);ctx.fillStyle=gradient(0,0,0,620,[[0,'#101c26'],[.55,'#26313b'],[1,'#080e14']]);ctx.fillRect(0,0,1100,620);
// Architecture, ambient ceiling light, floor: visual context, not dimensional objects.
for(let x=60;x<1100;x+=180){ctx.fillStyle='#18232d';ctx.fillRect(x,0,7,365);ctx.fillStyle='#2e3942';ctx.fillRect(x+7,0,1,365)}
ctx.fillStyle=gradient(0,350,0,620,[[0,'#18232c'],[1,'#45525c']]);ctx.beginPath();ctx.moveTo(0,365);ctx.lineTo(1100,365);ctx.lineTo(1100,620);ctx.lineTo(0,620);ctx.fill();
for(let z=-5;z<7;z++)line([-7,0,z],[7,0,z],'#84919a19');for(let x=-8;x<8;x++)line([x,0,-6],[x,0,6],'#84919a15');
const light=ctx.createRadialGradient(570,220,20,570,220,520);light.addColorStop(0,'#9bbdd016');light.addColorStop(1,'#9bbdd000');ctx.fillStyle=light;ctx.fillRect(0,0,1100,620);
for(let x of [220,880]){ctx.fillStyle='#c9dce3';ctx.shadowBlur=20;ctx.shadowColor='#b6e5ff88';ctx.fillRect(x,35,94,3);ctx.shadowBlur=0}
const h=w*9/16,left=.55-w/2,right=left+w,bottom=.9,top=bottom+h;const [sx,sy]=p(left,top),pw=w*S,ph=h*S;
// Soft contact shadows and physically proportioned support study.
ellipse(C+.55*S,F+9,w*S*.57,18,'#00000055');
const footXs=[left+w*.17,right-w*.17];for(let x of footXs){box(x-.045,0,.1,.09,.9,.12,gradient(...p(x-.045,.9),...p(x+.045,0),[[0,'#a5adb0'],[.3,'#53626a'],[.7,'#25323c'],[1,'#65717a']]));box(x-.30,0,-.15,.6,.045,.52,'#333f49')}
// Screen cabinet with material thickness, bevel and luminous face.
box(left-.045,bottom-.045,0,w+.09,h+.09,.13,'#080b0e');ctx.fillStyle='#51616a';ctx.fillRect(sx-2,sy-2,pw+4,2);
ctx.save();ctx.beginPath();ctx.rect(sx,sy,pw,ph);ctx.clip();ctx.fillStyle=gradient(sx,sy,sx+pw,sy+ph,[[0,'#102e44'],[.36,'#1b6b83'],[.7,'#0d263c'],[1,'#111b33']]);ctx.fillRect(sx,sy,pw,ph);
// Procedural flowing light ribbon, not a static stock texture.
for(let j=0;j<32;j++){ctx.beginPath();for(let i=0;i<=80;i++){const t=i/80,x=sx+t*pw,y=sy+ph*(.48+.20*Math.sin(t*5.4+w*.2+j*.016))+(j-16)*ph*.009;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=`rgba(${160+j*2},${198+j},225,${.055+(16-Math.abs(j-16))*.011})`;ctx.lineWidth=1.4;ctx.stroke()}
const glow=ctx.createRadialGradient(sx+pw*.64,sy+ph*.35,0,sx+pw*.64,sy+ph*.35,pw*.65);glow.addColorStop(0,'#87ced433');glow.addColorStop(1,'#87ced400');ctx.fillStyle=glow;ctx.fillRect(sx,sy,pw,ph);
// Subtle LED pixel texture; geometry does not imply a specific panel pitch.
ctx.fillStyle='#00000020';for(let y=sy;y<sy+ph;y+=5)ctx.fillRect(sx,y,pw,.7);ctx.restore();
// Light spill and reflection on floor.
ctx.save();ctx.globalAlpha=.18;ctx.fillStyle=gradient(0,F,0,F+90,[[0,'#49a5bc'],[1,'#49a5bc00']]);ctx.beginPath();ctx.moveTo(sx,F);ctx.lineTo(sx+pw,F);ctx.lineTo(sx+pw+60,F+95);ctx.lineTo(sx-60,F+95);ctx.fill();ctx.restore();
// Human model: exact 1.70m bounding height, feet on z=0 plane.
const [hx,hy]=p(-4.75,0);ellipse(hx+5,hy+5,27,6,'#00000066');ctx.save();ctx.translate(hx,hy);ctx.scale(S,S);
const suit=gradient(-.22,0,.22,0,[[0,'#1c2832'],[.35,'#596774'],[.65,'#3e4c58'],[1,'#19232d']]);ctx.fillStyle=suit;
ctx.beginPath();ctx.moveTo(-.16,-.91);ctx.lineTo(.16,-.91);ctx.lineTo(.13,-.08);ctx.lineTo(.025,-.08);ctx.lineTo(0,-.69);ctx.lineTo(-.025,-.08);ctx.lineTo(-.14,-.08);ctx.closePath();ctx.fill();
ctx.fillStyle='#111820';ctx.fillRect(-.17,-.075,.17,.075);ctx.fillRect(.025,-.075,.17,.075);
ctx.fillStyle=suit;ctx.beginPath();ctx.moveTo(-.11,-1.46);ctx.quadraticCurveTo(-.27,-1.42,-.27,-1.29);ctx.lineTo(-.32,-.91);ctx.lineTo(-.23,-.89);ctx.lineTo(-.15,-1.22);ctx.lineTo(-.16,-.82);ctx.quadraticCurveTo(0,-.77,.17,-.82);ctx.lineTo(.15,-1.22);ctx.lineTo(.24,-.9);ctx.lineTo(.32,-.93);ctx.lineTo(.26,-1.3);ctx.quadraticCurveTo(.25,-1.43,.11,-1.46);ctx.closePath();ctx.fill();
ctx.fillStyle=gradient(-.1,-1.65,.1,-1.5,[[0,'#e1c4ac'],[.5,'#bea38f'],[1,'#806b60']]);ctx.fillRect(-.045,-1.48,.09,.13);ellipse(0,-1.58,.10,.12,ctx.fillStyle);ctx.fillStyle='#343335';ctx.beginPath();ctx.ellipse(0,-1.61,.103,.09,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#bda28f';ellipse(-.277,-.88,.044,.065,ctx.fillStyle);ellipse(.278,-.89,.044,.065,ctx.fillStyle);ctx.restore();
// Dimensions share the exact same projection as the subjects.
ctx.font='500 17px system-ui';ctx.fillStyle='#dce7ed';ctx.textAlign='center';line([left,top+.27,0],[right,top+.27,0],'#c1d5dc',1);for(let x of [left,right])line([x,top+.20,0],[x,top+.34,0],'#c1d5dc',1);ctx.fillText(w.toFixed(1)+' m',sx+pw/2,sy-34);
line([right+.25,bottom,0],[right+.25,top,0],'#c1d5dc');for(let y of [bottom,top])line([right+.18,y,0],[right+.32,y,0],'#c1d5dc');ctx.save();ctx.translate(...p(right+.48,bottom+h/2));ctx.rotate(-Math.PI/2);ctx.fillText(h.toFixed(2)+' m',0,0);ctx.restore();ctx.font='14px system-ui';ctx.fillStyle='#c7d6df';ctx.fillText('1.70 m',hx,hy+31);
canvas.dataset.widthMeters=w.toFixed(4);canvas.dataset.heightMeters=h.toFixed(6);canvas.dataset.personMeters='1.7';canvas.dataset.scalePxPerMeter=String(S);canvas.dataset.liftMeters='0.9';canvas.dataset.projection='orthographic-same-depth';
}
function animate(time){if(!last)last=time;const dt=Math.min(50,time-last);last=time;current+=(target-current)*(1-Math.exp(-dt/95));if(Math.abs(current-target)<.001){current=target;draw(current);raf=0;last=0;return}draw(current);raf=requestAnimationFrame(animate)}
function set(w){w=Math.min(8,Math.max(1.5,Number(w)));target=w;range.value=String(w);out.value=w.toFixed(1)+' m × '+(w*9/16).toFixed(2)+' m';panels.textContent='50cm角換算：横 '+(w/.5).toFixed(0)+' 列 × 縦 '+(w*9/16/.5).toFixed(2)+' 段分。面積比較であり、実際の割付ではありません。';canvas.setAttribute('aria-label','幅'+w+'m、高さ'+(w*9/16).toFixed(2)+'mのLED画面と身長1.7mの人を同縮尺比較');document.querySelectorAll('.svp-pre button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.w===w)));if(mq.matches){cancelAnimationFrame(raf);raf=0;last=0;current=target;draw(current)}else if(!raf){last=0;raf=requestAnimationFrame(animate)}}
range.addEventListener('input',()=>set(range.value));document.querySelectorAll('.svp-pre button').forEach(b=>b.addEventListener('click',()=>set(b.dataset.w)));mq.addEventListener('change',()=>set(target));draw(4);set(4);
})();