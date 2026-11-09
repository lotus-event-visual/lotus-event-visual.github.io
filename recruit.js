/* 採用ページ — ゲーム・クイズ・応募メモ (Friday 2026-11-10) */
(function(){
'use strict';
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}

/* ---------- 表示アニメーション ---------- */
function reveal(){
  var els=$$('.rc-reveal, .rc-steps');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('is-in');});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});},{threshold:.15});
  els.forEach(function(e){io.observe(e);});
}

/* ---------- ゲーム:LED データ配線パズル ---------- */
var LEVELS=[
  {name:'ホール',w:5,h:3,blocks:[],tip:'まずは 15 枚。IN の 1 枚目から、隣どうしを 1 本の線でつないでいきます。'},
  {name:'アリーナ',w:6,h:4,blocks:[[4,3],[5,3]],tip:'右上は吊り点の都合でパネルなし。斜線のマスは飛ばして、残り 22 枚を 1 本に。'},
  {name:'ドーム',w:7,h:4,blocks:[[3,1],[3,2]],tip:'真ん中に柱。どこから回り込むかを先に考えるのが、現場のチーフの仕事です。'}
];
var lv=0,path=[],t0=0,timer=null,done=false;
function key(x,y){return x+','+y;}
function best(i,v){
  var k='lotus-rc-best-'+i;
  try{ if(v!==undefined){var o=parseFloat(localStorage.getItem(k));if(!o||v<o)localStorage.setItem(k,String(v));} return parseFloat(localStorage.getItem(k))||0; }catch(e){return 0;}
}
function fmt(ms){return (ms/1000).toFixed(1);}
function build(){
  var L=LEVELS[lv],board=$('#rc-board');if(!board)return;
  board.innerHTML='';board.classList.remove('done');
  board.style.gridTemplateColumns='repeat('+L.w+',minmax(0,1fr))';
  var blk={};L.blocks.forEach(function(b){blk[key(b[0],b[1])]=1;});
  for(var y=L.h-1;y>=0;y--){for(var x=0;x<L.w;x++){
    var b=document.createElement('button');b.type='button';b.dataset.x=x;b.dataset.y=y;
    if(blk[key(x,y)]){b.className='block';b.disabled=true;b.innerHTML='<span>'+(lv===2?'柱':'×')+'</span>';b.setAttribute('aria-label','パネルなし');}
    else{b.setAttribute('aria-label','パネル '+(x+1)+'列 '+(y+1)+'段');if(x===0&&y===0)b.classList.add('start');}
    board.appendChild(b);
  }}
  path=[];done=false;clearInterval(timer);timer=null;t0=0;
  $('#rc-time').textContent='0.0';$('#rc-count').textContent='0 / '+(L.w*L.h-L.blocks.length);
  var bs=best(lv);$('#rc-best').textContent=bs?fmt(bs):'—';
  msg(L.tip,'');
  $$('.rc-level').forEach(function(c,i){c.setAttribute('aria-pressed',i===lv?'true':'false');});
  hint();
}
function msg(t,c){var m=$('#rc-msg');m.textContent=t;m.className='rc-board-msg'+(c?' '+c:'');}
function cell(x,y){return $('#rc-board button[data-x="'+x+'"][data-y="'+y+'"]');}
function hint(){
  $$('#rc-board button').forEach(function(b){b.classList.remove('head','next');});
  if(done)return;
  if(!path.length){var s=cell(0,0);if(s)s.classList.add('next');return;}
  var h=path[path.length-1];cell(h[0],h[1]).classList.add('head');
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var c=cell(h[0]+d[0],h[1]+d[1]);if(c&&!c.disabled&&!c.classList.contains('on'))c.classList.add('next');});
}
function tap(e){
  var b=e.target.closest('button');if(!b||b.disabled||done)return;
  var x=+b.dataset.x,y=+b.dataset.y,L=LEVELS[lv],total=L.w*L.h-L.blocks.length;
  if(path.length&&b.classList.contains('on')){
    // 途中のパネルを押したら、そこまで巻き戻す(ケーブルを抜き直す)
    var idx=path.findIndex(function(p){return p[0]===x&&p[1]===y;});
    path.splice(idx+1).forEach(function(p){cell(p[0],p[1]).classList.remove('on');});
    msg('そこまでケーブルを抜き直しました。','');hint();$('#rc-count').textContent=path.length+' / '+total;return;
  }
  if(!path.length){
    if(!(x===0&&y===0)){msg('信号は左下の IN から入ります。まずは IN のパネルから。','ng');return;}
    t0=performance.now();timer=setInterval(function(){$('#rc-time').textContent=fmt(performance.now()-t0);},100);
  }else{
    var h=path[path.length-1];
    if(Math.abs(h[0]-x)+Math.abs(h[1]-y)!==1){msg('ケーブルが届くのは、上下左右のとなりのパネルだけ。','ng');return;}
  }
  path.push([x,y]);b.classList.add('on');
  $('#rc-count').textContent=path.length+' / '+total;
  if(path.length===total){
    done=true;clearInterval(timer);var ms=performance.now()-t0;$('#rc-time').textContent=fmt(ms);
    best(lv,ms);$('#rc-best').textContent=fmt(best(lv));
    $('#rc-board').classList.add('done');
    var lines=['全 '+total+' 枚、1 本でつながりました(',fmt(ms),' 秒)。本番では、この配線図を前日までに描いて、当日は 1 本の抜けもなく組みます。'];
    msg(lines.join('')+(lv<LEVELS.length-1?' 次のステージへどうぞ。':' 全ステージ制覇。この感覚が好きなら、きっと向いています。'),'ok');
  }else{
    // 行き止まりの判定
    var h2=path[path.length-1],free=[[1,0],[-1,0],[0,1],[0,-1]].some(function(d){var c=cell(h2[0]+d[0],h2[1]+d[1]);return c&&!c.disabled&&!c.classList.contains('on');});
    if(!free)msg('行き止まり。つないだパネルを押すと、そこまで抜き直せます。','ng');else if($('#rc-msg').classList.contains('ng'))msg(LEVELS[lv].tip,'');
  }
  hint();
}

