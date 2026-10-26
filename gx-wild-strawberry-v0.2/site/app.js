const works = [
 {title:'夏日的另一侧',author:'青鸟',kind:'图像',tags:['游城十代','角色中心'],date:'2026.10.21',likes:28,description:'傍晚的风穿过窗户，带来一点海的气味。关于夏天、离别，以及还没有说出口的话。'},
 {title:'森林不会回答',author:'雾岛',kind:'文字',tags:['游城十代','相爱相杀'],date:'2026.10.19',likes:46,description:'森林没有给出答案。树根向下延伸，雨水不断上涨，而他终于决定不再逃跑。'},
 {title:'放学以后',author:'盐汽水',kind:'图像',tags:['校园','日常'],date:'2026.10.17',likes:19,description:'放学铃响之后，走廊被夕阳切成几块。那些没来得及讲完的话，就留在下一张画里。'},
 {title:'潮汐记录',author:'未明',kind:'文字',tags:['成长','游城十代'],date:'2026.10.14',likes:32,description:'一份关于潮水、森林和记忆的记录。某些东西退去之后，留下来的并不总是空白。'}
];
const comments = [
 '读到最后才意识到，原来前面那些看似平静的细节一直在回应结尾。想再读一遍。',
 '好喜欢这组图里留白的方式，像是声音停下之后，光还留在原地。',
 '“不再逃跑”那一段很有力量，不是突然变得勇敢，而是终于愿意留下来。',
 '颜色和文字的气质很一致，像在同一个傍晚里发生的事情。'
];
let activeFilter='全部'; let commentIndex=0; let toastTimer; const liked=new Set(); const bookmarked=new Set(); let currentWork=0;
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)}
function applyFilters(){const query=$('#searchInput').value.trim().toLowerCase();let shown=0;$$('.work-card').forEach((card,i)=>{const w=works[i];const filterMatch=activeFilter==='全部'||w.kind===activeFilter||w.tags.includes(activeFilter);const haystack=[w.title,w.author,...w.tags,w.kind].join(' ').toLowerCase();const queryMatch=!query||haystack.includes(query);card.hidden=!(filterMatch&&queryMatch);if(!card.hidden)shown++});$('#shownCount').textContent=String(shown).padStart(2,'0');$('#emptyState').hidden=shown!==0}
function setLiked(i){const button=$(`[data-like="${i}"]`);if(liked.has(i)){liked.delete(i);works[i].likes--;button.classList.remove('liked');button.innerHTML=`♡ <span>${works[i].likes}</span>`;notify('已取消喜欢')}else{liked.add(i);works[i].likes++;button.classList.add('liked');button.innerHTML=`♥ <span>${works[i].likes}</span>`;notify('已加入喜欢')}if(currentWork===i)updateModalLike()}
function updateModalLike(){const b=$('#modalLike');if(liked.has(currentWork)){b.innerHTML='♥ 已喜欢';}else{b.innerHTML='♡ 喜欢这件作品';}}
function openWork(i){currentWork=i;const w=works[i];$('#modalTitle').textContent=w.title;$('#modalAuthor').textContent=`${w.author} · ${w.date} · ${w.kind}`;$('#modalType').textContent=w.kind==='图像'?'ILLUSTRATION / IMAGE SET':'FICTION / TEXT WORK';$('#modalTags').innerHTML=w.tags.map(t=>`<span>#${t}</span>`).join('');$('#modalDescription').textContent=w.description;$('#modalArt').className=`modal-art modal-art-${i}`;$('#modalBookmark').textContent=bookmarked.has(i)?'✓ 已收藏':'＋ 收藏 / 书签';updateModalLike();$('#workModal').hidden=false;document.body.style.overflow='hidden'}
function closeModal(id){$('#'+id).hidden=true;if($$('.modal-backdrop:not([hidden])').length===0)document.body.style.overflow=''}
$('#filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;activeFilter=b.dataset.filter;$$('.filter-chip').forEach(c=>c.classList.toggle('selected',c===b));applyFilters()});$('#searchInput').addEventListener('input',applyFilters);
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openWork(Number(b.dataset.open))));$$('[data-like]').forEach(b=>b.addEventListener('click',()=>setLiked(Number(b.dataset.like))));
$('#randomize').addEventListener('click',()=>{const grid=$('#workGrid');const cards=$$('.work-card');for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));grid.insertBefore(cards[j],cards[i])}notify('作品顺序已随机更新')});
$('#nextComment').addEventListener('click',()=>{commentIndex=(commentIndex+1)%comments.length;$('#randomComment').textContent=comments[commentIndex]});
$('#themeToggle').addEventListener('click',()=>{document.body.classList.toggle('cool-mode');notify(document.body.classList.contains('cool-mode')?'已切换为冷色阅读模式':'已切换为暖色模式')});
$('#menuToggle').addEventListener('click',()=>$('.main-nav').classList.toggle('open'));$$('.main-nav a').forEach(a=>a.addEventListener('click',()=>$('.main-nav').classList.remove('open')));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));$$('.modal-backdrop').forEach(backdrop=>backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal(backdrop.id)}));document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-backdrop:not([hidden])').forEach(m=>closeModal(m.id))});
$('#modalLike').addEventListener('click',()=>setLiked(currentWork));$('#modalBookmark').addEventListener('click',()=>{if(bookmarked.has(currentWork)){bookmarked.delete(currentWork);notify('已取消收藏')}else{bookmarked.add(currentWork);notify('已加入收藏')}$('#modalBookmark').textContent=bookmarked.has(currentWork)?'✓ 已收藏':'＋ 收藏 / 书签'});$('#modalShare').addEventListener('click',async()=>{const w=works[currentWork];const shareData={title:`${w.title}｜GX：野草莓之地`,text:`${w.title} — ${w.author}`};if(navigator.share){try{await navigator.share(shareData)}catch(e){}}else{try{await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);notify('分享文案已复制')}catch(e){notify('可以复制作品标题进行分享')}}});
function openSubscribe(){ $('#subscribeModal').hidden=false;document.body.style.overflow='hidden'}$('#subscribeOpen').addEventListener('click',openSubscribe);$('#subscribeOpen2').addEventListener('click',openSubscribe);$('#subscribeForm').addEventListener('submit',e=>{e.preventDefault();$('#subscribeMessage').textContent='原型演示：未连接邮件服务，邮箱没有被提交或保存。';notify('邮件订阅将在后续开发阶段接入')});
const now=new Date();$('#screenDate').textContent='FRAME '+String(Math.floor((now.getMonth()*31+now.getDate())%365+1).padStart(3,'0'));
// The static demo intentionally does not persist likes, bookmarks, or email addresses.
