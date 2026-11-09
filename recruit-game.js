/* 採用ページ ゲーム「LED 現場チーフへの道」 (Friday 2026-11-10)
   9 会場。プロセッサーの出力(IN)ごとにつなげる枚数の上限があり、柱や吊り点を避けて全パネルを配線する。
   ドラッグでも、タップでも遊べる。星・自己ベスト・称号を端末に保存(保存できない環境でも遊べる)。 */
(function(){
'use strict';
var LEVELS=[
 {name:'会議室',scale:'約50席',w:4,h:3,ports:[[0,0]],cap:12,blocks:[]},
 {name:'宴会場',scale:'約300名',w:5,h:3,ports:[[0,0]],cap:15,blocks:[]},
 {name:'ライブハウス',scale:'キャパ300',w:6,h:3,ports:[[0,0]],cap:16,blocks:[[5,2],[4,2]]},
 {name:'ホール',scale:'約1,000席',w:6,h:4,ports:[[0,0],[5,0]],cap:12,blocks:[]},
 {name:'展示会',scale:'大型ブース',w:7,h:4,ports:[[0,0],[6,0]],cap:14,blocks:[[3,1],[3,2]]},
 {name:'アリーナ',scale:'仕込み',w:8,h:4,ports:[[0,0],[3,0],[7,0]],cap:11,blocks:[[4,3],[3,3]]},
 {name:'アリーナ 本番',scale:'1万人規模',w:9,h:5,ports:[[0,0],[4,0],[8,0]],cap:15,blocks:[[2,2],[5,2]]},
 {name:'ドーム',scale:'仕込み',w:10,h:5,ports:[[0,0],[3,0],[6,0],[9,0]],cap:13,blocks:[[4,2],[5,2],[0,4],[9,4]]},
 {name:'ドーム 本番',scale:'5万人規模',w:12,h:5,ports:[[0,0],[3,0],[6,0],[9,0],[11,0]],cap:12,blocks:[[2,3],[5,3],[6,3],[9,3]]}
];
var COLORS=['#43e0c2','#f0b85a','#a98bff','#ff7d9c','#5cc4ff'];
var RANKS=[[0,'見習い'],[6,'アシスタント'],[12,'テクニシャン'],[18,'映像チーフ'],[24,'ドーム級チーフ']];
var KEY='lotus-rc-game-v2';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){}}
var data=load(); // {i:{stars,best}}
var root,lv=0,chains=[],active=0,t0=0,timer=null,done=false,dragging=false,blk={},portAt={};
function $(s,r){return (r||document).querySelector(s);}
function total(L){return L.w*L.h-L.blocks.length;}
function stars(L,sec){var n=total(L);return sec<=n*0.9?3:sec<=n*1.8?2:1;}
function sumStars(){var s=0;for(var i=0;i<LEVELS.length;i++)s+=(data[i]&&data[i].stars)||0;return s;}
function rank(){var s=sumStars(),r=RANKS[0][1];RANKS.forEach(function(x){if(s>=x[0])r=x[1];});return r;}
function unlocked(i){return i===0||(data[i-1]&&data[i-1].stars>0);}
function k(x,y){return x+','+y;}

