/* 設営イメージ 3D — three.js リアルタイム CG (Friday 2026-11-09)
   入力は外部へ送信しない。three.js は jsDelivr から読み込む。失敗時は 2D 描画のまま。 */
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const root=document.getElementById('setup-render');
const frame=root&&root.querySelector('.sr-frame');
if(frame){try{boot()}catch(e){console.warn('SR3D',e)}}

function boot(){
const canvas=document.createElement('canvas');canvas.className='sr-3d';canvas.setAttribute('aria-hidden','true');
frame.prepend(canvas);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(36,16/9,.1,600);
const pmrem=new THREE.PMREMGenerator(renderer);
const envTex=pmrem.fromScene(new RoomEnvironment(),.04).texture;
scene.environment=envTex;
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(1600,900),.85,.55,.86);
composer.addPass(bloom);composer.addPass(new OutputPass());
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.dampingFactor=.06;controls.enablePan=false;
controls.minPolarAngle=Math.PI*.28;controls.maxPolarAngle=Math.PI*.52;
let userMoved=false;controls.addEventListener('start',()=>{userMoved=true});

/* ---------- shared materials ---------- */
const M={
 metal:new THREE.MeshStandardMaterial({color:0xc4c8cd,metalness:1,roughness:.32}),
 dark:new THREE.MeshStandardMaterial({color:0x17181b,metalness:.4,roughness:.55}),
 black:new THREE.MeshStandardMaterial({color:0x0b0b0c,metalness:.2,roughness:.7}),
 case:new THREE.MeshStandardMaterial({color:0x1a1b1e,metalness:.1,roughness:.62}),
 alu:new THREE.MeshStandardMaterial({color:0xd9dcdf,metalness:1,roughness:.25}),
 navy:new THREE.MeshStandardMaterial({color:0x1d3550,roughness:.85}),
 green:new THREE.MeshStandardMaterial({color:0x2a4733,roughness:.85}),
 pants:new THREE.MeshStandardMaterial({color:0x22252b,roughness:.9}),
 skin:new THREE.MeshStandardMaterial({color:0xd9a988,roughness:.65}),
 helmet:new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.18,clearcoat:1,clearcoatRoughness:.1}),
 hivis:new THREE.MeshStandardMaterial({color:0xd8ff3a,emissive:0x8fb000,emissiveIntensity:.35,roughness:.5}),
 crowd:new THREE.MeshStandardMaterial({color:0x101114,roughness:1}),
 lift:new THREE.MeshStandardMaterial({color:0x2c63b8,metalness:.3,roughness:.45}),
};
const G={cyl:new THREE.CylinderGeometry(1,1,1,10),box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,24,16)};

/* ---------- video / content ---------- */
const vid=document.createElement('video');
vid.src='assets/brand/estimate-live-loop.mp4';vid.muted=true;vid.loop=true;vid.playsInline=true;vid.preload='auto';
vid.setAttribute('muted','');vid.play().catch(()=>{});

let S=null,world=null,screens=[],beams=[],penlights=null,t0=performance.now(),running=false;

