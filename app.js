const works = window.GX_WORKS;
const authors = window.GX_AUTHORS || [];

const noteItems = [
  {
    id: 'demo-comment-1',
    type: 'comment',
    content: '读到最后才意识到，原来前面那些看似平静的细节一直在回应结尾。想再读一遍。',
    byline: '评论摘选示例',
    source: '演示内容 · 对应作品《森林不会回答》',
    workId: 'work_forest_001',
    sourceUrl: '',
    isDemo: true
  },
  {
    id: 'demo-comment-2',
    type: 'comment',
    content: '好喜欢这组图里留白的方式，像是声音停下之后，光还留在原地。',
    byline: '评论摘选示例',
    source: '演示内容 · 对应图像作品',
    workId: 'work_summer_001',
    sourceUrl: '',
    isDemo: true
  },
  {
    id: 'demo-thought-1',
    type: 'thought',
    content: '最近又翻出了一段旧稿，发现当时没写完的东西，现在仍然想继续写下去。',
    byline: '站长碎碎念（示例）',
    source: '演示内容 · 站长手记',
    workId: null,
    sourceUrl: '',
    isDemo: true
  },
  {
    id: 'demo-thought-2',
    type: 'thought',
    content: '希望这个地方能慢慢收集起大家喜欢的故事，也留下创作者在作品之外的声音。',
    byline: '站长碎碎念（示例）',
    source: '演示内容 · 社区建设记录',
    workId: null,
    sourceUrl: '',
    isDemo: true
  }
];
let noteMode = 'mixed';
let currentNoteId = null;

let activeFilter='全部'; let commentIndex=0; let toastTimer; const liked=new Set(); const bookmarked=new Set(); let currentWork=0;
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];

function renderWorkCards() {
  const grid = $('#workGrid');
  if (!grid) return;

  grid.replaceChildren();

  works.forEach((w, i) => {
    const card = document.createElement('article');
    card.className = 'work-card';
    card.dataset.workIndex = String(i);
    card.dataset.kind = w.kind;
    card.dataset.title = w.title;
    card.dataset.author = w.author;

    const visualClasses = ['visual-one', 'visual-two', 'visual-three', 'visual-four'];
    const visualLabels = ['SUMMER / GX', 'THE FOREST KNOWS', 'AFTER SCHOOL', 'TIDE NOTES / 07'];
    const visualParts = [
      '<span class="visual-orbit"></span><span class="visual-sun"></span>',
      '<span class="forest-moon"></span><span class="forest-line"></span>',
      '<span class="window-shape"></span><span class="window-light"></span>',
      '<span class="tide-circle"></span><span class="tide-wave"></span>'
    ];

    const visual = document.createElement('button');
    visual.type = 'button';
    visual.className = `work-visual ${visualClasses[i % visualClasses.length]}`;
    visual.dataset.open = String(i);
    visual.setAttribute('aria-label', `打开${w.title}`);
    visual.innerHTML = visualParts[i % visualParts.length];

    const caption = document.createElement('span');
    caption.className = 'visual-caption';
    caption.textContent = visualLabels[i % visualLabels.length];

    const stamp = document.createElement('span');
    stamp.className = 'visual-stamp';
    stamp.textContent = w.author;

    visual.append(caption, stamp);

    const meta = document.createElement('div');
    meta.className = 'work-meta';

    const info = document.createElement('div');

    const type = document.createElement('span');
    type.className = 'work-type';
    type.textContent = w.kind === '图像'
      ? 'ILLUSTRATION / IMAGE SET'
      : 'FICTION / TEXT WORK';

    const heading = document.createElement('h3');
    const titleButton = document.createElement('button');
    titleButton.type = 'button';
    titleButton.className = 'title-button';
    titleButton.dataset.open = String(i);
    titleButton.textContent = w.title;
    heading.appendChild(titleButton);

    const authorLine = document.createElement('p');
    authorLine.className = 'author-line';
    authorLine.append(document.createTextNode(w.author + ' '));

    const separator = document.createElement('span');
    separator.textContent = '·';

    authorLine.append(separator, document.createTextNode(' ' + w.date));
    info.append(type, heading, authorLine);

    const likeButton = document.createElement('button');
    likeButton.type = 'button';
    likeButton.className = 'like-button';
    likeButton.dataset.like = String(i);
    likeButton.setAttribute('aria-label', `点赞${w.title}`);
    likeButton.innerHTML = `♡ <span>${w.likes ?? 0}</span>`;

    meta.append(info, likeButton);

    const tags = document.createElement('div');
    tags.className = 'tag-line';

    (w.tags || []).forEach(tag => {
      const item = document.createElement('span');
      item.textContent = '#' + tag;
      tags.appendChild(item);
    });

    card.append(visual, meta, tags);
    grid.appendChild(card);
  });

  $('#shownCount').textContent = String(works.length).padStart(2, '0');
  $('#emptyState').hidden = works.length !== 0;
}