function renderLevels(){
  var box=$('#rcg-levels');box.innerHTML='';
  LEVELS.forEach(function(L,i){
    var b=document.createElement('button');b.type='button';b.className='rcg-lv'+(i===lv?' is-on':'')+(unlocked(i)?'':' is-lock');
    var st=(data[i]&&data[i].stars)||0;
    b.innerHTML='<small>STAGE '+(i+1)+'</small><strong>'+L.name+'</strong><span class="st">'+'★★★'.slice(0,st)+'<i>'+'★★★'.slice(st)+'</i></span>';
    if(!unlocked(i)){b.disabled=true;b.innerHTML='<small>STAGE '+(i+1)+'</small><strong>🔒</strong><span class="st">前のステージをクリア</span>';}
    b.addEventListener('click',function(){lv=i;build();});
    box.appendChild(b);
  });
  $('#rcg-rank').textContent=rank();$('#rcg-stars').textContent=sumStars()+' / '+(LEVELS.length*3);
}
function build(){
  var L=LEVELS[lv];done=false;clearInterval(timer);timer=null;t0=0;
  chains=L.ports.map(function(p){return [[p[0],p[1]]];});active=0;
  blk={};L.blocks.forEach(function(b){blk[k(b[0],b[1])]=1;});
  portAt={};L.ports.forEach(function(p,i){portAt[k(p[0],p[1])]=i;});
  var bd=$('#rcg-board');bd.innerHTML='';bd.className='rcg-board';bd.style.gridTemplateColumns='repeat('+L.w+',minmax(0,1fr))';
  bd.style.setProperty('--w',L.w);bd.style.setProperty('--h',L.h);
  for(var y=L.h-1;y>=0;y--)for(var x=0;x<L.w;x++){
    var c=document.createElement('div');c.className='rcg-cell';c.dataset.x=x;c.dataset.y=y;
    c.style.setProperty('--gx',x);c.style.setProperty('--gy',L.h-1-y);
    if(blk[k(x,y)]){c.classList.add('blk');c.innerHTML='<span>'+(lv>=7?'吊':'柱')+'</span>';}
    if(portAt[k(x,y)]!==undefined){c.classList.add('port');c.dataset.port=portAt[k(x,y)];c.innerHTML='<em>IN'+(portAt[k(x,y)]+1)+'</em>';}
    bd.appendChild(c);
  }
  $('#rcg-title').textContent='STAGE '+(lv+1)+' '+L.name;
  $('#rcg-scale').textContent=L.scale+' ・ パネル '+total(L)+' 枚 ・ 出力 '+L.ports.length+' 系統 ・ 1 系統 '+L.cap+' 枚まで';
  var bs=data[lv]&&data[lv].best;$('#rcg-best').textContent=bs?bs.toFixed(1):'—';
  $('#rcg-time').textContent='0.0';
  msg(lv===0?'IN1 から、となりのパネルへ指でなぞって(またはタップで)つなぎます。全部つながれば映像が流れます。':(L.ports.length>1?'出力は '+L.ports.length+' 系統。各 IN から '+L.cap+' 枚まで。どの IN で、どこまで受け持つかが勝負です。':'柱を避けて、1 本で全部つなごう。'),'');
  renderLevels();paint();
}
function cellEl(x,y){return $('#rcg-board .rcg-cell[data-x="'+x+'"][data-y="'+y+'"]');}
function owner(x,y){for(var i=0;i<chains.length;i++)for(var j=0;j<chains[i].length;j++)if(chains[i][j][0]===x&&chains[i][j][1]===y)return [i,j];return null;}
function paint(){
  var L=LEVELS[lv];
  Array.prototype.forEach.call(document.querySelectorAll('#rcg-board .rcg-cell'),function(c){
    c.classList.remove('on','head','act');c.style.removeProperty('--c');c.removeAttribute('data-dir');
  });
  chains.forEach(function(ch,i){ch.forEach(function(p,j){var c=cellEl(p[0],p[1]);c.classList.add('on');c.style.setProperty('--c',COLORS[i]);
    if(j>0){var q=ch[j-1];c.dataset.dir=(p[0]>q[0]?'l':p[0]<q[0]?'r':p[1]>q[1]?'d':'u');}
    if(j===ch.length-1){c.classList.add('head');if(i===active)c.classList.add('act');}});});
  var used=chains.reduce(function(a,c){return a+c.length;},0);
  $('#rcg-count').textContent=used+' / '+total(L);
  var bars=$('#rcg-ports');bars.innerHTML='';
  chains.forEach(function(ch,i){var d=document.createElement('button');d.type='button';d.className='rcg-port'+(i===active?' is-on':'')+(ch.length>L.cap?' over':'');d.style.setProperty('--c',COLORS[i]);
    d.innerHTML='<b>IN'+(i+1)+'</b><span><i style="width:'+Math.min(100,ch.length/L.cap*100)+'%"></i></span><small>'+ch.length+'/'+L.cap+'</small>';
    d.addEventListener('click',function(){active=i;paint();});bars.appendChild(d);});
}
function msg(t,c){var m=$('#rcg-msg');m.textContent=t;m.className='rcg-msg'+(c?' '+c:'');}
function start(){if(!t0){t0=performance.now();timer=setInterval(function(){$('#rcg-time').textContent=((performance.now()-t0)/1000).toFixed(1);},100);}}
function bump(){var b=$('#rcg-board');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');}
function touch(x,y,isDown){
  if(done)return;var L=LEVELS[lv];if(blk[k(x,y)])return;
  var o=owner(x,y);
  if(o){
    // 既存の線上: そこまで巻き戻して、その系統を操作中に
    if(isDown||o[0]===active){chains[o[0]].length=o[1]+1;active=o[0];paint();}
    return;
  }
  var ch=chains[active],h=ch[ch.length-1];
  if(Math.abs(h[0]-x)+Math.abs(h[1]-y)!==1){
    if(isDown){
      // となりに来ている別の系統の先端があれば、そちらを使う
      for(var i=0;i<chains.length;i++){var hh=chains[i][chains[i].length-1];if(Math.abs(hh[0]-x)+Math.abs(hh[1]-y)===1&&chains[i].length<L.cap){active=i;return touch(x,y,false);}}
      msg('ケーブルが届くのは、線の先端(光っているパネル)の上下左右だけ。','ng');bump();
    }
    return;
  }
  if(ch.length>=L.cap){msg('IN'+(active+1)+' は '+L.cap+' 枚まで。ここから先は、別の IN から回そう。','ng');bump();dragging=false;return;}
  start();ch.push([x,y]);paint();
  if($('#rcg-msg').classList.contains('ng'))msg('いい調子。','');
  var used=chains.reduce(function(a,c){return a+c.length;},0);
  if(used===total(L))win();
}
function win(){
  done=true;dragging=false;clearInterval(timer);var sec=(performance.now()-t0)/1000;$('#rcg-time').textContent=sec.toFixed(1);
  var L=LEVELS[lv],st=stars(L,sec),d=data[lv]||{};
  var first=!d.stars;
  d.stars=Math.max(d.stars||0,st);d.best=d.best?Math.min(d.best,sec):sec;data[lv]=d;save(data);
  $('#rcg-best').textContent=d.best.toFixed(1);
  var bd=$('#rcg-board');bd.classList.add('done');
  var n=total(L);
  var t='映像、出ました! '+sec.toFixed(1)+' 秒 '+'★★★'.slice(0,st)+'☆☆☆'.slice(st)+'。';
  t+=st<3?' ★3 は '+(n*0.9).toFixed(0)+' 秒以内。':' 文句なしの段取りです。';
  if(lv<LEVELS.length-1)t+=first?' STAGE '+(lv+2)+'「'+LEVELS[lv+1].name+'」が解放されました。':'';
  else t+=' ドーム本番まで制覇。現場で待っています。';
  msg(t,'ok');renderLevels();
  $('#rcg-next').hidden=lv>=LEVELS.length-1;
}
function cellFromPoint(e){var el=document.elementFromPoint(e.clientX,e.clientY);return el&&el.closest?el.closest('#rcg-board .rcg-cell'):null;}
function init(){
  root=$('#rcg');if(!root)return;
  var bd=$('#rcg-board');
  bd.addEventListener('pointerdown',function(e){var c=cellFromPoint(e);if(!c)return;e.preventDefault();dragging=true;touch(+c.dataset.x,+c.dataset.y,true);});
  bd.addEventListener('pointermove',function(e){if(!dragging)return;var c=cellFromPoint(e);if(c)touch(+c.dataset.x,+c.dataset.y,false);});
  window.addEventListener('pointerup',function(){dragging=false;});
  $('#rcg-reset').addEventListener('click',build);
  $('#rcg-next').addEventListener('click',function(){if(lv<LEVELS.length-1&&unlocked(lv+1)){lv++;build();$('#rcg-next').hidden=true;}});
  $('#rcg-next').hidden=true;
  // 前回の続きから
  for(var i=0;i<LEVELS.length;i++){if(unlocked(i))lv=i;}
  if(data[lv]&&data[lv].stars)lv=Math.min(lv,LEVELS.length-1);
  build();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