function mk(geo,mat,sx,sy,sz,x,y,z,parent){const m=new THREE.Mesh(geo,mat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(parent||world).add(m);return m}
function rod(a,b,r,mat,parent){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();const m=new THREE.Mesh(G.cyl,mat);m.scale.set(r,L,r);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.castShadow=true;(parent||world).add(m);return m}

/* box truss 290mm */
function truss(x0,x1,y,z){const s=.29,h=s/2,g=new THREE.Group();world.add(g);
 const c=[[-h,-h],[-h,h],[h,-h],[h,h]];c.forEach(([dy,dz])=>rod([x0,y+dy,z+dz],[x1,y+dy,z+dz],.024,M.metal,g));
 const L=x1-x0,n=Math.max(1,Math.round(L/.5));
 for(let i=0;i<n;i++){const a=x0+L*i/n,b=x0+L*(i+1)/n;
  rod([a,y-h,z-h],[b,y+h,z-h],.011,M.metal,g);rod([a,y-h,z+h],[b,y+h,z+h],.011,M.metal,g);
  rod([a,y+h,z-h],[b,y+h,z+h],.011,M.metal,g);rod([a,y-h,z-h],[b,y-h,z+h],.011,M.metal,g)}
 return g}
function hoist(x,y,z,top){mk(G.box,M.black,.26,.38,.26,x,y+.45,z);mk(G.box,M.black,.18,.12,.3,x,y+.62,z);
 rod([x,y+.66,z],[x,top,z],.012,M.metal);rod([x,y+.25,z],[x,y+.16,z],.01,M.metal)}

/* LED wall with live content */
function ledWall(o){ // o:{x,y,w,h,z,cols,rows,built,main,mode,name}
 const cw=1536,ch=Math.max(256,Math.min(2048,Math.round(cw*o.h/o.w)));
 const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const cx=cv.getContext('2d');
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
 const mat=new THREE.MeshBasicMaterial({map:tex,toneMapped:false,transparent:true,alphaTest:.02});
 mat.color.setScalar(o.mode==='show'?1.55:1.15);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(o.w,o.h),mat);face.position.set(o.x,o.y+o.h/2,o.z+.065);world.add(face);
 // cabinet backs (only built rows)
 const builtRows=o.mode==='show'?o.rows:Math.max(1,Math.round(o.rows*o.built));
 const bh=o.h*builtRows/o.rows;
 mk(G.box,M.dark,o.w,bh,.1,o.x,o.y+bh/2,o.z);
 // glow light cast onto floor/stage
 const pl=new THREE.PointLight(o.mode==='show'?0x8a7dff:0x6f8cff,o.mode==='show'?Math.min(60,o.w*o.h*1.6):Math.min(20,o.w*o.h*.6),Math.max(12,o.w*2.2),2);
 pl.position.set(o.x,o.y+bh*.5,o.z+2.2);world.add(pl);
 screens.push({cv,cx,tex,o,builtRows});
}
function bars(cx,x,y,w,h){const c=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'];c.forEach((k,i)=>{cx.fillStyle=k;cx.fillRect(x+w*i/7,y,w/7+1,h*.72)});cx.fillStyle='#101010';cx.fillRect(x,y+h*.72,w,h*.28);cx.fillStyle='#eaeaea';cx.fillRect(x+w*.15,y+h*.78,w*.2,h*.16)}
function paint(sc,t){
 const {cx,cv,o}=sc,W=cv.width,H=cv.height;cx.clearRect(0,0,W,H);
 const show=o.mode==='show',rowsOn=sc.builtRows;
 const yTop=H*(1-rowsOn/o.rows);
 cx.save();cx.beginPath();cx.rect(0,yTop,W,H-yTop);cx.clip();
 if(show||o.main===false&&show){
  if(vid.readyState>=2){const vr=vid.videoWidth/vid.videoHeight,cr=W/H;let sw=vid.videoWidth,sh=vid.videoHeight,sx=0,sy=0;if(vr>cr){sw=sh*cr;sx=(vid.videoWidth-sw)/2}else{sh=sw/cr;sy=(vid.videoHeight-sh)/2}cx.drawImage(vid,sx,sy,sw,sh,0,0,W,H)}
  else{const g=cx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#1aa0ef');g.addColorStop(.5,'#6a4dff');g.addColorStop(1,'#ff5a8a');cx.fillStyle=g;cx.fillRect(0,0,W,H)}
  if(o.main&&o.name){cx.fillStyle='rgba(0,0,0,.18)';cx.fillRect(0,H*.36,W,H*.28);cx.fillStyle='#fff';cx.textAlign='center';cx.textBaseline='middle';
   const fs=Math.min(H*.17,W/Math.max(o.name.length,5)*1.55);cx.font='700 '+fs+'px "Hiragino Sans","Noto Sans JP","Helvetica Neue",sans-serif';cx.shadowColor='rgba(0,0,0,.4)';cx.shadowBlur=fs*.2;cx.fillText(o.name,W/2,H/2);cx.shadowBlur=0}
 }else{ // setup: test pattern on built rows, a few tiles dark
  cx.fillStyle='#050506';cx.fillRect(0,0,W,H);bars(cx,0,yTop,W,H-yTop);
  if(o.main&&o.name){cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(W*.25,yTop+(H-yTop)*.08,W*.5,(H-yTop)*.18);cx.fillStyle='#fff';cx.textAlign='center';cx.textBaseline='middle';const fs=Math.min((H-yTop)*.11,W/Math.max(o.name.length,6)*.9);cx.font='600 '+fs+'px "Helvetica Neue",sans-serif';cx.fillText(o.name,W/2,yTop+(H-yTop)*.17)}
  const tw=W/o.cols,th=H/o.rows;cx.fillStyle='#050506';for(let i=0;i<Math.max(1,o.cols*.08);i++){const c=(i*7+3)%o.cols,r=o.rows-rowsOn+((i*5)%rowsOn);cx.fillRect(c*tw,r*th,tw,th)}
 }
 cx.restore();
 // pixel grid + cabinet seams
 const tw=W/o.cols,th=H/o.rows;cx.strokeStyle='rgba(0,0,0,.55)';cx.lineWidth=Math.max(1,W/900);
 cx.beginPath();for(let c=1;c<o.cols;c++){cx.moveTo(c*tw,yTop);cx.lineTo(c*tw,H)}for(let r=Math.ceil(yTop/th);r<o.rows;r++){cx.moveTo(0,r*th);cx.lineTo(W,r*th)}cx.stroke();
 cx.fillStyle='rgba(0,0,0,.10)';for(let y=yTop;y<H;y+=4)cx.fillRect(0,y,W,1.2);
 sc.tex.needsUpdate=true;
}

/* people */
function person(x,z,o){o=o||{};const g=new THREE.Group();g.position.set(x,o.y||0,z);g.rotation.y=o.ry||0;world.add(g);
 const top=o.crew?M[o.col||'navy']:M.crowd;
 mk(G.cyl,M.pants,.075,.86,.075,-.1,.43,0,g);mk(G.cyl,M.pants,.075,.86,.075,.1,.43,0,g);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.42,4,12),top);torso.position.set(0,1.18,0);torso.scale.set(1,1,.72);torso.castShadow=true;g.add(torso);
 if(o.crew){const band=new THREE.Mesh(new THREE.CylinderGeometry(.205,.205,.06,20,1,true),M.hivis);band.scale.set(1,1,.72);band.position.set(0,1.12,0);g.add(band)}
 const up=o.arms==='up';[-1,1].forEach(s=>{const a=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.5,4,8),top);a.castShadow=true;if(up){a.position.set(s*.25,1.72,0)}else{a.position.set(s*.26,1.12,0);a.rotation.z=s*.12}g.add(a)});
 const head=new THREE.Mesh(G.sph,o.crew?M.skin:M.crowd);head.scale.setScalar(.115);head.position.set(0,1.62,0);head.castShadow=true;g.add(head);
 if(o.crew){const hel=new THREE.Mesh(new THREE.SphereGeometry(.135,24,12,0,Math.PI*2,0,Math.PI/2),M.helmet);hel.position.set(0,1.63,0);hel.castShadow=true;g.add(hel);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.012,24),M.helmet);brim.position.set(0,1.635,.02);g.add(brim)}
 if(o.panel){mk(G.box,M.dark,.5,.5,.09,0,2.12,.05,g)}
 return g}