function notify(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)}

function applyFilters() {
  const query = $('#searchInput').value.trim().toLowerCase();
  let shown = 0;

  $$('.work-card').forEach(card => {
    const i = Number(card.dataset.workIndex);
    const w = works[i];
    if (!w) return;

    const filterMatch =
      activeFilter === '全部' ||
      w.kind === activeFilter ||
      (w.tags || []).includes(activeFilter);

    const haystack = [
      w.title,
      w.author,
      w.kind,
      ...(w.tags || [])
    ].join(' ').toLowerCase();

    const queryMatch = !query || haystack.includes(query);
    card.hidden = !(filterMatch && queryMatch);

    if (!card.hidden) shown++;
  });

  $('#shownCount').textContent = String(shown).padStart(2, '0');
  $('#emptyState').hidden = shown !== 0;
}

function setLiked(i) {
  const button = $(`[data-like="${i}"]`);

  if (liked.has(i)) {
    liked.delete(i);
    works[i].likes--;
    button.classList.remove('liked');
    button.innerHTML = `♡ <span>${works[i].likes}</span>`;
    notify('已取消喜欢');
  } else {
    liked.add(i);
    works[i].likes++;
    button.classList.add('liked');
    button.innerHTML = `♥ <span>${works[i].likes}</span>`;
    notify('已加入喜欢');
  }

  if (currentWork === i) {
    updateModalLike();
  }

  renderRanking();
}
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
$('#workGrid').addEventListener('click', event => {
  const likeButton = event.target.closest('[data-like]');
  if (likeButton) {
    event.stopPropagation();
    setLiked(Number(likeButton.dataset.like));
    return;
  }

  const openButton = event.target.closest('[data-open]');
  if (openButton) {
    openWork(Number(openButton.dataset.open));
  }
});
$('#randomize').addEventListener('click',()=>{const grid=$('#workGrid');const cards=$$('.work-card');for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));grid.insertBefore(cards[j],cards[i])}notify('作品顺序已随机更新')});

function getAvailableNotes() {
  if (noteMode === 'mixed') return noteItems;
  return noteItems.filter(item => item.type === noteMode);
}

function showRandomNote() {
  const available = getAvailableNotes();

  if (!available.length) {
    $('#randomComment').textContent = '这个分类暂时还没有内容。';
    $('#noteByline').textContent = '暂无内容';
    $('#noteSource').textContent = '之后可以从后台添加';
    $('#noteAvatar').textContent = '…';
    return;
  }

  let choices = available.filter(item => item.id !== currentNoteId);
  if (!choices.length) choices = available;

  const item = choices[Math.floor(Math.random() * choices.length)];
  currentNoteId = item.id;

  $('#randomComment').textContent = item.content;
  $('#noteByline').textContent = item.byline ||
    (item.type === 'comment' ? '评论摘选' : '碎碎念');
  $('#noteSource').textContent = item.source ||
    (item.type === 'comment' ? '外站评论摘选' : '创作者手记');
  $('#noteAvatar').textContent = item.type === 'comment' ? '“' : '✳';

  const eyebrow = $('.quote-panel .eyebrow');
  if (eyebrow) {
    eyebrow.textContent = item.type === 'comment'
      ? 'A RANDOM NOTE / 随机评论'
      : 'A RANDOM NOTE / 碎碎念';
  }
}