/* ---------- クイズ:現場のことば ---------- */
var QS=[
  {q:'現場で「バラシ」と言われたら、何をする?',o:['本番が終わったあとの撤去と片付け','映像の素材をばらばらに編集する','チームを 2 班に分ける'],a:0,ex:'<b>正解は撤去。</b>組むのが「仕込み」、片付けが「バラシ」。終わりの時間が決まっているので、実は一番チームワークが試される時間です。'},
  {q:'「ゲネ(ゲネプロ)」とは?',o:['機材の点検表','本番と同じ流れで通す最後のリハーサル','照明の色の名前'],a:1,ex:'<b>本番と同じ流れで通す、最後のリハーサル。</b>映像の切り替えのタイミングも、ここで最終確認します。'},
  {q:'LED ビジョンの「2.6mm ピッチ」が表すものは?',o:['パネルの厚み','パネル 1 枚の重さ','となり合う LED の中心どうしの間隔'],a:2,ex:'<b>LED の間隔。</b>数字が小さいほど細かく、近くで見てもきれい。会場の広さで選び分けます。'},
  {q:'重たい機材ケースを運ぶとき、LOTUS VISUAL のルールは?',o:['重たいものは 1 人で持たない','力自慢が 1 人で運ぶ','急いで走って運ぶ'],a:0,ex:'<b>1 人で持たない。</b>台車とチームで運びます。体力に自信がなくても大丈夫、と求人に書いているのはこのためです。'},
  {q:'本番前の「仕込み」とは?',o:['お弁当の準備','本番前の設営と準備','打ち上げの段取り'],a:1,ex:'<b>設営と準備。</b>LED を組み、配線し、映像を出して確かめる。ここが 8 割、と言う人もいます。'}
];
var qi=0,score=0,answered=false;
function qrender(){
  var Q=QS[qi];$('#rc-qno').textContent='Q'+(qi+1)+' / '+QS.length;$('#rc-qscore').textContent='正解 '+score;
  $('#rc-q').textContent=Q.q;var box=$('#rc-opts');box.innerHTML='';
  Q.o.forEach(function(t,i){var b=document.createElement('button');b.type='button';b.textContent=t;b.addEventListener('click',function(){qanswer(i,b);});box.appendChild(b);});
  $('#rc-ex').innerHTML='';answered=false;$('#rc-qnext').hidden=true;
}
function qanswer(i,b){
  if(answered)return;answered=true;var Q=QS[qi];
  if(i===Q.a){score++;b.classList.add('right');}else{b.classList.add('wrong');$$('#rc-opts button')[Q.a].classList.add('right');}
  $('#rc-ex').innerHTML=Q.ex;$('#rc-qscore').textContent='正解 '+score;
  var n=$('#rc-qnext');n.hidden=false;n.textContent=qi<QS.length-1?'次の問題へ →':'結果を見る →';
}
function qnext(){
  if(qi<QS.length-1){qi++;qrender();return;}
  var r=score===5?'満点。もう現場のことばで話せます。あとは体で覚えるだけ。':score>=3?score+' 問正解。上出来です。残りは STEP1 の研修で。':score+' 問正解。大丈夫、知らなくて当たり前。先輩が細かく教えます。';
  $('#rc-q').textContent=r;$('#rc-opts').innerHTML='';$('#rc-ex').innerHTML='';
  var n=$('#rc-qnext');n.textContent='もう一度挑戦する ↺';n.onclick=function(){qi=0;score=0;n.onclick=null;qrender();};
}

/* ---------- 応募メモ(メールを作る) ---------- */
function entry(){
  var f=$('#rc-form');if(!f)return;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var g=function(n){var el=f.elements[n];return el?String(el.value||'').trim():'';};
    var kinds=$$('input[name="kind"]:checked',f).map(function(i){return i.value;});
    if(!g('name')){msg2('お名前を入れてください。');return;}
    if(!g('contact')){msg2('電話番号かメールアドレスを入れてください。');return;}
    var body=['【採用への応募・相談】','お名前:'+g('name'),'連絡先:'+g('contact'),'希望の形:'+(kinds.join('・')||'相談したい'),'映像・イベントの経験:'+(g('exp')||'—'),'',g('msg')||'',''].join('\n');
    location.href='mailto:lotus@lotusgroupholdings.com?subject='+encodeURIComponent('【採用】映像設営スタッフへの応募・相談('+g('name')+')')+'&body='+encodeURIComponent(body);
    msg2('メールアプリが開きます。そのまま送信してください。開かない場合はお電話でどうぞ。');
  });
  function msg2(t){$('#rc-fmsg').textContent=t;}
}

function init(){
  reveal();
  if($('#rc-board')){
    $('#rc-board').addEventListener('click',tap);
    $$('.rc-level').forEach(function(c,i){c.addEventListener('click',function(){lv=i;build();});});
    $('#rc-reset').addEventListener('click',build);
    build();
  }
  if($('#rc-q')){$('#rc-qnext').addEventListener('click',function(){if(!this.onclick)qnext();});qrender();}
  entry();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