function cases(x,z,n,ry){for(let i=0;i<n;i++){const g=new THREE.Group();g.position.set(x+i*.82,0,z+(i%2)*.25);g.rotation.y=ry||0;world.add(g);
 mk(G.box,M.case,.72,.78,.6,0,.45,0,g);[[-.36,-.3],[.36,-.3],[-.36,.3],[.36,.3]].forEach(([a,b])=>mk(G.box,M.alu,.025,.8,.025,a,.45,b,g));
 mk(G.box,M.alu,.74,.025,.62,0,.06,0,g);mk(G.box,M.alu,.74,.025,.62,0,.84,0,g);[-.25,.25].forEach(a=>mk(G.cyl,M.black,.05,.03,.05,a,.04,.27,g))}}
function scissor(x,z,h){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 mk(G.box,M.lift,.8,.32,1.6,0,.26,0,g);[[-.32,-.6],[.32,-.6],[-.32,.6],[.32,.6]].forEach(([a,b])=>mk(G.cyl,M.black,.11,.08,.11,a,.11,b,g));
 const steps=Math.max(2,Math.round((h-.5)/.55));for(let i=0;i<steps;i++){const y0=.45+i*(h-.5)/steps,y1=.45+(i+1)*(h-.5)/steps;[-.36,.36].forEach(sx=>{rod([sx,y0,-.65],[sx,y1,.65],.03,M.lift,g);rod([sx,y0,.65],[sx,y1,-.65],.03,M.lift,g)})}
 mk(G.box,M.dark,.86,.06,1.7,0,h,0,g);const r=1.05;[[-.43,0],[.43,0]].forEach(([a])=>{rod([a,h,-.85],[a,h+r,-.85],.018,M.alu,g);rod([a,h,.85],[a,h+r,.85],.018,M.alu,g);rod([a,h+r,-.85],[a,h+r,.85],.018,M.alu,g)});rod([-.43,h+r,.85],[.43,h+r,.85],.018,M.alu,g);rod([-.43,h+r,-.85],[.43,h+r,-.85],.018,M.alu,g);
 return g}