$$('[data-note-mode]').forEach(button => {
  button.addEventListener('click', () => {
    noteMode = button.dataset.noteMode;

    $$('[data-note-mode]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    currentNoteId = null;
    showRandomNote();
  });
});

$('#nextComment').addEventListener('click', showRandomNote);
showRandomNote();

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

/* ===== 作者索引：跳转到独立作者页 ===== */

function getAuthorWorks(authorName) {
  return works.filter(work => work.author === authorName);
}


function renderAuthorList() {
  const list = $('#authorList');
  if (!list) return;

  list.replaceChildren();

  // 先以作者资料为主，再补入作品中存在但资料表尚未登记的作者
  const authorEntries = [...authors];

  works.forEach(work => {
    const exists = authorEntries.some(author =>
      (work.authorId && author.authorId === work.authorId) ||
      (!work.authorId && author.name === work.author)
    );

    if (!exists && work.author) {
      authorEntries.push({
        authorId: work.authorId || '',
        name: work.author,
        bio: '',
        role: '创作者'
      });
    }
  });

  authorEntries.forEach((author, index) => {
    const authorWorks = works.filter(work =>
      (author.authorId && work.authorId === author.authorId) ||
      (!author.authorId && work.author === author.name)
    );

    const kinds = [...new Set(authorWorks.map(work => work.kind))];

    const item = document.createElement('a');
    item.className = 'author-item';

    const authorKey = author.authorId
      ? `id=${encodeURIComponent(author.authorId)}`
      : `name=${encodeURIComponent(author.name)}`;

    item.href = `author.html?${authorKey}`;
    item.setAttribute('aria-label', `查看作者 ${author.name} 的详情`);

    const avatar = document.createElement('span');
    avatar.className = `author-avatar avatar-${(index % 4) + 1}`;
    avatar.textContent = author.name.slice(0, 1);

    const info = document.createElement('span');
    info.className = 'author-item-info';

    const authorName = document.createElement('b');
    authorName.textContent = author.name;

    const meta = document.createElement('small');
    meta.textContent =
      `${kinds.join(' / ') || '尚无作品'} · ${authorWorks.length} 件作品`;

    const arrow = document.createElement('span');
    arrow.className = 'author-arrow';
    arrow.textContent = '↗';

    info.append(authorName, meta);
    item.append(avatar, info, arrow);
    list.appendChild(item);
  });
}


function renderRanking() {
  const list = $('#rankingList');
  if (!list) return;

  list.replaceChildren();

  const rankedWorks = works
    .filter(work => work.status !== 'hidden' && work.status !== 'draft')
    .slice()
    .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
    .slice(0, 3);

  rankedWorks.forEach((work, index) => {
    const item = document.createElement('li');

    const rank = document.createElement('span');
    rank.className = 'rank-num';
    rank.textContent = String(index + 1).padStart(2, '0');

    const info = document.createElement('div');

    const title = document.createElement('b');
    title.textContent = work.title;

    const meta = document.createElement('small');
    meta.textContent = `${work.author} · ${work.kind}`;

    info.append(title, meta);

    const likes = document.createElement('span');
    likes.className = 'rank-likes';
    likes.textContent = `♡ ${work.likes ?? 0}`;

    item.append(rank, info, likes);
    list.appendChild(item);
  });const pageParams = new URLSearchParams(window.location.search);
const requestedWorkId = pageParams.get('workId');
const requestedWorkTitle = pageParams.get('work');

const requestedWorkIndex = works.findIndex(work =>
  requestedWorkId
    ? work.workId === requestedWorkId
    : work.title === requestedWorkTitle
);

if (requestedWorkIndex >= 0) {
  window.addEventListener('load', () => {
    openWork(requestedWorkIndex);
  });
}
}
renderWorkCards();
renderRanking();
renderAuthorList();

/* 从作者页返回首页时，尝试自动打开指定作品。 */


