/* LOTUS proposed standard prices only. No supplier source data or availability claim. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LotusPublicRentalRates=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const catalog=[
 {model:'smartscope-duo4k',unit:'台',dailyAmount:11000,confirmed:true},
 {model:'videohub40-12g',unit:'台',dailyAmount:48000,confirmed:true},
 {model:'novastar-cvt10pro',unit:'台',dailyAmount:21000,confirmed:true},
 {model:'roland-vr120hd',unit:'台',dailyAmount:27000,confirmed:true},
 {model:'roland-v160hd',unit:'台',dailyAmount:58000},
 {model:'roland-p20hd',unit:'台',dailyAmount:11500},
 {model:'hyperdeck-studio-hd-plus',unit:'台',dailyAmount:7500},
 {model:'videoassist7-12ghdr',unit:'台',dailyAmount:4300},
 {model:'teranex-av',unit:'台',dailyAmount:15000},
 {model:'roland-vc1dl',unit:'台',dailyAmount:5000},
 {model:'barco-imagepro4k',unit:'台',dailyAmount:87000},
 {model:'panasonic-rq25kj',unit:'台',dailyAmount:840000},
 {model:'panasonic-pt-vmz71',unit:'台',dailyAmount:57000},
 {model:'visualproductions-timecore',unit:'台',dailyAmount:10500},
 {model:'roe-dm26',unit:'枚',dailyAmount:33000},
 {model:'barco-imagepro-ii',unit:'台',dailyAmount:53000},
 {model:'barco-imagepro-ii-jr',unit:'台',dailyAmount:53000},
 {model:'aja-gen10',unit:'台',dailyAmount:2800},
 {model:'decimator-mdhx',unit:'台',dailyAmount:4000},
 {model:'adtechno-lcd1015s',unit:'台',dailyAmount:6500},
 {model:'adtechno-uh1561s',unit:'台',dailyAmount:15000},
 {model:'adtechno-uh1560',unit:'台',dailyAmount:9500},
 {model:'leyard-clm10m3',unit:'枚',dailyAmount:48000,confirmed:true},
 {model:'leyard-cli39-clt',unit:'枚',dailyAmount:32000,confirmed:true},
 {model:'leyard-clo39',unit:'枚',dailyAmount:37000,confirmed:true},
 {model:'epson-ev115',unit:'台',dailyAmount:21000,confirmed:true},
 {model:'sharp-pnp506',unit:'台',dailyAmount:63000,confirmed:true}
];
function resolve(line,days,rates=catalog){
 if(days!==1)return null;
 const rows=rates.filter(r=>r.model===line.model&&r.unit===line.unit);
 if(rows.length!==1)return null;
 const r=rows[0];if(!Number.isSafeInteger(r.dailyAmount)||r.dailyAmount<0)return null;
 return {confirmed:!!r.confirmed,amount:r.dailyAmount,tax:'exclusive',unit:r.unit,days:1,provider:'LOTUS',periodLabel:'1利用日',checkedAt:'2026-11-13',exclusions:r.unit==='人'?'担当範囲・拘束時間・深夜延長・旅費宿泊は個別見積':'機材単体。運搬・設営撤去・人員・レンズ等の付属品は別途'};
}
function summary(q){if(q&&q.confirmed)return `レンタル料金：1${q.unit}・1利用日 ${q.amount.toLocaleString('ja-JP')}円（税別）。${q.exclusions}。複数日・業者様・ツアーは個別にお見積りします。`;return q?`概算：1${q.unit}・1利用日 ${q.amount.toLocaleString('ja-JP')}円（税別）。${q.exclusions}。料金は正式見積りで確定します。複数日・業者様・ツアーは条件に応じて個別にお見積りします。`:'料金は個別にお見積りします。';}
function apply(line,rates=catalog){const out={...line};if(out.priceSource==='manual'){out.publicRate=null;return out;}const q=resolve(out,out.days,rates);out.price=q?q.amount:null;out.priceSource=q?'lotus-standard':null;out.publicRate=q;return out;}
return {resolve,summary,apply,catalog};
});