/* volumetric beam */
const beamMat=c=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{c:{value:new THREE.Color(c)},a:{value:.16}},
 vertexShader:'varying float v;varying vec3 n;varying vec3 vv;void main(){v=uv.y;vec4 mv=modelViewMatrix*vec4(position,1.);vv=normalize(-mv.xyz);n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform vec3 c;uniform float a;varying float v;varying vec3 n;varying vec3 vv;void main(){float e=pow(abs(dot(n,vv)),1.6);gl_FragColor=vec4(c*a*pow(v,1.5)*e,1.);}'});
function beam(from,to,color,r){const A=new THREE.Vector3(...from),B=new THREE.Vector3(...to),L=A.distanceTo(B);
 const geo=new THREE.CylinderGeometry(.06,r,L,32,1,true);const m=new THREE.Mesh(geo,beamMat(color));
 m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),B.clone().sub(A).normalize());world.add(m);
 const fx=mk(G.box,M.black,.32,.38,.32,A.x,A.y+.2,A.z);const lens=new THREE.Mesh(G.sph,new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(3),toneMapped:false}));lens.scale.setScalar(.09);lens.position.copy(A);world.add(lens);
 const sp=new THREE.SpotLight(color,180,L*1.4,Math.atan(r/L)*1.2,.5,2);sp.position.copy(A);sp.target.position.copy(B);world.add(sp,sp.target);
 beams.push({m,A,B,ph:Math.random()*6,sp});}

