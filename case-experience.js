/* Original realtime perspective renderer. Local canvas only; no models, trackers, storage, or remote assets. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const smooth = v => { v=clamp(v);return v*v*(3-2*v); };
  const mix = (a,b,t) => a+(b-a)*t;
  const visiblePanelCount=(phase,progress,total)=>Math.ceil((phase===2?1-clamp(progress):clamp(progress))*total);
  const surfaces = [];
  const photos={};
  const needsLegacy=[...document.querySelectorAll('.cx-film:not([data-case-media])')];
  for(const [key,file] of Object.entries({assembly:'presentation-concept.png',playback:'realistic-playback-operation.png'})){
    if(!needsLegacy.some(el=>(el.dataset.filmMode==='playback'?'playback':'assembly')===key))continue;
    const img=new Image();img.onload=()=>surfaces.forEach(s=>s.dirty=true);img.src='assets/equipment/'+file;photos[key]=img;
  }
  const tint=(a,b,t)=>'#'+[0,2,4].map(i=>Math.round(mix(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),t)).toString(16).padStart(2,'0')).join('');
  const texture = document.createElement('canvas');texture.width=960;texture.height=540;
  const tx=texture.getContext('2d');
  function picture(t,variant=0,grid=false,kind='abstract'){
    const g=tx.createLinearGradient(0,0,960,540);
    g.addColorStop(0,tint('032b35','221b40',variant));g.addColorStop(.6,tint('286c6c','955b78',variant));g.addColorStop(1,tint('d5c48f','efb993',variant));
    tx.fillStyle=g;tx.fillRect(0,0,960,540);
    // An original flowing-ribbon artwork, synchronized between program and LED wall.
    // No titles dominate the canvas; the image, not a demo word, is the centerpiece.
    for(let i=0;i<18;i++){
      const k=i/17,drift=Math.sin(t*.42+k*2.8)*35;
      const y=160+k*430;
      const light=tx.createLinearGradient(0,y-160,960,y+80);
      light.addColorStop(0,'rgba(4,28,35,.1)');light.addColorStop(.38,`rgba(155,216,198,${.08+k*.09})`);light.addColorStop(.71,`rgba(249,238,197,${.20+k*.19})`);light.addColorStop(1,'rgba(48,72,68,.06)');
      tx.beginPath();tx.moveTo(-90,y+drift);
      tx.bezierCurveTo(180,y-220-k*100,550,y+210-k*140,1050,y-260+drift);
      tx.lineTo(1050,y-240+drift);tx.bezierCurveTo(550,y+240-k*140,180,y-195-k*100,-90,y+28+drift);tx.closePath();tx.fillStyle=light;tx.fill();
      tx.beginPath();tx.moveTo(-90,y+drift);tx.bezierCurveTo(180,y-220-k*100,550,y+210-k*140,1050,y-260+drift);tx.strokeStyle=`rgba(255,244,206,${.12+k*.15})`;tx.lineWidth=1.2;tx.stroke();
    }
    const glow=tx.createRadialGradient(700,140,0,700,140,350);glow.addColorStop(0,'#faf1c522');glow.addColorStop(1,'#faf1c500');tx.fillStyle=glow;tx.fillRect(0,0,960,540);
    if(kind!=='abstract'&&variant<1){
      tx.save();tx.globalAlpha=1-variant;tx.fillStyle='#f0f0e6';tx.fillRect(0,0,960,540);
      tx.fillStyle='#234c49';tx.fillRect(58,54,48,5);tx.font='500 21px "Noto Sans CJK JP", sans-serif';
      tx.fillText(kind==='online'?'共有する画面':kind==='lyrics'?'進行に合わせて':'会場の画面へ',58,110);
      tx.font='600 66px "Noto Sans CJK JP", sans-serif';tx.fillText(kind==='online'?'資料を共有':kind==='lyrics'?'歌詞を表示':'発表資料',54,237);
      tx.fillStyle='#c3d1c4';tx.fillRect(60,291,700,2);
      for(let i=0;i<3;i++){tx.fillStyle='#547c70';tx.fillRect(60,338+i*40,8,8);tx.fillStyle='#a7b9aa';tx.fillRect(91,339+i*40,420-i*70,5)}
      tx.fillStyle='#527264';tx.font='400 16px "Noto Sans CJK JP", sans-serif';tx.fillText(kind==='lyrics'?'歌詞の切り替えと、映像の再生':kind==='online'?'資料・動画音声・録画対象を確認':'資料から映像へ、合図で切り替える',60,488);tx.restore();
    }
    if(grid){tx.strokeStyle='#e5f8d94d';tx.lineWidth=1;for(let i=0;i<=8;i++){tx.beginPath();tx.moveTo(i*120,0);tx.lineTo(i*120,540);tx.stroke()}for(let i=0;i<=4;i++){tx.beginPath();tx.moveTo(0,i*135);tx.lineTo(960,i*135);tx.stroke()}}
  }
  class Film {
    constructor(root){
      this.root=root;this.canvas=root.querySelector('canvas');this.ctx=this.canvas.getContext('2d',{alpha:false});if(!this.ctx)return;this.tile=document.createElement('canvas');this.tileCtx=this.tile.getContext('2d');
      this.media=root.dataset.caseMedia?JSON.parse(root.dataset.caseMedia):null;
      if(this.media){this.casePhoto=new Image();this.casePhoto.onload=()=>{this.dirty=true};this.casePhoto.onerror=()=>{this.root.dataset.mediaError='true';this.dirty=true};}
      this.mode=root.dataset.filmMode;this.player=root.closest('[data-case-player]');this.gallery=root.closest('[data-case-gallery]');
      this.phase=0;this.time=0;this.elapsed=0;this.playing=false;this.wanted=false;this.suspended=false;this.visible=false;this.dirty=true;this.last=0;this.transition=1;
      this.progress=root.querySelector('.cx-film-progress i');
      this.resize=()=>{const r=root.getBoundingClientRect();const ratio=Math.min(devicePixelRatio||1,1.75);this.canvas.width=Math.max(2,Math.round(r.width*ratio));this.canvas.height=Math.max(2,Math.round(r.height*ratio));this.dirty=true;};
      new ResizeObserver(this.resize).observe(root);
      new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;if(this.visible&&this.casePhoto&&!this.casePhoto.src)this.casePhoto.src=this.media.poster;this.dirty=true;},{rootMargin:'100px'}).observe(root);
      this.resize();surfaces.push(this);
      if(this.player)this.controls();else this.setPlaying(true);
    }
    controls(){
      this.button=this.player.querySelector('.cx-play');this.steps=[...this.player.querySelectorAll('[data-step-index]')];
      this.button.hidden=reduce.matches;
      this.button.addEventListener('click',()=>this.setPlaying(!this.playing));
      this.player.querySelector('.cx-restart')?.addEventListener('click',()=>{this.select(0,false);this.elapsed=reduce.matches?4:0;this.setPlaying(true);});
      this.steps.forEach((b,i)=>b.addEventListener('click',()=>{this.setPlaying(false);this.select(i,true)}));
      this.setPlaying(true);
    }
    setPlaying(value){this.wanted=value;this.syncPlayback();}
    setSuspended(value){this.suspended=value;this.syncPlayback();}
    syncPlayback(){this.playing=this.wanted&&!this.suspended&&!reduce.matches&&!document.hidden;this.dirty=true;if(!this.player)return;this.player.dataset.playing=String(this.playing);this.button.hidden=reduce.matches;this.button.setAttribute('aria-pressed',String(this.playing));this.button.innerHTML=this.playing?'動きを停止 <span aria-hidden="true">Ⅱ</span>':'動きを再生 <span aria-hidden="true">▷</span>';}
    select(i,manual=false){this.phase=i;this.elapsed=manual?3.3:0;this.transition=manual&&!reduce.matches?0:1;this.dirty=true;if(!this.player)return;
      this.player.dataset.step=String(i);this.steps.forEach((b,n)=>b.setAttribute('aria-pressed',String(i===n)));
      this.player.querySelectorAll('[data-insight]').forEach((p,n)=>p.hidden=i!==n);
      this.player.querySelector('.cx-frame-number').textContent=`0${i+1} — 03`;
    }
    project(x,y,z){const X=x*this.cos-z*this.sin,Z=x*this.sin+z*this.cos;const Y=y-this.look;
      const yy=Y*this.pitchCos-Z*this.pitchSin,zz=Y*this.pitchSin+Z*this.pitchCos;
      const scale=this.focal/(this.distance-zz);return [this.w*.52+X*scale,this.h*.52-yy*scale];}
    path(points){const c=this.ctx;c.beginPath();points.forEach((p,i)=>{const q=this.project(...p);i?c.lineTo(...q):c.moveTo(...q)});c.closePath();}
    face(points,fill,stroke=null){this.path(points);this.ctx.fillStyle=fill;this.ctx.fill();if(stroke){this.ctx.strokeStyle=stroke;this.ctx.lineWidth=.7;this.ctx.stroke()}}
    box(x,y,z,w,h,d,front='#17282c',top='#425456',side='#0b1419'){
      this.face([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z-d],[x,y+h,z-d]],top);
      this.face([[x+w,y,z],[x+w,y+h,z],[x+w,y+h,z-d],[x+w,y,z-d]],side);
      this.face([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],front,'#64818a38');
    }
    tri(image,src,dst){const c=this.ctx;const [s0,s1,s2]=src,[d0,d1,d2]=dst;
      const den=s0[0]*(s1[1]-s2[1])+s1[0]*(s2[1]-s0[1])+s2[0]*(s0[1]-s1[1]);
      const component=k=>[(d0[k]*(s1[1]-s2[1])+d1[k]*(s2[1]-s0[1])+d2[k]*(s0[1]-s1[1]))/den,(d0[k]*(s2[0]-s1[0])+d1[k]*(s0[0]-s2[0])+d2[k]*(s1[0]-s0[0]))/den,(d0[k]*(s1[0]*s2[1]-s2[0]*s1[1])+d1[k]*(s2[0]*s0[1]-s0[0]*s2[1])+d2[k]*(s0[0]*s1[1]-s1[0]*s0[1]))/den];
      const a=component(0),b=component(1);c.save();const mid=[(d0[0]+d1[0]+d2[0])/3,(d0[1]+d1[1]+d2[1])/3];const out=[d0,d1,d2].map(p=>{const len=Math.hypot(p[0]-mid[0],p[1]-mid[1]);return [p[0]+(p[0]-mid[0])/len*.7,p[1]+(p[1]-mid[1])/len*.7]});c.beginPath();c.moveTo(...out[0]);c.lineTo(...out[1]);c.lineTo(...out[2]);c.closePath();c.clip();c.transform(a[0],b[0],a[1],b[1],a[2],b[2]);c.drawImage(image,0,0);c.restore();
    }
    image(x,y,z,w,h,sx=0,sy=0,sw=960,sh=540){const q=[[x,y+h,z],[x+w,y+h,z],[x+w,y,z],[x,y,z]].map(p=>this.project(...p));
      if(this.tile.width!==sw||this.tile.height!==sh){this.tile.width=sw;this.tile.height=sh;}
      this.tileCtx.drawImage(texture,sx,sy,sw,sh,0,0,sw,sh);
      const c=this.ctx;c.save();c.beginPath();q.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.clip();
      c.transform((q[1][0]-q[0][0])/sw,(q[1][1]-q[0][1])/sw,(q[3][0]-q[0][0])/sh,(q[3][1]-q[0][1])/sh,q[0][0],q[0][1]);c.drawImage(this.tile,0,0,sw*1.015,sh*1.015);c.restore();
    }
    line(points,color,width=1){const c=this.ctx;c.beginPath();points.forEach((p,i)=>{const q=this.project(...p);i?c.lineTo(...q):c.moveTo(...q)});c.strokeStyle=color;c.lineWidth=width;c.stroke();}
    label(text,x,y,z,color='#cfdbd6',size=12){const p=this.project(x,y,z);this.ctx.fillStyle=color;this.ctx.font=`500 ${size*this.w/1600}px "Noto Sans CJK JP", "DejaVu Sans", sans-serif`;this.ctx.fillText(text,...p);}
    render(dt){
      if(this.playing&&!document.hidden){this.time+=dt;this.elapsed+=dt;if(this.elapsed>8.5)this.select((this.phase+1)%3)}
      if(this.transition<1){this.transition=Math.min(1,this.transition+dt*2.5);this.dirty=true;}
      if(!this.dirty&&!this.playing)return;this.dirty=false;
      const c=this.ctx,w=this.canvas.width,h=this.canvas.height;this.w=w;this.h=h;
      const ratio=w/h;this.distance=ratio<1.3?24:20;this.focal=w*(ratio<1.3?2.1:1.24);this.look=2.65+Math.sin(this.time*.11)*.09;
      const angle=-.34+Math.sin(this.time*.13)*.12;this.cos=Math.cos(angle);this.sin=Math.sin(angle);this.pitchCos=Math.cos(.15);this.pitchSin=Math.sin(.15);
      const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#050c12');bg.addColorStop(.55,'#10252b');bg.addColorStop(1,'#050a0f');c.fillStyle=bg;c.fillRect(0,0,w,h);
      if(this.media){if(this.casePhoto&&this.casePhoto.width)this.caseSpecific();else{c.fillStyle='#142b2e';c.fillRect(0,0,w,h);}this.progress.style.transform=`scaleX(${clamp(this.elapsed/8.5)})`;return;}
      if(this.mode==='playback'&&photos.playback&&photos.playback.width){this.photographic(1);this.progress.style.transform=`scaleX(${clamp(this.elapsed/8.5)})`;return;}
      const halo=c.createRadialGradient(w*.55,h*.32,0,w*.55,h*.32,w*.5);halo.addColorStop(0,'#42798324');halo.addColorStop(1,'#07101600');c.fillStyle=halo;c.fillRect(0,0,w,h);
      // Theater architecture: velvet wings and a lit stage deck establish real spatial scale.
      for(let i=0;i<18;i++){
        const x=-10+i*1.14;
        const shade=i%2?'#13252a':'#0b1a21';
        this.face([[x,0,-3],[x+1.14,0,-3],[x+1.14,8.4,-3],[x,8.4,-3]],shade);
        this.line([[x+.04,0,-2.98],[x+.04,8.4,-2.98]],'#59706a15',1.5);
      }
      // A continuous grounded stage: floor, contact shadows, aluminum perimeter.
      const floor=c.createLinearGradient(0,h*.35,0,h);floor.addColorStop(0,'#1b3035');floor.addColorStop(.7,'#17272c');floor.addColorStop(1,'#080e16');
      this.face([[-12,0,10],[12,0,10],[12,0,-3],[-12,0,-3]],floor);
      this.box(-7.1,.015,2.1,14.2,.12,4.8,'#25363d','#33464a','#15232b');
      this.box(-7.35,.015,2.48,14.7,.055,.4,'#192b32','#415153','#12212a');
      this.line([[-7.3,.08,2.46],[7.3,.08,2.46]],'#adbe9e38',1);
      // Overhead truss and four focused fixtures, modeled rather than floating line effects.
      this.box(-8,7.0,-1,16,.13,.22,'#3b4a50','#71837f','#16272e');
      for(let fixture=0;fixture<4;fixture++){
        const x=-6+fixture*4;
        this.box(x-.18,6.62,-.78,.36,.34,.52,'#1e2e36','#53646a','#0a151e');
        this.face([[x-.14,6.63,-.77],[x+.14,6.63,-.77],[x+.14,6.63,-.25],[x-.14,6.63,-.25]],'#f3e6be');
      }
      for(let i=-9;i<10;i+=2){this.line([[i,0,-6],[i,0,9]],'#7890900b');this.line([[-10,0,i],[10,0,i]],'#7890900b')}
      this.face([[-4.5,.008,1.1],[4.5,.008,1.1],[4.5,.008,-1.2],[-4.5,.008,-1.2]],'#02060977');
      this.box(-4,.03,.3,8,.18,1.2,'#15282e','#34484d','#101d24');
      this.box(-3.7,.2,-.38,.1,4.93,.14,'#3a5057','#93a8a9','#14242b');this.box(3.6,.2,-.38,.1,4.93,.14,'#3a5057','#93a8a9','#14242b');this.box(-3.7,5.12,-.38,7.4,.1,.14,'#52656c','#a2b1ac','#182e35');
      const assembly=this.mode==='assembly';const disassemble=assembly&&this.phase===2;
      let build=assembly&&this.phase===0?smooth((this.elapsed+.5)/5):1;if(disassemble)build=1-smooth(Math.max(0,this.elapsed-1)/5);
      if(reduce.matches)build=1;
      const illumination=assembly?(this.phase===1?.9:.17):(this.phase===0?.72:1);
      // Broad reflected illumination, rather than moving dots or decorative line sweeps.
      const light=c.createRadialGradient(w*.55,h*.69,0,w*.55,h*.69,w*.4);light.addColorStop(0,`rgba(100,191,182,${illumination*.16})`);light.addColorStop(1,'rgba(30,85,90,0)');c.fillStyle=light;c.fillRect(0,h*.35,w,h*.65);
      picture(this.time,this.mode==='playback'&&this.phase===1?smooth((this.elapsed-1)/1.4):0,this.mode==='processor'&&this.phase<2);
      tx.fillStyle=`rgba(4,12,18,${1-illumination})`;tx.fillRect(0,0,960,540);
      // Each panel is a thick solid with edge treatment. Installation unfolds bottom to top.
      const panels=[];for(let row=0;row<4;row++)for(let col=0;col<8;col++)panels.push({row,col,order:row*8+col});
      panels.sort((a,b)=>b.col-a.col);
      for(const {row,col,order} of panels){
        const p=smooth((build*1.6-order/32)/.6);const lift=(1-p)*(1-p);const px=-3.55+col*.89,py=.75+row*1.08;
        const x=px+(1-p)*(-1.2-col*.12),y=mix(.26+row*.06,py,p),z=.08+lift*2.4;
        if(p<.01&&assembly){continue}
        c.globalAlpha=Math.max(.2,p);
        this.box(x,y,z,.875,1.065,.16,'#0b141b','#50656a','#15262e');
        c.globalAlpha=1;
        this.image(x+.018,y+.018,z+.005,.839,1.029,col*120,(3-row)*135,120,135);
        c.globalAlpha=1;
        this.line([[x+.01,y+1.055,z+.01],[x+.865,y+1.055,z+.01]],'#a1b9b645',.7);
      }
      // Panel storage is kept on the ground; its contents diminish as the wall is assembled.
      if(assembly){
        this.box(-6.35,.04,2.6,1.7,.25,1.35,'#24343d','#5a6d70','#101d26');
        const remaining=Math.ceil((1-build)*8);
        for(let i=0;i<remaining;i++){
          this.box(-6.23+i*.17,.29,2.48,.12,1.34,1.05,'#263b43','#869995','#122630');
          this.box(-6.225+i*.17,.8,2.50,.11,.14,.03,'#8c9993','#bac4b6','#486366');
        }
        this.label('LEDパネル',-6.3,.1,2.67,'#91a49f',10);
      }
      // Low road cases are grounded, not floating schematic rectangles.
      this.box(4.55,.03,1.4,1.25,1.6,.95,'#101b22','#425056','#080f15');
      for(const yy of [.12,1.5])this.box(4.55,yy,1.42,1.25,.035,.98,'#657176','#9ba8a7','#29363f');
      this.box(4.93,.72,1.45,.44,.13,.03,'#6c797e','#a4b3b1','#324047');
      this.label(this.mode==='processor'?'映像を整える機器':'映像をつなぐ機器',4.65,1.18,1.45,'#acbbb9',10);
      for(let row=0;row<3;row++){this.box(4.64,.25+row*.2,1.44,1.05,.12,.02,'#0a1116','#22333b','#05080c');this.box(5.52,.29+row*.2,1.47,.035,.025,.01,illumination>.5?'#a5d5c6':'#566f6a')}
      if(!assembly||this.root.dataset.filmCase==='showcase-led')this.desk();
      // Small seating groups at the edge of the composition establish audience scale.
      for(let row=0;row<2;row++)for(const side of [-1,1])for(let seat=0;seat<4;seat++){
        const x=side*(4.3+seat*.7),z=5.3+row*1.1;
        this.box(x,.10,z,.49,.15,.55,'#101a23','#314047','#09131c');
        this.box(x,.25,z-.38,.49,.58,.1,'#1c2e35','#52625d','#0b1720');
        this.box(x+.05,.03,z-.02,.045,.1,.05,'#45534f');this.box(x+.39,.03,z-.02,.045,.1,.05,'#45534f');
      }
      // Soft spotlights have a physical source overhead and end on the deck.
      for(let fixture=0;fixture<4;fixture++){
        const x=-6+fixture*4,top=this.project(x,6.64,-.5),bottom=this.project(x*.8,.14,2.0);
        const beam=c.createLinearGradient(top[0],top[1],bottom[0],bottom[1]);beam.addColorStop(0,'#f5e0ad0d');beam.addColorStop(.5,'#c4d7bd05');beam.addColorStop(1,'#f4e7bb00');
        c.beginPath();c.moveTo(top[0]-2,top[1]);c.lineTo(bottom[0]-w*.06,bottom[1]);c.quadraticCurveTo(bottom[0],bottom[1]+h*.03,bottom[0]+w*.06,bottom[1]);c.lineTo(top[0]+2,top[1]);c.closePath();c.fillStyle=beam;c.fill();
        const pool=c.createRadialGradient(bottom[0],bottom[1],0,bottom[0],bottom[1],w*.085);pool.addColorStop(0,'#ddcda518');pool.addColorStop(1,'#ddcda500');c.fillStyle=pool;c.fillRect(bottom[0]-w*.1,bottom[1]-w*.1,w*.2,w*.2);
      }
      // Screen edge light physically remains attached to the display.
      if(build>.98){this.line([[-3.55,.74,.15],[3.55,.74,.15]],`rgba(151,218,201,${illumination*.5})`,1.4);}
      const topLight=c.createRadialGradient(w*.52,h*.16,0,w*.52,h*.16,w*.24);topLight.addColorStop(0,'#b3d8ce0c');topLight.addColorStop(1,'#12373b00');c.fillStyle=topLight;c.fillRect(0,0,w,h);
      // Vignette and restrained lens haze complete the studio visualization.
      const vignette=c.createRadialGradient(w*.5,h*.45,w*.2,w*.5,h*.45,w*.72);vignette.addColorStop(0,'#02070b00');vignette.addColorStop(1,'#02070bb3');c.fillStyle=vignette;c.fillRect(0,0,w,h);
      const photoMix=this.mode==='playback'?1:this.phase===1?smooth(this.elapsed/1.6):this.phase===2?1-smooth(this.elapsed/1.3):0;
      if(photoMix>0)this.photographic(photoMix);
      this.progress.style.transform=`scaleX(${clamp(this.elapsed/8.5)})`;
    }
    caseSpecific(){
      const main=this.ctx,img=this.casePhoto,w=this.w,h=this.h;
      if(!this.sceneCanvas){this.sceneCanvas=document.createElement('canvas');this.sceneCanvas.width=img.width;this.sceneCanvas.height=img.height;this.sceneContext=this.sceneCanvas.getContext('2d');}
      const c=this.sceneContext;this.ctx=c;
      // One explicit case asset and its measured screen coordinates. No cross-case media fallback.
      // A complete shot returns to the overview; no permanent mobile crop.
      // Camera framing is explanatory, not a reconstruction of camera positions.
      const shot=reduce.matches?0:Math.sin(Math.PI*clamp(this.elapsed/8.5));
      const focusIndex=this.media.kind==='conference-led'?this.phase===1?2:0:this.media.kind==='twin-led'?this.phase===1?0:1:0;
      const focusQuad=(this.media.screens||[])[focusIndex];
      const focus=focusQuad?focusQuad.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]):[img.width/2,img.height/2];
      const depth=this.media.kind==='conference-led'?(this.phase===1?.48:.025):this.media.kind==='twin-led'?(this.phase===1?.55:.02):this.media.kind==='hall-led'?(this.phase===1?.23:.04):this.media.kind==='showcase-led'?.18:0;
      const zoom=1+(w<500?0:depth)*shot;
      const scale=Math.max(w/img.width,h/img.height)*zoom;
      const emphasis=this.media.kind==='twin-led'&&this.phase===1?.90:.32;
      const targetX=mix(img.width/2,focus[0],shot*emphasis),targetY=mix(img.height/2,focus[1],shot*.28);
      const dx=clamp(w/2-targetX*scale,w-img.width*scale,0),dy=clamp(h/2-targetY*scale,h-img.height*scale,0);
      c.save();c.clearRect(0,0,img.width,img.height);c.drawImage(img,0,0);
      const quads=this.media.screens||[];
      quads.forEach((q,i)=>{
        tx.fillStyle='#10191e';tx.fillRect(0,0,960,540);
        if(this.media.kind==='hall-led'||this.media.kind==='conference-led'){
          const [cols,rows]=this.media.panel_grids?this.media.panel_grids[i]:this.media.panel_grid;
          tx.fillStyle='#111d22';tx.fillRect(0,0,960,540);
          if(this.phase===1){
            const surface=tx.createLinearGradient(0,0,960,540);surface.addColorStop(0,'#c5dfd6');surface.addColorStop(.48,'#3d8d99');surface.addColorStop(1,'#143e54');tx.fillStyle=surface;tx.fillRect(0,0,960,540);
            const sx=reduce.matches?480:(Math.sin(this.elapsed*.55+i*.12)+1)*480;
            const sheen=tx.createLinearGradient(sx-200,0,sx+200,0);sheen.addColorStop(0,'#efffef00');sheen.addColorStop(.5,'#efffef44');sheen.addColorStop(1,'#efffef00');tx.fillStyle=sheen;tx.fillRect(0,0,960,540);
          }
          for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
            if(this.phase===1){tx.strokeStyle='#09293655';tx.lineWidth=1.2;tx.strokeRect(x*960/cols,y*540/rows,960/cols,540/rows);continue;}
            const n=y*cols+x,progress=reduce.matches?1:smooth(this.elapsed/4);
            const on=n<visiblePanelCount(this.phase,progress,cols*rows);
            const px=x*960/cols+3,py=y*540/rows+3,pw=960/cols-6,ph=540/rows-6;
            const tileLight=tx.createLinearGradient(px,py,px+pw,py+ph);
            if(this.phase===1){
              const scan=reduce.matches?0:Math.sin(this.elapsed*.75+i*.22);
              const selected=Math.abs(x/cols-(scan+1)/2)<.10;
              tileLight.addColorStop(0,selected?'#e2ede7':'#9ab7b2');tileLight.addColorStop(1,selected?'#88c3c5':'#486d75');
            }else{tileLight.addColorStop(0,on?'#7da5a8':'#182329');tileLight.addColorStop(1,on?'#294a57':'#080f14');}
            tx.fillStyle=tileLight;tx.fillRect(px,py,pw,ph);
            tx.strokeStyle=on||this.phase===1?'#b5d7d644':'#25373b';tx.lineWidth=1;tx.strokeRect(px+.5,py+.5,pw-1,ph-1);
            // Subtle panel-depth edges, not invented mounting hardware.
            tx.fillStyle='#01080b66';tx.fillRect(px,py+ph-2,pw,2);

          }
          c.fillStyle='#070b0c';c.fillRect(q[0][0]-3,q[0][1]-3,q[1][0]-q[0][0]+6,q[3][1]-q[0][1]+6);
        }else if(this.media.kind==='showcase-led'){
          picture(this.time,1,false,'abstract');
          const level=reduce.matches?(this.phase===2?0:1):this.phase===0?smooth(this.elapsed/3):this.phase===2?1-smooth(this.elapsed/3):1;
          tx.fillStyle=`rgba(3,7,10,${1-level*.9})`;tx.fillRect(0,0,960,540);
        }else if(this.media.kind==='twin-led'){
          const light=reduce.matches?1:this.phase===0?smooth(this.elapsed/2.5):1;
          // Three distinct states: source arrival, panel mapping, then synchronized program.
          if(this.phase===0){
            tx.fillStyle='#07161d';tx.fillRect(0,0,960,540);
            const reveal=reduce.matches?1:smooth(this.elapsed/3.5);
            const g=tx.createLinearGradient(0,0,960,540);g.addColorStop(0,'#08677c');g.addColorStop(.55,'#66d2bd');g.addColorStop(1,'#e9d090');
            tx.fillStyle=g;tx.fillRect(0,0,960*reveal,540);
          }else if(this.phase===1){
            const bars=['#e9e8d3','#dac352','#64c4be','#65a170','#b285bb','#ba6675','#567ea8'];
            bars.forEach((color,n)=>{tx.fillStyle=color;tx.fillRect(n*960/7,0,960/7+1,540)});
            tx.fillStyle='#10242acc';tx.fillRect(0,420,960,120);
            tx.fillStyle='#d9eae1';tx.font='500 34px sans-serif';tx.fillText('22 × 6',42,496);
          }else{
            picture(this.time,1,false,'abstract');
            tx.globalCompositeOperation='screen';
            for(let k=0;k<4;k++){
              const x=480+Math.sin(this.time*.48+k*1.7)*380,y=270+Math.cos(this.time*.39+k*1.3)*230;
              const bloom=tx.createRadialGradient(x,y,5,x,y,320);bloom.addColorStop(0,['#ff9f74bb','#7be3dab0','#9d84e9aa','#ffe8a5aa'][k]);bloom.addColorStop(1,'#00000000');tx.fillStyle=bloom;tx.fillRect(0,0,960,540);
            }
            tx.globalCompositeOperation='source-over';
          }
          tx.fillStyle=`rgba(1,6,10,${.35*(1-light)+.05})`;tx.fillRect(0,0,960,540);
          const [cols,rows]=this.media.panel_grid;
          tx.strokeStyle=this.phase===0?'#d7e8dc70':'#101e2045';tx.lineWidth=1;
          for(let n=0;n<=cols;n++){tx.beginPath();tx.moveTo(n*960/cols,0);tx.lineTo(n*960/cols,540);tx.stroke();}
          for(let n=0;n<=rows;n++){tx.beginPath();tx.moveTo(0,n*540/rows);tx.lineTo(960,n*540/rows);tx.stroke();}
          // Physical black perimeter of the dimensioned surface in front of its support rail.
          c.save();c.fillStyle='#060a0c';c.shadowColor='#0009';c.shadowBlur=9;c.fillRect(q[0][0]-5,q[0][1]-5,q[1][0]-q[0][0]+10,q[3][1]-q[0][1]+10);c.restore();
        }else if(this.media.kind==='hybrid'||this.media.kind==='online'){
          const online=this.media.kind==='online';
          const program=online?i===4:i===0;
          const preview=online?i===0:i===2;
          if(program){picture(this.time,this.phase===1?1:0,false,online?'online':'slides');}
          else if(preview){
            tx.fillStyle='#172b32';tx.fillRect(0,0,960,540);
            const colors=['#6ba7b8','#8c86ac','#799e8d','#c5ad7c'];
            colors.forEach((color,n)=>{tx.fillStyle=color;tx.fillRect(15+(n%2)*475,15+Math.floor(n/2)*265,455,245);});
            tx.strokeStyle='#e0ead7';tx.lineWidth=7;tx.strokeRect(15+(this.phase%2)*475,15,455,245);
          }else{
            tx.fillStyle='#e4e9e3';tx.fillRect(0,0,960,540);tx.fillStyle='#264c50';tx.fillRect(0,0,960,65);
            for(let r=0;r<6;r++){tx.fillStyle=r===this.phase?'#83b5a4':'#c4d0ca';tx.fillRect(36,95+r*65,870,45);tx.fillStyle='#4d706a';tx.fillRect(55,110+r*65,230+(r%3)*100,8);}
            if(online&&this.phase===2&&i===5){tx.fillStyle='#b5564f';tx.beginPath();tx.arc(900,33,12,0,Math.PI*2);tx.fill();}
          }
        }else if(i===0){
          // Cue rows advance only inside the laptop, not across the whole photograph.
          tx.fillStyle='#23333c';tx.fillRect(0,0,960,42);
          for(let row=0;row<10;row++){
            const active=row===Math.floor(this.elapsed/1.7)%10;
            tx.fillStyle=active?'#366e73':'#19272f';tx.fillRect(20,58+row*45,920,35);
            tx.fillStyle=active?'#d9e6dc':'#6c828a';tx.fillRect(43,70+row*45,16,10);tx.fillRect(90,71+row*45,340+(row%3)*90,5);
          }
        }else{
          const change=this.phase===1?smooth((this.elapsed-1)/1.5):this.phase===2?1:0;
          picture(this.time,change,false,'lyrics');
        }
        this.photoQuad(q);
      });
      c.restore();this.ctx=main;
      main.save();main.translate(dx,dy);main.scale(scale,scale);main.drawImage(this.sceneCanvas,0,0);main.restore();
      // Keep a live full-layout reference when a close view crops the composition.
      if(w>=500&&!reduce.matches&&this.phase===1&&(this.media.kind==='conference-led'||this.media.kind==='twin-led')){
        const ow=w*.24,oh=ow*img.height/img.width,ox=w-ow-w*.025,oy=h*.025;
        main.save();main.globalAlpha=1;main.fillStyle='#07191c';main.fillRect(ox-3,oy-3,ow+6,oh+6);main.drawImage(this.sceneCanvas,ox,oy,ow,oh);main.strokeStyle='#d9c28c';main.lineWidth=1;main.strokeRect(ox-.5,oy-.5,ow+1,oh+1);main.restore();
      }
      if(this.gallery){this.root.dataset.mediaReady='true';this.root.dataset.framePhase=String(this.phase);return;}
      // A restrained editorial caption explains the confirmed object, not a fabricated operation.
      const facts={
        'conference-led':['5つの独立したセッションエリア','18 × 8 が4面 ／ 22 × 8 が1面','担当：設営・撤去'],
        'hall-led':['横7m × 縦4m のLED画面','14列 × 4段 ／ 56枚','担当：設営・確認・撤去と引き継ぎ'],
        'twin-led':['舞台の左右、それぞれの画面へ','片側22列 × 6段 ／ 左右2面','左右それぞれの表示を確認'],
        'showcase-led':['上下に分かれた映像画面','本事例の対象は、下部の横長LED','担当：下部LEDまわりの現場対応'],
        'hybrid':['会場とオンライン、両方へ','資料と映像を、進行に合わせて切り替える','映す先と、確認する画面を整理'],
        'online':['小部屋から、オンラインへ','資料・動画・音声の共有を確認','録画対象画面を確認'],
        'workstation':['歌詞の表示と、映像の再生','合図に合わせて、表示内容を切り替える','次の映像に備える、操作環境']
      };
      const caption=(facts[this.media.kind]||facts.workstation)[this.phase];
      const font=Math.max(13,Math.min(22,w*.022)),pad=w*.028;
      main.save();main.font=`500 ${font}px sans-serif`;const cw=Math.min(w-pad*2,main.measureText(caption).width+pad*1.5);
      const shade=main.createLinearGradient(0,h-h*.20,0,h);shade.addColorStop(0,'#06171a00');shade.addColorStop(1,'#06171acc');main.fillStyle=shade;main.fillRect(0,h-h*.20,w,h*.20);
      const lines=[];let line='';for(const ch of caption){if(main.measureText(line+ch).width>w-pad*2-16&&line){lines.push(line);line=ch;}else line+=ch;}if(line)lines.push(line);
      const lineHeight=font*1.4;main.fillStyle='#d6be8c';main.fillRect(pad,h-pad-font-(lines.length-1)*lineHeight,2,font+(lines.length-1)*lineHeight);main.fillStyle='#f3f3e8';lines.forEach((line,i)=>main.fillText(line,pad+12,h-pad-(lines.length-1-i)*lineHeight));main.restore();
      this.root.dataset.mediaReady='true';this.root.dataset.framePhase=String(this.phase);
    }
    photographic(alpha){
      const img=photos[this.mode==='playback'?'playback':'assembly'];if(!img||!img.width)return;
      const c=this.ctx,w=this.w,h=this.h;
      const scale=Math.max(w/img.width,h/img.height)*(1.015+Math.sin(this.time*.10)*.015);
      const dx=(w-img.width*scale)/2+Math.sin(this.time*.09)*w*.006,dy=(h-img.height*scale)/2;
      c.save();c.globalAlpha=alpha;c.translate(dx,dy);c.scale(scale,scale);c.drawImage(img,0,0);
      if(this.mode==='playback'){
        const kind=this.root.dataset.filmCase==='lyrics-vtr'?'lyrics':this.root.dataset.filmCase==='online-operations'?'online':'presentation';
        const source=this.phase===1?smooth((this.elapsed-1)/1.4):this.phase===2?1:0;
        picture(this.time,source,false,kind);
        this.photoQuad([[674,104],[1127,104],[1127,324],[674,324]]);
        this.photoQuad([[1038,539],[1361,538],[1361,720],[1038,717]]);
        picture(this.time,this.phase===2?0:1,false,kind);
        c.save();c.beginPath();[[752,539],[1005,539],[1005,716],[895,716],[839,684],[797,661],[747,643],[723,620],[738,581]].forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.clip();
        this.photoQuad([[679,539],[1005,539],[1005,716],[679,716]]);c.restore();
      }
      c.restore();
      c.save();c.globalAlpha=alpha;const shade=c.createLinearGradient(0,h*.63,0,h);shade.addColorStop(0,'#03100c00');shade.addColorStop(1,'#03100cd9');c.fillStyle=shade;c.fillRect(0,h*.6,w,h*.4);
      c.fillStyle='#f4eddb';c.font=`500 ${Math.max(12,w*.018)}px "Noto Sans CJK JP",sans-serif`;
      const key=this.root.dataset.filmCase;const title=key==='online-operations'?'共有する内容と、録画する画面を確かめる。':key==='lyrics-vtr'?'歌詞も映像も、進行に合わせて。':this.mode==='processor'?'映像と画面の条件を、そろえる。':this.mode==='playback'?'映す前に確認。合図で切り替える。':'組み上げた画面が、空間の表情を変える。';
      c.fillText(title,w*.035,h*.87);
      c.fillStyle='#dfdfcc';c.font=`400 ${Math.max(9,w*.010)}px "Noto Sans CJK JP",sans-serif`;
      const caption=key==='online-operations'?'配信画面・資料・動画音声・録画対象を分けて確認。':key==='conference-led'?'画面まわりの設営と撤去を、チームの一員として。':key==='showcase-led'?'設営・本番中の対応・撤去。工程ごとに支える。':key==='hall-led-handover'?'設営・確認・撤去、そして次の担当への引き継ぎ。':this.mode==='processor'?'LED画面へ映像を届けるための設定調整。':'左：次の映像　／　右：会場に映す映像';
      c.fillText(caption,w*.035,h*.925);c.restore();
    }
    photoQuad(q){
      if(Math.abs(q[0][0]-q[1][0]+q[2][0]-q[3][0])<.01&&Math.abs(q[0][1]-q[1][1]+q[2][1]-q[3][1])<.01){
        const c=this.ctx;c.save();c.transform((q[1][0]-q[0][0])/960,(q[1][1]-q[0][1])/960,(q[3][0]-q[0][0])/540,(q[3][1]-q[0][1])/540,q[0][0],q[0][1]);c.drawImage(texture,0,0);c.restore();return;
      }
      // Projective mesh preserves straight document lines across a tilted display.
      const dx1=q[1][0]-q[2][0],dx2=q[3][0]-q[2][0],dx3=q[0][0]-q[1][0]+q[2][0]-q[3][0];
      const dy1=q[1][1]-q[2][1],dy2=q[3][1]-q[2][1],dy3=q[0][1]-q[1][1]+q[2][1]-q[3][1];
      const det=dx1*dy2-dx2*dy1,g=(dx3*dy2-dx2*dy3)/det,h=(dx1*dy3-dx3*dy1)/det;
      const point=(u,v)=>[(q[0][0]+(q[1][0]-q[0][0]+g*q[1][0])*u+(q[3][0]-q[0][0]+h*q[3][0])*v)/(g*u+h*v+1),(q[0][1]+(q[1][1]-q[0][1]+g*q[1][1])*u+(q[3][1]-q[0][1]+h*q[3][1])*v)/(g*u+h*v+1)];
      for(let y=0;y<6;y++)for(let x=0;x<8;x++){
        const u=x/8,v=y/6,U=(x+1)/8,V=(y+1)/6;
        this.tri(texture,[[u*960,v*540],[U*960,v*540],[U*960,V*540]],[point(u,v),point(U,v),point(U,V)]);
        this.tri(texture,[[u*960,v*540],[U*960,V*540],[u*960,V*540]],[point(u,v),point(U,V),point(u,V)]);
      }
    }

    desk(){const c=this.ctx;
      this.box(-3.2,.05,5.25,4.7,1.12,1.6,'#15252d','#3a4c52','#0b171f');
      this.box(-3.2,1.17,5.25,4.7,.12,1.6,'#394b52','#5b6c70','#20363f');
      // Preview and program monitors show distinct source states, then program matches the wall.
      for(let m=0;m<2;m++){
        const x=-2.92+m*2.05;
        this.box(x+.7,1.29,4.14,.13,.37,.12,'#3c5059','#697b7c','#24343d');
        this.box(x,1.64,4.22,1.84,1.11,.13,'#111c23','#738181','#273c45');
        picture(this.time,m===0?1:(this.phase===1?smooth((this.elapsed-1)/1.4):0),false);
        this.image(x+.055,1.70,4.23,1.73,.973);
        this.label(m===0?'次の映像':'会場の映像',x+.07,1.51,4.27,m===0?'#b9be90':'#e1ac9c',10);
      }
      // Tactile mixer surface, faders and tally-lit selection keys.
      this.face([[-2.8,1.31,5.13],[1,1.31,5.13],[1,1.31,4.48],[-2.8,1.31,4.48]],'#0e1c25','#4d626b');
      for(let row=0;row<2;row++)for(let col=0;col<8;col++){
        const selected=col===(this.phase===1?3:1)&&row===0;
        this.box(-2.64+col*.34,1.315,4.72+row*.23,.24,.035,.14,selected?'#badbc5':'#435661',selected?'#e3f5df':'#70818a','#1a2c35');
      }
      for(let i=0;i<3;i++){this.line([[.42+i*.18,1.32,4.63],[.42+i*.18,1.32,5.03]],'#98aca5',.8);this.box(.37+i*.18,1.33,4.82,.10,.03,.07,'#91aaa8','#c9d5cb','#47636d')}
    }
  }
  document.querySelectorAll('.cx-film').forEach(root=>new Film(root));
  document.querySelectorAll('.cx-video-switch').forEach(button=>{
    const player=button.closest('[data-case-player]'),video=player.querySelector('video'),film=player.querySelector('.cx-film'),pause=player.querySelector('.cx-video-pause'),status=player.querySelector('.cx-video-status');
    let whole=true,paused=false,inView=false,loaded=false,blocked=false;
    video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;button.hidden=false;
    const stopCanvas=()=>surfaces.filter(s=>s.player===player).forEach(s=>s.setSuspended(true));
    const fallback=()=>{blocked=true;video.pause();video.hidden=true;film.hidden=false;player.dataset.videoMode='false';pause.hidden=true;stopCanvas();status.textContent='動きを抑えた説明図を表示しています。';};
    const sync=()=>{
      const staticMode=reduce.matches||!!(navigator.connection&&navigator.connection.saveData);
      player.dataset.videoMode=String(whole&&!blocked);video.hidden=!whole||blocked;film.hidden=whole&&!blocked;
      button.setAttribute('aria-pressed',String(!whole));button.textContent=whole?(film.dataset.filmCase==='showcase-led'?'担当する仕事を見る ↗':'工程ごとに見る ↗'):(film.dataset.filmCase==='showcase-led'?'上下画面を見る ↗':'全体を見る ↗');
      pause.hidden=!whole||staticMode||blocked;pause.textContent=paused?'動きを戻す':'動きを止める';pause.setAttribute('aria-pressed',String(paused));
      if(whole)stopCanvas();else surfaces.filter(s=>s.player===player).forEach(s=>s.setSuspended(false));
      if(!whole||paused||staticMode||document.hidden||!inView||blocked){video.pause();return;}
      if(!loaded){video.querySelector('source').src=video.querySelector('source').dataset.src;video.load();loaded=true;}
      const attempt=video.play();if(attempt)attempt.catch(e=>{if(e.name!=='AbortError'&&whole&&!paused&&inView&&!document.hidden&&!reduce.matches)fallback();});
    };
    button.addEventListener('click',()=>{whole=!whole;stopCanvas();sync()});
    pause.addEventListener('click',()=>{paused=!paused;sync()});
    video.addEventListener('error',fallback);video.addEventListener('play',stopCanvas);
    document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync()},{threshold:.15}).observe(player);else{inView=true;}
    sync();
  });
  const gallery=document.querySelector('[data-case-gallery]');
  let galleryWanted=true;
  const syncGallery=()=>{if(!gallery)return;const button=gallery.querySelector('.cx-gallery-toggle'),running=galleryWanted&&!reduce.matches&&!document.hidden;button.hidden=reduce.matches;gallery.dataset.galleryPlaying=String(running);button.setAttribute('aria-pressed',String(running));button.textContent=running?'動きを停止':'動きを再生';};
  if(gallery){const button=gallery.querySelector('.cx-gallery-toggle');button.addEventListener('click',()=>{galleryWanted=!galleryWanted;surfaces.filter(s=>s.gallery).forEach(s=>s.setPlaying(galleryWanted));syncGallery();});syncGallery();}
  reduce.addEventListener('change',()=>{surfaces.forEach(s=>{s.syncPlayback();if(reduce.matches)s.elapsed=4;s.dirty=true;});syncGallery();});
  document.addEventListener('visibilitychange',()=>{surfaces.forEach(s=>s.syncPlayback());syncGallery();});
  let last=performance.now();function frame(now){if(now-last<1000/30){requestAnimationFrame(frame);return;}const dt=Math.min(1,(now-last)/1000);last=now;surfaces.forEach(s=>{if(s.visible)s.render(dt)});requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();
