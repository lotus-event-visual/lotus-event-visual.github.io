/* LOTUS proposed standard prices only. No supplier source data or availability claim. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LotusPublicRentalRates=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const catalog=[ /* 本人 11/10 23:54「概算も金額どのみち他社から調べて類似で掲載…概算出ないなら意味なくない？」(02:13 の「個別お見積り」を上書き)。決め方:他社の公開レンタル料金 3 件以上の 1 日料金を税別にそろえた平均 × 1.05〜1.10 の範囲で、1,000 円単位の最小の額。根拠は 会話の貯蔵庫\decisions\機材の概算金額-他社調査.md */
 {model:'roland-v160hd',unit:'台',dailyAmount:58000}
];
function resolve(line,days,rates=catalog){
 if(days!==1)return null;
 const rows=rates.filter(r=>r.model===line.model&&r.unit===line.unit);
 if(rows.length!==1)return null;
 const r=rows[0];if(!Number.isSafeInteger(r.dailyAmount)||r.dailyAmount<0)return null;
 return {amount:r.dailyAmount,tax:'exclusive',unit:r.unit,days:1,provider:'LOTUS',periodLabel:'1利用日',checkedAt:'2026-11-13',exclusions:r.unit==='人'?'担当範囲・拘束時間・深夜延長・旅費宿泊は個別見積':'機材単体。運搬・設営撤去・人員・レンズ等の付属品は別途'};
}
function summary(q){return q?`概算：1${q.unit}・1利用日 ${q.amount.toLocaleString('ja-JP')}円（税別）。${q.exclusions}。料金は正式見積りで確定します。複数日・業者様・ツアーは条件に応じて個別にお見積りします。`:'料金は個別にお見積りします。';}
function apply(line,rates=catalog){const out={...line};if(out.priceSource==='manual'){out.publicRate=null;return out;}const q=resolve(out,out.days,rates);out.price=q?q.amount:null;out.priceSource=q?'lotus-standard':null;out.publicRate=q;return out;}
return {resolve,summary,apply,catalog};
});