/* ---------- venues ---------- */
const VEN={arena:{w:70,d:80,h:24,stage:1.6},dome:{w:120,d:130,h:45,stage:1.8},hall:{w:30,d:34,h:14,stage:1.0},messe:{w:60,d:60,h:13,stage:.1},ballroom:{w:30,d:30,h:7,stage:.6},conf:{w:20,d:22,h:4.6,stage:.3},outdoor:{w:120,d:120,h:60,stage:1.4}};
function shell(s,v){const show=s.mode==='show';const bright=s.venue==='messe'||s.venue==='conf'||(s.venue==='outdoor'&&!show);
 // floor: reflector + semi-transparent surface
 const refl=new Reflector(new THREE.PlaneGeometry(v.w,v.d),{textureWidth:1024,textureHeight:1024,color:0x777777});refl.rotation.x=-Math.PI/2;refl.position.set(0,-.002,v.d/2-6);world.add(refl);
 const floorCol={arena:0x1b1c1f,dome:0x1d2a20,hall:0x241e1a,messe:0x8d9196,ballroom:0x3a2620,conf:0x585a5e,outdoor:0x3b3c3e}[s.venue];
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(v.w,v.d),new THREE.MeshStandardMaterial({color:floorCol,roughness:s.venue==='messe'||s.venue==='ballroom'?.9:.55,metalness:0,transparent:true,opacity:s.venue==='messe'||s.venue==='ballroom'||s.venue==='conf'?.96:.86}));
 floor.rotation.x=-Math.PI/2;floor.position.set(0,0,v.d/2-6);floor.receiveShadow=true;world.add(floor);
 if(s.venue==='outdoor'){
  scene.background=new THREE.Color(show?0x070b18:0x9cc6ea);
  const sky=new THREE.Mesh(new THREE.SphereGeometry(280,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{t:{value:new THREE.Color(show?0x02030a:0x3f86d1)},b:{value:new THREE.Color(show?0x2a1c3c:0xdbe9f3)}},vertexShader:'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 t;uniform vec3 b;varying float h;void main(){gl_FragColor=vec4(mix(b,t,clamp(h*2.2,0.,1.)),1.);}'}));world.add(sky);
  for(let i=0;i<26;i++){const bw=6+(i*37%9),bh=12+(i*53%40),x=-110+i*9,z=-60-(i*29%30);mk(G.box,new THREE.MeshStandardMaterial({color:show?0x0d1018:0x8f9aa3,roughness:.8,emissive:show?0x302812:0,emissiveIntensity:show?.25:0}),bw,bh,bw,x,bh/2,z)}
  return;}
 scene.background=new THREE.Color(bright?0xdfe2e5:0x050506);
 const wallMat=new THREE.MeshStandardMaterial({color:{arena:0x141518,dome:0x101114,hall:0x1c1a1c,messe:0xe9ebed,ballroom:0x4a3a30,conf:0xd8d4cc}[s.venue],roughness:.9});
 mk(G.box,wallMat,v.w,v.h,.4,0,v.h/2,-6-.2);
 mk(G.box,wallMat,.4,v.h,v.d,-v.w/2,v.h/2,v.d/2-6);mk(G.box,wallMat,.4,v.h,v.d,v.w/2,v.h/2,v.d/2-6);
 if(s.venue==='dome'){const roof=new THREE.Mesh(new THREE.SphereGeometry(v.w*.75,64,24,0,Math.PI*2,0,Math.PI*.32),new THREE.MeshStandardMaterial({color:0xd9dde2,roughness:.9,side:THREE.BackSide,emissive:0x1a1c22,emissiveIntensity:show?.12:.6}));roof.position.set(0,-v.w*.75*.62+v.h*1.2,v.d/2-6);world.add(roof)}
 else{mk(G.box,new THREE.MeshStandardMaterial({color:bright?0xf2f3f4:0x0d0e10,roughness:.9}),v.w,.3,v.d,0,v.h,v.d/2-6)}
 // roof trusses / grid
 if(s.venue==='arena'||s.venue==='dome'){for(let z=0;z<v.d-10;z+=8)rod([-v.w/2,v.h-1.5,z],[v.w/2,v.h-1.5,z],.18,M.dark)}
 if(s.venue==='messe'){const pm=new THREE.MeshBasicMaterial({color:0xffffff});for(let x=-v.w/2+5;x<v.w/2;x+=6)for(let z=-2;z<v.d-10;z+=6){mk(G.box,pm,2.4,.05,.5,x,v.h-.2,z)}}
 if(s.venue==='ballroom'){const cm=new THREE.MeshBasicMaterial({color:new THREE.Color(0xffe2a8).multiplyScalar(2.2),toneMapped:false});for(let x=-8;x<=8;x+=8)for(let z=6;z<22;z+=8){for(let i=0;i<18;i++){const a=i/18*Math.PI*2;const b=new THREE.Mesh(G.sph,cm);b.scale.setScalar(.07);b.position.set(x+Math.cos(a)*.7,v.h-1.1-(i%3)*.15,z+Math.sin(a)*.7);world.add(b)}const pl=new THREE.PointLight(0xffd59a,show?8:30,14,2);pl.position.set(x,v.h-1.4,z);world.add(pl)}
  const cloth=new THREE.MeshStandardMaterial({color:0xf3f0ea,roughness:.8});for(let x=-10;x<=10;x+=4.2)for(let z=7;z<22;z+=4.2)mk(new THREE.CylinderGeometry(.9,.95,.74,32),cloth,1,1,1,x+(z%2),.37,z)}
 if(s.venue==='conf'){const ch=new THREE.MeshStandardMaterial({color:0x2a2d33,roughness:.7});for(let r=0;r<9;r++)for(let c=-9;c<=9;c++){if(Math.abs(c)<1)continue;mk(G.box,ch,.48,.45,.46,c*.62,.23,4.5+r*1.1);mk(G.box,ch,.48,.5,.06,c*.62,.7,4.5+r*1.1+.22)}
  const lm=new THREE.MeshBasicMaterial({color:0xffffff});for(let x=-8;x<=8;x+=4)for(let z=0;z<16;z+=4)mk(G.box,lm,1.2,.03,1.2,x,v.h-.17,z)}
 if(s.venue==='hall'){const seat=new THREE.MeshStandardMaterial({color:0x5a1418,roughness:.85});for(let r=0;r<14;r++){const y=Math.max(0,(r-4)*.32),z=7+r*1.05;if(y>0)mk(G.box,new THREE.MeshStandardMaterial({color:0x1d1a1a,roughness:.9}),v.w-2,y,1.05,0,y/2,z);for(let c=-13;c<=13;c++){if(Math.abs(c)===4)continue;mk(G.box,seat,.5,.45,.5,c*.56,y+.23,z);mk(G.box,seat,.5,.55,.1,c*.56,y+.72,z+.24)}}
  // proscenium
  const pm=new THREE.MeshStandardMaterial({color:0x111012,roughness:.95});mk(G.box,pm,4,v.h,1,-v.w/2+2,v.h/2,4.2);mk(G.box,pm,4,v.h,1,v.w/2-2,v.h/2,4.2);mk(G.box,pm,v.w,3,1,0,v.h-1.5,4.2)}
 if(s.venue==='arena'||s.venue==='dome'){// stand tiers on sides
  const tm=new THREE.MeshStandardMaterial({color:0x1a1c22,roughness:.95});for(const sd of[-1,1])for(let k=0;k<10;k++){mk(G.box,tm,2,1+k*1.1,v.d-20,sd*(v.w/2-1-k*2),(1+k*1.1)/2,v.d/2)}}
}
function stageDeck(s,v,x0,x1,z){if(v.stage<.2)return;const w=x1-x0+6,dm=new THREE.MeshStandardMaterial({color:0x101012,roughness:.6});
 mk(G.box,dm,w,v.stage,7,(x0+x1)/2,v.stage/2,z+2.6);mk(G.box,new THREE.MeshStandardMaterial({color:0x050505,roughness:1}),w,v.stage-.02,.02,(x0+x1)/2,v.stage/2,z+6.11)}

