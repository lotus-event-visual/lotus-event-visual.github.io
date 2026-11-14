'use strict';
/* Explicit device-local drafts. No network, autosave, or remote collection. */
(() => {
 const form=document.querySelector('#brief-form');
 const panel=document.querySelector('#saved-memos');
 if(!form||!panel)return;
 const key='lotus.consultationMemos.v1';
 const select=document.querySelector('#saved-memo-select');
 const status=document.querySelector('#saved-memo-status');
 const confirm=document.querySelector('#saved-memo-confirm');
 const prompt=document.querySelector('#saved-memo-prompt');
 const okay=document.querySelector('#saved-memo-okay');
 const cancel=document.querySelector('#saved-memo-cancel');
 const preview=document.querySelector('#saved-memo-preview');
 const previewText=document.querySelector('#saved-memo-preview-text');
 const previewDate=document.querySelector('#saved-memo-preview-date');
 const draftState=document.querySelector('#draft-save-state');
 const fields=[...form.querySelectorAll('input[name],textarea[name]')];
 const limits={date:150,venue:150,purpose:250,message:2000};
 const stages=['技術スタッフの相談','機材レンタル（LED等）','映像送出','設営・仕込み','本番対応','撤去','まだ相談中'];
 let pending=null;
 const object=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
 const validDraft=d=>object(d)&&Object.keys(d).every(k=>['type','date','venue','purpose','message','stage'].includes(k))&&['event','partner'].includes(d.type)&&Object.entries(limits).every(([k,max])=>typeof d[k]==='string'&&d[k].length<=max)&&Array.isArray(d.stage)&&d.stage.length<=stages.length&&new Set(d.stage).size===d.stage.length&&d.stage.every(s=>stages.includes(s));
 function read(){
  const raw=localStorage.getItem(key);if(raw===null)return [];
  if(raw.length>100000)throw Error('invalid');
  const data=JSON.parse(raw);
  if(!object(data)||data.version!==1||Object.keys(data).some(k=>!['version','memos'].includes(k))||!Array.isArray(data.memos)||data.memos.length>10)throw Error('invalid');
  const ids=new Set();for(const m of data.memos){
   if(!object(m)||Object.keys(m).some(k=>!['id','savedAt','draft'].includes(k))||typeof m.id!=='string'||!/^[a-z0-9-]{8,80}$/i.test(m.id)||ids.has(m.id)||typeof m.savedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(m.savedAt)||!Number.isFinite(Date.parse(m.savedAt))||!validDraft(m.draft))throw Error('invalid');ids.add(m.id);
  }
  return data.memos;
 }
 function write(memos){localStorage.setItem(key,JSON.stringify({version:1,memos}));}
 // Describe the current fields, not the selected record or the last clicked save.
 // Checking never writes storage. Repeated keystrokes do not repeat live announcements.
 function refreshDraftState(memos){
  if(!draftState)return;
  let state='unknown',label='保存状態を確認できません。入力内容はそのままです。必要な内容はコピーして残してください。';
  try{
   if(memos===undefined)memos=read();
   if(memos!==null){
    const d=capture();
    const saved=memos.some(m=>m.draft.type===d.type&&Object.keys(limits).every(k=>m.draft[k]===d[k])&&m.draft.stage.length===d.stage.length&&m.draft.stage.every(s=>d.stage.includes(s)));
    const blank=d.type==='event'&&!d.stage.length&&Object.keys(limits).every(k=>!d[k].trim());
    state=saved?'saved':blank?'empty':'unsaved';
    label=saved?'今の入力と同じ内容を、このブラウザーに保存しています。LOTUSへは未送信です。':blank?'残したい内容は「このブラウザーに保存」で保存できます。':'今の入力は、このブラウザーには保存されていません。残す場合は「このブラウザーに保存」を押してください。';
   }
  }catch{/* A storage error must never leave a previous saved indication visible. */}
  draftState.hidden=false;draftState.className='draft-save-state draft-save-state--'+state;
  if(draftState.textContent!==label)draftState.textContent=label;
 }
 function title(m){return (m.draft.purpose||m.draft.message.split('\n').find(x=>x.trim())||m.draft.venue||'相談メモ').slice(0,50)+' — '+new Date(m.savedAt).toLocaleString('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}
 // Only validated, device-local records reach this read-only preview.
 function showPreview(memos,selected=''){
  if(!preview||!previewText||!previewDate)return;
  const m=memos.find(x=>x.id===selected);
  preview.hidden=!m;previewText.value='';previewDate.textContent='';
  if(!m)return;
  const d=m.draft,val=k=>d[k].trim()?d[k]:'未記入';
  previewDate.textContent='保存日時：'+new Date(m.savedAt).toLocaleString('ja-JP');
  previewText.value=['LOTUS ご相談メモ（保存内容）','種別：'+(d.type==='partner'?'技術協力・協業のご相談':'イベント映像のご相談'),'日程・時間：'+val('date'),'会場・場所：'+val('venue'),'イベントの内容：'+val('purpose'),'ご相談したい内容：'+(d.stage.join('、')||'未記入'),'','ご相談内容：',val('message')].join('\n');
 }
 function render(memos,selected=''){
  select.replaceChildren();const first=document.createElement('option');first.value='';first.textContent=memos.length?'保存メモを選ぶ（'+memos.length+'件）':'保存したメモはありません';select.append(first);
  for(const m of memos){const o=document.createElement('option');o.value=m.id;o.textContent=title(m);select.append(o);}select.value=selected;showPreview(memos,selected);refreshDraftState(memos);
 }
 function error(){showPreview([]);refreshDraftState(null);status.textContent='保存メモを利用できません。入力内容はそのままです。必要な内容はコピーしてください。保存データが壊れている場合は「保存メモをすべて削除」で、このサイトの保存メモだけ消せます。';}
 function capture(){const d={type:'event',date:'',venue:'',purpose:'',message:'',stage:[]};for(const e of fields){if(e.name==='stage'){if(e.checked)d.stage.push(e.value);}else if(e.name==='type'){if(e.checked)d.type=e.value;}else if(Object.hasOwn(limits,e.name))d[e.name]=e.value;}return d;}
 function restore(d){
  for(const e of fields){if(e.name==='stage')e.checked=d.stage.includes(e.value);else if(e.name==='type')e.checked=e.value===d.type;else if(Object.hasOwn(limits,e.name))e.value=d[e.name];}
  document.querySelector('#memo-result').hidden=true;document.querySelector('#memo-output').value='';document.querySelector('#copy-status').textContent='';document.querySelector('#brief-status').textContent='';document.querySelector('#brief-context').hidden=true;document.querySelector('#clear-confirm').hidden=true;
  history.replaceState(null,'',location.pathname);
 }
 function ask(action,id,label){pending={action,id,snapshot:action==='all'?localStorage.getItem(key):null};prompt.textContent=label;okay.textContent=action==='load'?'このメモを読み込む':'削除する';okay.classList.toggle('lotus-control--danger',action!=='load');okay.classList.toggle('lotus-control--primary',action==='load');okay.classList.remove('lotus-control--secondary');confirm.hidden=false;cancel.focus();}
 function dismiss(){pending=null;confirm.hidden=true;document.querySelector('#save-browser-memo').focus();}
 const locked=action=>{if(!navigator.locks?.request){status.textContent='このブラウザーでは安全な保存操作を利用できません。メモのコピーをご利用ください。';return Promise.resolve();}return navigator.locks.request(key,{mode:'exclusive'},action).catch(error);};
 document.querySelector('#save-browser-memo').addEventListener('click',()=>{const draft=capture();if(!validDraft(draft)){status.textContent='入力が長すぎる項目があります。内容を短くしてから保存してください。';return;}return locked(()=>{
  try{const memos=read();if(memos.length>=10){status.textContent='保存は10件までです。不要な保存メモを削除してから保存してください。';return;}
   const m={id:crypto.randomUUID(),savedAt:new Date().toISOString(),draft};write([m,...memos]);render([m,...memos],m.id);confirm.hidden=true;pending=null;status.textContent=JSON.stringify(capture())===JSON.stringify(draft)?'このブラウザーに保存しました。LOTUSへは送信されていません。':'保存ボタンを押した時の内容を保存しました。その後の変更も残す場合は、もう一度保存してください。LOTUSへは送信されていません。';
  }catch{error();}
 });});
 document.querySelector('#load-browser-memo').addEventListener('click',()=>{try{const m=read().find(x=>x.id===select.value);if(!m){status.textContent='読み込む保存メモを選んでください。';return;}ask('load',m.id,'今の入力を「'+title(m)+'」に置き換えます。未保存の変更は失われます。読み込みますか？');}catch{error();}});
 document.querySelector('#delete-browser-memo').addEventListener('click',()=>{try{const m=read().find(x=>x.id===select.value);if(!m){status.textContent='削除する保存メモを選んでください。';return;}ask('delete',m.id,'保存メモ「'+title(m)+'」を削除しますか？今の入力は残ります。');}catch{error();}});
 document.querySelector('#delete-all-browser-memos').addEventListener('click',()=>{try{ask('all','','このサイトで保存したメモをすべて削除しますか？今の入力と、他のサイトの保存内容は消しません。');}catch{error();}});
 cancel.addEventListener('click',dismiss);confirm.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dismiss();}});
 okay.addEventListener('click',()=>{const job=pending;if(!job)return;
  // Consent covers the draft at confirmation, not edits made while waiting for the lock.
  const confirmedDraft=job.action==='load'?JSON.stringify(capture()):null;
  return locked(()=>{
  if(pending!==job)return;
  try{if(job.action==='all'){if(localStorage.getItem(key)!==job.snapshot){render(read());dismiss();status.textContent='保存メモが別の画面で変更されました。内容を見てから、削除を選び直してください。';return;}localStorage.removeItem(key);render([]);status.textContent='このサイトの保存メモをすべて削除しました。今の入力は残っています。';}
   else{const memos=read(),m=memos.find(x=>x.id===job.id);if(!m){status.textContent='対象の保存メモが見つかりません。一覧を選び直してください。';render(memos);dismiss();return;}
    if(job.action==='load'){
     if(JSON.stringify(capture())!==confirmedDraft){refreshDraftState(memos);dismiss();status.textContent='確認後に入力が変更されたため、読み込みを中止しました。今の入力は残っています。読み込む場合は、もう一度選び直してください。';return;}
     restore(m.draft);render(memos,m.id);status.textContent='保存メモを読み込みました。内容の変更後は、もう一度保存すると別のメモとして残せます。';}
    else{const rest=memos.filter(x=>x.id!==job.id);write(rest);render(rest);status.textContent='選んだ保存メモを削除しました。今の入力は残っています。';}}
   dismiss();
  }catch{error();pending=null;confirm.hidden=true;}
 });});
 select.addEventListener('change',()=>{
  pending=null;confirm.hidden=true;
  try{const memos=read(),selected=select.value;showPreview(memos,selected);refreshDraftState(memos);status.textContent=selected?(memos.some(m=>m.id===selected)?'選んだ保存メモの内容を表示しました。今の入力は変更していません。':'選んだ保存メモが見つかりません。一覧を選び直してください。'):'';if(selected&&!memos.some(m=>m.id===selected))render(memos);}catch{error();}
 });
 fields.forEach(e=>{e.addEventListener('input',()=>refreshDraftState());e.addEventListener('change',()=>refreshDraftState());});
 document.querySelector('#confirm-clear')?.addEventListener('click',()=>refreshDraftState());
 window.addEventListener('pageshow',()=>refreshDraftState());
 try{render(read());}catch{error();}
 window.addEventListener('storage',e=>{if(e.key===key||e.key===null){pending=null;confirm.hidden=true;try{render(read());status.textContent='保存メモの一覧を更新しました。今の入力は変更していません。確認中の操作は選び直してください。';}catch{error();}}});
})();
