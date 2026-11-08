(()=>{
'use strict';
const recipient='lotus@lotusgroupholdings.com';
function draftFor(text){
 const base='mailto:'+recipient+'?subject='+encodeURIComponent('イベント映像・技術協力の相談');
 const full=base+'&body='+encodeURIComponent(text);
 return full.length<=1800?{href:full,bodyIncluded:true}:{href:base,bodyIncluded:false};
}
if(typeof module!=='undefined'&&module.exports)module.exports={draftFor};
if(typeof document==='undefined')return;
const message=document.getElementById('message');
if(message&&new URLSearchParams(window.location.search).get('brief')==='technical')message.placeholder='例：技術提供スタッフをお願いしたい。設営・本番操作・撤去など、必要な工程や日程から相談したい。';
const root=document.querySelector('.intake-email-delivery'),button=document.getElementById('compose-lotus-email'),output=document.getElementById('memo-output'),status=document.getElementById('intake-email-status'),result=document.getElementById('memo-result');
if(!root||!button||!output||!status||!result)return;
button.addEventListener('click',()=>{
 if(result.hidden||!output.value.trim()){status.textContent='先に相談内容を確認してください。';return;}
 const draft=draftFor(output.value);
 window.location.href=draft.href;
 status.textContent=draft.bodyIncluded
 ? 'メールアプリを開く操作を行いました。まだ送信していません。アプリ内で宛先・内容・ご連絡先を確認して送信してください。このサイトでは送信・受信を確認できません。'
 : '内容が長いため、宛先と件名だけをメールアプリへ渡します。「メモをコピー」で本文を貼り付けて送信してください。このサイトからは送信していません。';
});
for(const id of ['review-memo','confirm-clear'])document.getElementById(id)?.addEventListener('click',()=>{status.textContent='';});
})();