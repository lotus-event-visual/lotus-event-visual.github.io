(()=>{
 const search=document.querySelector('#guide-search');
 if(!search)return;
 const input=search.querySelector('input'),clear=search.querySelector('button');
 const status=document.querySelector('#guide-search-status'),empty=document.querySelector('#guide-no-results');
 const groups=[...document.querySelectorAll('.product-category')];
 const fold=value=>String(value??'').normalize('NFKC').toLowerCase();
 const identity=value=>fold(value).replace(/[^\p{L}\p{N}+]/gu,'');
 const textIndex=value=>fold(value).replace(/[^\p{L}\p{N}+]+/gu,' ').trim();
 const modelTokens=name=>new Set((fold(name).match(/[a-z0-9]+(?:[-_.][a-z0-9]+)*\+?/g)??[]).map(identity).filter(token=>/^[a-z][a-z0-9]*\d[a-z0-9]*\+?$/.test(token)));
 const entries=groups.map(group=>({group,nav:[...document.querySelectorAll('a[href="#'+group.id+'"]')],count:group.querySelector('.product-category-heading p'),cards:[...group.querySelectorAll('.product-card')].map(card=>{const name=card.querySelector('.product-card-title')?.textContent||'';return {card,name:identity(name),models:modelTokens(name),text:textIndex(card.dataset.guideSearch||card.textContent)};})}));
 const indexed=entries.flatMap(entry=>entry.cards);
 const findMatches=query=>{
  const compact=identity(query);
  if(!/[\p{L}\p{N}]/u.test(compact))return new Set(indexed);
  const exactNames=indexed.filter(item=>item.name===compact);
  if(exactNames.length)return new Set(exactNames);
  const exactModels=indexed.filter(item=>item.models.has(compact));
  if(exactModels.length)return new Set(exactModels);
  const terms=textIndex(query).split(/\s+/).filter(Boolean);
  return new Set(indexed.filter(item=>terms.every(term=>item.text.includes(term)||item.name.includes(identity(term)))));
 };
 const total=entries.reduce((n,e)=>n+e.cards.length,0);
 // Shareable search state: only the q parameter is ever touched, and the URL is a convenience, so search must keep working if it cannot be read or written.
 const QUERY_LIMIT=120;
 let composing=false,urlQuery='';
 const cleanQuery=value=>{
  let text=String(value??'').trim();
  if(text.length>QUERY_LIMIT){text=text.slice(0,QUERY_LIMIT);if(/[\uD800-\uDBFF]$/.test(text))text=text.slice(0,-1);}
  return text.trim();
 };
 const readUrlQuery=()=>{try{return cleanQuery((new URLSearchParams(location.search).get('q')??'').replace(/[\u0000-\u001F\u007F�]/g,''));}catch{return '';}};
 // Rebuilt segment by segment because URLSearchParams.toString() would re-encode the other parameters.
 const searchWith=value=>{
  const encoded=value?new URLSearchParams({q:value}).toString():'';
  const parts=[];
  let placed=false;
  for(const part of location.search.slice(1).split('&')){
   if(!part)continue;
   if(!new URLSearchParams(part).has('q'))parts.push(part);
   else if(encoded&&!placed){parts.push(encoded);placed=true;}
  }
  if(encoded&&!placed)parts.push(encoded);
  return parts.length?'?'+parts.join('&'):'';
 };
 const syncUrl=()=>{
  if(composing)return;
  const value=cleanQuery(input.value);
  try{
   const next=searchWith(value);
   // replaceState, never pushState: typing must not add one history entry per key.
   if(next!==location.search)history.replaceState(history.state,'',location.pathname+next+location.hash);
   urlQuery=value;
  }catch{}
 };
 // Product pages hand q back to their own links to this list (see product-experience.js).
 const cardLinks=[...document.querySelectorAll('a.product-card')].map(card=>({card,href:card.getAttribute('href')})).filter(link=>/^product-[^/?#]+\.html$/.test(link.href));
 let linkedQuery='';
 const syncCardLinks=()=>{
  const value=cleanQuery(input.value);
  if(value===linkedQuery)return;
  linkedQuery=value;
  const suffix=value?'?'+new URLSearchParams({q:value}).toString():'';
  for(const link of cardLinks)link.card.setAttribute('href',link.href+suffix);
 };
 const update=()=>{
  const tokens=textIndex(input.value).split(/\s+/u).filter(Boolean);
  const matches=findMatches(input.value);
  let matched=0;
  for(const entry of entries){let count=0;for(const item of entry.cards){const show=matches.has(item);item.card.hidden=!show;if(show)count++;}entry.group.hidden=count===0;for(const nav of entry.nav)nav.hidden=count===0;entry.count.textContent=count+'項目';matched+=count;}
  for(const sub of document.querySelectorAll('.product-subgroup'))sub.hidden=![...sub.querySelectorAll('.product-card')].some(c=>!c.hidden);
  const parent=document.querySelector('.product-category-parent');
  if(parent){parent.hidden=![...parent.querySelectorAll('.product-category')].some(g=>!g.hidden);for(const a of document.querySelectorAll('a[href="#display"]'))a.hidden=parent.hidden;}
  const related=document.querySelector('.monitor-recording-link');
  if(related)related.hidden=!!tokens.length;
  status.textContent=tokens.length?total+'項目中 '+matched+'項目を表示':total+'項目を表示';
  empty.hidden=matched!==0;clear.hidden=input.value.length===0;
  syncCardLinks();
  syncUrl();
 };
 for(const example of search.querySelectorAll('[data-guide-query]')){example.addEventListener('click',()=>{input.value=example.dataset.guideQuery;update();input.focus();});}
 // Keep results stable while Japanese text is still being converted by an IME.
 // Escape belongs to the IME until conversion is finished, including legacy 229 events.
 input.addEventListener('keydown',event=>{if(event.key==='Escape'&&!composing&&!event.isComposing&&event.keyCode!==229){input.value='';update();}});
 input.addEventListener('compositionstart',()=>{composing=true;});
 input.addEventListener('compositionend',()=>{composing=false;update();});
 input.addEventListener('input',event=>{if(!composing&&!event?.isComposing)update();});
 clear.addEventListener('click',()=>{input.value='';update();input.focus();});
 // Follow q across history entries. Comparing with the last known q keeps the typed text when a URL write was refused.
 addEventListener('popstate',()=>{
  if(composing)return;
  const value=readUrlQuery();
  if(value===urlQuery)return;
  urlQuery=value;input.value=value;update();
 });
 urlQuery=readUrlQuery();input.value=urlQuery;
 update();search.hidden=false;
})();
