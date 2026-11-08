/* Pure candidate: no DOM, storage or network. Monetary values are tax-exclusive JPY. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LotusEstimateBundle=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TYPES=['led','projector','monitor','none'];
const ROLES={processor:'LEDプロセッサー',powerbox:'電源BOX・電源分配',transformer:'絶縁トランス（必要な場合）',pc:'調整・制御用PC',signal:'信号ケーブル・分配機器',powercable:'電源ケーブル',support:'設置方式に合う支持部材'};
const ROLE_UNITS={processor:'台',powerbox:'台',transformer:'台',pc:'台',signal:'式',powercable:'式',support:'式'};
const clone=v=>JSON.parse(JSON.stringify(v));
function integer(v,min,max){if(v===null||v===undefined||!/^\d+$/.test(String(v).trim()))return null;const n=Number(v);return Number.isSafeInteger(n)&&n>=min&&n<=max?n:null;}
function create(manualLines=[]){return {screenType:null,quantityMode:"size",panelQty:null,cols:7,rows:4,model:null,lines:manualLines.map(l=>({...clone(l),origin:'manual'})),cache:{},dismissed:[]};}
function stage(s){if(s.screenType!=='led'||s.quantityMode==='count')return null;const c=integer(s.cols,1,40),r=integer(s.rows,1,20);return c===null||r===null?null:{cols:c,rows:r,panels:c*r,width:c*.5,height:r*.5};}
function key(type,role,model){return type+':'+role+':'+(model||'unspecified');}
function configure(state,selection){const s=clone(state);const type=selection.screenType===undefined?s.screenType:selection.screenType;if(!TYPES.includes(type))throw new Error('画面の種類を選んでください。');
 for(const l of s.lines.filter(l=>l.origin==='auto'))s.cache[l.id]=clone(l);
 s.quantityMode=selection.quantityMode===undefined?(s.quantityMode||'size'):selection.quantityMode;if(!['size','count'].includes(s.quantityMode))throw new Error('Invalid quantity mode');s.panelQty=selection.panelQty===undefined?s.panelQty:selection.panelQty;
 s.screenType=type;s.cols=selection.cols===undefined?s.cols:selection.cols;s.rows=selection.rows===undefined?s.rows:selection.rows;
 s.model=selection.model===undefined?(type===state.screenType?s.model:null):(selection.model||null);
 if(type==='led'&&(s.quantityMode==='count'?integer(s.panelQty,1,800)===null:!stage(s)))throw new Error('LEDの横枚数は1〜40、縦枚数は1〜20です。');
 s.lines=s.lines.filter(l=>l.origin!=='auto');
 if(type==='none')return s;
 const definitions=[['display',type==='led'?'LEDパネル':type==='projector'?'プロジェクター':'モニター',s.model,type==='led'?'枚':'台']];
 if(type==='led')for(const role of Object.keys(ROLES))definitions.push([role,ROLES[role],null,ROLE_UNITS[role]]);
 for(const [role,item,model,unit] of definitions){const id=key(type,role,model);if(role!=='display'&&s.dismissed.includes(type+':'+role))continue;
 let line=s.cache[id]?clone(s.cache[id]):{id,origin:'auto',role,item,model,unit,qty:null,price:null,days:1,priceSource:null};
 if(role==='display'&&type==='led')line.qty=s.quantityMode==='count'?integer(s.panelQty,1,800):stage(s).panels;s.lines.push(line);
 }return s;
}
function edit(state,id,patch){const s=clone(state),line=s.lines.find(l=>l.id===id);if(!line)throw new Error('Unknown line');for(const f of ['qty','price','days','item'])if(Object.hasOwn(patch,f)){
 if(f==='qty'&&line.origin==='auto'&&line.role==='display'&&s.screenType==='led')throw new Error('LED枚数は画面サイズから変更してください。');
 if(f==='item'){if(typeof patch[f]!=='string'||!patch[f].trim())throw new Error('Invalid item');line[f]=patch[f];continue;}
 const value=patch[f];const n=value===null||value===''?null:integer(value,f==='price'?0:1,f==='price'?100000000:f==='qty'?1000:365);if(n===null&&value!==null&&value!=='')throw new Error('Invalid '+f);line[f]=n;
 if(f==='price')line.priceSource='manual';
 }return s;}
function selectModel(state,id,selection){
 const s=clone(state),line=s.lines.find(l=>l.id===id);if(!line)throw new Error('Unknown line');
 if(line.origin==='auto'&&line.role==='display')throw new Error('画面機種はconfigureから選択してください。');
 if(typeof selection.model!=='string'||!selection.model.trim()||typeof selection.item!=='string'||!selection.item.trim()||typeof selection.unit!=='string'||!selection.unit.trim())throw new Error('型式・名称・単位を指定してください。');
 const profile=selection.specProfile===undefined?null:selection.specProfile;
 if(profile!==null&&(typeof profile!=='string'||!profile.trim()))throw new Error('Invalid specProfile');
 if(line.model!==selection.model||line.unit!==selection.unit||(line.specProfile||null)!==profile){line.price=null;line.priceSource=null;line.rateEvidence=null;delete line.spec;delete line.specEvidence;delete line.weightKg;delete line.maxPowerW;}
 line.model=selection.model;line.item=selection.item;line.unit=selection.unit;line.specProfile=profile;return s;
}
function remove(state,id){const s=clone(state),line=s.lines.find(l=>l.id===id);if(!line)return s;if(line.origin==='auto'&&line.role==='display')throw new Error('画面を外すには「なし」を選択してください。');if(line.origin==='auto')s.dismissed=Array.from(new Set([...s.dismissed,s.screenType+':'+line.role]));s.lines=s.lines.filter(l=>l.id!==id);return s;}
function restoreRecommendation(state,role){if(!Object.hasOwn(ROLES,role))throw new Error('Unknown recommendation');const s=clone(state);s.dismissed=s.dismissed.filter(x=>x!==s.screenType+':'+role);return configure(s,{});}
function resolveRate(line,rates){if(!line.model)return null;const candidates=rates.filter(r=>r.model===line.model&&r.unit===line.unit&&(r.profile||null)===(line.specProfile||null)&&r.approved===true&&typeof r.approvalRef==='string'&&r.approvalRef.trim()&&typeof r.sourceVersion==='string'&&r.sourceVersion.trim()&&r.currency==='JPY'&&r.tax==='exclusive'&&r.period==='day'&&integer(r.amount,0,100000000)!==null);if(candidates.length!==1)return null;return {amount:Number(candidates[0].amount),sourceVersion:candidates[0].sourceVersion||null,approvalRef:candidates[0].approvalRef};}
function applyRates(state,rates){const s=clone(state);for(const l of s.lines){if(l.priceSource==='manual')continue;const r=resolveRate(l,rates);l.price=r?r.amount:null;l.priceSource=r?'approved':null;l.rateEvidence=r;}return s;}
function resolveSpec(line,specs){if(!line.model)return null;const matches=specs.filter(r=>r.model===line.model&&r.unit===line.unit&&r.approved===true&&(r.profile||null)===(line.specProfile||null)&&r.scope==='body-only'&&typeof r.sourceVersion==='string'&&r.sourceVersion.trim());if(matches.length!==1)return null;const r=matches[0],valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;return {weightKg:valid(r.weightKg)?r.weightKg:null,maxPowerW:valid(r.maxPowerW)?r.maxPowerW:null,scope:r.scope,sourceVersion:r.sourceVersion};}
function summarizePhysical(state,specs){const result={weightKg:{knownSubtotal:0,unknownLines:0,total:null},maxPowerW:{knownSubtotal:0,unknownLines:0,total:null},scope:'body-only'};for(const l of state.lines){const sp=resolveSpec(l,specs),qty=integer(l.qty,1,1000);for(const field of ['weightKg','maxPowerW']){const n=sp&&sp[field];if(qty===null||n===null||n===undefined||!Number.isFinite(n*qty))result[field].unknownLines++;else result[field].knownSubtotal+=n*qty;}}for(const f of ['weightKg','maxPowerW']){result[f].knownSubtotal=Math.round(result[f].knownSubtotal*1e9)/1e9;if(!result[f].unknownLines)result[f].total=result[f].knownSubtotal;}return result;}
function draft(state){const pending=[];if(!TYPES.includes(state.screenType))pending.push({field:'screenType',reason:'画面の種類を選んでください。'});const lines=state.lines.map(l=>{for(const f of ['qty','days'])if(integer(l[f],1,f==='qty'?1000:365)===null)pending.push({id:l.id,field:f});if(l.price===null||l.price===undefined)pending.push({id:l.id,field:'price'});else if(integer(l.price,0,100000000)===null)pending.push({id:l.id,field:'price',reason:'invalid'});return {item:l.item,name:l.item,qty:l.qty,days:l.days,price:l.price};});if(lines.length>16)pending.push({field:'lines',reason:'概算計算は16項目までです。'});return {lines,tax:10,pending,ready:pending.length===0&&lines.length>0};}
return {TYPES,ROLES,create,stage,configure,edit,selectModel,remove,restoreRecommendation,resolveRate,applyRates,resolveSpec,summarizePhysical,draft};
});
