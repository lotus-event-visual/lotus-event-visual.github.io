/* Local reference only: no network, storage, or generation service. */
(function(root){
'use strict';
const LIMIT=10*1024*1024;
function validateReference(bytes,size){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes||[]);
 if(!Number.isSafeInteger(size)||size<=0)return {ok:false,error:'空のファイルは表示できません。'};
 if(size>LIMIT)return {ok:false,error:'10MB以下のファイルをお選びください。'};
 const ascii=(start,text)=>[...text].every((c,i)=>b[start+i]===c.charCodeAt(0));
 let mime=null;
 if(b.length>=8&&[137,80,78,71,13,10,26,10].every((x,i)=>b[i]===x))mime='image/png';
 else if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)mime='image/jpeg';
 else if(b.length>=12&&ascii(0,'RIFF')&&ascii(8,'WEBP'))mime='image/webp';
 else if(b.length>=5&&ascii(0,'%PDF-'))mime='application/pdf';
 if(!mime)return {ok:false,error:'PNG・JPEG・WebP・PDFのファイルをお選びください。'};
 return {ok:true,mime,kind:mime==='application/pdf'?'pdf':'image'};
}
const api={validateReference,MAX_BYTES:LIMIT};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;
root.LotusProjectReference=api;
function init(){
 const $=id=>document.getElementById(id),input=$('project-reference'),preview=$('project-reference-preview'),clear=$('project-reference-clear');
 if(!input||!preview||!clear)return;
 const name=$('project-name'),namePreview=$('project-name-preview'),printCheck=$('project-reference-printimage'),printImage=$('project-print-image');
 let version=0,url=null,current=null;
 function emptyPrint(){if(printImage){printImage.replaceChildren();printImage.hidden=true;}}
 function removeURL(){if(url){URL.revokeObjectURL(url);url=null;}current=null;emptyPrint();}
 function resetCheck(){if(printCheck){printCheck.checked=false;printCheck.disabled=true;}}
 function status(message){preview.replaceChildren();const p=document.createElement('p');p.textContent=message;p.setAttribute('role','status');preview.append(p);preview.hidden=false;}
 function updatePrint(){emptyPrint();if(!printImage||!printCheck?.checked||current?.kind!=='image'||!url)return;const token=version,ownURL=url,img=document.createElement('img');img.src=ownURL;img.alt='選択した参考画像';img.addEventListener('error',()=>{if(token!==version||url!==ownURL||printImage.firstChild!==img)return;emptyPrint();resetCheck();},{once:true});printImage.append(img);printImage.hidden=false;}
 function clearFile(){++version;removeURL();resetCheck();input.value='';preview.replaceChildren();preview.hidden=true;clear.hidden=true;}
 async function select(){
  const token=++version,file=input.files&&input.files[0];removeURL();resetCheck();preview.replaceChildren();preview.hidden=true;clear.hidden=!file;
  if(!file)return;
  if(file.size>LIMIT||file.size===0){status(validateReference([],file.size).error);return;}
  status('資料を読み込んでいます。');
  try{
   const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());if(token!==version)return;
   const result=validateReference(bytes,file.size);if(!result.ok){status(result.error);return;}
   // Re-type bytes after signature validation. Never trust a filename or declared MIME.
   const blob=file.slice(0,file.size,result.mime);url=URL.createObjectURL(blob);const ownURL=url;
   if(result.kind==='pdf'){
    current={kind:'pdf'};preview.replaceChildren();const title=document.createElement('p');title.textContent=file.name;const link=document.createElement('a');link.href=ownURL;link.target='_blank';link.rel='noopener noreferrer';link.textContent='選択したPDFを開く';link.className='text-button';preview.append(title,link);preview.hidden=false;return;
   }
   const img=new Image();img.alt='選択した参考画像';img.onload=()=>{
    if(token!==version||url!==ownURL)return;
    if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>40000000){removeURL();status('画像が大きすぎるため表示できません。解像度を下げてお選びください。');return;}
    current={kind:'image'};preview.replaceChildren();const caption=document.createElement('p');caption.textContent=file.name;preview.append(img,caption);preview.hidden=false;if(printCheck)printCheck.disabled=false;
   };
   img.onerror=()=>{if(token!==version||url!==ownURL)return;removeURL();resetCheck();status('画像を読み込めませんでした。別のファイルをお選びください。');};img.src=ownURL;
  }catch(e){if(token!==version)return;removeURL();resetCheck();status('このファイルを読み込めませんでした。選び直してください。');}
 }
 input.addEventListener('change',select);clear.addEventListener('click',()=>{clearFile();input.focus();});printCheck?.addEventListener('change',updatePrint);
 const updateName=()=>{if(namePreview)namePreview.textContent=(name?.value||'').slice(0,100);};name?.addEventListener('input',updateName);updateName();resetCheck();emptyPrint();
 // bfcache must not restore an attachment after its blob URL has been released.
 window.addEventListener('pagehide',clearFile);
 window.addEventListener('pageshow',event=>{if(event.persisted){clearFile();if(name)name.value='';updateName();}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(typeof window!=='undefined'?window:globalThis);