/* crowd with penlights (instanced) */
function crowd(s,v,zs,ze,xs){const n0=[];for(let z=zs;z<ze;z+=.9)for(let x=-xs;x<=xs;x+=.62){if(Math.random()<.08)continue;n0.push([x+(Math.random()-.5)*.25,z+(Math.random()-.5)*.25])}
 const n=Math.min(n0.length,5200);const body=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.21,1.0,3,8),M.crowd,n);const head=new THREE.InstancedMesh(G.sph,M.crowd,n);
 const pc=['#ff3c7a','#38b6ff','#ffffff','#ffd23c','#b04cff'],pick=pc[(s.name||'x').length%pc.length];
 const plMat=new THREE.MeshBasicMaterial({color:new THREE.Color(pick).multiplyScalar(2.2),toneMapped:false});const pens=new THREE.InstancedMesh(new THREE.CylinderGeometry(.018,.018,.32,6),plMat,n);
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(1,1,1);
 for(let i=0;i<n;i++){const [x,z]=n0[i],hh=.9+Math.random()*.12;m.compose(new THREE.Vector3(x,hh*.78,z),q,new THREE.Vector3(1,hh,1));body.setMatrixAt(i,m);m.compose(new THREE.Vector3(x,hh*1.5+.06,z),q,new THREE.Vector3(.11,.12,.11));head.setMatrixAt(i,m);
  const e=new THREE.Euler((Math.random()-.5)*.6,0,(Math.random()-.5)*.8);const on=Math.random()<.32;m.compose(new THREE.Vector3(x+(Math.random()-.5)*.3,hh*1.5+.45+Math.random()*.2,z),new THREE.Quaternion().setFromEuler(e),on?sc:new THREE.Vector3(0,0,0));pens.setMatrixAt(i,m)}
 world.add(body,head,pens);penlights=pens;}

