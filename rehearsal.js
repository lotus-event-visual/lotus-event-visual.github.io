'use strict';
const items=[
['素材','使用するファイルと順番が、進行表の内容と合っている。差替えの有無も確認する。'],
['全画面表示','本番と同じ表示方法で、余計なウインドウ・操作画面が会場側へ出ていないか確認する。'],
['文字と画角','客席側で、小さな文字・端の切れ・縦横の見え方を確認する。'],
['動画の開始・終わり','冒頭と末尾、繰返し時のつながりを実際に再生する。静止画だけで判断しない。'],
['音声','音声が必要な素材は、音響担当と再生の合図・出力先・聞こえ方を確認する。'],
['切替と待機画面','次の素材への切替と、素材終了後に出す画面を進行担当と合わせる。'],
['中断時の連絡','止まった場合の連絡先と、待機画面へ切り替える判断者を共有する。']
];
function format(scope,who,states,note){return ['本番前の映像チェック',`範囲：${scope.trim()||'未記入'}`,`時刻・担当：${who.trim()||'未記入'}`,...items.map((x,i)=>`${x[0]}：${states[i]||'未確認'}`),'未解決・申し送り：',note.trim()||'未記入'].join('\n');}
if(typeof module!=='undefined')module.exports={items,format};
if(typeof document!=='undefined'){
const box=document.getElementById('checks');
items.forEach(([name,desc],i)=>{const row=document.createElement('div');row.className='row';const label=document.createElement('label');label.htmlFor='state'+i;label.textContent=`${i+1}. ${name}`;const p=document.createElement('p');p.textContent=desc;const select=document.createElement('select');select.id='state'+i;['未確認','確認済み','要対応','対象外'].forEach(t=>{const o=document.createElement('option');o.textContent=t;o.value=t;select.append(o)});row.append(label,p,select);box.append(row);select.addEventListener('change',update)});
const states=()=>items.map((_,i)=>document.getElementById('state'+i).value);
function update(){const s=states();document.getElementById('summary').textContent=`確認済み ${s.filter(v=>v==='確認済み').length}／${s.length}　未確認 ${s.filter(v=>v==='未確認').length}　要対応 ${s.filter(v=>v==='要対応').length}　対象外 ${s.filter(v=>v==='対象外').length}`;}
function build(){const t=format(document.getElementById('scope').value,document.getElementById('who').value,states(),document.getElementById('note').value);document.getElementById('result').textContent=t;return t}
document.getElementById('build').addEventListener('click',build);
document.getElementById('save').addEventListener('click',()=>{const a=document.createElement('a');const url=URL.createObjectURL(new Blob([build()],{type:'text/plain;charset=utf-8'}));a.href=url;a.download='rehearsal-handover.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('notice').textContent='保存を開始しました。ダウンロード先でファイルを確認してください。'});update();
}
