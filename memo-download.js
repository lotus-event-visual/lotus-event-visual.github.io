// Optional, explicit file export. No network request or browser storage.
(()=>{
 'use strict';
 const button=document.querySelector('#download-memo');
 const output=document.querySelector('#memo-output');
 const result=document.querySelector('#memo-result');
 const status=document.querySelector('#copy-status');
 const note=document.querySelector('#download-memo-note');
 if(!button||!output||!result||!status||!note)return;
 if(typeof Blob!=='function'||typeof URL==='undefined'||typeof URL.createObjectURL!=='function'||typeof URL.revokeObjectURL!=='function')return;
 if(!('download' in document.createElement('a')))return;
 button.addEventListener('click',()=>{
  // Review owns this snapshot. Never export cleared or invalidated content.
  if(result.hidden||!output.value.trim())return;
  let url='',link=null;
  try{
   const file=new Blob(['\uFEFF',output.value],{type:'text/plain;charset=utf-8'});
   url=URL.createObjectURL(file);
   link=document.createElement('a');
   link.href=url;link.download='lotus-consultation-memo.txt';link.hidden=true;
   document.body.appendChild(link);
   link.click();
   // Initiation is observable; the browser's completed save is not.
   status.textContent='保存操作を開始しました。端末の保存先やダウンロード一覧をご確認ください。';
  }catch{
   output.focus();output.select();
   status.textContent='ファイル保存を開始できませんでした。メモを選択しました。端末のコピー操作をご利用ください。';
  }finally{
   if(link)link.remove();
   // Let the browser consume the blob before releasing this temporary URL.
   if(url)setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
 });
 button.hidden=false;note.hidden=false;
})();