/* ---------- build ---------- */
function build(s){
 if(world){scene.remove(world);world.traverse(o=>{if(o.geometry&&!Object.values(G).includes(o.geometry))o.geometry.dispose();if(o.material&&o.material.map&&o.material.map.isCanvasTexture)o.material.map.dispose()})}
 world=new THREE.Group();scene.add(world);screens=[];beams=[];penlights=null;
 const v=VEN[s.venue]||VEN.hall,show=s.mode==='show';
 scene.fog=new THREE.FogExp2(s.venue==='messe'||s.venue==='conf'?0xdfe2e5:(s.venue==='outdoor'&&!show?0xbcd3e6:0x07070a),s.venue==='outdoor'?.004:show?.018:.01);
 shell(s,v);
 const bright=s.venue==='messe'||s.venue==='conf'||(s.venue==='outdoor'&&!show);
 const hemi=new THREE.HemisphereLight(bright?0xffffff:0x9aa6c0,bright?0xb9b3a8:0x16161a,bright?1.6:show?.08:.55);world.add(hemi);
 const key=new THREE.DirectionalLight(0xffffff,bright?2.2:show?.15:1.1);key.position.set(-12,30,30);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-30,right:30,top:30,bottom:-30,far:120});world.add(key);
 if(!show&&!bright){for(let x=-v.w/3;x<=v.w/3;x+=v.w/3){const wl=new THREE.SpotLight(0xfff1dd,600,v.h*3,.7,.6,2);wl.position.set(x,v.h-2,8);wl.target.position.set(x*.4,0,2);world.add(wl,wl.target)}}
 scene.environmentIntensity=bright?1:show?.12:.35;
 renderer.toneMappingExposure=bright?1.0:show?1.05:1.15;
 bloom.strength=bright?.25:show?.62:.45;bloom.radius=show?.38:.3;bloom.threshold=bright?.96:.88;

 // screens layout
 const isLED=s.type==='led'||!s.type;const W=s.w,H=s.h,z=0,stage=v.stage;
 const off=s.place==='left'?-(W*.35):s.place==='right'?W*.35:0;
 const hanging=s.inst==='hanging';
 const y0=hanging?Math.max(stage+1.2,Math.min(v.h-H-2.5,stage+2.4)):stage+(isLED?.15:.9);
 const built=show?1:.62;
 let x0=off-W/2,x1=off+W/2;
 const mains=[{x:off,y:y0,w:W,h:H,z,cols:isLED?s.cols:16,rows:isLED?s.rows:9,built,main:true,mode:s.mode,name:s.name}];
 if(s.sides&&isLED){const sw=s.sides[0]*.5,sh=s.sides[1]*.5;for(const d of[-1,1]){const cx=d<0?x0-1.8-sw/2:x1+1.8+sw/2;mains.push({x:cx,y:Math.max(y0,y0+(H-sh)/2),w:sw,h:sh,z:.8,cols:s.sides[0],rows:s.sides[1],built,main:false,mode:s.mode,name:''})}
  x0=mains[1].x-mains[1].w/2;x1=mains[2].x+mains[2].w/2}
 stageDeck(s,v,x0,x1,z);
 if(s.type==='none'){cases(-2,3,6);person(-1,4,{crew:true});person(1.6,3.4,{crew:true,col:'green'})}
 else if(s.type==='projector'){const o=mains[0];mk(G.box,M.black,o.w+.3,o.h+.3,.05,o.x,o.y+o.h/2,z-.02);ledWall(Object.assign({},o,{cols:1,rows:1}));
  const pz=Math.min(v.d-14,o.w*1.7+4);mk(G.box,M.dark,.7,.38,.6,o.x,1.5,pz);rod([o.x,0,pz],[o.x,1.3,pz],.05,M.metal);
  if(show){beam([o.x,1.5,pz-.3],[o.x,o.y+o.h/2,z+.1],0xbfc8ff,o.w*.62)}}
 else if(s.type==='monitor'){const n=Math.max(1,Math.min(4,Math.round(W/2))),mw=Math.min(2.2,W/n);for(let i=0;i<n;i++){const x=-((n-1)*(mw+.9))/2+i*(mw+.9);rod([x,stage,1.2],[x,stage+1.2,1.2],.04,M.dark);mk(G.box,M.black,mw+.06,mw*.5625+.06,.08,x,stage+1.2+mw*.28,1.18);ledWall({x,y:stage+1.2,w:mw,h:mw*.5625,z:1.2,cols:1,rows:1,built:1,main:i===0,mode:'show',name:s.name})}}
 else mains.forEach(o=>{ledWall(o);
  if(hanging){const ty=o.y+o.h+.55;truss(o.x-o.w/2-.4,o.x+o.w/2+.4,ty,o.z);const nH=Math.max(2,Math.ceil(o.w/2.4));for(let i=0;i<=nH;i++){const x=o.x-o.w/2+o.w*i/nH;rod([x,ty-.15,o.z],[x,o.y+o.h,o.z],.008,M.metal);hoist(x,ty+.1,o.z,v.h-.2)}}
  else{mk(G.box,M.dark,o.w+.5,.14,1.4,o.x,stage+.07,o.z+.2);for(let x=o.x-o.w/2;x<=o.x+o.w/2+.01;x+=1.5)rod([x,stage+.14,o.z+.85],[x,o.y+o.h*.85,o.z-.08],.03,M.metal);if(o.y>stage+.2)mk(G.box,M.black,o.w,o.y-stage,.08,o.x,(o.y+stage)/2,o.z)}});

 const mid=(x0+x1)/2;
 if(!show){ // setup scene
  person(mid-W*.2,1.6,{crew:true,y:stage,arms:'up',panel:true});person(mid+W*.15,2.3,{crew:true,y:stage,col:'green',ry:.6});person(mid-W*.38,3,{crew:true,y:stage,ry:-.8});
  if(isLED&&s.type!=='projector'){const lh=Math.min(mains[0].y+mains[0].h*built-1.4,9);scissor(x1+1.4,1.2,Math.max(1.5,lh-stage)).position.y=stage;person(x1+1.4,1.2,{crew:true,y:stage+Math.max(1.5,lh-stage)+.06,arms:'up'})}
  cases(x0-.6,v.stage>.2?8.2:4.2,Math.min(7,3+Math.round(W/4)),.1);cases(mid+1.5,v.stage>.2?9.5:5.6,3,-.2);
  person(mid+1,v.stage>.2?10.6:6.6,{crew:true,ry:2.6});person(mid-2,v.stage>.2?11.2:7.2,{crew:true,col:'green',ry:-2.8});
  // cable runs
  const cm=new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:.5});for(let k=0;k<3;k++){const pts=[];for(let i=0;i<=20;i++){const t=i/20;pts.push(new THREE.Vector3(mid+k*.3+Math.sin(t*5+k)*.5,.02,(v.stage>.2?6.4:1.5)+t*14))}world.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,.018,6),cm))}
 }else{ // show
  if(s.venue!=='conf'&&s.venue!=='messe'){const cols=[0x7a5cff,0x2ba7e8,0xff3c8a,0x7a5cff,0x2ba7e8,0xff3c8a];const ty=Math.min(v.h-1.2,y0+H+3.2);const xs=Math.max(W,x1-x0)/2+2;
   for(let i=0;i<6;i++){const x=-xs+i*(2*xs)/5;beam([mid+x,ty,1.4],[mid+x*.35+(i%2?3:-3),0,12+i%3*3],cols[i],1.9)}
   truss(mid-xs-.5,mid+xs+.5,ty+.35,1.4)}
  const zs=s.venue==='ballroom'?0:(v.stage>.2?8.5:5),xs=Math.min(v.w/2-3,{arena:22,dome:30,hall:7,messe:10,ballroom:0,conf:0,outdoor:26}[s.venue]||10);
  if(xs>0)crowd(s,v,zs,zs+Math.min(26,v.d*.4),xs);
  if(s.venue==='messe'){for(let i=0;i<14;i++)person(-9+Math.random()*18,5+Math.random()*10,{ry:Math.random()*6})}
  // FOH
  const fz=Math.min(v.d-12,zs+12);mk(G.box,M.dark,3.2,.95,1.1,mid,.48,fz);const scr=new THREE.MeshBasicMaterial({color:new THREE.Color(0x3ccfff).multiplyScalar(1.6),toneMapped:false});mk(G.box,scr,.7,.4,.02,mid-.6,1.25,fz-.2);mk(G.box,scr,.7,.4,.02,mid+.6,1.25,fz-.2);
  person(mid-.6,fz+.8,{crew:true,ry:Math.PI});person(mid+.7,fz+.8,{crew:true,col:'green',ry:Math.PI});
 }
 // camera framing
 const span=Math.max(x1-x0,6),topY=y0+H;const aspect=camera.aspect;const fovR=THREE.MathUtils.degToRad(camera.fov);
 const dist=Math.max((span*1.18)/(2*Math.tan(fovR/2)*aspect),(topY+1)/(Math.tan(fovR/2))*.95,7);
 let cy=Math.min(Math.max(1.7,topY*.32),8);const camZ=z+dist;if(s.venue==='hall'){const riser=Math.max(0,((camZ-7)/1.05-4)*.32);cy=Math.max(cy,riser+1.35)}
 camera.position.set(mid+dist*.12,cy,camZ);controls.target.set(mid,Math.max(stage+.8,y0+H*.42),z);controls.maxDistance=dist*1.8;controls.minDistance=Math.max(4,dist*.35);controls.update();
 home={p:camera.position.clone(),t:controls.target.clone()};userMoved=false;
}
let home=null;

