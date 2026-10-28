const works = window.GX_WORKS;
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
let currentImageIndex = 0;

// 生成图片展示层：真实图片启用磨砂玻璃背景，模拟图片继续使用原样式
function renderArtImage(art, workIndex, imageIndex) {
  const w = works[workIndex];
  const imageUrl = w.images?.[imageIndex];

  art.replaceChildren();
  art.className = `modal-art modal-art-${workIndex} gallery-slide-${imageIndex}`;

  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    art.classList.add('has-real-image');

    const backdrop = document.createElement('img');
    backdrop.className = 'art-image-backdrop';
    backdrop.src = imageUrl;
    backdrop.alt = '';
    backdrop.setAttribute('aria-hidden', 'true');

    
    const mainWrap = document.createElement('div');
    mainWrap.className = 'art-image-main-wrap';

    const mainImage = document.createElement('img');
    mainImage.className = 'art-image-main';
    mainImage.src = imageUrl;
    mainImage.alt = `${w.title}，第 ${imageIndex + 1} 张`;
    mainImage.draggable = false;

    mainWrap.appendChild(mainImage);
    art.append(backdrop, mainWrap);

  }
}

function openImageViewer() {
  const w = works[currentWork];
  if (w.kind !== '图像') return;

  const total = w.images?.length || (currentWork === 0 ? 3 : 5);
  let viewerIndex = currentImageIndex;

  const viewer = document.createElement('div');
  viewer.className = 'image-viewer';
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', `${w.title}，图片浏览`);

  const close = document.createElement('button');
  close.className = 'image-viewer-close';
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', '退出全屏');

  const heading = document.createElement('div');
  heading.className = 'image-viewer-heading';
  heading.textContent = `${w.title} · ${w.author}`;

  const stage = document.createElement('div');
  stage.className = 'image-viewer-stage';
  stage.setAttribute('aria-label', '作品图片展示区域');

  const art = document.createElement('div');

  const controls = document.createElement('div');
  controls.className = 'image-viewer-controls';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = '← 上一张';

  const count = document.createElement('span');
  count.className = 'image-viewer-count';

  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = '下一张 →';

  function render() {
    count.textContent = `${viewerIndex + 1} / ${total}`;
    renderArtImage(art, currentWork, viewerIndex);
  }

  function closeViewer() {
    viewer.remove();
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'ArrowLeft') {
      viewerIndex = (viewerIndex - 1 + total) % total;
      render();
    }
    if (event.key === 'ArrowRight') {
      viewerIndex = (viewerIndex + 1) % total;
      render();
    }
  }

  prev.addEventListener('click', () => {
    viewerIndex = (viewerIndex - 1 + total) % total;
    render();
  });

  next.addEventListener('click', () => {
    viewerIndex = (viewerIndex + 1) % total;
    render();
  });

  close.addEventListener('click', closeViewer);

  stage.addEventListener('click', () => {
    viewerIndex = (viewerIndex + 1) % total;
    render();
  });

  stage.appendChild(art);
  controls.append(prev, count, next);
  viewer.append(heading, close, stage, controls);
  document.body.appendChild(viewer);

  render();
  document.addEventListener('keydown', onKeyDown);
}

function renderImageGallery() {
  const w = works[currentWork];
  const art = $('#modalArt');
  const controls = $('#galleryControls');
  if (w.kind !== '图像') return;

  const total = w.images?.length || (currentWork === 0 ? 3 : 5);

  renderArtImage(art, currentWork, currentImageIndex);
  controls.replaceChildren();
  controls.hidden = total <= 1;

  if (total > 1) {
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'gallery-prev';
    prev.textContent = '‹';
    prev.setAttribute('aria-label', '上一张图片');

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'gallery-next';
    next.textContent = '›';
    next.setAttribute('aria-label', '下一张图片');

    const count = document.createElement('span');
    count.className = 'gallery-count';
    count.textContent = `${currentImageIndex + 1} / ${total}`;

    prev.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + total) % total;
      renderImageGallery();
    });

    next.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % total;
      renderImageGallery();
    });

    controls.append(prev, next, count);
  }

  art.style.cursor = 'zoom-in';
  art.setAttribute('role', 'button');
  art.setAttribute('tabindex', '0');
  art.setAttribute('aria-label', '点击全屏查看作品图片');

  art.onclick = () => openImageViewer();
  art.onkeydown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openImageViewer();
    }
  };
}

