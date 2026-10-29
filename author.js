
const works = window.GX_WORKS || [];
const authors = window.GX_AUTHORS || [];
const params = new URLSearchParams(window.location.search);
const authorId = params.get('id');
const authorName = params.get('name');
const root = document.querySelector('#authorPageContent');
function renderAuthorPage() {
  if (!root) return;

const profile = authorId
  ? authors.find(author => author.authorId === authorId)
  : authors.find(author => author.name === authorName);

const resolvedName = profile?.name || authorName;

const authorWorks = works
  .map((work, index) => ({ ...work, originalIndex: index }))
  .filter(work => {
    if (authorId) return work.authorId === authorId;
    return work.author === authorName;
  });

root.replaceChildren();

if (!resolvedName || (!profile && authorWorks.length === 0)) {
    const message = document.createElement('p');
    message.className = 'author-page-message';
    message.textContent = '没有找到这位作者，请返回作者索引选择其他作者。';
    root.appendChild(message);
    document.title = `${resolvedName} · 作者主页 · GX：野草莓之地`;
    return;
  }

  document.title = `${authorName} · 作者主页 · GX：野草莓之地`;

  const profileSection = document.createElement('section');
  profileSection.className = 'author-page-profile';

  const avatar = document.createElement('div');
  avatar.className = 'author-page-avatar';
  avatar.textContent = resolvedName.slice(0, 1);

  const info = document.createElement('div');
  const heading = document.createElement('h1');
  heading.textContent = resolvedName;

  const role = document.createElement('p');
  role.className = 'author-page-role';
  role.textContent = profile?.role || '创作者';

  const bio = document.createElement('p');
  bio.className = 'author-page-bio';
  bio.textContent = profile?.bio || '这位作者还没有填写个人简介。';

  info.append(heading, role, bio);
  profileSection.append(avatar, info);
  root.appendChild(profileSection);

  const headingRow = document.createElement('div');
  headingRow.className = 'author-page-works-heading';

  const titleWrap = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'WORKS BY THIS AUTHOR';

  const worksTitle = document.createElement('h2');
  worksTitle.textContent = 'TA 的作品';

  titleWrap.append(eyebrow, worksTitle);

  const count = document.createElement('span');
  count.textContent = `${authorWorks.length} 件作品`;

  headingRow.append(titleWrap, count);
  root.appendChild(headingRow);

  if (authorWorks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'author-page-message';
    empty.textContent = '这位作者还没有展示中的作品。';
    root.appendChild(empty);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'author-page-work-grid';

  authorWorks.forEach(work => {
    const card = document.createElement('article');
    card.className = 'author-page-work-card';

    const link = document.createElement('a');
    link.href = `index.html?work=${encodeURIComponent(work.title)}#works`;
    link.setAttribute('aria-label', `查看作品：${work.title}`);

    const visual = document.createElement('div');
    visual.className = 'author-page-work-visual';

    if (work.kind === '图像' && work.images?.[0]) {
      const image = document.createElement('img');
      image.src = work.images[0];
      image.alt = `${work.title}的作品预览`;
      image.loading = 'lazy';
      visual.appendChild(image);
    } else {
      const mark = document.createElement('span');
      mark.className = 'author-page-text-mark';
      mark.textContent = 'Aa';
      visual.appendChild(mark);
    }

    const details = document.createElement('div');
    details.className = 'author-page-work-info';

    const title = document.createElement('h3');
    title.textContent = work.title;

    const meta = document.createElement('p');
    meta.textContent = `${work.kind} · ${work.date}`;

    const description = document.createElement('p');
    description.className = 'author-page-description';
    description.textContent = work.description || '';

    details.append(title, meta, description);
    link.append(visual, details);
    card.appendChild(link);
    grid.appendChild(card);
  });

  root.appendChild(grid);
}

renderAuthorPage();
