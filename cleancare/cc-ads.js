/* クリーンケア 広告バナー・タブ */
(function(){
var w=document.querySelector('.ad-wrap');
if(w){var t=w.querySelector('.ad-track'),s=[].slice.call(t.querySelectorAll('.ad')),d=w.querySelector('.ad-dots'),cur=0,timer=null;
s.forEach(function(_,i){var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-label',(i+1)+' 枚目のバナー');b.onclick=function(){go(i,true)};d.appendChild(b)});
var dots=[].slice.call(d.children);
function mark(i){cur=i;dots.forEach(function(b,k){b.setAttribute('aria-current',k===i?'true':'false')})}
function go(i,user){i=(i+s.length)%s.length;t.scrollTo({left:s[i].offsetLeft-t.offsetLeft,behavior:'smooth'});mark(i);if(user)restart()}
w.querySelector('.prev').onclick=function(){go(cur-1,true)};w.querySelector('.next').onclick=function(){go(cur+1,true)};
var raf;t.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){var i=Math.round(t.scrollLeft/t.clientWidth);if(i!==cur)mark(i)})},{passive:true});
function restart(){clearInterval(timer);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(function(){go(cur+1)},5200)}
w.addEventListener('mouseenter',function(){clearInterval(timer)});w.addEventListener('mouseleave',restart);
w.addEventListener('focusin',function(){clearInterval(timer)});
mark(0);restart();}
var tabs=[].slice.call(document.querySelectorAll('.ad-tabs [role=tab]'));
tabs.forEach(function(b){b.onclick=function(){tabs.forEach(function(x){var on=x===b;x.setAttribute('aria-selected',on);document.getElementById(x.getAttribute('aria-controls')).hidden=!on})}});
})();