function openWork(i) {
  currentWork = i;
  const w = works[i];
  const modalPanel = $('#workModal .work-modal');
  modalPanel.classList.toggle('image-work', w.kind === '图像');
  $('#modalTitle').textContent = w.title;
  $('#modalAuthor').textContent = `${w.author} · ${w.date} · ${w.kind}`;
  $('#modalType').textContent = w.kind === '图像'
    ? 'ILLUSTRATION / IMAGE SET'
    : 'FICTION / TEXT WORK';
  $('#modalTags').innerHTML = w.tags.map(t => `<span>#${t}</span>`).join('');
  $('#modalDescription').textContent = w.description;
if (w.kind === '图像') {
  currentImageIndex = 0;
  renderImageGallery();
} else {
  $('#modalArt').replaceChildren();
  $('#galleryControls').replaceChildren();
  $('#galleryControls').hidden = true;
  $('#modalArt').className = `modal-art modal-art-${i}`;
}
  $('#modalBookmark').textContent = bookmarked.has(i) ? '✓ 已收藏' : '＋ 收藏 / 书签';

  let readButton = $('#readWorkButton');

  if (w.kind === '文字') {
    if (!readButton) {
      readButton = document.createElement('button');
      readButton.id = 'readWorkButton';
      readButton.className = 'primary-link';
      readButton.type = 'button';
      readButton.textContent = '阅读全文 →';
      $('#modalDescription').after(readButton);
      readButton.addEventListener('click', openReader);
    }
    readButton.hidden = false;
  } else if (readButton) {
    readButton.hidden = true;
  }

  updateModalLike();
  $('#workModal').hidden = false;
  document.body.style.overflow = 'hidden';
}

let previousCoolMode = false;

function openReader() {
  const w = works[currentWork];

  if (w.kind !== '文字') return;

  previousCoolMode = document.body.classList.contains('cool-mode');

  $('#readerTitle').textContent = w.title;
  $('#readerAuthor').textContent = `${w.author} · ${w.date}`;
  $('#readerType').textContent = 'FICTION / TEXT WORK';

  const content = $('#readerContent');
  content.replaceChildren();

  if (w.content) {
    w.content.split(/\n\s*\n/).forEach(paragraph => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      content.appendChild(p);
    });
  } else {
    const p = document.createElement('p');
    p.textContent = '正文尚未录入。';
    content.appendChild(p);
  }

  $('#workModal').hidden = true;
  $('#readerModal').hidden = false;
  document.body.classList.add('cool-mode');
  document.body.style.overflow = 'hidden';
}

function closeReader() {
  $('#readerModal').hidden = true;
  if (!previousCoolMode) {
    document.body.classList.remove('cool-mode');
  }
  document.body.style.overflow = '';
}

$('#readerBack').addEventListener('click', closeReader);
$('#readerClose').addEventListener('click', closeReader);

$('#readerModal').addEventListener('click', event => {
  if (event.target === $('#readerModal')) closeReader();
});
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
const now=new Date();$('#screenDate').textContent='FRAME '+String(Math.floor((now.getMonth()*31+now.getDate())%365+1)).padStart(3,'0');
// The static demo intentionally does not persist likes, bookmarks, or email addresses.
const frameWidget = $('#screenshotWidget');

frameWidget.setAttribute('role', 'button');
frameWidget.setAttribute('tabindex', '0');
frameWidget.setAttribute('aria-label', '放大查看今日的一帧');

function openFrameModal() {
  if ($('#frameModal')) return;

  const modal = document.createElement('div');
  modal.id = 'frameModal';
  modal.className = 'frame-modal';

  const panel = document.createElement('div');
  panel.className = 'frame-modal-panel';

  const close = document.createElement('button');
  close.className = 'frame-modal-close';
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', '关闭放大画面');

  const art = $('#screenshotWidget .screen-art').cloneNode(true);
  art.classList.add('frame-large');

  const caption = document.createElement('p');
  caption.className = 'frame-modal-caption';
  caption.textContent = 'GX · MEMORY FRAME';

  panel.append(close, art, caption);
  modal.append(panel);
  document.body.append(modal);

  function closeFrame() {
    modal.remove();
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') closeFrame();
  }

  close.addEventListener('click', closeFrame);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeFrame();
  });
  document.addEventListener('keydown', onKeyDown);
}

frameWidget.addEventListener('click', openFrameModal);
frameWidget.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openFrameModal();
  }
});
