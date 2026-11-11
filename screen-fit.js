'use strict';
function calculateFit(sw,sh,tw,th){
 const a=[sw,sh,tw,th];if(a.some(x=>!Number.isInteger(x)||x<1||x>100000))throw new Error('幅・高さは1〜100000の整数で入力してください。');
 const contain=Math.min(tw/sw,th/sh),cover=Math.max(tw/sw,th/sh);
 return {contain:{width:sw*contain,height:sh*contain,gapX:(tw-sw*contain)/2,gapY:(th-sh*contain)/2},cover:{width:sw*cover,height:sh*cover,cropX:(sw-tw/cover)/2,cropY:(sh-th/cover)/2},stretch:{x:tw/sw,y:th/sh}};
}
if(typeof module!=='undefined')module.exports={calculateFit};
if(typeof document!=='undefined'){
 const form=document.querySelector('form'),out=document.querySelector('#result');
 function draw(){try{
 const [sw,sh,tw,th]=['sw','sh','tw','th'].map(id=>Number(document.getElementById(id).value));const r=calculateFit(sw,sh,tw,th);const n=x=>Math.abs(x)<.005?'0':x.toFixed(1).replace(/\.0$/,'');
 document.querySelector('#error').textContent='';out.hidden=false;
 const min=Math.min(sw,sh),m=min*.06,rr=min*.24;
 document.querySelectorAll('.picture svg').forEach(svg=>{svg.setAttribute('viewBox',`0 0 ${sw} ${sh}`);svg.innerHTML=`<rect x="${m}" y="${m}" width="${sw-2*m}" height="${sh-2*m}" fill="none" stroke="#125c66" stroke-width="${min*.015}"/><circle cx="${sw/2}" cy="${sh/2}" r="${rr}" fill="white" stroke="#125c66" stroke-width="${min*.015}"/>`;});
 document.querySelectorAll('.screen').forEach(el=>el.style.aspectRatio=`${tw}/${th}`);
 const fit=document.querySelector('#contain .picture');fit.style.width=`${r.contain.width/tw*100}%`;fit.style.height=`${r.contain.height/th*100}%`;
 const fill=document.querySelector('#cover .picture');fill.style.width=`${r.cover.width/tw*100}%`;fill.style.height=`${r.cover.height/th*100}%`;
 document.querySelector('#gaps').textContent=`出力画面の余白：左右各 ${n(r.contain.gapX)} px ／ 上下各 ${n(r.contain.gapY)} px`;
 document.querySelector('#crops').textContent=`素材から隠れる範囲：左右各 ${n(r.cover.cropX)} px ／ 上下各 ${n(r.cover.cropY)} px`;
 document.querySelector('#distortion').textContent=Math.abs(r.stretch.x-r.stretch.y)<1e-9?'この組み合わせは縦横比が一致します。':`横 ${n(r.stretch.x)} 倍・縦 ${n(r.stretch.y)} 倍。円や人物の形が変わります。`;
 document.querySelector('#summary').textContent=`素材 ${sw} × ${sh} px → 出力画面 ${tw} × ${th} px。まず「全体表示」で文字とロゴが欠けないか比較しましょう。`;
 }catch(e){document.querySelector('#error').textContent=e.message;out.hidden=true;}}
 form.addEventListener('submit',e=>{e.preventDefault();draw();});
 document.querySelector('#preset').addEventListener('change',e=>{const values=e.target.value.split(',');if(values.length===4){['sw','sh','tw','th'].forEach((id,i)=>document.getElementById(id).value=values[i]);draw();}});draw();
}
