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
    location.href='mailto:lotus@lotusgroupholdings.com,office@lotusgroupholdings.com?subject='+encodeURIComponent('【採用】映像設営スタッフへの応募・相談('+g('name')+')')+'&body='+encodeURIComponent(body);
    msg2('メールアプリが開きます。そのまま送信してください。');
  });
  function msg2(t){$('#rc-fmsg').textContent=t;}
}

function init(){
  reveal();
  if($('#rc-q')){$('#rc-qnext').addEventListener('click',function(){if(!this.onclick)qnext();});qrender();}
  entry();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