function resize(){const w=frame.clientWidth||960,h=Math.round(w*9/16);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(frame);resize();

let visible=true;new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)loop()}).observe(frame);
function loop(){if(running)return;running=true;requestAnimationFrame(tick)}
function tick(now){if(!visible||document.hidden){running=false;return}
 const t=(now-t0)/1000;
 if(home&&!userMoved){const a=Math.sin(t*.12)*.07;const p=home.p.clone().sub(home.t);p.applyAxisAngle(new THREE.Vector3(0,1,0),a);camera.position.copy(home.t).add(p)}
 controls.update();
 screens.forEach(sc=>paint(sc,t));
 beams.forEach(b=>{const k=Math.sin(t*.7+b.ph)*.5+.5;b.m.material.uniforms.a.value=.08+.12*k});
 composer.render();requestAnimationFrame(tick)}

let lastKey='';
window.SR3D={ready:true,update(s){const k=JSON.stringify(s);if(k===lastKey)return;lastKey=k;S=s;frame.classList.add('is-3d');build(s);if(s.mode==='show')vid.play().catch(()=>{});loop()},
 snapshot(label){composer.render();const c=document.createElement('canvas');c.width=1600;c.height=900;const x=c.getContext('2d');x.drawImage(canvas,0,0,1600,900);
  if(label){x.fillStyle='rgba(10,11,13,.78)';x.fillRect(0,840,1600,60);x.fillStyle='#c9a35a';x.font='600 15px Helvetica,Arial,sans-serif';x.textBaseline='middle';x.fillText('LOTUS VISUAL  SETUP VIEW',26,870);x.fillStyle='#eee9df';x.font='500 17px "Hiragino Sans","Noto Sans JP",sans-serif';x.fillText(label,220,870)}
  return c}};
window.dispatchEvent(new Event('sr3d-ready'));
}
