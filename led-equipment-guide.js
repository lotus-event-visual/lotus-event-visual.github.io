/* Local guidance only: model choice is not a compatibility or installation approval. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LotusLEDGuide=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const roles=[
 {role:'processor',title:'画面に合わせる',name:'LEDプロセッサー',help:'映像をLEDの並びへ。パネル側の仕様に合う機種を確認します。'},
 {role:'signal',title:'映像を届ける',name:'信号ケーブル・分配',help:'機器の端子と会場内の距離に合わせて、経路と種類を考えます。'},
 {role:'powerbox',title:'電源を分ける',name:'電源BOX・電源分配',help:'会場の電源と機材の条件を確認。必要容量・回路は別途設計します。'},
 {role:'support',title:'画面を支える',name:'支持部材',help:'自立・吊りなどの設置方法に合わせて、構造と安全条件を設計します。'}
];
function snapshot(state,catalog=[]){return roles.map(role=>{const line=state.lines.find(l=>l.origin==='auto'&&l.role===role.role);const product=line&&catalog.find(p=>p.key===line.model);return {...role,lineId:line?.id||null,model:product?.name||(line?.model||null),quantity:line?.qty??null,status:!line?'おすすめ明細から除外中':line.model?'機材入力済み・適合は要確認':'機種は相談して決められます'};});}
function mount(root,onChoose){
 const heading=document.createElement('h3');heading.textContent='LEDと一緒に、何を考える？';
 const intro=document.createElement('p');intro.textContent='主な4つの役割から、気になる明細へ。機種が分からなくても、未定のまま相談できます。';
 const grid=document.createElement('div');grid.className='led-guide-grid';
 const cards=roles.map((role,i)=>{const card=document.createElement('article');card.className='led-guide-card';const number=document.createElement('span');number.className='led-guide-number';number.textContent='0'+(i+1);const title=document.createElement('h4');title.textContent=role.title;const name=document.createElement('strong');name.textContent=role.name;const help=document.createElement('p');help.textContent=role.help;const status=document.createElement('p');status.className='led-guide-status';const selection=document.createElement('p');selection.className='led-guide-selection';const button=document.createElement('button');button.type='button';button.className='lotus-control lotus-control--secondary';button.textContent='この明細を見る ↗';button.addEventListener('click',()=>onChoose(role.role));card.append(number,title,name,help,status,selection,button);grid.append(card);return {card,status,selection,button};});
 const note=document.createElement('p');note.className='estimate-small';note.textContent='この4項目は構成の一部です。制御PC・電源ケーブル等も明細で確認します。機材入力は適合確認や設置の安全確認を意味しません。';
 root.append(heading,intro,grid,note);
 return {update(state,catalog){root.hidden=state.screenType!=='led';snapshot(state,catalog).forEach((entry,i)=>{const c=cards[i];c.status.textContent=entry.status;c.selection.textContent=entry.lineId?(entry.model||'型式未定')+' ／ '+(entry.quantity===null?'数量未定':entry.quantity+'（明細の数量）'): '別の明細に入力している場合もあります。';c.button.disabled=!entry.lineId;c.button.textContent=entry.lineId?'この明細を見る ↗':'明細から除外中';c.card.dataset.selected=String(!!entry.model);});}};
}
return {snapshot,mount};
});
