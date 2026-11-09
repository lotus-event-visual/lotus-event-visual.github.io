(()=>{'use strict';
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'}):null;
document.querySelectorAll('.pt-reveal').forEach(el=>io?io.observe(el):el.classList.add('on'));
const f=document.getElementById('pt-brief');if(!f)return;const out=document.getElementById('pt-memo-text'),send=document.getElementById('pt-send'),copy=document.getElementById('pt-copy'),st=document.getElementById('pt-status');
const val=n=>[...f.querySelectorAll('input[name="'+n+'"]:checked')].map(i=>i.value);
function build(){const L=['■ 案件名・時期：'+(f.querySelector('#pt-name').value.trim()||'(未定)'),'■ ご依頼のかたち：'+(val('mode').join('・')||'相談して決めたい'),'■ 担当してほしい工程：'+(val('phase').join('・')||'相談して決めたい'),'■ 映像機材：'+(val('gear').join('・')||'相談して決めたい'),'■ 会場：'+(val('venue').join('・')||'未定'),'■ そのほか：'+(f.querySelector('#pt-note').value.trim()||'—')];
 out.textContent=L.join('\n');const q=encodeURIComponent('映像会社様からのご相談\n'+L.join('\n'));send.href='contact.html?brief='+(val('mode').includes('技術と機材')?'both':val('mode').includes('機材レンタル')?'rental':'technical')+'&memo='+q}
f.addEventListener('input',build);f.addEventListener('change',build);build();
copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(out.textContent);st.textContent='コピーしました。メールやチャットに貼り付けてお送りください。'}catch{st.textContent='テキストを選択してコピーしてください。'}});
})();
